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

import $ from 'jquery';
import CustomEvents from "core/custom_interaction_events";
import {enter, arrowUp, arrowDown, home, end, space, escape, tab} from 'core/key_codes';
import {debounce} from 'core/utils';
import {moveToFirstNode, moveToLastNode, moveToNode} from 'gradereport_grader/search/node_handling';

/**
 * The class that manages the state of the user search.
 *
 * @module    gradereport_grader/search/search_class
 * @copyright 2023 Mathew May <mathew.solutions>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Define our standard lookups.
const selectors = {
    'courseid': '[data-region="courseid"]',
    'input': '[data-action="search"]',
    'clearSearch': '[data-action="clearsearch"]',
    'resultitems': '[role="menuitem"]',
    'viewall': '#select-all',
};

const selectorsAbstract = {
    'component': '.user-search',
    'dropdown': '.usersearchdropdown',
    'trigger': '.usersearchwidget',
};

// DOM nodes that persist.
const component = document.querySelector(selectorsAbstract.component);
const searchDropdown = component.querySelector(selectorsAbstract.dropdown);
const $searchButton = $(selectorsAbstract.trigger);

const courseID = component.querySelector(selectors.courseid).dataset.courseid;
const searchInput = component.querySelector(selectors.input);
const clearSearchButton = component.querySelector(selectors.clearSearch);

// Reused variables for the class.
const UP = -1;
const DOWN = 1;
const events = [
    'click',
    'keydown',
    CustomEvents.events.activate,
    CustomEvents.events.keyboardActivate
];
let dataset = [];

export const gradebookSearchClass = class {
    // The results from the called filter function.
    matchedResults = [];

    // What did the user search for?
    searchTerm = '';

    // The DOM nodes after the dropdown render.
    resultNodes = [];

    // Where does the user currently have focus?
    currentNode = null;

    // The current node for the view all link.
    currentViewAll = null;

    // The function defined by the caller that'll filter the dataset.
    filterFunction = null;

    // The function defined by the caller that mutates the results to indicate to the user what matched.
    filterFunctionIndicator = null;

    // The function defined by the caller that allows the mutation of the matching dataset.
    matchAllFunction = false;

    // The function defined by the caller that dictates how the results are rendered out.
    render = null;

    constructor(fetchFunc, filterFunc, filterMatchIndFunc, render, matchAllBuild = false) {
        // Assign the appropriate filter and indicator functions for this search.
        this.filterFunction = filterFunc;
        this.filterFunctionIndicator = filterMatchIndFunc;

        // Grab the dataset via the passed in function that dictates what we are filtering.
        this.fetchDataset(fetchFunc);

        this.matchAllFunction = matchAllBuild ? matchAllBuild : false;
        this.render = render;

        // Begin handling the base search component.
        this.registerClickHandlers();
        this.registerInputHandlers();
    }

    /**
     * These class members change when a new result set is rendered. So update for fresh data.
     */
    updateNodes() {
        this.resultNodes = [...component.querySelectorAll(selectors.resultitems)];
        this.currentNode = this.resultNodes.find(r => r.id === document.activeElement.id);
        this.currentViewAll = component.querySelector(selectors.viewall);
    }

    /**
     * Given we have been provided with a caller, grab the data ready to search.
     *
     * @param {Function} fetchFunc Call the curried function to populate the dataset.
     * @returns {Promise<void>}
     */
    async fetchDataset(fetchFunc) {
        dataset = await fetchFunc(courseID);
    }

    /**
     * Register clickable event listeners.
     */
    registerClickHandlers() {
        CustomEvents.define(document, events);

        // Prevent the click triggering the dropdown.
        $searchButton.on('click', () => {
            this.mutateDropdown();
        });
        // Register click events.
        events.forEach((event) => {
            component.addEventListener(event, this.clickHandler.bind(this));

            // Since we are handling dropdowns manually, ensure we can close it when clicking off.
            document.addEventListener(event, (e) => {
                if (!e.target.closest(selectorsAbstract.component) && searchDropdown.classList.contains('show')) {
                    this.mutateDropdown();
                }
            });
        });
    }

    /**
     * Register input event listener for the text input area.
     */
    registerInputHandlers() {
        // Register & handle the text input.
        searchInput.addEventListener('input', debounce(async() => {
            this.searchTerm = searchInput.value;
            // We can also require a set amount of input before search.
            if (this.searchTerm === '') {
                this.mutateDropdown();
                // Hide the "clear" search button in the search bar.
                clearSearchButton.classList.add('d-none');
            } else {
                // Display the "clear" search button in the search bar.
                clearSearchButton.classList.remove('d-none');
                // User has given something for us to filter against.
                this.matchedResults = this.filterDataset();
                // Replace the dropdown node contents and show the results.
                await this.render(
                    this.filterFunctionIndicator(
                        this.matchedResults.slice(0, 20),
                        this.searchTerm,
                        courseID
                    ),
                    dataset,
                    courseID,
                    searchDropdown,
                    this.searchTerm,
                    this.matchAllFunction,
                );
                // Set the dropdown to open.
                this.mutateDropdown(true);
            }
        }, 300));
    }

    /**
     * Filter the dataset to find if any of the fields include the string the user is searching for.
     *
     * @returns {Array} The results found for the given search term.
     */
    filterDataset() {
        return this.filterFunction(dataset, this.searchTerm);
    }

    /**
     * When called, update the dropdown fields.
     *
     * @param {Boolean} on Flag to toggle hiding or showing values.
     */
    mutateDropdown(on = false) {
        $(component).dropdown('toggle');
        $searchButton.attr('aria-expanded', on);
        if (on) {
            searchDropdown.classList.add('show');
            $(searchDropdown).show();
        } else {
            searchDropdown.classList.remove('show');
            $(searchDropdown).hide();
        }
    }

    /**
     * Set the current focus either on the preceding or next result item.
     *
     * @param {Number} direction Is the user moving up or down the resultset?
     * @param {Event} e The JS event from the event handler.
     */
    keyUpDown(direction, e) {
        e.preventDefault();
        // Stop Bootstrap from being clever.
        e.stopPropagation();
        // Current focus is on the input box so depending on direction, go to the top or the bottom of the displayed results.
        if (document.activeElement === searchInput && this.resultNodes.length > 0) {
            if (direction === UP) {
                moveToLastNode(this.resultNodes);
            } else {
                moveToFirstNode(this.resultNodes);
            }
        }
        const index = this.resultNodes.indexOf(this.currentNode);
        if (this.currentNode) {
            if (direction === UP) {
                if (index === 0) {
                    moveToLastNode(this.resultNodes);
                } else {
                    moveToNode(this.resultNodes, index - 1);
                }
            } else {
                if (index + 1 >= this.resultNodes.length) {
                    moveToFirstNode(this.resultNodes);
                } else {
                    moveToNode(this.resultNodes, index + 1);
                }
            }
        }
    }

    /**
     * The handler for when a user interacts with the component.
     *
     * @param {Event} e The triggering event that we are working with.
     */
    clickHandler(e) {
        // Handy little function to handle general closing of the search component.
        const closeSearch = () => {
            this.mutateDropdown();
            // Hide the "clear" search button search bar.
            clearSearchButton.classList.add('d-none');
            // Clear the entered search query in the search bar and hide the search results container.
            searchInput.value = "";
        };
        this.updateNodes();

        // Prevent normal key presses activating this.
        if (e.target.closest('.dropdown-item') && e.which === 1) {
            window.location = e.target.closest('.dropdown-item').href;
        }
        if (e.target === this.currentViewAll && (e.which === enter || e.which === space || e.which === 1)) {
            if (this.matchAllFunction) {
                window.location = this.matchAllFunction(this.searchTerm, courseID);
            }
        }
        // The "clear search" button is triggered.
        if (e.target.closest(selectors.clearSearch) && e.which === 1) {
            closeSearch();
            searchInput.focus({preventScroll: true});
        }

        // Switch the key presses to handle keyboard nav.
        this.keySwitching(e, closeSearch);
    }

    /**
     * Switch the users key input.
     *
     * @param {Event} e The triggering event that we are working with.
     * @param {Function} closeSearch Helper function that handles the case we want to close the dropdown.
     */
    keySwitching(e, closeSearch) {
        switch (e.which) {
            case arrowUp:
                this.keyUpDown(UP, e);
                break;
            case arrowDown:
                this.keyUpDown(DOWN, e);
                break;
            case home:
                e.preventDefault();
                moveToFirstNode(this.resultNodes);
                break;
            case end:
                e.preventDefault();
                moveToLastNode(this.resultNodes);
                break;
            case escape:
                this.mutateDropdown();
                searchInput.focus({preventScroll: true});
                break;
            case enter:
            case space:
                if (document.activeElement === searchInput) {
                    if (e.which === space) {
                        break;
                    } else {
                        if (this.matchAllFunction) {
                            window.location = this.matchAllFunction(this.searchTerm, courseID);
                        }
                        break;
                    }
                }
                if (document.activeElement === clearSearchButton) {
                    closeSearch();
                    break;
                }
                e.preventDefault();
                window.location = e.target.closest('.dropdown-item').href;
                break;
            case tab:
                // If the current focus is on clear search, then check if viewall exists then around tab to it.
                if (e.target.closest(selectors.clearSearch)) {
                    if (this.currentViewAll) {
                        e.preventDefault();
                        this.currentViewAll.focus({preventScroll: true});
                    } else {
                        closeSearch();
                    }
                }
                // If the current focus is on the view all link, then close the widget then set focus on the next tert nav item.
                if (e.target.closest(selectors.viewall)) {
                    closeSearch();
                }
                break;
        }
    }
};
