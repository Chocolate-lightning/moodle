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
        const testMap = mapTemplate();

        this.getDependantsOfType(target.name, 'notchecked').forEach((dependant, key) => {
            if (Boolean(key) === target.checked) {
                showUnlock(dependant, testMap);
            } else {
                hideLock(dependant, testMap);
            }
        });

        return pruneEmptyDisplayOptions(testMap);
    }

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    checked(target) {
        const testMap = mapTemplate();

        this.getDependantsOfType(target.name, 'checked').forEach((dependant, key) => {
            if (Boolean(key) !== target.checked) {
                showUnlock(dependant, testMap);
            } else {
                hideLock(dependant, testMap);
            }
        });

        return pruneEmptyDisplayOptions(testMap);
    }

    // Handlers for default rules defined in the links in the JSDoc for this class.

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    eq(target) {
        const testMap = mapTemplate();

        this.getDependantsOfType(target.name, 'eq').forEach((dependant, key) => {
            if (key === target.value) {
                showUnlock(dependant, testMap);
            } else {
                hideLock(dependant, testMap);
            }
        });

        return pruneEmptyDisplayOptions(testMap);
    }

    // TODO: Whats the difference between neq, ne && noteq?
    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    neq(target) {
        const testMap = mapTemplate();

        this.getDependantsOfType(target.name, 'neq').forEach((dependant, key) => {
            if (key !== target.value) {
                hideLock(dependant, testMap);
            } else {
                showUnlock(dependant, testMap);
            }
        });

        return pruneEmptyDisplayOptions(testMap);
    }

    /**
     * Alias for ne => neq rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    ne(target) {
        return this.neq(target);
    }

    /**
     * Alias for noteq => neq rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    noteq(target) {
        return this.neq(target);
    }

    /**
     * Compare the value of the changed DOM node to the requested rule.
     * TODO: Likely needed for MDL-81410 and needs testing for confirmation of behaviour.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    gt(target) {
        const testMap = mapTemplate();

        this.getDependantsOfType(target.name, 'gt').forEach((dependant, key) => {
            if (target.value > key) {
                showUnlock(dependant, testMap);
            } else {
                hideLock(dependant, testMap);
            }
        });

        return pruneEmptyDisplayOptions(testMap);
    }

    // Moodle addons to the rules list.

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    in(target) {
        const testMap = mapTemplate();

        this.getDependantsOfType(target.name, 'in').forEach((dependant, key) => {
            if (key.split('|').includes(target.value)) {
                hideLock(dependant, testMap);
            } else {
                showUnlock(dependant, testMap);
            }
        });

        return pruneEmptyDisplayOptions(testMap);
    }

    /**
     * TODO: Review YUI module to verify if this is needed / what this likely does.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    hide(target) {
        const testMap = mapTemplate();

        window.console.log('hide', target);

        return pruneEmptyDisplayOptions(testMap);
    }

    /**
     * TODO: Review YUI module to verify if this is needed / what this likely does.
     *
     * @param {HTMLFormElement} target The changed DOM node to be compared against the requested rule.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    default(target) {
        const testMap = mapTemplate();

        window.console.log('hide', target);

        return pruneEmptyDisplayOptions(testMap);
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
 * @param {Map<String, Array>} testMap The aggregation of elements that should be shown, hidden, locked, or unlocked.
 */
const showUnlock = (dependant, testMap) => {
    if (dependant.hasOwnProperty(dependencyBehaviour.hide)) {
        testMap.get('show').push(...dependant[dependencyBehaviour.hide]);
    }
    if (dependant.hasOwnProperty(dependencyBehaviour.disable)) {
        testMap.get('unlock').push(...dependant[dependencyBehaviour.disable]);
    }
};

/**
 * Considering the dependant object, hide and lock the elements that are required.
 *
 * @param {Object<Number, Array>} dependant The dependant object that contains the rules for hiding and locking.
 * @param {Map<String, Array>} testMap The aggregation of elements that should be shown, hidden, locked, or unlocked.
 */
const hideLock = (dependant, testMap) => {
    if (dependant.hasOwnProperty(dependencyBehaviour.hide)) {
        testMap.get('hide').push(...dependant[dependencyBehaviour.hide]);
    }
    if (dependant.hasOwnProperty(dependencyBehaviour.disable)) {
        testMap.get('lock').push(...dependant[dependencyBehaviour.disable]);
    }
};

/**
 * A standard map that we'll be using to figure out what has to change and how.
 *
 * @returns {Map<String, Array>}
 */
const mapTemplate = () => {
    return new Map([
        ['hide', []],
        ['show', []],
        ['lock', []],
        ['unlock', []],
    ]);
};

/**
 * Given a map, remove any entries that have empty arrays / no elements to change.
 *
 * @param {Map<String, Array>} testMap The map to prune empty entries from.
 * @returns {Map<String, Array>|Map<>} The pruned map or map even a fully pruned map if noting has to change.
 */
const pruneEmptyDisplayOptions = (testMap) => {
    for (const [key, value] of testMap) {
        if (value.length === 0) {
            testMap.delete(key);
        }
    }
    return testMap;
};
