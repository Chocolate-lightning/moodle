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
import * as Submit from './submit';
import Rules from './form/rules';
import * as MutateDom from './form/dom';
import Pending from 'core/pending';

// Maybe not needed but noted just in case.
// import * as CollapseSections from './collapsesections'; // This is included via ../collapsesections.mustache
// import * as EncryptedPassword from './encryptedpassword'; // This is included via ../setting_encryptedpassword.mustache
// import * as FileTypes from './filetypes'; // This is included via /lib/form/filetypes.php#L152
// import * as PasswordUnmask from './passwordunmask'; // This is included via ../element-passwordunmask.mustache
// import * as ShowAdvanced from './showadvanced'; // This is included via /lib/formslib.php#L3349

// Custom element types, Likely not needed.
// import * as ChoiceDropdown from 'core_form/choicedropdown'; // This is included via ../choicedropdown.mustache
// import * as ConfigText_maxlength from 'core_form/configtext_maxlength'; // This is included via lib/adminlib.php#L2635
// import * as DefaultCustom from 'core_form/defaultcustom'; // This is included via lib/form/defaultcustom.php#L253

export default class Form {
    /**
     * @var {HTMLFormElement} form Our very own form to work on.
     */
    form;

    /**
     * @var {Map} dependencies Our map of form dependencies.
     */
    dependencies;

    editors = new Map();
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
        this.isEditor();
        this.rules = new Rules(this);

        // Apply the initial state of the form.
        this.applyInitialState();

        // Handle mutations within the form.
        this.registerEventListeners();
        FormChangeChecker.watchForm(this.form);
    }

    /**
     * Given the page has loaded, apply the initial state of the form.
     */
    applyInitialState() {
        [...this.form.elements].forEach((element) => {
            if (this.dependencies.has(element.name)) {
                this.domDispatch(this.displayMapPrune(this.dispatchDependencyRules(element)));
            }
        });
    }

    /**
     * Add event listeners to the form.
     */
    registerEventListeners() {
        this.form.addEventListener('change', async(e) => {
            if (e.target.type === 'submit') {
                FormChangeChecker.resetFormDirtyState(this.form);
                Submit.init(e.target.id);
            }
            if (e.target.type === 'reset') {
                FormChangeChecker.resetFormDirtyState(this.form);
                this.form.reset();
            }
            // Something changes based on this element.
            if (this.dependencies.has(e.target.name)) {
                FormChangeChecker.markFormChangedFromNode(e.target);
                // Add a pending?
                const pendingPromise = new Pending('core/form:update');
                await this.domDispatch(this.displayMapPrune(this.dispatchDependencyRules(e.target)));
                pendingPromise.resolve();
            }
        });
    }

    /**
     * Dispatch the dependency rules to the appropriate rule handler.
     *
     * @param {HTMLFormElement} target The name associated to the element that has changed.
     * @returns {Map<String, Array>} Actions to be taken along with elements that should be affected.
     */
    dispatchDependencyRules(target) {
        const displayMap = this.mapTemplate();
        this.dependencies.get(target.name).forEach((dependants, ruleName) => {
            // If the rule exists, use it, otherwise fallback to 'neq' which seems to be the "default" rule originally.
            const elNamesMap = this.rules[ruleName] ? this.rules[ruleName](target) : this.rules.neq(target);
            // Merge the current rule map with the final display map.
            elNamesMap.forEach((nodeNames, displayOption) => {
                displayMap.get(displayOption).push(...nodeNames);
            });
        });
        return displayMap;
    }

    /**
     * By default, the full display map contains empty entries and potential duplicated DOM node names.
     * Here we will get rid of any empty entries and review the locked array. If a node name exists in both
     * the locked and hidden array, it should be removed from the locked array as nodes are locked / disabled when hidden.
     *
     * @param {Map<String, Array>} displayMap Map of elements and their associated rules to prune.
     * @returns {Map<String, Array>|Map<>} The pruned map or map even a fully pruned map if noting has to change.
     */
    displayMapPrune(displayMap) {
        // Filter any unlocked items that pegged to be hidden as they must be locked if they are hidden.
        const removeunlockifhidden = displayMap.get('unlock').filter(x => {
            return !displayMap.get('hide').toString().includes(x.toString());
        });
        displayMap.set('unlock', removeunlockifhidden);

        // Remove any empty entries.
        for (const [key, value] of displayMap) {
            if (value.length === 0) {
                displayMap.delete(key);
            }
        }
        return displayMap;
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
        window.console.log('elNamesMap', elNamesMap);
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
     * @param {Array<Array>} elementNames The name of dependent elements to get associated DOM nodes.
     * @returns {Array<HTMLFormElement|RadioNodeList>}
     */
    elementNamesToDomNodes(elementNames) {
        return elementNames.map((element) => {
            // TODO: Rename and document why we need to deep look if there are multiple nodes effected by the rule.
            return element.map((element2) => {
                if (this.isEditor(element2)) {
                    return this.form.elements.namedItem(`${element2}[text]`);
                }
                return this.form.elements.namedItem(element2);
            });
        });
    }

    isEditor(elementName = '') {
        if (this.editors.size === 0) {
            const fEditors = this.form.querySelectorAll('[data-fieldtype="editor"] textarea');
            Array.from(fEditors).forEach((node) => {
                this.editors.set(node.name, true);
            });
        }

        return this.editors.get(`${elementName}[text]`) || false;
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
                /**
                 * Convert any disabledIf rules into objects, so we can manage them the same as hideIf items.
                 *
                 * @type {Map<string, Map>} The map of comparison values t.
                 * @example "none" => "none" => Object<Number, Array>
                 * @example "neq" => "point" => Object<Number, Array>
                 */
                const hideDefine = new Map(Object.entries(ruleComparisons));
                hideDefine.forEach((action, compVal) => {
                    if (Array.isArray(action)) {
                        action = {...action};
                    }
                    hideDefine.set(compVal, action);
                });
                ruleMap.set(key, hideDefine);
            });
            elementMap.set(key, ruleMap);
        });
        return elementMap;
    }

    /**
     * A standard map that we'll be using to figure out what has to change and how.
     *
     * @returns {Map<String, Array>}
     */
    mapTemplate() {
        return new Map([
            ['hide', []],
            ['show', []],
            ['lock', []],
            ['unlock', []],
        ]);
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
