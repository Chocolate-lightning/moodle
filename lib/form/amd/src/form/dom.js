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
 * TODO: Considerations requiring action:
 *
 * Things old YUI looked for after grabbing the element DOM ancestor (Label management):
 * Classes: fitem fitem_fgroup
 * Data attributes: label[for="' + id + '"]
 * Selectors from old YUI:
 * .fitem [data-fieldtype="filepicker"] input,
 * .fitem [data-fieldtype="filemanager"] input,
 * .fitem [data-fieldtype="group"] input[id*="filemanager"]
 *
 * Guessed selectors:
 * [data-groupname="${element}"]
 *
 * Other things to consider:
 * Special handling for editors & filepickers i.e. Name suffix on editors -> See old YUI?
 * element.setAttribute('aria-disabled', <State Bool>>);
 * element.setAttribute('readonly', 'readonly');
 */

/**
 * Disable an element.
 *
 * @param {HTMLElement} element The element to be disabled.
 */
// eslint-disable-next-line no-unused-vars
export const lock = (element) => {
    // window.console.log('Lock node:', element);
    // element.disabled = true;
    // element.classList.add('disabled');
};

/**
 * Enable an element.
 *
 * @param {HTMLElement} element The element to be enabled.
 */
export const unlock = (element) => {
    show(element);
    // window.console.log('Unlock node:', element);
    // element.disabled = false;
    // element.classList.remove('disabled');
};

/**
 * Hide an element.
 *
 * @param {HTMLElement} element The element to be hidden.
 */
export const hide = (element) => {
    // Lock the element to prevent interaction.
    lock(element);
    // window.console.log('Hide node:', element);
    // element.hidden = true;
    // element.classList.add('hidden');
};

/**
 * Show an element.
 *
 * @param {HTMLElement} element The element to be shown.
 */
// eslint-disable-next-line no-unused-vars
export const show = (element) => {
    //window.console.log('Show node:', element);
    // element.hidden = false;
    // element.classList.remove('hidden');
};
