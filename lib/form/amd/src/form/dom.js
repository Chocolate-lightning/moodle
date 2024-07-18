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
 * @param {Array<HTMLElement>} elements The element to be disabled.
 */
export const lock = (elements) => {
    elements.forEach(element => {
        if (element !== null) {
            element.setAttribute('disabled', 'disabled');
            // TODO: Editor check.
            element.setAttribute('readonly', 'readonly');
            element.dispatchEvent(new Event('form:editorUpdated'));
        }
    });
};

/**
 * Enable an element.
 *
 * @param {Array<HTMLElement>} elements The element to be enabled.
 */
export const unlock = (elements) => {
    elements.forEach(element => {
        if (element !== null) {
            element.removeAttribute('disabled');
            // TODO: Editor check.
            element.removeAttribute('readonly');
            element.dispatchEvent(new Event('form:editorUpdated'));
        }
    });
};

/**
 * Hide an element.
 *
 * @param {Array<HTMLElement>} elements The elements to be hidden.
 */
export const hide = (elements) => {
    elements.forEach(element => {
        // TODO: RadioNodeList is not an instance of HTMLElement, need to find a way to handle this.
        if (element !== null && element instanceof HTMLElement) {
            element.setAttribute('disabled', 'disabled');
            // Check if the element is part of a group otherwise, just grab the nearest wrapping element.
            const parent = element.closest('[data-groupname]') ? element.closest('[data-groupname]') : element.closest('.fitem');
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
        }/* else {
            window.console.log('Hide: Element is not an instance of HTMLElement', element);
        }*/
    });
};

/**
 * Show an element.
 *
 * @param {Array<HTMLElement>} elements The elements to be shown.
 */
export const show = (elements) => {
    elements.forEach(element => {
        // TODO: RadioNodeList is not an instance of HTMLElement, need to find a way to handle this.
        if (element !== null && element instanceof HTMLElement) {
            element.removeAttribute('disabled');
            // Check if the element is part of a group otherwise, just grab the nearest wrapping element.
            const parent = element.closest('[data-groupname]') ? element.closest('[data-groupname]') : element.closest('.fitem');
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
        }/* else {
            window.console.log('Show: Element is not an instance of HTMLElement', element);
        }*/
    });
};
