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
 * @module     core_form/form/rules
 * @copyright  2024 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

export class Rules {

    // eslint-disable-next-line no-unused-vars
    notChecked(value, dependants) {}

    // eslint-disable-next-line no-unused-vars
    checked(value, dependants) {}

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {String} value The value of the changed DOM node to be compared against the requested rule.
     * @param {Map<String, Object>} dependants The values to compare vs the DOM and associated actions and elements to mutate.
     * @returns {{hide: *[], unlock: *[], show: *[], lock: *[]}} Actions to be taken along with elements that should be affected.
     */
    eq(value, dependants) {
        let hide = [];
        let show = [];
        let lock = [];
        let unlock = [];
        dependants.forEach((dependant, key) => {
            if (key === value) {
                window.console.log('The eq value matches the condition');
                this.showUnlock(dependant, show, unlock);
            } else {
                window.console.log('The eq value requires action');
                this.hideLock(dependant, hide, lock);
            }
        });
        return {hide, lock, show, unlock};
    }

    /**
     * Compare the value of the changed DOM node to the requested rule.
     *
     * @param {String} value The value of the changed DOM node to be compared against the requested rule.
     * @param {Map<String, Object>} dependants The values to compare vs the DOM and associated actions and elements to mutate.
     * @returns {{hide: *[], unlock: *[], show: *[], lock: *[]}} Actions to be taken along with elements that should be affected.
     */
    neq(value, dependants) {
        let hide = [];
        let show = [];
        let lock = [];
        let unlock = [];
        dependants.forEach((dependant, key) => {
            if (key !== value) {
                window.console.log('The neq value requires action');
                this.hideLock(dependant, hide, lock);
            } else {
                window.console.log('The neq value matches the condition');
                this.showUnlock(dependant, show, unlock);
            }
        });
        return {hide, lock, show, unlock};
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

    // eslint-disable-next-line no-unused-vars
    ne(value, dependants) {}

    // eslint-disable-next-line no-unused-vars
    gt(value, dependants) {}

    // eslint-disable-next-line no-unused-vars
    lt(value, dependants) {}

    inSet() {}

    hide() {}

    default() {}

    /**
     * Constructor for the Rules class.
     */
    constructor() {
        this.dependencyBehaviour = {
            disable: 0,
            hide: 1,
        };
    }
}
