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
 * Admin search suggestions to the site admin settings page.
 *
 * @module     core/settings/suggestions
 * @package    core/settings
 * @copyright  2020 Simeon Naydenov <moniNaydenov@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {debounce} from 'core/utils';
import * as Templates from 'core/templates';
import {arrowUp, arrowDown, enter} from 'core/key_codes';

const selectors = {
    body: 'body',
    currentResult: 'li.bg-secondary',
    firstResult: 'li:first-child',
    lastResult: 'li:last-child',
    searchBox: '#id_query',
    searchLinks: '.tab-pane ul li a'
};
const cssClasses = {
    selectedResult: 'bg-secondary'
};

const searchBox = document.querySelector(selectors.searchBox);
const resultBox = document.createElement('ul');
const searchLinks = document.querySelectorAll(selectors.searchLinks);
// Let's make the a useful array of objects for ourselves.
const builtLinks = Array.prototype.map.call(searchLinks, link => ({
    name: link.innerHTML.toLowerCase(),
    action: link.href,
    fullName: link.innerHTML
}));
const foundLinks = [];

/**
 * Initialize the resultBox and registerEventListeners
 *
 * @method init
 */
export const init = () => {
    resultBox.dataset.search = 'result';
    resultBox.style.zIndex = 999999;
    resultBox.classList.add('list-group', 'bg-white', 'position-absolute');
    searchBox.parentNode.insertBefore(resultBox, searchBox.nextSibling);
    hideResultBox();
    registerEventListeners();
};

/**
 * Function that goes through the list of builtLinks and compares against the provided input in the searchBox.
 * The matching links are then displayed inside resultBox
 *
 * @method keyUp
 */
const searchBuiltLinks = async () => {
    let query = searchBox.value.toLowerCase();
    // Clears out resultBox and foundLinks array.
    resultBox.innerHTML = '';
    foundLinks.length = 0;
    if (query.length >= 2) {
        // If input length is more than one character, perform search
        builtLinks.forEach((link) => {
            if (link.name.includes(query)) {
                let itemFound = false;
                foundLinks.forEach(item => {
                    itemFound = itemFound || item.name === link.name;
                });
                if (!itemFound) {
                    foundLinks.push(link);
                }
            }
        });
        // Sort the results.
        foundLinks.sort((a, b) => {
            if (a.fullName < b.fullName) {
                return -1;
            } else if (a.fullName > b.fullName) {
                return 1;
            }
            return 0;
        });
        // Pass the results to the template render.
        const {html, js} = await Templates.renderForPromise('core/settings/settings-results', foundLinks);
        Templates.replaceNodeContents(resultBox, html, js);
    }
    if (foundLinks.length === 0) {
        hideResultBox();
    } else {
        showResultBox();
    }
};

/**
 * Listener that handles keyDown event. Depending on the keyCode, it does:
 *   * arrowDown, arrowUp - iterates through the results in resultBox (if present)
 *   * enter - if no item is selected, submits the form, if an item is selected, does nothing and waits for keyup event
 *
 * @method keyDown
 */
const keyDown = (e) => {
    if (foundLinks.length === 0) {
        return;
    }
    let current = resultBox.querySelector(selectors.currentResult);
    let next = null;
    if (e.keyCode === arrowDown) {
        e.preventDefault();
        // Goes down through the list of found links.
        if (current === null) {
            next = resultBox.querySelector(selectors.firstResult);
        } else {
            next = current.nextElementSibling;
        }
    } else if (e.keyCode === arrowUp) {
        e.preventDefault();
        // Goes up through the list of found links.
        if (current === null) {
            next = resultBox.querySelector(selectors.lastResult);
        } else {
            next = current.previousElementSibling;
        }
    } else if (e.keyCode === enter) {
        // In case item is selected, do nothing. enter is later handled in keyUp.
        if (current !== null) {
            e.preventDefault();
            return;
        }
    }
    if (next !== null) {
        // Changes the currently selected item (if applicable).
        next.classList.add(cssClasses.selectedResult);
        if (current !== null) {
            current.classList.remove(cssClasses.selectedResult);
        }
    }
};

/**
 * Helper function that handles keyUp events. in case of up/down arrows, nothing happens, if keyCode == enter, then
 * the selected (if any) result is opened
 *
 * @method keyUp
 */
const keyUp = (e) => {
    let current = resultBox.querySelector(selectors.currentResult);
    if (e.keyCode === arrowDown || e.keyCode === arrowUp) {
        e.preventDefault();
    } else if (e.keyCode === enter) {
        if (current !== null) {
            e.preventDefault();
            window.location = current.querySelector('a').href;
        }
    }
};

/**
 * Hides the resultBox
 *
 * @method hideResultBox
 */
const hideResultBox = () => {
    resultBox.classList.add('d-none');
};

/**
 * Shows the resultBox
 *
 * @method showResultBox
 */
const showResultBox = () => {
    resultBox.classList.remove('d-none');
};

/**
 * Helper method that adds all necessary event listeners
 *
 * @method registerEventListeners
 */
const registerEventListeners = () => {
    searchBox.addEventListener('input', debounce(async() => { searchBuiltLinks(); }, 300));
    searchBox.addEventListener('keyup', keyUp);
    searchBox.addEventListener('keydown', keyDown);
    resultBox.addEventListener('keydown', keyDown);
    document.querySelector(selectors.body).addEventListener('click', (e) => {
        // Click event hides the resultBox if the click is outside resultBox or searchBox.
        let eventPath = e.composedPath();
        let firedFromResultBox = false;
        eventPath.forEach((elem) => {
            firedFromResultBox = firedFromResultBox || (elem instanceof HTMLElement && elem.isEqualNode(resultBox));
        });
        if (!firedFromResultBox && !searchBox.isEqualNode(e.target)) {
            hideResultBox();
        }
    });
};