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

let userPrefs;
let colsToHide;

// Contain our selectors within this file until they could be of use elsewhere.
const selectors = {
    component: '.collapse-columns',
    trigger: '.collapsecolumn',
    dropdown: '.collapsecolumndropdown',
    parentDomNode: '.collapse-columns',
    cellClass: '.collapsible.user',
    input: '[data-action="search"]',
    clearSearch: '[data-action="clearsearch"]',
    resultContainer: '[data-region="search-result-items-container"]',
    userid: '[data-region="userid"]',
    formDropdown: '.columnsdropdownform',
    formItems: {
        type: 'submit',
        save: 'save',
        cancel: 'cancel'
    }
};

const component = document.querySelector(selectors.component);
const searchInput = component.querySelector(selectors.input);
const clearSearchButton = component.querySelector(selectors.clearSearch);
const resultContainer = component.querySelector(selectors.resultContainer);
const userID = component.querySelector(selectors.userid).dataset.userid;

const clickFunc = (e) => {
    //e.preventDefault();
    // Prevent the usual form behaviour.
    if (e.target.closest(selectors.formDropdown)) {
        if (e.target.dataset.action === selectors.formItems.save) {
            const form = component.querySelector(selectors.formDropdown);
            form.addEventListener('submit', async(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Get the users' checked columns to change.
                const checkedItems = [...form.elements].filter(item => item.checked);
                checkedItems.forEach((item) => {
                    const idx = colsToHide.indexOf(item);
                    colsToHide.splice(idx, 1);
                    const nodes = [...document.querySelectorAll(`${selectors.cellClass}${item.dataset.collapse}`)];
                    nodes.forEach((element) => {
                        if (element.classList.contains('d-none')) {
                            element.classList.remove('d-none');
                            element.setAttribute('aria-expanded', 'false');
                        } else {
                            element.classList.add('d-none');
                            element.setAttribute('aria-expanded', 'true');
                        }
                    });
                    // Update table then rerender the search widget.
                });
                const preferences = [{
                    'name': 'gradereport_grader_collapsed_columns',
                    'value': `${colsToHide.join(',')}`,
                    'userid': userID
                }];
                Repository.prefSet(preferences);
                // TODO: Placeholder.
                const filteredResults = filterfunc(colsToHide, searchInput.value);
                const filtermatchResults = filtermatch(filteredResults);
                await renderfunc(filtermatchResults, colsToHide, userID, resultContainer, searchInput.value);
            }, false);
        }
        if (e.target.dataset.action === selectors.formItems.cancel) {
            window.console.log('cancel');
        }
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
        const filteredResults = filterfunc(colsToHide, searchInput.value);
        const filtermatchResults = filtermatch(filteredResults);
        await renderfunc(filtermatchResults, colsToHide, userID, resultContainer, searchInput.value);
    }, 300));
};

export const init = async() => {
    const pendingPromise = new Pending();

    //new gradebookSearchClass(fetchFilterbleData(), filter(), filterMatchIndicator(), render());

    userPrefs = await data(userID);
    // Optionally chain the split and nullishly check if the array has contents.
    colsToHide = userPrefs[0].value?.split(',') ?? [];

    registerListenerEvents();
    registerInputEvents();
    pendingPromise.resolve();
};

/**
 * Get the data we will be searching against in this component.
 *
 * @returns {function(*): Promise<*>}
 */
const fetchFilterbleData = () => {
    return (userID) => {
        return Repository.prefFetch(userID).then(r => {
            return r.preferences;
        }).catch(Notification.exception);
    };
};

/**
 * Dictate to the search component how and what we want to match upon.
 *
 * @returns {function(*, *): *}
 */
const filter = () => {
    return (dataset, searchTerm) => {
        const preppedSearchTerm = searchTerm.toLowerCase();
        return dataset.filter((col) => {
            if (col === "") {
                return false;
            }
            return col.toString().toLowerCase().includes(preppedSearchTerm);
        });
    };
};

const filterMatchIndicator = () => {
    /**
     * Given we have a subset of the dataset, set the field that we matched upon to inform the end user.
     *
     * @param {Array} matchedResultsSubset The results we will render out.
     * @returns {Array} The results with the matched fields inserted.
     */
    return (matchedResultsSubset) => {
        return matchedResultsSubset;
    };
};

/**
 * Build the content then replace the node.
 *
 */
const render = () => {
    return async(results, dataset, courseID, resultContainer, searchTerm) => {
        const {html, js} = await Templates.renderForPromise('gradereport_grader/collapse/collapseresults', {
            'results': results,
            'currentvalue': searchTerm,
        });
        Templates.replaceNodeContents(resultContainer, html, js);
    };
};

// TODO: Move this into the class eventually.
const data = fetchFilterbleData();
const filterfunc = filter();
// TODO: Make this optional in the base class?
const filtermatch = filterMatchIndicator();
const renderfunc = render();
