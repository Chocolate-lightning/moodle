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

export default class Rules {
    /**
     * @var {Form} form The instance of the form class that has a DOM node & references matched.
     */
    form;

    // Shorthand helpers rather than requiring devs to export the value and use an eq or neq check.

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    notchecked(target) {
        const displayMap = this.form.mapTemplate();

        this.getDependantsOfType(target.name, 'notchecked').forEach((dependant, key) => {
            if (Boolean(key) === target.checked) {
                showUnlock(dependant, displayMap);
            } else {
                hideLock(dependant, displayMap);
            }
        });

        return this.form.displayMapPrune(displayMap);
    }

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    checked(target) {
        const displayMap = this.form.mapTemplate();

        this.getDependantsOfType(target.name, 'checked').forEach((dependant, key) => {
            if (Boolean(key) !== target.checked) {
                showUnlock(dependant, displayMap);
            } else {
                hideLock(dependant, displayMap);
            }
        });

        return this.form.displayMapPrune(displayMap);
    }

    // Handlers for default rules defined in the links in the JSDoc for this class.

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    eq(target) {
        const displayMap = this.form.mapTemplate();
        const radioFieldVal = this.getRadioFieldVal(target);

        this.getDependantsOfType(target.name, 'eq').forEach((dependant, key) => {
            if (key === target.value || String(key) === String(radioFieldVal?.value)) {
                hideLock(dependant, displayMap);
            } else {
                showUnlock(dependant, displayMap);
            }
        });

        return this.form.displayMapPrune(displayMap);
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
        const radioFieldVal = this.getRadioFieldVal(target);

        // TODO: get ne & noteq as well.
        this.getDependantsOfType(target.name, 'neq').forEach((dependant, key) => {
            if (key !== target.value || String(key) !== String(radioFieldVal?.value)) {
                hideLock(dependant, displayMap);
            } else {
                showUnlock(dependant, displayMap);
            }
        });

        return this.form.displayMapPrune(displayMap);
    }

    // Moodle addons to the rules list.

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    in(target) {
        const displayMap = this.form.mapTemplate();

        this.getDependantsOfType(target.name, 'in').forEach((dependant, key) => {
            if (key.split('|').includes(target.value)) {
                hideLock(dependant, displayMap);
            } else {
                showUnlock(dependant, displayMap);
            }
        });

        return this.form.displayMapPrune(displayMap);
    }

    /**
     * Call off to the Form() to grab the elements that listen to the passed rule for the given element.
     *
     * @param {String} element The name of the element to get the dependants for.
     * @param {String} type The rule type to get the dependants for.
     * @returns {Array<String>|[]}
     */
    getDependantsOfType(element, type) {
        return this.form.getDependantsOfType(element, type);
    }

    /**
     * Radio fields are a bit different, they need to be handled differently.
     *
     * @param {HTMLFormElement} target The changed DOM node to find a potential radio field for.
     * @returns {RadioNodeList|null}
     */
    getRadioFieldVal(target) {
        return target.type === 'radio' ? this.form.form.elements.namedItem(target.name) : null;
    }

    /**
     * Constructor for the Rules class.
     * @param {Form} form The form object that the rules are being applied to.
     */
    constructor(form) {
        this.form = form;
    }
}

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
 * Considering the dependant object, show and unlock the elements that are required.
 *
 * @param {Object<Number, Array>} dependant The dependant object that contains the rules for showing and unlocking.
 * @param {Map<String, Array>} displayMap The aggregation of elements that should be shown, hidden, locked, or unlocked.
 */
const showUnlock = (dependant, displayMap) => {
    if (dependant.hasOwnProperty(dependencyBehaviour.hide)) {
        displayMap.get('show').push(dependant[dependencyBehaviour.hide]);
    }
    if (dependant.hasOwnProperty(dependencyBehaviour.disable)) {
        displayMap.get('unlock').push(dependant[dependencyBehaviour.disable]);
    }
};

/**
 * Considering the dependant object, hide and lock the elements that are required.
 *
 * @param {Object<Number, Array>} dependant The dependant object that contains the rules for hiding and locking.
 * @param {Map<String, Array>} displayMap The aggregation of elements that should be shown, hidden, locked, or unlocked.
 */
const hideLock = (dependant, displayMap) => {
    if (dependant.hasOwnProperty(dependencyBehaviour.hide)) {
        displayMap.get('hide').push(dependant[dependencyBehaviour.hide]);
    }
    if (dependant.hasOwnProperty(dependencyBehaviour.disable)) {
        displayMap.get('lock').push(dependant[dependencyBehaviour.disable]);
    }
};
