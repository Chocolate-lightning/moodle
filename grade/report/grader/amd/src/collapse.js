// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Allow the user to show and hide columns of the report at will.
 *
 * @module    gradereport_grader/collapse
 * @copyright 2023 Mathew May <mathew.solutions>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import * as Repository from 'gradereport_grader/collapse/repository';
import Notification from 'core/notification';
import GradebookSearchClass from 'gradereport_grader/search/search_class';
import {renderForPromise, replaceNodeContents, replaceNode} from 'core/templates';
import {debounce} from 'core/utils';
import $ from 'jquery';
import {get_strings as getStrings} from 'core/str';
import CustomEvents from "core/custom_interaction_events";

// Contain our selectors within this file until they could be of use elsewhere.
const selectors = {
    component: '.collapse-columns',
    formDropdown: '.columnsdropdownform',
    formItems: {
        cancel: 'cancel',
        save: 'save',
        checked: 'input[type="checkbox"]:checked'
    },
    hider: 'hide',
    expand: 'expand',
    colVal: '[data-col]',
    itemVal: '[data-itemid]',
    content: '[data-collapse="content"]',
    sort: '[data-collapse="sort"]',
    expandbutton: '[data-collapse="expandbutton"]',
    menu: '[data-collapse="menu"]',
    icons: '[data-collapse="gradeicons"]',
    count: '[data-collapse="count"]',
    placeholder: '.collapsecolumndropdown [data-region="placeholder"]',
};

const countIndicator = document.querySelector(selectors.count);

export default class ColumnSearch extends GradebookSearchClass {

    userID = -1;
    courseID = null;
    defaultSort = '';

    nodes = [];

    gradeStrings = null;
    userStrings = null;
    stringMap = [];

    static init(userID, courseID, defaultSort) {
        return new ColumnSearch(userID, courseID, defaultSort);
    }

    constructor(userID, courseID, defaultSort) {
        super();
        this.userID = userID;
        this.courseID = courseID;
        this.defaultSort = defaultSort;

        this.renderDefault();
    }

    /**
     * The overall div that contains the searching widget.
     *
     * @returns {string}
     */
    setComponentSelector() {
        return '.collapse-columns';
    }

    /**
     * The dropdown div that contains the searching widget result space.
     *
     * @returns {string}
     */
    setDropdownSelector() {
        return '.searchresultitemscontainer';
    }

    /**
     * The triggering div that contains the searching widget.
     *
     * @returns {string}
     */
    setTriggerSelector() {
        return '.collapsecolumn';
    }

    /**
     * Return the dataset that we will be searching upon.
     *
     * @returns {Promise<Array>}
     */
    async getDataset() {
        if (!this.dataset) {
            const cols = await this.fetchDataset();
            if (cols[0].value === '') {
                this.dataset = [];
            } else {
                this.dataset = cols[0].value?.split(',') ?? [];
            }
        }
        this.datasetSize = this.dataset.length;
        return this.dataset;
    }

    /**
     * Externally defined click function to improve memory handling.
     *
     * @param {MouseEvent} e
     * @returns {Promise<void>}
     */
    async docClickHandler(e) {
        const ds = await this.getDataset();
        if (e.target.dataset.hider === selectors.hider) {
            e.preventDefault();
            const desiredToHide = e.target.closest(selectors.colVal) ?
                e.target.closest(selectors.colVal)?.dataset.col :
                e.target.closest(selectors.itemVal)?.dataset.itemid;
            const idx = ds.indexOf(desiredToHide);
            if (idx === -1) {
                ds.push(desiredToHide);
            }
            await this.setPreferences();
            // Update the collapsed button pill.
            this.countUpdate();

            // User has given something for us to filter against.
            this.setMatchedResults(await this.filterDataset(ds));
            await this.filterMatchDataset();
            await this.renderDropdown();

            const colNodesToHide = [...document.querySelectorAll(`[data-col="${desiredToHide}"]`)];
            const itemIDNodesToHide = [...document.querySelectorAll(`[data-itemid="${desiredToHide}"]`)];
            this.nodes = [...colNodesToHide, ...itemIDNodesToHide];
            this.updateDisplay();
        }

        if (e.target.closest('button')?.dataset.hider === selectors.expand) {
            e.preventDefault();
            const desiredToHide = e.target.closest(selectors.colVal) ?
                e.target.closest(selectors.colVal)?.dataset.col :
                e.target.closest(selectors.itemVal)?.dataset.itemid;
            const idx = ds.indexOf(desiredToHide);
            ds.splice(idx, 1);

            await this.setPreferences();
            // Update the collapsed button pill.
            this.countUpdate();

            const colNodesToHide = [...document.querySelectorAll(
                `[data-col="${e.target.closest(selectors.colVal)?.dataset.col}"]`
            )];
            const itemIDNodesToHide = [
                ...document.querySelectorAll(`[data-itemid="${e.target.closest(selectors.itemVal)?.dataset.itemid}"]`)
            ];
            this.nodes = [...colNodesToHide, ...itemIDNodesToHide];
            this.updateDisplay();
        }
    }

    /**
     * Build the content then replace the node.
     */
    async renderDropdown() {
        const {html, js} = await renderForPromise('gradereport_grader/collapse/collapseresults', {
            'results': this.getMatchedResults(),
            'searchTerm': this.getSearchTerm(),
        });
        replaceNodeContents(this.getHTMLElements().searchDropdown, html, js);
    }

    /**
     * Dictate to the search component how and what we want to match upon.
     *
     * @param {Array} filterableData
     * @returns {Array} An array of objects containing the system reference and the user readable value.
     */
    async filterDataset(filterableData) {
        const stringUserMap = await this.fetchRequiredUserStrings();
        const stringGradeMap = await this.fetchRequiredGradeStrings();
        // Custom user profile fields are not in our string map and need a bit of extra love.
        const customFieldMap = this.fetchCustomFieldValues();
        this.stringMap = new Map([...stringGradeMap, ...stringUserMap, ...customFieldMap]);

        const searching = filterableData.map(s => {
            const mapObj = this.stringMap.get(s);
            if (mapObj === undefined) {
                return {
                    key: s,
                    string: s,
                    category: '',
                };
            }
            return {
                key: s,
                string: mapObj.itemname ?? this.stringMap.get(s),
                category: mapObj.category ?? '',
            };
        });
        // Sometimes we just want to show everything.
        if (this.getPreppedSearchTerm() === '') {
            return searching;
        }
        // Other times we want to actually filter the content.
        return searching.filter((col) => {
            return col.string.toString().toLowerCase().includes(this.getPreppedSearchTerm());
        });
    }

    /**
     * Given we have a subset of the dataset, set the field that we matched upon to inform the end user.
     *
     * @returns {Array} The results with the matched fields inserted.
     */
    async filterMatchDataset() {
        this.setMatchedResults(
            this.getMatchedResults().map((column) => {
                return {
                    name: column.key,
                    displayName: column.string ?? column.key,
                    category: column.category ?? '',
                };
            })
        );
    }

    /**
     * Get the data we will be searching against in this component.
     *
     * @returns {function(*): Promise<*>}
     */
    fetchDataset() {
        return Repository.prefFetch(this.userID).then(r => r.preferences).catch(Notification.exception);
    }

    /**
     * These class members change when a new result set is rendered. So update for fresh data.
     */
    updateNodes() {
        this.component = document.querySelector(selectors.component);
        super.updateNodes();
    }

    /**
     * Handle any keyboard inputs.
     */
    registerInputEvents() {
        // Register & handle the text input.
        this.searchInput.addEventListener('input', debounce(async() => {
            this.setSearchTerms(this.searchInput.value);
            // We can also require a set amount of input before search.
            if (this.searchInput.value === '') {
                // Hide the "clear" search button in the search bar.
                this.clearSearchButton.classList.add('d-none');
            } else {
                // Display the "clear" search button in the search bar.
                this.clearSearchButton.classList.remove('d-none');
            }
            // User has given something for us to filter against.
            this.setMatchedResults(await this.filterDataset(await this.getDataset()));
            await this.filterMatchDataset();
            this.updateNodes();
            await this.renderDropdown();
        }, 300));
    }

    /**
     * Register clickable event listeners.
     */
    registerClickHandlers() {
        // Register click events within the component.
        this.component.addEventListener('click', this.clickHandler.bind(this));

        document.addEventListener('click', this.docClickHandler.bind(this));
    }

    /**
     * Handle the form submission within the dropdown.
     */
    registerFormEvents() {
        const form = this.component.querySelector(selectors.formDropdown);
        const events = [
            'click',
            CustomEvents.events.activate,
            CustomEvents.events.keyboardActivate
        ];
        CustomEvents.define(document, events);

        // Register clicks & keyboard form handling.
        events.forEach((event) => {
            form.addEventListener(event, (e) => {
                // Stop Bootstrap from being clever.
                e.stopPropagation();
                const submitBtn = form.querySelector(`[data-action="${selectors.formItems.save}"`);
                if (e.target.closest('input')) {
                    const checkedCount = Array.from(form.querySelectorAll(selectors.formItems.checked)).length;
                    // Check if any are clicked or not then change disabled.
                    submitBtn.disabled = checkedCount > 0 ? false : true;

                }
            }, false);
        });

        form.addEventListener('submit', async(e) => {
            e.preventDefault();
            if (e.submitter.dataset.action === selectors.formItems.cancel) {
                $(this.component).dropdown('toggle');
                return;
            }
            // Get the users' checked columns to change.
            const checkedItems = [...form.elements].filter(item => item.checked);
            const ds = await this.getDataset();
            checkedItems.forEach((item) => {
                const idx = ds.indexOf(item.dataset.collapse);
                ds.splice(idx, 1);

                const colNodesToHide = [...document.querySelectorAll(`[data-col="${item.dataset.collapse}"]`)];
                const itemIDNodesToHide = [...document.querySelectorAll(`[data-itemid="${item.dataset.collapse}"]`)];
                this.nodes = [...colNodesToHide, ...itemIDNodesToHide];
                this.updateDisplay();
            });
            await this.setPreferences();
            // User has given something for us to filter against.
            this.setMatchedResults(await this.filterDataset(await this.getDataset()));
            await this.filterMatchDataset();
            await this.renderDropdown();
            // Update the collapsed button pill.
            this.countUpdate();
        }, false);
    }

    /**
     * When given an array of nodes, switch their classes and values.
     */
    updateDisplay() {
        this.nodes.forEach((element) => {
            const content = element.querySelector(selectors.content);
            const sort = element.querySelector(selectors.sort);
            const menu = element.querySelector(selectors.menu);
            const icons = element.querySelector(selectors.icons);
            const expandButton = element.querySelector(selectors.expandbutton);

            if (element.classList.contains('cell')) {
                // The column is actively being sorted, lets reset that and reload the page.
                if (sort !== null) {
                    window.location = this.defaultSort;
                }
                // We should always have content but some cells do not contain menus or other actions.
                if (content.classList.contains('d-none')) {
                    element.classList.remove('collapsed');
                    content.classList.remove('d-none');
                    content.setAttribute('aria-hidden', 'false');

                    menu?.classList.remove('d-none');
                    menu?.setAttribute('aria-hidden', 'false');
                    icons?.classList.remove('d-none');
                    icons?.setAttribute('aria-hidden', 'false');
                    expandButton?.classList.add('d-none');
                    expandButton?.setAttribute('aria-hidden', 'true');
                } else {
                    element.classList.add('collapsed');
                    content.classList.add('d-none');
                    content.setAttribute('aria-hidden', 'true');

                    menu?.classList.add('d-none');
                    menu?.setAttribute('aria-hidden', 'true');
                    icons?.classList.add('d-none');
                    icons?.setAttribute('aria-hidden', 'true');
                    expandButton?.classList.remove('d-none');
                    expandButton?.setAttribute('aria-hidden', 'false');
                }
            }
        });
    }

    countUpdate() {
        countIndicator.textContent = this.getDatasetSize();
        // TODO: Add SR handling.
        if (this.getDatasetSize() > 0) {
            this.component.parentElement.classList.add('d-flex');
            this.component.parentElement.classList.remove('d-none');
        } else {
            this.component.parentElement.classList.remove('d-flex');
            this.component.parentElement.classList.add('d-none');
        }
    }

    /**
     * Given a user performs an action update the users' preferences.
     */
    async setPreferences() {
        const ds = await this.getDataset();
        const preferences = [{
            'name': 'grade_report_grader_collapsed_columns',
            'value': `${ds.join(',')}`,
            'userid': this.userID
        }];
        Repository.prefSet(preferences);
    }

    /**
     * Given the set of gradeable items we can possibly search, fetch their strings,
     * so we can report to screen readers the field that matched.
     *
     * @returns {Promise<void>}
     */
    fetchRequiredGradeStrings() {
        if (!this.gradeStrings) {
            this.gradeStrings = Repository.gradeItems(this.courseID)
                .then((result) => new Map(
                    result.gradeItems.map(key => ([key.id, key]))
                ));
        }
        return this.gradeStrings;
    }

    /**
     * Build the content then replace the node by default we want our form to exist.
     */
    async renderDefault() {
        this.setMatchedResults(await this.filterDataset(await this.getDataset()));
        await this.filterMatchDataset();

        // Update the collapsed button pill.
        this.countUpdate();
        const {html, js} = await renderForPromise('gradereport_grader/collapse/collapsebody', {
            'results': this.getMatchedResults(),
            'userid': this.userID,
        });
        replaceNode(selectors.placeholder, html, js);
        this.updateNodes();

        // Given we now have the body, we can set up more triggers.
        this.registerFormEvents();
        this.registerInputEvents();
    }

    /**
     * If we have any custom user profile fields, grab their system & readable names to add to our string map.
     *
     * @returns {[string,*][]} An array of associated string arrays ready for our map.
     */
    fetchCustomFieldValues() {
        const customFields = document.querySelectorAll('[data-collapse-name]');
        // Cast from NodeList to array to grab all the values.
        return [...customFields].map(field => [field.parentElement.dataset.col, field.dataset.collapseName]);
    }

    /**
     * Given the set of profile fields we can possibly search, fetch their strings,
     * so we can report to screen readers the field that matched.
     *
     * @returns {Promise<void>}
     */
    fetchRequiredUserStrings() {
        if (!this.userStrings) {
            const requiredStrings = [
                'username',
                'firstname',
                'lastname',
                'email',
                'city',
                'country',
                'department',
                'institution',
                'idnumber',
                'phone1',
                'phone2',
            ];
            this.userStrings = getStrings(requiredStrings.map((key) => ({key})))
                .then((stringArray) => new Map(
                    requiredStrings.map((key, index) => ([key, stringArray[index]]))
                ));
        }
        return this.userStrings;
    }
}
