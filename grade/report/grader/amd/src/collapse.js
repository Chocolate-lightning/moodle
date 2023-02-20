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

import Pending from 'core/pending';
import CustomEvents from "core/custom_interaction_events";
import * as Repository from 'gradereport_grader/collapse/repository';
import Notification from 'core/notification';
//import {gradebookSearchClass} from 'gradereport_grader/search/search_class';
import * as Templates from 'core/templates';
import {debounce} from 'core/utils';
import $ from 'jquery';
import {get_strings as getStrings} from 'core/str';

let userPrefs;
let colsToHide;

// Contain our selectors within this file until they could be of use elsewhere.
const selectors = {
    component: '.collapse-columns',
    trigger: '.collapsecolumn',
    dropdown: '.collapsecolumndropdown',
    parentDomNode: '.collapse-columns',
    input: '[data-action="search"]',
    clearSearch: '[data-action="clearsearch"]',
    resultContainer: '[data-region="search-result-items-container"]',
    userid: '[data-region="userid"]',
    formDropdown: '.columnsdropdownform',
    formItems: {
        type: 'submit',
        save: 'save',
        cancel: 'cancel'
    },
    hider: 'hide',
    expand: 'expand',
    colVal: '[data-col]',
    itemVal: '[data-itemid]',
    content: '[data-collapse="content"]',
    expandbutton: '[data-collapse="expandbutton"]',
    menu: '[data-collapse="menu"]',
};

let component;
let searchInput;
let clearSearchButton;
let resultContainer;
let userID;

const selectorUpdate = () => {
    component = document.querySelector(selectors.component);
    searchInput = component.querySelector(selectors.input);
    clearSearchButton = component.querySelector(selectors.clearSearch);
    resultContainer = component.querySelector(selectors.resultContainer);
    userID = component.querySelector(selectors.userid).dataset.userid;
};

/**
 * Given the set of profile fields we can possibly search, fetch their strings,
 * so we can report to screen readers the field that matched.
 *
 * @returns {Promise<void>}
 */
let profilestringmap = [];

const fetchRequiredStrings = () => {
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
    return getStrings(requiredStrings.map((key) => ({key})))
        .then((stringArray) => new Map(
            requiredStrings.map((key, index) => ([key, stringArray[index]]))
        ));
};

const setPreferences = () => {
    const preferences = [{
        'name': 'gradereport_grader_collapsed_columns',
        'value': `${colsToHide.join(',')}`,
        'userid': userID
    }];
    Repository.prefSet(preferences);
};

const updateDisplay = (nodes) => {
    nodes.forEach((element) => {
        const content = element.querySelector(selectors.content);
        const menu = element.querySelector(selectors.menu);
        const expandButton = element.querySelector(selectors.expandbutton);

        if (element.classList.contains('cell')) {
            // We should always have content but some cells do not contain menus or other actions.
            if (content.classList.contains('d-none')) {
                element.classList.remove('collapsed');
                content.classList.remove('d-none');
                content.setAttribute('aria-hidden', 'false');

                menu?.classList.remove('d-none');
                menu?.setAttribute('aria-hidden', 'false');
                expandButton?.classList.add('d-none');
                expandButton?.setAttribute('aria-hidden', 'true');
            } else {
                element.classList.add('collapsed');
                content.classList.add('d-none');
                content.setAttribute('aria-hidden', 'true');

                menu?.classList.add('d-none');
                menu?.setAttribute('aria-hidden', 'true');
                expandButton?.classList.remove('d-none');
                expandButton?.setAttribute('aria-hidden', 'false');
            }
        }
    });
};

const registerFormEvents = () => {
    const form = component.querySelector(selectors.formDropdown);
    form.addEventListener('submit', async(e) => {
        e.preventDefault();
        if (e.submitter.dataset.action === selectors.formItems.cancel) {
            $(component).dropdown('toggle');
            return;
        }
        // Get the users' checked columns to change.
        const checkedItems = [...form.elements].filter(item => item.checked);
        checkedItems.forEach((item) => {
            const idx = colsToHide.indexOf(item.dataset.collapse);
            colsToHide.splice(idx, 1);

            const colNodesToHide = [...document.querySelectorAll(`[data-col="${item.dataset.collapse}"]`)];
            const itemIDNodesToHide = [...document.querySelectorAll(`[data-itemid="${item.dataset.collapse}"]`)];
            updateDisplay([...colNodesToHide, ...itemIDNodesToHide]);
        });
        await setPreferences();
        const filteredResults = filter(colsToHide, searchInput.value);
        const filtermatchResults = filterMatchIndicator(filteredResults);
        await render(filtermatchResults, colsToHide, userID, resultContainer, searchInput.value);
    }, false);
};

const clickFunc = async(e) => {
    if (e.target.dataset.hider === selectors.hider) {
        e.preventDefault();
        const desiredToHide = e.target.closest(selectors.colVal) ?
            e.target.closest(selectors.colVal)?.dataset.col :
            e.target.closest(selectors.itemVal)?.dataset.itemid;
        const idx = colsToHide.indexOf(desiredToHide);
        if (idx === -1) {
            colsToHide.push(desiredToHide);
        }
        setPreferences();
        const filteredResults = filter(colsToHide, searchInput.value);
        const filtermatchResults = filterMatchIndicator(filteredResults);
        await render(filtermatchResults, colsToHide, userID, resultContainer, searchInput.value);

        const colNodesToHide = [...document.querySelectorAll(`[data-col="${desiredToHide}"]`)];
        const itemIDNodesToHide = [...document.querySelectorAll(`[data-itemid="${desiredToHide}"]`)];
        updateDisplay([...colNodesToHide, ...itemIDNodesToHide]);
    }

    if (e.target.closest('button')?.dataset.hider === selectors.expand) {
        const desiredToHide = e.target.closest(selectors.colVal) ?
            e.target.closest(selectors.colVal)?.dataset.col :
            e.target.closest(selectors.itemVal)?.dataset.itemid;
        const idx = colsToHide.indexOf(desiredToHide);
        colsToHide.splice(idx, 1);

        setPreferences();

        const colNodesToHide = [...document.querySelectorAll(`[data-col="${e.target.closest(selectors.colVal)?.dataset.col}"]`)];
        const itemIDNodesToHide = [
            ...document.querySelectorAll(`[data-itemid="${e.target.closest(selectors.itemVal)?.dataset.itemid}"]`)
        ];
        updateDisplay([...colNodesToHide, ...itemIDNodesToHide]);
    }
};

const registerListenerEvents = () => {
    const events = [
        'click',
        CustomEvents.events.activate,
        CustomEvents.events.keyboardActivate
    ];
    CustomEvents.define(document, events);

    // Register events.
    events.forEach((event) => {
        document.addEventListener(event, e => clickFunc(e));
    });
};

const registerInputEvents = () => {
    // Register & handle the text input.
    searchInput.addEventListener('input', debounce(async() => {
        // We can also require a set amount of input before search.
        if (searchInput.value === '') {
            // Hide the "clear" search button in the search bar.
            clearSearchButton.classList.add('d-none');
        } else {
            // Display the "clear" search button in the search bar.
            clearSearchButton.classList.remove('d-none');
        }
        const filteredResults = filter(colsToHide, searchInput.value);
        const filtermatchResults = filterMatchIndicator(filteredResults);
        await render(filtermatchResults, colsToHide, userID, resultContainer, searchInput.value);
    }, 300));
};

export const init = async(userID, courseID) => {
    const pendingPromise = new Pending();

    const gradeItem = await Repository.gradeItems(courseID)
        .then(result => new Map(result.gradeitems.map(key => ([key.id, key.itemname]))));
    profilestringmap = await fetchRequiredStrings();
    // Merge the string maps.
    profilestringmap = new Map([...profilestringmap, ...gradeItem]);
    //new gradebookSearchClass(fetchFilterbleData(), filter(), filterMatchIndicator(), render());

    userPrefs = await fetchFilterbleData(userID);
    // Optionally chain the split and nullishly check if the array has contents.
    colsToHide = userPrefs[0].value?.split(',') ?? [];

    await renderDefault(filterMatchIndicator(colsToHide), userID);
    selectorUpdate();

    registerListenerEvents();
    registerInputEvents();
    registerFormEvents();

    pendingPromise.resolve();
};

/**
 * Get the data we will be searching against in this component.
 *
 * @param {Null|Number} userID The potential ID of the user whishing to update their collapsed columns.
 * @returns {function(*): Promise<*>}
 */
const fetchFilterbleData = (userID) => {
    return Repository.prefFetch(userID).then(r => {
        return r.preferences;
    }).catch(Notification.exception);
};

/**
 * Dictate to the search component how and what we want to match upon.
 *
 * @param {Array} dataset All of the columns to search within.
 * @param {String} searchTerm The term that the user is searching for.
 * @returns {function(*, *): *}
 */
const filter = (dataset, searchTerm) => {
    const preppedSearchTerm = searchTerm.toLowerCase();
    return dataset.filter((col) => {
        if (col === "") {
            return false;
        }
        return col.toString().toLowerCase().includes(preppedSearchTerm);
    });
};

/**
 * Given we have a subset of the dataset, set the field that we matched upon to inform the end user.
 *
 * @param {Array} matchedResultsSubset The results we will render out.
 * @returns {Array} The results with the matched fields inserted.
 */
const filterMatchIndicator = (matchedResultsSubset) => {
    return matchedResultsSubset.map((column) => {
        return {
            name: column,
            displayName: profilestringmap.get(column) ?? column,
        };
    });
};

/**
 * Build the content then replace the node.
 *
 * @param {Array} results The results of the dataset having its' matching indicators applied.
 * @param {Array} dataset All of the columns to search within.
 * @param {int} userID ID of the course to fetch the columns of.
 * @param {HTMLElement} resultContainer Where we will be updating the users' view.
 * @param {String} searchTerm The term that the user is searching for.
 * @returns {Promise<void>}
 */
const render = async(results, dataset, userID, resultContainer, searchTerm) => {
    const {html, js} = await Templates.renderForPromise('gradereport_grader/collapse/collapseresults', {
        'results': results,
        'searchTerm': searchTerm,
    });
    Templates.replaceNodeContents(resultContainer, html, js);
};

const renderDefault = async(filtermatchResults, userID) => {
    const {html, js} = await Templates.renderForPromise('gradereport_grader/collapse/collapsebody', {
        'results': filtermatchResults,
        'userid': userID,
    });
    Templates.replaceNodeContents('.collapsecolumndropdown [data-region="placeholder"]', html, js);
};
