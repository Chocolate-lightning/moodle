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
    form = '';
    dependencyBehaviour = {
        disable: 0,
        hide: 1,
    };

    // Shorthand helper rather than requiring devs to export the value and use a eq or neq check.

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
                this.showUnlock(dependant, show, unlock);
            } else {
                this.hideLock(dependant, hide, lock);
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
                this.showUnlock(dependant, show, unlock);
            } else {
                this.hideLock(dependant, hide, lock);
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
                this.showUnlock(dependant, show, unlock);
            } else {
                this.hideLock(dependant, hide, lock);
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
    neq(target) {
        const dependants = this.getDependantsOfType(target.name, 'neq');
        let [hide, show, lock, unlock] = [[], [], [], []];

        dependants.forEach((dependant, key) => {
            if (key !== target.value) {
                this.hideLock(dependant, hide, lock);
            } else {
                this.showUnlock(dependant, show, unlock);
            }
        });
        return {hide, show, lock, unlock};
    }

    /**
     * TODO: Compare the value of the changed DOM node to the requested rule.
     * TODO: Whats the difference between neq, ne && noteq?
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {{hide: *[], unlock: *[], show: *[], lock: *[]}} Actions to be taken along with elements that should be affected.
     */
    ne(target) {
        const dependants = this.getDependantsOfType(target.name, 'ne');
        let [hide, show, lock, unlock] = [[], [], [], []];

        dependants.forEach((dependant, key) => {
            if (key !== target.value) {
                this.hideLock(dependant, hide, lock);
            } else {
                this.showUnlock(dependant, show, unlock);
            }
        });

        return {hide, show, lock, unlock};
    }

    // TODO: Document these different rule types that are Moodle? only??

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
                this.hideLock(dependant, hide, lock);
            } else {
                this.showUnlock(dependant, show, unlock);
            }
        });

        return {hide, show, lock, unlock};
    }

    /**
     * TODO: Compare the value of the changed DOM node to the requested rule.
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
     * TODO: Compare the value of the changed DOM node to the requested rule.
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
     * Considering the dependant object, show and unlock the elements that are required.
     *
     * @param {Object<Number, Array>} dependant The dependant object that contains the rules for showing and unlocking.
     * @param {Array} show The elements that should be shown if the rule for hiding is set.
     * @param {Array} unlock The elements that should be unlocked if the rule for locking is set.
     */
    showUnlock(dependant, show, unlock) {
        if (dependant.hasOwnProperty(this.dependencyBehaviour.hide)) {
            show.push(...dependant[this.dependencyBehaviour.hide]);
        }
        if (dependant.hasOwnProperty(this.dependencyBehaviour.disable)) {
            unlock.push(...dependant[this.dependencyBehaviour.disable]);
        }
    }

    /**
     * Considering the dependant object, hide and lock the elements that are required.
     *
     * @param {Object<Number, Array>} dependant The dependant object that contains the rules for hiding and locking.
     * @param {Array} hide The elements that should be hidden if the rule for hiding is set.
     * @param {Array} lock The elements that should be locked if the rule for locking is set.
     */
    hideLock(dependant, hide, lock) {
        if (dependant.hasOwnProperty(this.dependencyBehaviour.hide)) {
            hide.push(...dependant[this.dependencyBehaviour.hide]);
        }
        if (dependant.hasOwnProperty(this.dependencyBehaviour.disable)) {
            lock.push(...dependant[this.dependencyBehaviour.disable]);
        }
    }

    /**
     * TODO: Document...
     *
     * @param {String} element The name of the element to get the dependants for.
     * @param {String} type The rule type to get the dependants for.
     * @returns {*|[]}
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
