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
        let lock = false;

        this.getDependantsOfType(target.name, 'notchecked').forEach((dependant, key) => {
            lock = Boolean(key) !== target.checked;
            determineDisplayMap(dependant, displayMap, lock);
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
        let lock = false;

        this.getDependantsOfType(target.name, 'checked').forEach((dependant, key) => {
            lock = Boolean(key) === target.checked;
            determineDisplayMap(dependant, displayMap, lock);
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
        const rTarget = this.getRadioFieldVal(target);
        let lock = false;

        this.getDependantsOfType(target.name, 'eq').forEach((dependant, key) => {
            if (target.type === 'radio') {
                lock = String(key) === String(rTarget.value);
                determineDisplayMap(dependant, displayMap, lock);
                return;
            } else if (target.type === 'hidden') {
                // This is the hidden input that is part of an advcheckbox.
                //hiddenVal = target.value === key;
                return;
            } else if (target.type === 'checkbox' && !target.checksed) {
                lock = target.checked === Boolean(key);
                determineDisplayMap(dependant, displayMap, lock);
                return;
            }
            if (target.classList.contains('filepickerhidden')) {
                lock = !M.form_filepicker.instances[target.id].fileadded;
                determineDisplayMap(dependant, displayMap, lock);
            } else if (target.tagName.toLowerCase() === 'select' && target.multiple) {
                // Multiple selects can have one or more value assigned. A pipe (|) is used as a value separator
                // when multiple values have to be selected at the same time.
            } else {
                lock = target.value === key;
                determineDisplayMap(dependant, displayMap, lock);
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
        const rTarget = this.getRadioFieldVal(target);
        let lock = false;

        // Get all the aliases of neq and check them all at once.
        const maps = [
            ...this.getDependantsOfType(target.name, 'neq')?.entries() ?? [],
            ...this.getDependantsOfType(target.name, 'ne')?.entries() ?? [],
            ...this.getDependantsOfType(target.name, 'noteq')?.entries() ?? [],
        ];
        const condensedMaps = new Map(maps);
        condensedMaps.forEach((dependant, key) => {
            if (target.type === 'radio') {
                lock = String(key) !== String(rTarget.value);
                determineDisplayMap(dependant, displayMap, lock);
                return;
            } else if (target.type === 'hidden') {
                // This is the hidden input that is part of an advcheckbox.
                //hiddenVal = target.value === key;
                return;
            } else if (target.type === 'checkbox' && !target.checked) {
                lock = target.checked === Boolean(key);
                determineDisplayMap(dependant, displayMap, lock);
                return;
            }
            if (target.classList.contains('filepickerhidden')) {
                lock = !!M.form_filepicker.instances[target.id].fileadded;
                determineDisplayMap(dependant, displayMap, lock);
            } else if (target.tagName.toLowerCase() === 'select' && target.multiple) {
                // Multiple selects can have one or more value assigned. A pipe (|) is used as a value separator
                // when multiple values have to be selected at the same time.
            } else {
                lock = target.value !== key;
                determineDisplayMap(dependant, displayMap, lock);
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
        let lock = false;

        this.getDependantsOfType(target.name, 'in').forEach((dependant, key) => {
            lock = key.split('|').includes(target.value);
            determineDisplayMap(dependant, displayMap, lock);
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
     * @returns {RadioNodeList|HTMLFormElement}
     */
    getRadioFieldVal(target) {
        return target.type === 'radio' ? this.form.form.elements.namedItem(target.name) : target;
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
 * Considering the dependant object and if we need to lock it, assign the elements to the correct displayMap key.
 *
 * @param {Object<Number, Array>} dependant The dependant object that contains the rules for hiding and locking.
 * @param {Map<String, Array>} displayMap The aggregation of elements that should be shown, hidden, locked, or unlocked.
 * @param {Boolean} lock According to the rules, should the element be locked or unlocked.
 */
const determineDisplayMap = (dependant, displayMap, lock) => {
    const hide = dependant.hasOwnProperty(dependencyBehaviour.hide) ? lock : false;
    if (dependant.hasOwnProperty(dependencyBehaviour.disable)) {
        //displayMap.get('show').push(dependant[dependencyBehaviour.disable]);
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
