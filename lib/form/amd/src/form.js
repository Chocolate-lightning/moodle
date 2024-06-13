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
 * This file contains JS functionality required by mforms and is included automatically
 * when required.
 *
 * @module     core_form/form
 * @copyright  2024 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// import * as FormChangeChecker from 'core_form/changechecker';
// import * as FormEvents from 'core_form/events';
import {Rules} from 'core_form/form/rules';
import {disableElement, enableElement, hideElement, showElement} from 'core_form/form/dom';

export default class Form {
    form = '';
    dependencies = [];

    /**
     * Create a new form instance.
     *
     * @param {String} formID The ID of the form to be managed.
     * @param {Object} dependencies The passed object of form dependencies.
     */
    constructor(formID, dependencies) {
        // Set class properties.
        this.form = document.querySelector(`#${formID}`);
        this.dependencies = this.dependencyMapper(dependencies);
        this.rules = new Rules();

        // Handle mutations within the form.
        this.registerEventListeners();
    }

    /**
     * Add event listeners to the form.
     */
    registerEventListeners() {
        this.form.addEventListener('change', (e) => {
            if (e.target.type === 'submit') {
                this.form.submit();
            }
            if (e.target.type === 'reset') {
                this.form.reset();
            }
            // Something changes based on this element.
            if (this.dependencies.has(e.target.name)) {
                this.dependencyDispatcher(e.target, this.dependencies.get(e.target.name));
            }
        });
    }

    /**
     * Dispatch the dependency rules to the appropriate rule handler.
     *
     * @param {HTMLFormElement} target The name associated to the element that has changed.
     * @param {Map<String, Map>} dependants The map of rules that are associated to the element.
     */
    dependencyDispatcher(target, dependants) {
        let elementsNames = {};
        if (dependants.has('checked')) {
            this.rules.checked(target.value, dependants.get('checked'));
        }
        if (dependants.has('notchecked')) {
            this.rules.notChecked(target.value, dependants.get('notchecked'));
        }
        if (dependants.has('eq')) {
            elementsNames = this.rules.eq(target.value, dependants.get('eq'));
            this.domDispatch(elementsNames);
        }
        if (dependants.has('neq')) {
            elementsNames = this.rules.neq(target.value, dependants.get('neq'));
            this.domDispatch(elementsNames);
        }
        if (dependants.has('ne')) {
            this.rules.ne(target.value, dependants.get('ne'));
        }
        if (dependants.has('gt')) {
            this.rules.gt(target.value, dependants.get('gt'));
        }
        if (dependants.has('lt')) {
            this.rules.lt(target.value, dependants.get('lt'));
        }
    }

    /**
     * Dispatch the DOM manipulation to the appropriate function.
     *
     * @param {Object<hide[String], show[String], lock[String], unlock[String]>} elementsNames What needs to change.
     */
    domDispatch(elementsNames) {
        this.elementNamesToDomNodes(elementsNames.hide).forEach((element) => {
            if (element === null) {
                return;
            }
            hideElement(element);
        });
        this.elementNamesToDomNodes(elementsNames.lock).forEach((element) => {
            if (element === null) {
                return;
            }
            disableElement(element);
        });
        this.elementNamesToDomNodes(elementsNames.show).forEach((element) => {
            if (element === null) {
                return;
            }
            showElement(element);
        });
        this.elementNamesToDomNodes(elementsNames.unlock).forEach((element) => {
            if (element === null) {
                return;
            }
            enableElement(element);
        });
    }

    /**
     * Convert the element names into DOM nodes based on the element names.
     *
     * @param {Array<String>} elementNames The name of dependent elements to get associated DOM nodes.
     * @returns {Array<HTMLFormElement>}
     */
    elementNamesToDomNodes(elementNames) {
        return elementNames.map((element) => {
            return this.form.elements.namedItem(element);
        });
    }

    /**
     * Convert the dependencies object into a map of elements and their associated rules.
     *
     * @example
     * Note: This is a simplified example of the returned map showing the rules for the grade type element in assign.
     *
     *      "grade[modgrade_type]" => Map {
     *          "eq" => Map {
     *              "none" => Object {
     *                  1 => Array [
     *                      "advancedgradingmethod_submissions",
     *                      "gradecat",
     *                      "gradepass",
     *                      "completionusegrade",
     *                      "completionusegrade",
     *                  ]
     *              }
     *          },
     *          "neq" => Map {
     *              "point" => Object {
     *                  1 => Array [
     *                      "grade[modgrade_point]",
     *                      "grade[modgrade_rescalegrades]"
     *                  ]
     *              },
     *              "scale" => Object {
     *                  1 => Array [
     *                      "grade[modgrade_scale]"
     *                  ]
     *              }
     *          }
     *      }
     *
     * Note: If the value of grade[modgrade_type] === "none" then the array of elements defined should be hidden.
     * Note: If the value of grade[modgrade_type] !== "point" then the array of elements defined within the following:
     * "eq" => "none" && "neq" => "scale" should be hidden.
     *
     * Note: The object within the "rule" map can contain either 0 or 1 this helps determine if the element should be:
     *       hidden or locked if the rule is met.
     * @See formslib.php DEP_DISABLE & DEP_HIDE.
     *
     * @param {Object} dependencies The supplied object of form dependencies to migrate into a map.
     * @returns {Map<String, Map>} A map of elements and their associated rules.
     */
    dependencyMapper(dependencies) {
        /**
         * Convert the object into a first level map. i.e. elementName => ruleType.
         *
         * @type {Map<string, Map>} The map of rules associated to the given element.
         * @example "grade[modgrade_type]" => Map<"eq", "neq">
         */
        const elementMap = new Map(Object.entries(dependencies));
        elementMap.forEach((elementrules, key) => {
            /**
             * Convert the element rules object into a map.
             *
             * @type {Map<string, Map>} The map of rules associated to the given element.
             * @example "eq" => Map<"none" => Object<Number, Array>>
             * @example "neq" => Map<"point" => Object<Number, Array>, "scale" => Object<Number, Array>>
             */
            const ruleMap = new Map(Object.entries(elementrules));
            ruleMap.forEach((ruleComparisons, key) => {
                ruleMap.set(key, new Map(Object.entries(ruleComparisons)));
            });
            elementMap.set(key, ruleMap);
        });
        return elementMap;
    }

    /**
     * Initialize the form and its dependencies.
     *
     * @param {String} formID The ID of the form to be managed.
     * @param {Object} dependencies The passed object of form dependencies.
     * @returns {Form} An instance associated to a specific form on an given page.
     */
    static init(formID, dependencies) {
        return new Form(formID, dependencies);
    }
}
