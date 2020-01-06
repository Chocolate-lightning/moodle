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
 * @param {Promise} modal Our modal that we are working with
 * @param {Map} mappedModules A map of all of the modules we are working with with K: mod_name V: {Object}
 * @method registerListenerEvents
 */
const registerListenerEvents = (modal, mappedModules) => {
    modal.getBody()[0].addEventListener('click', async(e) => {
        if (e.target.matches(selectors.actions.optionActions.showSummary)) {
            // Get the systems name for the module just clicked.
            const module = e.target.closest(selectors.regions.chooserOption.container);
            const moduleName = module.dataset.modname;
            // Build up the html & js ready to place into the help section.
            const {html, js} = await Templates.renderForPromise('core_course/chooser_help', mappedModules.get(moduleName));
            const help = modal.getBody()[0].querySelector(selectors.regions.help);
            Templates.replaceNodeContents(help, html, js);
            // Trigger the transition between 'pages'.
            const carousel = $(selectors.regions.carousel);
            carousel.carousel();
            carousel.carousel('next');
            carousel.carousel('pause');
        }
        // From the help screen go back to the module overview.
        if (e.target.matches(selectors.actions.closeOption)) {
            // Trigger the transition between 'pages'.
            const carousel = $(selectors.regions.carousel);
            carousel.carousel();
            carousel.carousel('prev');
            carousel.carousel('pause');
        }
    });

    // Register event listeners related to the keyboard navigation controls.
    initKeyboardNavigation();
};

/**
 * Initialise the keyboard navigation controls for the chooser.
 *
 * @method initKeyboardNavigation
 */
const initKeyboardNavigation = () => {

    const chooserOption = $(selectors.regions.chooserOption.container);

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

    chooserOption.on(CustomEvents.events.next, selectors.actions.addChooser, (e, data) => {
        const currentOption = $(data.originalEvent.currentTarget);
        const nextOption = currentOption.next();
        clickErrorHandler(nextOption);
        nextOption.focus();
    });

    chooserOption.on(CustomEvents.events.previous, selectors.actions.addChooser, (e, data) => {
        const currentOption = $(data.originalEvent.currentTarget);
        const previousOption = currentOption.prev();
        clickErrorHandler(previousOption);
        previousOption.focus();
    });

    chooserOption.on(CustomEvents.events.next, selectors.actions.optionActions.showSummary,
        (e, data) => {
            const currentOption = $(data.originalEvent.currentTarget);
            const nextOption = currentOption.next();
            clickErrorHandler(nextOption);
            nextOption.focus();
        });

    chooserOption.on(CustomEvents.events.previous, selectors.actions.optionActions.showSummary,
        (e, data) => {
            const currentOption = $(data.originalEvent.currentTarget);
            const previousOption = currentOption.prev();
            clickErrorHandler(previousOption);
            previousOption.focus();
        });

    chooserOption.on(CustomEvents.events.home, () => {
        const chooserOptions = $(selectors.regions.chooserOptions).find(selectors.regions.chooserOption.container);
        const previousOption = $(chooserOptions).first();
        previousOption.focus();
    });

    chooserOption.on(CustomEvents.events.end, () => {
        const chooserOptions = $(selectors.regions.chooserOptions).find(selectors.regions.chooserOption.container);
        const nextOption = $(chooserOptions).last();
        nextOption.focus();
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
 * Display the module chooser.
 *
 * @method displayChooser
 * @param {EventFacade} e Triggering Event
 * @param {Object} data Object containing the data required by the chooser template
 */
export const displayChooser = async(e, data) => {
    const [
        modal,
    ] = await Promise.all([
        ModalFactory.create({
            type: ModalFactory.types.DEFAULT,
            title: await getString('addresourceoractivity'),
            body: Templates.render('core_course/chooser', data),
            large: true
        })
    ]);

    // Make a map so we can quickly fetch a specific module's object for either rendering or searching.
    let mappedModules = new Map();
    data.allmodules.forEach((module) => {
        mappedModules.set(module.modulename, module);
    });

    // Modal has rendered our initial content, we can allow users to interact.
    modal.getRoot().on(ModalEvents.bodyRendered, (e) => {
        $(e.target).addClass('modchooser');
        // Initially, omit any anchor elements from the focus order in the summary content container.
        const optionSummaryContentAnchors = $(selectors.regions.chooserSummary.content).find('a');
        optionSummaryContentAnchors.each((key, anchor) => {
            $(anchor).attr('tabindex', -1);
        });
        // Register event listeners.
        registerListenerEvents(modal, mappedModules);
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
