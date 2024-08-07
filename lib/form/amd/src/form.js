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

import * as FormChangeChecker from './changechecker';
import * as Submit from './submit';
import Rules from './form/rules';
import {mapTemplate} from './form/display';
import * as MutateDom from './form/display';
import Pending from 'core/pending';

/**
 * @var {Map<string, Form>} M.form2 Global map of forms currently on the page.
 */
M.form2 = M.form2 || new Map();

export default class Form {
    /**
     * @var {HTMLFormElement} form Our very own form to work on.
     */
    form;

    /**
     * @var {Map} dependencies Our map of form dependencies.
     * @See this.getDependencyMapper() for structure info.
     */
    dependencies;

    /**
     * @var {Map<String, Boolean>} editors Our map of form editors used get the right selector.
     */
    editors;

    /**
     * @var {Array<String>} initialDisabledHidden An array of element names that were hidden or disabled by default.
     */
    initialDisabledHidden = [];

    /**
     * Create a new Form instance.
     *
     * @param {String} formID The ID of the form to be managed.
     * @param {Object} dependencies The passed object of form dependencies.
     */
    constructor(formID, dependencies) {
        // Handle constructing the dependency map, finding editors and init the rules.
        const pendingPromise = new Pending('construction');
        this.form = document.querySelector(`#${formID}`);
        this.dependencies = this.getDependencyMapper(dependencies);
        this.editors = this.findEditors();
        this.rules = new Rules(this);

        // Apply the initial state of the form.
        this.applyInitialState();

        // Handle mutations within the form.
        this.registerEventListeners();
        FormChangeChecker.watchForm(this.form);
        pendingPromise.resolve();
    }

    /**
     * On page load, apply the initial state of the form by checking the shown items and running their rules.
     * We also want to confirm if anything has been hidden or disabled by a PHP callback on load and respect
     * their wishes on page load.
     */
    applyInitialState() {
        // Find any elements that are hidden or disabled by a PHP callback rule.
        [...this.form.elements].forEach((element) => {
            if ((element.disabled || element.hidden) && element.name !== '') {
                this.initialDisabledHidden.push(element.name);
            }
        });
        // Run through the form elements looking for anything to run rules against on load.
        const map = this.generateDisplayMap();
        this.domDispatch(map, true);
    }

    /**
     * Somewhere out there, we have a form that wants to ensure the state of the form reflects their changes.
     */
    formUpdatedExternally() {
        const map = this.generateDisplayMap();
        this.domDispatch(map);

        if (map.get('show') !== undefined) {
            const opened = this.elementNamesToDomNodes(map.get('show'));
            const filterNullNodes = opened.filter((node) => node !== null);

            filterNullNodes.forEach((node) => {
                if (this.dependencies.has(node.name)) {
                    const secondLvlResult = this.displayMapPrune(this.dispatchDependencyRules(node));
                    this.domDispatch(secondLvlResult);
                }
            });
        }
    }

    /**
     * Helper to iterate all the form elements that have a rule associated with them and generate a display map.
     *
     * @returns {Map<String, Array>}
     */
    generateDisplayMap() {
        const map = mapTemplate();
        [...this.form.elements].forEach((element) => {
            if (this.dependencies.has(element.name)) {
                const elDisplayMap = this.displayMapPrune(this.dispatchDependencyRules(element));
                for (const [key, value] of elDisplayMap) {
                    map.get(key).push(...value);
                }
            }
        });
        return map;
    }

    /**
     * Add event listeners to the form.
     */
    registerEventListeners() {
        // TODO: Choice dropdown does not trigger here.
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
                const pendingPromise = new Pending('update');
                const results = this.displayMapPrune(this.dispatchDependencyRules(e.target));
                await this.domDispatch(results);

                // Given that we are showing something,
                // we'll do a second order check to see if we need to show more based on the new state of the form.
                if (results.get('show') !== undefined) {
                    const opened = this.elementNamesToDomNodes(results.get('show'));
                    const filterNullNodes = opened.filter((node) => node !== null);

                    filterNullNodes.forEach((node) => {
                        const pendingPromise = new Pending('updatesecond');
                        // RadioNodeList needs to be iterated through as it is not a simple element.
                        if (node instanceof RadioNodeList) {
                            node.forEach((n) => {
                                if (this.dependencies.has(n.name)) {
                                    const secondLvlResult = this.displayMapPrune(this.dispatchDependencyRules(n));
                                    this.domDispatch(secondLvlResult);
                                }
                            });
                        }
                        if (this.dependencies.has(node.name)) {
                            const secondLvlResult = this.displayMapPrune(this.dispatchDependencyRules(node));
                            this.domDispatch(secondLvlResult);
                        }
                        pendingPromise.resolve();
                    });
                }
                pendingPromise.resolve();
            }
        });
    }

    /**
     * Dispatch the dependency rules to the appropriate rule handler and get back a map of display options.
     *
     * @param {HTMLFormElement} target The name associated to the element that has changed.
     * @returns {Map<String, Array<String>>} Actions to be taken along with element names that should be affected.
     */
    dispatchDependencyRules(target) {
        const displayMap = mapTemplate();
        this.dependencies.get(target.name).forEach((dependants, ruleName) => {
            // If the rule exists, use it, otherwise fallback to 'neq' which seems to be the "default" rule originally.
            const elNamesMap = this.rules[ruleName] ? this.rules[ruleName](target) : this.rules.neq(target);
            // Merge the current rule map with the final display map.
            elNamesMap.forEach((nodeNames, displayOption) => {
                // We want to merge in the new array values into the existing array otherwise,
                // we would get an array of arrays which is needless complexity.
                displayMap.set(displayOption, [...displayMap.get(displayOption), ...nodeNames.values()].flat());
            });
        });
        return displayMap;
    }

    /**
     * By default, the full display map contains empty entries and potential duplicated DOM node names.
     *
     * First: We review the unlock array for node names that have to be hidden. If a match is found,
     * the node name will be removed from being unlocked.
     * Then: We review the show array for node names that have to be hidden. If a match is found,
     * the node name will be removed from being shown as a rule has specified this should actually be hidden.
     * Finally: We get rid of any empty entries within the display map to prevent running pointless display updates.
     *
     * @param {Map<String, Array>} displayMap Map of elements and their associated rules to prune.
     * @returns {Map<String, Array>|Map<>} The pruned map or map even a fully pruned map if noting has to change.
     */
    displayMapPrune(displayMap) {
        // Filter any unlocked items that pegged to be hidden as they must be locked if they are hidden.
        // Using something like !displayMap.get('hide').toString().includes(x.toString()) did not work as
        // it could result in false positives such as contentfoobar includes content when doing the eval.
        if (displayMap.get('unlock') !== undefined) {
            if (displayMap.get('hide') !== undefined) {
                const hideEvenIfUnlocked = displayMap.get('unlock').filter(x => {
                    return displayMap.get('hide').indexOf(x.toString()) === -1;
                });
                displayMap.set('unlock', hideEvenIfUnlocked);
            }
            if (displayMap.get('lock') !== undefined) {
                const lockEvenIfUnlocked = displayMap.get('unlock').filter(x => {
                    return displayMap.get('lock').indexOf(x.toString()) === -1;
                });
                displayMap.set('unlock', lockEvenIfUnlocked);
            }
        }

        // Filter any shown items that pegged to be hidden.
        if (displayMap.get('show') !== undefined && displayMap.get('hide') !== undefined) {
            const hideEvenIfShown = displayMap.get('show').filter(x => {
                return displayMap.get('hide').indexOf(x.toString()) === -1;
            });
            displayMap.set('show', hideEvenIfShown);
        }

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
     * @param {String} elementName The name of the element to get the dependants for.
     * @param {String} ruleName The rule type to get the dependants for.
     * @returns {Map<String, Array>|[]} Either the rule comparison value with associated node names to update or an empty array.
     */
    getDependantsOfType(elementName, ruleName) {
        return this.dependencies.get(elementName) !== 'undefined' ? this.dependencies.get(elementName).get(ruleName) ?? [] : [];
    }

    /**
     * Dispatch the DOM manipulation to the appropriate function.
     *
     * @param {Map<String, Array>} elNamesMap What needs to change.
     * @param {Boolean|Null} firstRun Whether this is the first run of the form if so,
     * filter some elements based on PHP rule callback values.
     */
    domDispatch(elNamesMap, firstRun = false) {
        elNamesMap = this.displayMapPrune(elNamesMap);
        // Go through the pruned display map and perform the requested display action.
        elNamesMap.forEach((elements, domUpdateOpt) => {
            // The requested display function somehow does not exist.
            if (!MutateDom[domUpdateOpt]) {
                return;
            }
            // If something was hidden or disabled by default via PHP rule callback, we don't want to touch it.
            if (firstRun) {
                elements = elements.filter((el) => !this.initialDisabledHidden.includes(el));
            }

            // Given the node names to update for a given display action, grab their associated HTMLFormElement and update them.
            this.elementNamesToDomNodes(elements).forEach((node) => {
                // Ensure we only update form items, instanceof check is a bit too much here as we have RadioNodeList items.
                if (node === null) {
                    return;
                }
                if (node instanceof RadioNodeList) {
                    node.forEach((el) => {
                        MutateDom[domUpdateOpt](el);
                    });
                } else {
                    // Given a HTMLFormElement, perform the requested display action.
                    MutateDom[domUpdateOpt](node);
                }
            });
        });
    }

    /**
     * Convert element names into DOM nodes based on the element name or a compound selector based on the given name.
     *
     * @param {Array<String>} elementNames The name of dependent elements to get associated DOM nodes.
     * @returns {Array<HTMLFormElement>} DOM items to perform display actions on.
     */
    elementNamesToDomNodes(elementNames) {
        return elementNames.map((element) => {
            if (this.form.querySelector(`[data-groupname="${element}"]`)) {
                return this.form.querySelector(`[data-groupname="${element}"]`);
            }
            if (this.editors.get(`${element}[text]`)) {
                // Text editors are stupid.
                return this.form.elements.namedItem(`${element}[text]`);
            } else if (!this.form.elements.namedItem(element)) {
                // Grouped items are stupid.
                return this.form.elements.namedItem(`id_${element}`);
            }
            // Regular happy plain form item or RadioNodeList.
            return this.form.elements.namedItem(element);
        });
    }

    /**
     * During init, look through the form and identify which elements are editors.
     *
     * @returns {Map<String, Boolean>} Map of found editors.
     */
    findEditors() {
        let found = new Map();
        const fEditors = this.form.querySelectorAll('[data-fieldtype="editor"] textarea');
        Array.from(fEditors).forEach((node) => {
            found.set(node.name, true);
        });
        return found;
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
                 * @type {Map<string, Map>} The map of comparison values.
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
     * Initialize the form and its dependencies. Also add the Form instance to the global state.
     *
     * @param {String} formID The ID of the form to be managed.
     * @param {Object} dependencies The passed object of form dependencies.
     * @returns {Form} An instance associated to a specific form on a given page.
     */
    static init(formID, dependencies) {
        const instance = new Form(formID, dependencies);
        // Add the Form instance to the global state so other modules can access this instance.
        M.form2.set(formID, instance);
        return instance;
    }
}
