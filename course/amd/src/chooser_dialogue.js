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
 * A type of dialogue used as for choosing options.
 *
 * @module     core_course/chooser_dialogue
 * @package    core
 * @copyright  2019 Mihail Geshoski <mihail@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      3.9
 */

import $ from 'jquery';
import * as ModalEvents from 'core/modal_events';
import * as CustomEvents from 'core/custom_interaction_events';
import selectors from 'core_course/local/chooser/selectors';
import * as ModalFactory from 'core/modal_factory';
import * as Templates from 'core/templates';
import {get_string as getString} from 'core/str';

/**
 * Register chooser related event listeners.
 *
 * @method registerListenerEvents
 */
const registerListenerEvents = () => {
    const showChooserOptionSummary = $(selectors.actions.option_actions.show_summary);
    CustomEvents.define(showChooserOptionSummary, [
        CustomEvents.events.activate
    ]);

    // Show the chooser option summary.
    showChooserOptionSummary.on(CustomEvents.events.activate, (e) => {
        const optionSummaryElement = $(e.target).closest(selectors.regions.chooser_option.container)
            .find(selectors.regions.chooser_summary.container);
        showOptionSummary(optionSummaryElement);
    });

    const closeChooserOptionSummary = $(selectors.actions.close_option);

    CustomEvents.define(closeChooserOptionSummary, [
        CustomEvents.events.activate
    ]);

    // Close the chooser option summary.
    closeChooserOptionSummary.on(CustomEvents.events.activate, (e) => {
        const optionSummaryElement = $(e.target).closest(selectors.regions.chooser_summary.container);
        optionSummaryElement.removeClass('open');
        $(selectors.regions.chooser).removeClass('noscroll');
    });

    // Register event listeners related to the keyboard navigation controls.
    initKeyboardNavigation(showChooserOptionSummary);
};

/**
 * Initialise the keyboard navigation controls for the chooser.
 *
 * @method initKeyboardNavigation
 * @param {jQuery} showChooserOptionSummary selector for activating the summary
 */
const initKeyboardNavigation = (showChooserOptionSummary) => {

    const chooserOption = $(selectors.regions.chooser_option.container);

    CustomEvents.define(chooserOption, [
        CustomEvents.events.next,
        CustomEvents.events.previous,
        CustomEvents.events.home,
        CustomEvents.events.end
    ]);

    chooserOption.on(CustomEvents.events.next, (e) => {
        const currentOption = $(e.target);
        const nextOption = currentOption.next();
        clickErrorHandler(nextOption);
        nextOption.focus();
    });

    chooserOption.on(CustomEvents.events.previous, (e) => {
        const currentOption = $(e.target);
        const previousOption = currentOption.prev();
        clickErrorHandler(previousOption);
        previousOption.focus();
    });

    chooserOption.on(CustomEvents.events.next, selectors.actions.add_chooser, (e, data) => {
        const currentOption = $(data.originalEvent.currentTarget);
        const nextOption = currentOption.next();
        clickErrorHandler(nextOption);
        nextOption.focus();
    });

    chooserOption.on(CustomEvents.events.previous, selectors.actions.add_chooser, (e, data) => {
        const currentOption = $(data.originalEvent.currentTarget);
        const previousOption = currentOption.prev();
        clickErrorHandler(previousOption);
        previousOption.focus();
    });

    chooserOption.on(CustomEvents.events.next, selectors.actions.option_actions.show_summary,
        (e, data) => {
            const currentOption = $(data.originalEvent.currentTarget);
            const nextOption = currentOption.next();
            clickErrorHandler(nextOption);
            nextOption.focus();
        });

    chooserOption.on(CustomEvents.events.previous, selectors.actions.option_actions.show_summary,
        (e, data) => {
            const currentOption = $(data.originalEvent.currentTarget);
            const previousOption = currentOption.prev();
            clickErrorHandler(previousOption);
            previousOption.focus();
        });

    chooserOption.on(CustomEvents.events.home, () => {
        const chooserOptions = $(selectors.regions.chooser_options).find(selectors.regions.chooser_option.container);
        const previousOption = $(chooserOptions).first();
        previousOption.focus();
    });

    chooserOption.on(CustomEvents.events.end, () => {
        const chooserOptions = $(selectors.regions.chooser_options).find(selectors.regions.chooser_option.container);
        const nextOption = $(chooserOptions).last();
        nextOption.focus();
    });

    CustomEvents.define(showChooserOptionSummary, [
        CustomEvents.events.keyboardActivate
    ]);

    showChooserOptionSummary.on(CustomEvents.events.keyboardActivate, (e) => {
        const optionSummaryElement = $(e.target).closest(selectors.regions.chooser_option.container)
            .find(selectors.regions.chooser_summary.container);
        showOptionSummary(optionSummaryElement);
    });
};

/**
 * Small error handling function to make sure the navigated to object exists
 *
 * @method clickErrorHandler
 * @param {jQuery} item What we want to check exists
 */
const clickErrorHandler = (item) => {
    if (typeof item === 'undefined') {
        return;
    }
};

/**
 * Show the option summary for a particular chooser option.
 *
 * @method showOptionSummary
 * @param {jQuery} optionSummaryElement The option summary container element
 */
const showOptionSummary = (optionSummaryElement) => {
    // Get the current scroll position of the chooser container element.
    const topPosition = $(selectors.regions.chooser).scrollTop();
    // Get the height of the chooser container element.
    const height = $(selectors.regions.chooser).outerHeight();
    // Disable the scroll of the chooser container element.
    $(selectors.regions.chooser).addClass('noscroll');

    // TODO: This is mutating optionSummaryElement.
    setOptionSummaryPositionAndHeight(optionSummaryElement, topPosition, height);

    const optionSummaryContentElement = optionSummaryElement.find(selectors.regions.chooser_summary.content);
    // Set the scroll of the type summary content element to top.
    if (optionSummaryContentElement.scrollTop() > 0) {
        optionSummaryContentElement.scrollTop(0);
    }
    // Show the particular summary overlay.
    optionSummaryElement.addClass('open');
    const cancelAction = optionSummaryElement.find(selectors.actions.close_option);
    const addAction = optionSummaryElement.find(selectors.actions.add_chooser);

    optionSummaryElement.attr('tabindex', 0);
    cancelAction.attr('tabindex', 0);
    addAction.attr('tabindex', 0);
    optionSummaryElement.focus();
};

/**
 * Set the top position and height of the option summary container.
 * This is used to align the top position and height of the option summary container
 * with the chooser options container.
 *
 * @method setOptionSummaryPositionAndHeight
 * @param {jQuery} optionSummaryElement The option summary container element
 * @param {int} positionTop The top position attributed to the option summary container element
 * @param {int} height The height attributed to the option summary container element
 */
const setOptionSummaryPositionAndHeight = (optionSummaryElement, positionTop, height) => {
    const optionSummaryContentElement = optionSummaryElement.find(selectors.regions.chooser_summary.container);
    const optionSumaryActionsElement = optionSummaryElement.find(selectors.regions.chooser_summary.actions);
    const contentHeight = height - optionSumaryActionsElement.outerHeight();
    optionSummaryContentElement.css({'height': `${contentHeight}px`});

    optionSummaryElement.css({'top': `${positionTop}px`, 'height': `${height}px`});
};

/**
 * Display the module chooser.
 *
 * @method displayChooser
 * @param {EventFacade} e Triggering Event
 * @param {Object} moduleInfo Object containing the data required by the chooser template
 */
export const displayChooser = async(e, moduleInfo) => {
    const [
        modal,
    ] = await Promise.all([
        ModalFactory.create({
            type: ModalFactory.types.DEFAULT,
            title: await getString('addresourceoractivity'),
            body: Templates.render('core_course/chooser', moduleInfo),
            large: true
        })
    ]);

    modal.getRoot().on(ModalEvents.bodyRendered, (e) => {
        $(e.target).addClass('modchooser');
        // Initially, omit any anchor elements from the focus order in the summary content container.
        const optionSummaryContentAnchors = $(selectors.regions.chooser_summary.content).find('a');
        optionSummaryContentAnchors.each((key, anchor) => {
            $(anchor).attr('tabindex', -1);
        });
        // Register event listeners.
        registerListenerEvents();
    });

    // We want to focus on the action select when the dialog is closed.
    modal.getRoot().on(ModalEvents.hidden, () => {
        modal.destroy();
        try {
            // Does not seem to work.
            $(e.target.closest('.chooser-link')).focus();
        } catch (e) {
            // eslint-disable-line
        }
    });
    modal.show();
};

