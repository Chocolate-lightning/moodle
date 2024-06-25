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
     * @returns {{hide: *[], unlock: *[], show: *[], lock: *[]}} Actions to be taken along with elements that should be affected.
     */
    notchecked(target) {
        const dependants = this.getDependantsOfType(target.name, 'notchecked');
        let [hide, show, lock, unlock] = [[], [], [], []];

        dependants.forEach((dependant, key) => {
            if (Boolean(key) === target.checked) {
                showUnlock(dependant, show, unlock);
            } else {
                hideLock(dependant, hide, lock);
            }
        });

        return {hide, show, lock, unlock};
    }

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {{hide: *[], unlock: *[], show: *[], lock: *[]}} Actions to be taken along with elements that should be affected.
     */
    checked(target) {
        const dependants = this.getDependantsOfType(target.name, 'checked');
        let [hide, show, lock, unlock] = [[], [], [], []];

        dependants.forEach((dependant, key) => {
            if (Boolean(key) !== target.checked) {
                showUnlock(dependant, show, unlock);
            } else {
                hideLock(dependant, hide, lock);
            }
        });

        return {hide, show, lock, unlock};
    }

    // Handlers for default rules defined in the links in the JSDoc for this class.

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {{hide: *[], unlock: *[], show: *[], lock: *[]}} Actions to be taken along with elements that should be affected.
     */
    eq(target) {
        const dependants = this.getDependantsOfType(target.name, 'eq');
        let [hide, show, lock, unlock] = [[], [], [], []];

        dependants.forEach((dependant, key) => {
            if (key === target.value) {
                showUnlock(dependant, show, unlock);
            } else {
                hideLock(dependant, hide, lock);
            }
        });
        return {hide, show, lock, unlock};
    }

    // TODO: Whats the difference between neq, ne && noteq?
    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {{hide: *[], unlock: *[], show: *[], lock: *[]}} Actions to be taken along with elements that should be affected.
     */
    neq(target) {
        const dependants = this.getDependantsOfType(target.name, 'neq');
        let [hide, show, lock, unlock] = [[], [], [], []];

        dependants.forEach((dependant, key) => {
            if (key !== target.value) {
                hideLock(dependant, hide, lock);
            } else {
                showUnlock(dependant, show, unlock);
            }
        });
        // TODO: Maybe convert these returns to a Map where there are never empty arrays?
        return {hide, show, lock, unlock};
    }

    /**
     * Alias for ne => neq rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {{hide: *[], unlock: *[], show: *[], lock: *[]}} Actions to be taken along with elements that should be affected.
     */
    ne(target) {
        return this.neq(target);
    }

    /**
     * Alias for noteq => neq rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {{hide: *[], unlock: *[], show: *[], lock: *[]}} Actions to be taken along with elements that should be affected.
     */
    noteq(target) {
        return this.neq(target);
    }

    /**
     * Compare the value of the changed DOM node to the requested rule.
     * TODO: Likely needed for MDL-81410 and needs testing for confirmation of behaviour.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {{hide: *[], unlock: *[], show: *[], lock: *[]}} Actions to be taken along with elements that should be affected.
     */
    gt(target) {
        const dependants = this.getDependantsOfType(target.name, 'eq');
        let [hide, show, lock, unlock] = [[], [], [], []];

        dependants.forEach((dependant, key) => {
            if (target.value > key) {
                showUnlock(dependant, show, unlock);
            } else {
                hideLock(dependant, hide, lock);
            }
        });

        return {hide, show, lock, unlock};
    }

    // Moodle addons to the rules list.

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {{hide: *[], unlock: *[], show: *[], lock: *[]}} Actions to be taken along with elements that should be affected.
     */
    in(target) {
        const dependants = this.getDependantsOfType(target.name, 'in');
        let [hide, show, lock, unlock] = [[], [], [], []];

        dependants.forEach((dependant, key) => {
            if (key.split('|').includes(target.value)) {
                hideLock(dependant, hide, lock);
            } else {
                showUnlock(dependant, show, unlock);
            }
        });

        return {hide, show, lock, unlock};
    }

    /**
     * TODO: Review YUI module to verify if this is needed / what this likely does.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {{hide: *[], unlock: *[], show: *[], lock: *[]}} Actions to be taken along with elements that should be affected.
     */
    hide(target) {
        const dependants = this.getDependantsOfType(target.name, 'eq');
        let [hide, show, lock, unlock] = [[], [], [], []];

        window.console.log(dependants);

        return {hide, show, lock, unlock};
    }

    /**
     * TODO: Review YUI module to verify if this is needed / what this likely does.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {{hide: *[], unlock: *[], show: *[], lock: *[]}} Actions to be taken along with elements that should be affected.
     */
    default(target) {
        const dependants = this.getDependantsOfType(target.name, 'eq');
        let [hide, show, lock, unlock] = [[], [], [], []];

        window.console.log(dependants);

        return {hide, show, lock, unlock};
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
     * Constructor for the Rules class.
     * @param {Form} form The form object that the rules are being applied to.
     */
    constructor(form) {
        this.form = form;
    }
}

const dependencyBehaviour = {
    disable: 0,
    hide: 1,
};

/**
 * Considering the dependant object, show and unlock the elements that are required.
 *
 * @param {Object<Number, Array>} dependant The dependant object that contains the rules for showing and unlocking.
 * @param {Array} show The elements that should be shown if the rule for hiding is set.
 * @param {Array} unlock The elements that should be unlocked if the rule for locking is set.
 */
const showUnlock = (dependant, show, unlock) => {
    if (dependant.hasOwnProperty(dependencyBehaviour.hide)) {
        show.push(...dependant[dependencyBehaviour.hide]);
    }
    if (dependant.hasOwnProperty(dependencyBehaviour.disable)) {
        unlock.push(...dependant[dependencyBehaviour.disable]);
    }
};

/**
 * Considering the dependant object, hide and lock the elements that are required.
 *
 * @param {Object<Number, Array>} dependant The dependant object that contains the rules for hiding and locking.
 * @param {Array} hide The elements that should be hidden if the rule for hiding is set.
 * @param {Array} lock The elements that should be locked if the rule for locking is set.
 */
const hideLock = (dependant, hide, lock) => {
    if (dependant.hasOwnProperty(dependencyBehaviour.hide)) {
        hide.push(...dependant[dependencyBehaviour.hide]);
    }
    if (dependant.hasOwnProperty(dependencyBehaviour.disable)) {
        lock.push(...dependant[dependencyBehaviour.disable]);
    }
};
