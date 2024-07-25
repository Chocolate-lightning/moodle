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
 * This file contains some helper functions to change the visual state of the form elements.
 *
 * @module     core_form/form/dom
 * @copyright  2024 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

"use strict";

/**
 * Disable an element.
 *
 * @param {HTMLElement} element The element to be disabled.
 */
export const lock = (element) => {
    if (element !== null && !(element instanceof RadioNodeList)) {
        element.setAttribute('disabled', 'disabled');
        if (element.dataset.fieldtype === 'editor') {
            element.setAttribute('readonly', 'readonly');
            element.dispatchEvent(new Event('form:editorUpdated'));
        }
    }
};

/**
 * Enable an element.
 *
 * @param {HTMLElement} element The element to be enabled.
 */
export const unlock = (element) => {
    if (element !== null && !(element instanceof RadioNodeList)) {
        element.removeAttribute('disabled');
        if (element.dataset.fieldtype === 'editor') {
            element.removeAttribute('readonly');
            element.dispatchEvent(new Event('form:editorUpdated'));
        }
    }
};

/**
 * Hide an element.
 *
 * @param {HTMLElement} element The element to be hidden.
 */
export const hide = (element) => {
    if (element !== null && !(element instanceof RadioNodeList)) {
        element.setAttribute('disabled', 'disabled');
        const parent = element.closest('.fitem');
        if (parent) {
            parent.setAttribute('hidden', 'hidden');
            parent.classList.add('d-none');

            // Hide the label as well.
            const label = document.querySelector('label[for="' + element.id + '"]');
            if (label) {
                label.setAttribute('hidden', 'hidden');
                label.classList.add('d-none');
            }
        }
    }
};

/**
 * Show an element.
 *
 * @param {HTMLElement} element The elements to be shown.
 */
export const show = (element) => {
    if (element !== null && !(element instanceof RadioNodeList)) {
        element.removeAttribute('disabled');
        const parent = element.closest('.fitem');
        if (parent) {
            parent.removeAttribute('hidden');
            parent.classList.remove('d-none');

            // Show the label as well.
            const label = document.querySelector('label[for="' + element.id + '"]');
            if (label) {
                label.removeAttribute('hidden');
                label.classList.remove('d-none');
            }
        }
    }
};

/**
 * A small object that defines the behaviour of the dependency rules for readability.
 *
 * @type {{hide: number, disable: number}}
 */
const dependencyBehaviour = {
    disable: 0,
    hide: 1,
};

/**
 * Considering the dependant object and if we need to lock it, assign the elements to the correct displayMap key.
 *
 * @param {Object<Number, Array>} dependant The dependant object that contains the rules for hiding and locking.
 * @param {Map<String, Array>} displayMap The aggregation of elements that should be shown, hidden, locked, or unlocked.
 * @param {Boolean} lock According to the rules, should the element be locked or unlocked.
 */
export const determineDisplayMap = (dependant, displayMap, lock) => {
    const hide = dependant.hasOwnProperty(dependencyBehaviour.hide) ? lock : false;
    if (dependant.hasOwnProperty(dependencyBehaviour.disable)) {
        displayMap.get('show').push(dependant[dependencyBehaviour.disable]);
        if (lock) {
            displayMap.get('lock').push(dependant[dependencyBehaviour.disable]);
        } else {
            displayMap.get('unlock').push(dependant[dependencyBehaviour.disable]);
        }
    } else if (dependant.hasOwnProperty(dependencyBehaviour.hide)) {
        // Prevent showing an element if it has already been defined hidden.
        if (!hide && !displayMap.get('hide').toString().includes(dependant[dependencyBehaviour.hide].toString())) {
            displayMap.get('show').push(dependant[dependencyBehaviour.hide]);
        } else {
            displayMap.get('hide').push(dependant[dependencyBehaviour.hide]);
        }
    }
};
