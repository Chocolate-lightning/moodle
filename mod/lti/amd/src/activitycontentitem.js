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
 * Class that defines content item selection process for creating an LTI external tool activity.
 *
 * @module     mod_lti/activitycontentitem
 * @copyright  2024 Mihail Geshoski <mihail@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import ContentItem from 'core_ltix/contentitem';
import FormField from 'mod_lti/form-field';
import Templates from 'core/templates';

/** @constant {Object} The object containing the relevant selectors. */
const Selectors = {
    selectContentButton: '[name="selectcontent"]',
    activityNameInput: '#id_name',
    activityDescriptionTextarea: '#id_introeditor',
    submitAndLaunchButton: '#id_submitbutton',
    submitAndCourseButton: '#id_submitbutton2',
    activityForm: '#region-main-box form',
    cancelButton: '#id_cancel',
    selectContentIndicator: '#id_selectcontentindicator',
    allowGradesCheckbox: '#id_instructorchoiceacceptgrades',
    gradeTypeSelect:'#id_grade_modgrade_type',
    buttonGroup: '#fgroup_id_buttonar'
};

export default class ActivityContentItem extends ContentItem {

    /**
     * The class constructor.
     *
     * @param {int} toolID The tool ID.
     * @param {int} contextID The context ID.
     * @param {string|null} toolInstanceTitle The tool instance title.
     * @param {string|null} toolInstanceText The tool instance text.
     * @returns {void}
     */
    constructor(toolID, contextID, toolInstanceTitle = null, toolInstanceText = null) {
        super(toolID, contextID, toolInstanceTitle, toolInstanceText);
    }

    /**
     * Defines the selector of the element that triggers the opening of content item selection modal.
     *
     * @returns {string} The selector.
     */
    getContentItemTriggerSelector() {
        return Selectors.selectContentButton;
    }

    /**
     * Method for defining custom action that will occur right after the trigger action of the content item
     * selection modal.
     *
     * @returns {void}
     */
    customContentItemTriggerActions() {
        this.toolInstanceTitle = document.querySelector(Selectors.activityNameInput).value.trim();
        this.toolInstanceText = document.querySelector(Selectors.activityDescriptionTextarea).value.trim();
    }

    /**
     * Method that processes the content item return data and populates the mod_lti configuration form.
     * If the return data contains more than one item, the form will not be populated with item data
     * but rather hidden, and the item data will be added to a single input field used to create multiple
     * instances in one request.
     *
     * @param {object} returnData The fetched configuration data from the Content-Item selection dialogue.
     */
    processContentItemReturnData(returnData) {
        // Handle multiple content items.
        if (returnData.multiple) {
            this.getLtiFormFields().forEach((field) => {
                // Set a placeholder value for the 'name' field; other fields are set to null.
                const value = field.name === 'name' ? 'item' : null;
                field.setFieldValue(value);
            });
            const variants = returnData.multiple.map((item) => this.configToVariant(item));
            this.showMultipleSummaryAndHideForm(returnData.multiple);

            const submitAndCourseButton = document.querySelector(Selectors.submitAndCourseButton);
            submitAndCourseButton.onclick = (e) => {
                e.preventDefault();
                submitAndCourseButton.disabled = true;

                const form = document.querySelector(Selectors.activityForm);
                const formData = new FormData(form);
                const postVariant = (promise, variant) => {
                    // Update the form data with the variant values.
                    Object.entries(variant).forEach(([key, value]) => formData.set(key, value));
                    // Create a POST request with the updated form data.
                    const requestBody = new URLSearchParams(formData);
                    const doPost = () => fetch(document.location.pathname, {method: 'POST', body: requestBody});

                    return promise.then(doPost).catch(doPost);
                };
                const navigateBackToCourse = () => document.querySelector(Selectors.cancelButton).click();
                // Sequentially submit variants and navigate back to the course afterward.
                variants
                    .reduce(postVariant, Promise.resolve())
                    .then(navigateBackToCourse)
                    .catch(navigateBackToCourse);
            };
        } else { // Handle single content item.
            this.getLtiFormFields().forEach((field) => {
                const value = returnData[field.name] ?? null;
                field.setFieldValue(value);
            });
            // Update the content selection indicator UI.
            const selectContentIndicator = document.querySelector(Selectors.selectContentIndicator);
            selectContentIndicator.innerHTML = returnData.selectcontentindicator;
            // Trigger the change event for the grade checkbox to update dependent fields.
            const allowGradesCheckbox = document.querySelector(Selectors.allowGradesCheckbox);
            allowGradesCheckbox.dispatchEvent(new Event('change'));
            // If grades are accepted, set the grade type to "point" and trigger its change event.
            if (allowGradesCheckbox.checked) {
                const gradeTypeSelect = document.querySelector(Selectors.gradeTypeSelect);
                gradeTypeSelect.value = 'point';
                gradeTypeSelect.dispatchEvent(new Event('change'));
            }
        }
    }

    /**
     * Toggle the visibility of an element, including aria and tab index.
     *
     * @param {HTMLElement} element The element to be toggled.
     * @param {boolean} isVisible Whether the element should be shown (true) or hidden (false).
     */
    toggleElementVisibility(element, isVisible) {
        element.toggleAttribute('hidden', !isVisible);
        element.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
        element.setAttribute('tab-index', isVisible ? '1' : '-1');
    }

    /**
     * When more than one item needs to be added, the UI is simplified to just list the items to be added. Form is
     * hidden and the only options is (save and return to course) or cancel. This function injects the summary to the
     * form page, and hides the unneeded elements.
     *
     * @param {Object[]} items Items to be added to the course.
     */
    async showMultipleSummaryAndHideForm(items) {
        const form = document.querySelector(Selectors.activityForm);
        const toolArea = form.querySelector('[data-attribute="dynamic-import"]');
        const buttonGroup = form.querySelector(Selectors.buttonGroup);
        const submitAndLaunchButton = form.querySelector(Selectors.submitAndLaunchButton);
        // Hide all form children and specific elements.
        [...form.children].forEach((child) => {
            this.toggleElementVisibility(child, false);
        });
        this.toggleElementVisibility(submitAndLaunchButton, false);
        // Render the summary template with the provided items.
        const {html, js} = await Templates.renderForPromise('mod_lti/tool_deeplinking_results', {items: items});
        // Replace tool area content with the rendered HTML and execute associated JS.
        await Templates.replaceNodeContents(toolArea, html, js);
        // Show the updated tool area and button group.
        this.toggleElementVisibility(toolArea, true);
        this.toggleElementVisibility(buttonGroup, true);
    }

    /**
     * Transforms config values aimed at populating the lti mod form to JSON variant which are used to insert more than
     * one activity modules in one submit by applying variation to the submitted form.
     * See /course/modedit.php.
     *
     * @param {Object} config Transforms a config to an actual form data to be posted.
     * @return {Object} Variant that will be used to modify form values on submit.
     */
    configToVariant(config) {
        const variant = {};
        [
            'name',
            'toolurl',
            'securetoolurl',
            'instructorcustomparameters',
            'icon',
            'secureicon',
            'launchcontainer',
            'lineitemresourceid',
            'lineitemtag',
            'lineitemsubreviewurl',
            'lineitemsubreviewparams'
        ].forEach((field) => {
            variant[field] = config[field] || '';
        });
        // Handle intro editor fields.
        variant['introeditor[text]'] = config.introeditor ? config.introeditor.text : '';
        variant['introeditor[format]'] = config.introeditor ? config.introeditor.format : '';
        // Handle grade-related fields.
        if (config.instructorchoiceacceptgrades === 1) {
            variant.instructorchoiceacceptgrades = '1';
            variant['grade[modgrade_point]'] = config.grade_modgrade_point || '100';
        } else {
            variant.instructorchoiceacceptgrades = '0';
        }
        return variant;
    }

    /**
     * Returns an array of form fields for LTI tool configuration.
     *
     * @return {Array} The array of form fields.
     */
    getLtiFormFields() {
        return [
            new FormField('name', FormField.TYPES.TEXT, false, ''),
            new FormField('introeditor', FormField.TYPES.EDITOR, false, ''),
            new FormField('toolurl', FormField.TYPES.TEXT, true, ''),
            new FormField('securetoolurl', FormField.TYPES.TEXT, true, ''),
            new FormField('instructorchoiceacceptgrades', FormField.TYPES.CHECKBOX, true, true),
            new FormField('instructorchoicesendname', FormField.TYPES.CHECKBOX, true, true),
            new FormField('instructorchoicesendemailaddr', FormField.TYPES.CHECKBOX, true, true),
            new FormField('instructorcustomparameters', FormField.TYPES.TEXT, true, ''),
            new FormField('icon', FormField.TYPES.TEXT, true, ''),
            new FormField('secureicon', FormField.TYPES.TEXT, true, ''),
            new FormField('launchcontainer', FormField.TYPES.SELECT, true, 0),
            new FormField('grade_modgrade_point', FormField.TYPES.TEXT, false, ''),
            new FormField('lineitemresourceid', FormField.TYPES.TEXT, true, ''),
            new FormField('lineitemtag', FormField.TYPES.TEXT, true, ''),
            new FormField('lineitemsubreviewurl', FormField.TYPES.TEXT, true, ''),
            new FormField('lineitemsubreviewparams', FormField.TYPES.TEXT, true, '')
        ];
    }
}
