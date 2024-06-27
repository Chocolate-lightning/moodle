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
 * @see /lib/formslib.php#L2548 Candidate for removal, depends on grouped rules.
 * @see /lib/amd/src/showhidesettings.js Candidate for removal.
 *
 * @module     core_form/form
 * @copyright  2024 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

"use strict";

// Pure form functionality.
// import {serialize} from './util';
import * as FormChangeChecker from './changechecker';
import * as FormEvents from './events';
import * as Submit from './submit';
import Rules from './form/rules';
import * as MutateDom from './form/dom';

// Maybe not needed but noted just in case.
// import * as CollapseSections from './collapsesections'; // TODO: This is included via ../collapsesections.mustache
// import * as EncryptedPassword from './encryptedpassword'; // TODO: This is included via ../setting_encryptedpassword.mustache
// import * as FileTypes from './filetypes'; // TODO: This is included via /lib/form/filetypes.php#L152
// import * as PasswordUnmask from './passwordunmask'; // TODO: This is included via ../element-passwordunmask.mustache
// import * as ShowAdvanced from './showadvanced'; // TODO: This is included via /lib/formslib.php#L3349

// Custom element types, Likely not needed.
// import * as ChoiceDropdown from 'core_form/choicedropdown'; // TODO: This is included via ../choicedropdown.mustache
// import * as ConfigText_maxlength from 'core_form/configtext_maxlength'; // TODO: This is included via lib/adminlib.php#L2635
// import * as DefaultCustom from 'core_form/defaultcustom'; // TODO: This is included via lib/form/defaultcustom.php#L253

export default class Form {
    /**
     * @var {HTMLFormElement} form Our very own form to work on.
     */
    form;

    /**
     * @var {Map} dependencies Our map of form dependencies.
     */
    dependencies;

    /**
     * Create a new form instance.
     *
     * @param {String} formID The ID of the form to be managed.
     * @param {Object} dependencies The passed object of form dependencies.
     */
    constructor(formID, dependencies) {
        // Set class properties.
        this.form = document.querySelector(`#${formID}`);
        this.dependencies = this.getDependencyMapper(dependencies);
        this.rules = new Rules(this);

        // Handle mutations within the form.
        this.registerEventListeners();
        // TODO: Vanity call...
        FormChangeChecker.watchForm(this.form);
    }

    /**
     * Add event listeners to the form.
     */
    registerEventListeners() {
        this.form.addEventListener('change', (e) => {
            if (e.target.type === 'submit') {
                // TODO: Dummy calls so import list looks better...
                // Notify listeners that the form is about to be submitted (this will reset atto autosave).
                FormEvents.notifyFormSubmittedByJavascript(this.form);
                FormChangeChecker.resetFormDirtyState(this.form);
                // TODO: Figure out what the Submit module does and if it is needed.
                Submit.init(e.target.id);
            }
            if (e.target.type === 'reset') {
                this.form.reset();
            }
            // Something changes based on this element.
            if (this.dependencies.has(e.target.name)) {
                this.dispatchDependencyRules(e.target);
            }
        });
    }

    /**
     * Dispatch the dependency rules to the appropriate rule handler.
     *
     * @param {HTMLFormElement} target The name associated to the element that has changed.
     */
    dispatchDependencyRules(target) {
        this.dependencies.get(target.name).forEach((dependants, ruleName) => {
            // If the rule exists, use it, otherwise fallback to 'neq' which seems to be the "default" rule originally.
            const elNamesMap = this.rules[ruleName] ? this.rules[ruleName](target) : this.rules.neq(target);
            // TODO: If there is a form element matching the target name, pass that instead as it'll likely be a radiogroup.
            // TODO: Maybe collate the results of the rules into a single object to then dispatch to the DOM.
            window.console.log('elNamesMap', elNamesMap);
            this.domDispatch(elNamesMap);
        });
    }

    /**
     * For a given element, get the names of DOM nodes that can change based on the given rule type name.
     *
     * @param {String} element The name of the element to get the dependants for.
     * @param {String} type The rule type to get the dependants for.
     * @returns {Array<String>|[]}
     */
    getDependantsOfType(element, type) {
        return this.dependencies.get(element) !== 'undefined' ? this.dependencies.get(element).get(type) ?? [] : [];
    }

    /**
     * Dispatch the DOM manipulation to the appropriate function.
     *
     * @param {Map<String, Array>} elNamesMap What needs to change.
     */
    domDispatch(elNamesMap) {
        elNamesMap.forEach((elements, domUpdateOpt) => {
            if (!MutateDom[domUpdateOpt]) {
                return;
            }
            const nodes = this.elementNamesToDomNodes(elements);
            nodes.forEach((node) => {
                if (node === null) {
                    return;
                }
                MutateDom[domUpdateOpt](node);
            });
        });
    }

    /**
     * Convert the element names into DOM nodes based on the element names.
     *
     * @param {Array<String>} elementNames The name of dependent elements to get associated DOM nodes.
     * @returns {Array<HTMLFormElement|RadioNodeList>}
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
     * @See /lib/formslib.php DEP_DISABLE & DEP_HIDE.
     *
     * @param {Object} dependencies The supplied object of form dependencies to migrate into a map.
     * @returns {Map<String, Map>} A map of elements and their associated rules.
     */
    getDependencyMapper(dependencies) {
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
     * @returns {Form} An instance associated to a specific form on a given page.
     */
    static init(formID, dependencies) {
        return new Form(formID, dependencies);
    }
}
