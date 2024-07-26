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
 * This file contains a set of rules that elements can be compared against to determine if they should be shown, hidden, etc...
 *
 * @See /lib/pear/HTML/QuickForm/Rule/Compare.php
 * @See https://pear.php.net/manual/en/package.html.html-quickform2.rules.list.php for a list of available rules.
 *
 * @module     core_form/form/rules
 * @copyright  2024 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

"use strict";

import {determineDisplayMap} from './display';

export default class Rules {
    /**
     * @var {Form} form The instance of the form class that has a DOM node & references matched.
     */
    form;

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    notchecked(target) {
        const displayMap = this.form.mapTemplate();
        let lock = false;

        this.form.getDependantsOfType(target.name, 'notchecked').forEach((dependant, key) => {
            if (target.disabled) {
                lock = true;
            } else {
                lock = Boolean(key) !== target.checked;
            }
            determineDisplayMap(dependant, displayMap, lock);
        });

        return displayMap;
    }

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    checked(target) {
        const displayMap = this.form.mapTemplate();
        let lock = false;

        this.form.getDependantsOfType(target.name, 'checked').forEach((dependant, key) => {
            if (target.disabled) {
                lock = true;
            } else {
                lock = Boolean(key) === target.checked;
            }
            determineDisplayMap(dependant, displayMap, lock);
        });

        return displayMap;
    }

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    eq(target) {
        const displayMap = this.form.mapTemplate();
        const rTarget = this.getRadioFieldVal(target);
        let lock = false;

        this.form.getDependantsOfType(target.name, 'eq').forEach((dependant, key) => {
            if (target.type === 'radio') {
                lock = String(key) === String(rTarget.value);
                determineDisplayMap(dependant, displayMap, lock);
                return;
            } else if (target.type === 'hidden' && this.getHiddenCkbs(target)) {
                // This is the hidden input that is part of an advcheckbox.
                lock = target.checked === Boolean(key);
                determineDisplayMap(dependant, displayMap, lock);
                return;
            } else if (target.type === 'checkbox' && !target.checked) {
                lock = target.checked === Boolean(key);
                determineDisplayMap(dependant, displayMap, lock);
                return;
            }
            if (target.classList.contains('filepickerhidden')) {
                lock = !M.form_filepicker.instances[target.id].fileadded;
                determineDisplayMap(dependant, displayMap, lock);
            } else {
                lock = target.value === key;
                determineDisplayMap(dependant, displayMap, lock);
            }
        });

        return displayMap;
    }

    /**
     * Compare the value of the changed DOM node to the requested rule.
     * @See Moodle has some interesting aliasing ne && noteq, this is also the old "default" rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    neq(target) {
        const displayMap = this.form.mapTemplate();
        const rTarget = this.getRadioFieldVal(target);
        let lock = false;

        // Get all the aliases of neq and check them all at once.
        const maps = [
            ...this.form.getDependantsOfType(target.name, 'neq')?.entries() ?? [],
            ...this.form.getDependantsOfType(target.name, 'ne')?.entries() ?? [],
            ...this.form.getDependantsOfType(target.name, 'noteq')?.entries() ?? [],
        ];
        const condensedMaps = new Map(maps);
        condensedMaps.forEach((dependant, key) => {
            if (target.type === 'radio') {
                lock = String(key) !== String(rTarget.value);
                determineDisplayMap(dependant, displayMap, lock);
                return;
            } else if (target.type === 'hidden' && this.getHiddenCkbs(target)) {
                // This is the hidden input that is part of an advcheckbox.
                lock = target.checked !== Boolean(key);
                determineDisplayMap(dependant, displayMap, lock);
                return;
            } else if (target.type === 'checkbox' && !target.checked) {
                lock = target.checked === Boolean(key);
                determineDisplayMap(dependant, displayMap, lock);
                return;
            }
            if (target.classList.contains('filepickerhidden')) {
                lock = !!M.form_filepicker.instances[target.id].fileadded;
                determineDisplayMap(dependant, displayMap, lock);
            } else {
                lock = target.value !== key;
                determineDisplayMap(dependant, displayMap, lock);
            }
        });

        return displayMap;
    }

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    in(target) {
        const displayMap = this.form.mapTemplate();
        let lock = false;

        this.form.getDependantsOfType(target.name, 'in').forEach((dependant, key) => {
            lock = key.split('|').includes(target.value);
            determineDisplayMap(dependant, displayMap, lock);
        });

        return displayMap;
    }

    // Getters of form elements.

    /**
     * Radio fields are a bit different, they need to be handled differently.
     *
     * @param {HTMLFormElement} target The changed DOM node to find a potential radio field for.
     * @returns {RadioNodeList|HTMLFormElement}
     */
    getRadioFieldVal(target) {
        return target.type === 'radio' ? this.form.form.elements.namedItem(target.name) : target;
    }

    /**
     * A small helper to determine if the advcheckboxes are being used.
     *
     * @param {HTMLElement} target The target element to get the hidden checkboxes for.
     * @returns {boolean} Is this a hidden checkbox?
     */
    getHiddenCkbs(target) {
        return this.form.form.querySelectorAll('input[type=checkbox][name="' + target.name + '"]').length !== 0;
    }

    /**
     * Constructor for the Rules class.
     * @param {Form} form The form object that the rules are being applied to.
     */
    constructor(form) {
        this.form = form;
    }
}
