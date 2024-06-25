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
    element.disabled = true;
    element.classList.add('disabled');
    element.setAttribute('aria-disabled', 'true');
    element.setAttribute('readonly', 'readonly');
};

/**
 * Enable an element.
 *
 * @param {HTMLElement} element The element to be enabled.
 */
export const unlock = (element) => {
    element.disabled = false;
    element.classList.remove('disabled');
    element.setAttribute('aria-disabled', 'false');
    element.removeAttribute('readonly');
};

/**
 * Hide an element.
 *
 * @param {HTMLElement} element The element to be hidden.
 */
export const hide = (element) => {
    element.hidden = true;
    element.classList.add('hidden');
    // TODO: Likely need label management as well.
};

/**
 * Show an element.
 *
 * @param {HTMLElement} element The element to be shown.
 */
export const show = (element) => {
    element.hidden = false;
    element.classList.remove('hidden');
    // TODO: Likely need label management as well.
};
