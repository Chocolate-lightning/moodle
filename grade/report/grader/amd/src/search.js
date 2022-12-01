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
 * Allow the user to search for learners within the grader report.
 * Have to basically search twice on the dataset to avoid passing around massive csv params whilst allowing debouncing.
 *
 * @module    gradereport_grader/search
 * @copyright 2022 Mathew May <mathew.solutions>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import $ from 'jquery';
import Notification from 'core/notification';
import Pending from 'core/pending';
import CustomEvents from "core/custom_interaction_events";
import {enter, arrowUp, arrowDown, home, end, space, escape, tab} from 'core/key_codes';
import * as Templates from 'core/templates';
import {debounce} from 'core/utils';
import * as Repository from 'gradereport_grader/search/repository';
import {get_strings as getStrings} from 'core/str';
import Url from 'core/url';

/**
 * Whether the event listener has already been registered for this module.
 *
 * @type {boolean}
 */
let registered = false;

/**
 * A Map of the strings we may require for the user matching fields.
 *
 * @type {?Map}
 */
let profilestringmap = null;

/**
 * A string array of profile fields we do not want to search upon.
 *
 * @type {string[]}
 */
const bannedFilterFields = ['profileimageurlsmall', 'profileimageurl', 'id', 'link', 'matchingField', 'matchingFieldName'];

/**
 * Build up the view all link.
 *
 * @param {String} searchTerm The current users' search term.
 * @param {Number} courseID The ID of the course to fetch the report of.
 * @param {Null|Number} userID The potential ID of the user selected.
 * @returns {string|*}
 */
const selectAllResultsLink = (searchTerm, courseID, userID = null) => {
    const params = {
        id: courseID,
        searchvalue: searchTerm
    };
    if (userID !== null) {
        params.userid = userID;
    }
    return Url.relativeUrl('/grade/report/grader/index.php', params, false);
};

/**
 * Currently who the user is looking for.
 *
 * @type String
 */
let searchTerm = '';

// Our general selectors used within the module.
const selectors = {
    'component': '.user-search',
    'courseid': '[data-region="courseid"]',
    'trigger': '.usersearchwidget',
    'input': '[data-action="search"]',
    'clearSearch': '[data-action="clearsearch"]',
    'dropdown': '.usersearchdropdown',
    'resultitems': '[role="menuitem"]',
    'viewall': '#select-all',
};

/**
 * The hook into this module that does some basic setup.
 *
 * @returns {Promise<void>}
 */
export const init = async() => {
    if (registered) {
        return;
    }
    const pendingPromise = new Pending();
    const component = document.querySelector(selectors.component);
    const courseID = component.querySelector(selectors.courseid).dataset.courseid;

    await fetchStrings();
    const userData = await Repository.userFetch(courseID).catch(Notification.exception);
    registerListenerEvents(userData.users, component, courseID);

    pendingPromise.resolve();
    registered = true;
};

/**
 * Given the set of profile fields we can possibly search, fetch their strings,
 * so we can report to screen readers the field that matched.
 *
 * @returns {Promise<void>}
 */
const fetchStrings = async() => {
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
    profilestringmap = await getStrings(requiredStrings.map((key) => ({key})))
        .then((stringArray) => {
            return new Map(requiredStrings.map((key, index) => ([key, stringArray[index]])));
        }).catch(Notification.exception);
};

/**
 * Register event listeners.
 *
 * @method registerListenerEvents
 * @param {Array} users The users within the grader report to filter.
 * @param {HTMLElement} component The DOM node that contains the entire searching module.
 * @param {Number} courseID The ID of the course to fetch the report of.
 */
const registerListenerEvents = (users, component, courseID) => {
    const events = [
        'click',
        'keydown',
        CustomEvents.events.activate,
        CustomEvents.events.keyboardActivate
    ];
    CustomEvents.define(document, events);

    const searchInput = component.querySelector(selectors.input);
    const searchDropdown = component.querySelector(selectors.dropdown);
    const $searchButton = $(selectors.trigger);
    const clearSearchButton = component.querySelector(selectors.clearSearch);

    // Handy little function to handle general closing of the search component.
    const closeSearch = () => {
        dropdownHandler(component, $searchButton, searchDropdown);
        // Hide the "clear" search button search bar.
        clearSearchButton.classList.add('d-none');
        // Clear the entered search query in the search bar and hide the search results container.
        searchInput.value = "";
    };

    // Prevent the click triggering the dropdown.
    $searchButton.on('click', () => {
        dropdownHandler(component, $searchButton, searchDropdown);
    });

    // Register click events.
    events.forEach((event) => {
        component.addEventListener(event, (e) => {
            const resultnodes = [...component.querySelectorAll(selectors.resultitems)];
            const current = resultnodes.find(r => r.id === document.activeElement.id);
            const viewAll = component.querySelector(selectors.viewall);

            // Prevent normal key presses activating this.
            if (e.target.closest('.dropdown-item') && e.which === 1) {
                window.location = e.target.closest('.dropdown-item').href;
            }
            if (e.target === viewAll && (e.which === enter || e.which === space || e.which === 1)) {
                window.location = selectAllResultsLink(searchTerm, courseID);
            }
            // The "clear search" button is triggered.
            if (e.target.closest(selectors.clearSearch) && e.which === 1) {
                closeSearch();
                searchInput.focus({preventScroll: true});
            }
            // Switch the key presses to handle keyboard nav.
            switch (e.which) {
                case arrowUp:
                    e.preventDefault();
                    // Stop Bootstrap from being clever.
                    e.stopPropagation();
                    if (document.activeElement === searchInput && resultnodes.length > 0) {
                        resultnodes[resultnodes.length - 1].focus({preventScroll: true});
                    }
                    if (current) {
                        const index = resultnodes.indexOf(current);
                        if (index === 0) {
                            resultnodes[resultnodes.length - 1].focus({preventScroll: true});
                        } else {
                            resultnodes[index - 1].focus({preventScroll: true});
                        }
                    }
                    break;
                case arrowDown:
                    e.preventDefault();
                    e.stopPropagation();
                    if (document.activeElement === searchInput && resultnodes.length > 0) {
                        resultnodes[0].focus({preventScroll: true});
                    }
                    if (current) {
                        const index = resultnodes.indexOf(current);
                        if (index + 1 >= resultnodes.length) {
                            resultnodes[0].focus({preventScroll: true});
                        } else {
                            resultnodes[index + 1].focus({preventScroll: true});
                        }
                    }
                    break;
                case home:
                    e.preventDefault();
                    if (resultnodes.length > 0) {
                        resultnodes[0].focus({preventScroll: true});
                    }
                    break;
                case end:
                    e.preventDefault();
                    if (resultnodes.length > 0) {
                        resultnodes[resultnodes.length - 1].focus({preventScroll: true});
                    }
                    break;
                case escape:
                    dropdownHandler(component, $searchButton, searchDropdown);
                    searchInput.focus({preventScroll: true});
                    break;
                case enter:
                case space:
                    if (document.activeElement === searchInput) {
                        if (e.which === space) {
                            break;
                        } else {
                            window.location = selectAllResultsLink(searchTerm, courseID);
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
                        if (viewAll) {
                            e.preventDefault();
                            viewAll.focus({preventScroll: true});
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
        });

        // Since we are handling dropdowns manually, ensure we can close it when clicking off.
        document.addEventListener(event, (e) => {
            if (!e.target.closest(selectors.component) && searchDropdown.classList.contains('show')) {
                dropdownHandler(component, $searchButton, searchDropdown);
            }
        });
    });

    // Register & handle the text input.
    searchInput.addEventListener('input', debounce(async() => {
        searchTerm = searchInput.value;
        // We can also require a set amount of input before search.
        if (searchTerm === '') {
            dropdownHandler(component, $searchButton, searchDropdown);
            // Hide the "clear" search button in the search bar.
            clearSearchButton.classList.add('d-none');
        } else {
            // Display the "clear" search button in the search bar.
            clearSearchButton.classList.remove('d-none');
            // Filter the users on the given criteria, replace the dropdown node contents and show the results.
            // Await to prevent the little flash of template render.
            await makeDropdownBodyContent(
                users.length,
                filterUsers(searchTerm, users, courseID),
                searchTerm,
                component,
                courseID,
                searchDropdown
            );
            dropdownHandler(component, $searchButton, searchDropdown, true);
        }
    }, 300));
};

/**
 * When called, update the dropdown fields.
 *
 * @param {HTMLElement} component The DOM node that contains the entire searching module.
 * @param {object} $searchButton The jQuery button object that triggers the dropdown.
 * @param {HTMLElement} searchDropdown The child node that contains the dropdown area.
 * @param {Boolean} on Flag to toggle hiding or showing values.
 */
const dropdownHandler = (component, $searchButton, searchDropdown, on = false) => {
    $(component).dropdown('toggle');
    $searchButton.attr('aria-expanded', on);
    if (on) {
        searchDropdown.classList.add('show');
        $(searchDropdown).show();
    } else {
        searchDropdown.classList.remove('show');
        $(searchDropdown).hide();
    }
};

/**
 * Filter the dataset to find if any of the fields include the string the user is searching for.
 *
 * @param {String} searchTerm The current users' search term from the text input element.
 * @param {Array} users The array of users that we can debounce & filter against.
 * @param {Number} courseID The ID of the course to fetch the report of.
 * @returns {Array} The users found for the given search term.
 */
const filterUsers = (searchTerm, users, courseID) => {
    if (searchTerm === '') {
        return users;
    }
    const preppedSearchTerm = searchTerm.toLowerCase();
    return users.filter((user) => {
        return Object.keys(user).some((key) => {
            if (user[key] === "" || bannedFilterFields.includes(key)) {
                return false;
            } else {
                const hasTerm = user[key].toString().toLowerCase().includes(preppedSearchTerm);
                if (hasTerm) {
                    const str = user[key].toString().toLowerCase();
                    // Ensure we have a good string, otherwise fallback to the key.
                    user.matchingFieldName = profilestringmap.get(key) ? profilestringmap.get(key) : key;
                    user.matchingField = str.replace(preppedSearchTerm, `<span class="font-weight-bold">${searchTerm}</span>`);
                    user.link = selectAllResultsLink(searchTerm, courseID, user.id);
                }
                return hasTerm;
            }
        });
    });
};

/**
 * Given some values, build the content then replace the node.
 *
 * @param {Number} datasetSize The total count of users that we may find users within.
 * @param {Array} userData The users found for the given search term.
 * @param {String} searchTerm The current users' search term.
 * @param {HTMLElement} component The DOM node that contains the entire searching module.
 * @param {Number} courseID The ID of the course to fetch the report of.
 * @param {HTMLElement} searchDropdown The child node that contains the dropdown area.
 * @returns {Promise<void>}
 */
const makeDropdownBodyContent = async(datasetSize, userData, searchTerm, component, courseID, searchDropdown) => {
    const {html, js} = await Templates.renderForPromise('gradereport_grader/search/resultset', {
        'users': userData.slice(0, 20), // Slicing this array to show max 20 raises questions about the "Showing 25 of 50" string
        'hasusers': userData.length > 0,
        'total': datasetSize,
        'found': userData.length,
        'searchterm': searchTerm,
        'selectall': selectAllResultsLink(searchTerm, courseID),
    });
    Templates.replaceNodeContents(searchDropdown, html, js);
};
