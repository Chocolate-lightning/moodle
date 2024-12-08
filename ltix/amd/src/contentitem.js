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
 * Base class for defining a content item selection request to an LTI tool provider that supports Content-Item type messages.
 *
 * @module     core_ltix/contentitem
 * @copyright  2024 Mihail Geshoski <mihail@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      5.0
 */

import Notification from 'core/notification';
import {getString} from 'core/str';
import Templates from 'core/templates';
import Modal from 'core/modal';
import ModalEvents from 'core/modal_events';
import Url from 'core/url';

/** @constant {Object} The object containing the relevant selectors. */
const Selectors = {
    loadingContainer: '.contentitem-loading-container',
    failedContainer: '#tool-loading-failed',
    iframe: '#contentitem-page-iframe',
    requestForm: '#contentitem-request-form',
    mainContainer: 'div.contentitem-container'
};

export default class ContentItem {

    /** @property {int|null} toolID The tool ID. */
    toolID = null;

    /** @property {int|null} contextID The context ID. */
    contextID = null;

    /** @property {string|null} toolInstanceTitle The tool instance title. */
    toolInstanceTitle = null;

    /** @property {string|null} toolInstanceText The tool instance text. */
    toolInstanceText = null;

    /** @property {Object|null} modal The modal object. */
    modal = null;

    /**
     * Initializes the content item selection process.
     *
     * @param {int} toolID The tool ID.
     * @param {int} contextID The context ID.
     * @param {string|null} toolInstanceTitle The tool instance title.
     * @param {string|null} toolInstanceText The tool instance text.
     * @returns {void}
     */
    static async init(toolID, contextID, toolInstanceTitle = null, toolInstanceText = null) {
        const contentItem = new this(toolID, contextID, toolInstanceTitle, toolInstanceText);
        contentItem.registerEventListeners();
    }

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
        this.toolID = toolID;
        this.contextID = contextID;
        this.toolInstanceTitle = toolInstanceTitle;
        this.toolInstanceText = toolInstanceText;
    }

    /**
     * Registers the listener events for the content item selection.
     *
     * @returns {void}
     */
    registerEventListeners() {
        document.addEventListener('click', async (e) => {
            // Content item selection request has been initiated.
            if (e.target.closest(this.getContentItemTriggerSelector())) {
                e.preventDefault();
                // After initiating the content selection request, store the class object in the global scope.
                // This ensures it remains accessible later within the content item selection iframe.
                // Storing the object globally each time a request is initiated guarantees that the correct
                // instance is available to execute the appropriate logic in processContentItemReturnData()
                // for processing the returned data.
                globalThis['contentItem'] = this;
                this.customContentItemTriggerActions();
                this.modal = await this.showModal();
                this.submitForm();
            }
        });
    }

    /**
     * Shows the content item selection modal.
     *
     * @returns {Promise} The modal promise.
     */
    async showModal() {
        const modal = await Modal.create({
            title: await getString('selectcontent', 'lti'),
            body: await this.renderModalBody(),
            large: true,
        });

        // Handle hidden event.
        modal.getRoot().on(ModalEvents.hidden, () => {
            modal.destroy();
            // Fetch notifications.
            Notification.fetchNotifications();
        });

        modal.show();

        return modal;
    }

    /**
     * Renders the content item selection modal body.
     *
     * @returns {Promise} The modal body promise.
     */
    async renderModalBody() {
        var context = {
            url: Url.relativeUrl('/ltix/contentitem.php'),
            postData: {
                toolid: this.toolID,
                contextid: this.contextID,
                toolinstancetitle: this.toolInstanceTitle,
                toolinstancetext: this.toolInstanceText
            }
        };

        return Templates.render('core_ltix/contentitem', context);
    }

    /**
     * Auto-submits the content item selection request form to contentitem.php followed by rendering the content in
     * the iframe.
     *
     * @returns {void}
     */
    submitForm() {
        const modalRoot = this.modal.getRoot()[0];

        setTimeout(() => {
            const failedContainer = modalRoot.querySelector(Selectors.failedContainer);
            failedContainer.classList.remove('hidden');
        }, 20000);

        // Submit the form.
        modalRoot.querySelector(Selectors.requestForm).submit();

        const iframe = modalRoot.querySelector(Selectors.iframe);
        iframe.addEventListener('load', () => {
            const loadingContainer = modalRoot.querySelector(Selectors.loadingContainer);
            loadingContainer.classList.add('hidden');
            iframe.classList.remove('hidden');

            // Adjust iframe's width to fit the container's width.
            const containerWidth = modalRoot.querySelector(Selectors.mainContainer).offsetWidth;
            iframe.style.width = `${containerWidth}px`;

            // Adjust iframe's height to 75% of the width.
            const containerHeight = containerWidth * 0.75;
            modalRoot.querySelector(Selectors.iframe).style.height = `${containerHeight}px`;
        });
    }

    /**
     * Defines the action that occurs right after the content item selection data is returned.
     *
     * @param {string} returnData The returned data.
     * @returns {void}
     */
    contentItemReturnAction(returnData) {
        if (this.modal) {
            this.modal.hide();
        }
        // Process the content item return data.
        this.processContentItemReturnData(returnData);
    }

    /**
     * Defines any custom actions that will occur right after initiating the content item selection request.
     *
     * @returns {void}
     */
    customContentItemTriggerActions() {
        return;
    }

    /**
     * Defines the selector of the element that initiates the content item selection request.
     *
     * @returns {string} The selector.
     */
    getContentItemTriggerSelector() {
        throw new Error(`getContentItemTriggerSelector() must be implemented in ${this.constructor.name}`);
    }

    /**
     * Defines the logic for processing the content item return data.
     *
     * @param {string} returnData The returned data.
     * @returns {void}
     */
    processContentItemReturnData(returnData) {
        throw new Error(`processContentItemReturnData(${returnData}) must be implemented in ${this.constructor.name}`);
    }
}
