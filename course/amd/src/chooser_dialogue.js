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
 * @since      3.8
 */

define(
    [
        'jquery',
        'core/modal_factory',
        'core/modal_events',
        'core/templates',
        'core/custom_interaction_events',
    ],
    function(
        $,
        ModalFactory,
        ModalEvents,
        Templates,
        CustomEvents
    ) {

    /**
     * Class names for different elements.
     *
     * @private
     * @type {Object}
     */
    var SELECTORS = {
        CHOOSER_CONTAINER: '[data-region="chooser-container"]',
        CHOOSER_OPTIONS_CONTAINER: '[data-region="chooser-options-container"]',
        CHOOSER_OPTION_CONTAINER: '[data-region="chooser-option-container"]',
        CHOOSER_OPTION_ACTIONS_CONTAINER: '[data-region="chooser-option-actions-container"]',
        CHOOSER_OPTION_INFO_CONTAINER: '[data-region="chooser-option-info-container"]',
        CHOOSER_OPTION_SUMMARY_CONTAINER: '[data-region="chooser-option-summary-container"]',
        CHOOSER_OPTION_SUMMARY_CONTENT_CONTAINER: '[data-region="chooser-option-summary-content-container"]',
        CHOOSER_OPTION_SUMMARY_ACTIONS_CONTAINER: '[data-region="chooser-option-summary-actions-container"]',
        CHOOSER_OPTION_ACTIONS: {
            SHOW_CHOOSER_OPTION_SUMMARY: '[data-action="show-option-summary"]',
        },
        ADD_CHOOSER_OPTION: '[data-action="add-chooser-option"]',
        CLOSE_CHOOSER_OPTION_SUMMARY: '[data-action="close-chooser-option-summary"]',
    };

    /**
     * Register chooser related event listeners.
     *
     * @method registerListenerEvents
     */
    var registerListenerEvents = function() {

        var showChooserOptionSummary = $(SELECTORS.CHOOSER_OPTION_ACTIONS.SHOW_CHOOSER_OPTION_SUMMARY);

        CustomEvents.define(showChooserOptionSummary, [
            CustomEvents.events.activate
        ]);

        // Show the chooser option summary.
        showChooserOptionSummary.on(CustomEvents.events.activate, function(e) {
            var optionSummaryElement = $(e.target).closest(SELECTORS.CHOOSER_OPTION_CONTAINER)
                .find(SELECTORS.CHOOSER_OPTION_SUMMARY_CONTAINER);
            showOptionSummary(optionSummaryElement);
        });

        var closeChooserOptionSummary = $(SELECTORS.CLOSE_CHOOSER_OPTION_SUMMARY);

        CustomEvents.define(closeChooserOptionSummary, [
            CustomEvents.events.activate
        ]);

        // Close the chooser option summary.
        closeChooserOptionSummary.on(CustomEvents.events.activate, function(e) {
            var optionSummaryElement = $(e.target).closest(SELECTORS.CHOOSER_OPTION_SUMMARY_CONTAINER);
            optionSummaryElement.removeClass('open');
            $(SELECTORS.CHOOSER_CONTAINER).removeClass('noscroll');
        });

        // Register event listeners related to the keyboard navigation controls.
        initKeyboardNavigation();
    };

    /**
     * Initialise the keyboard navigation controls for the chooser.
     *
     * @method initKeyboardNavigation
     */
    var initKeyboardNavigation = function() {

        var chooserOption = $(SELECTORS.CHOOSER_OPTION_CONTAINER);

        CustomEvents.define(chooserOption, [
            CustomEvents.events.next,
            CustomEvents.events.previous,
            CustomEvents.events.home,
            CustomEvents.events.end
        ]);

        chooserOption.on(CustomEvents.events.next, function(e) {
            var currentOption = $(e.target);
            var nextOption = currentOption.next();
            if (typeof nextOption === 'undefined') {
                return;
            }
            nextOption.focus();
        });

        chooserOption.on(CustomEvents.events.previous, function(e) {
            var currentOption = $(e.target);
            var previousOption = currentOption.prev();
            if (typeof previousOption === 'undefined') {
                return;
            }
            previousOption.focus();
        });

        chooserOption.on(CustomEvents.events.next, SELECTORS.ADD_CHOOSER_OPTION, function(e, data) {
            var currentOption = $(data.originalEvent.currentTarget);
            var nextOption = currentOption.next();
            if (typeof nextOption === 'undefined') {
                return;
            }
            nextOption.focus();
        });

        chooserOption.on(CustomEvents.events.previous, SELECTORS.ADD_CHOOSER_OPTION, function(e, data) {
            var currentOption = $(data.originalEvent.currentTarget);
            var previousOption = currentOption.prev();
            if (typeof previousOption === 'undefined') {
                return;
            }
            previousOption.focus();
        });

        chooserOption.on(CustomEvents.events.next, SELECTORS.CHOOSER_OPTION_ACTIONS.SHOW_CHOOSER_OPTION_SUMMARY,
            function(e, data) {
                var currentOption = $(data.originalEvent.currentTarget);
                var nextOption = currentOption.next();
                if (typeof nextOption === 'undefined') {
                    return;
                }
                nextOption.focus();
            });

        chooserOption.on(CustomEvents.events.previous, SELECTORS.CHOOSER_OPTION_ACTIONS.SHOW_CHOOSER_OPTION_SUMMARY,
            function(e, data) {
                var currentOption = $(data.originalEvent.currentTarget);
                var previousOption = currentOption.prev();
                if (typeof previousOption === 'undefined') {
                    return;
                }
                previousOption.focus();
            });

        chooserOption.on(CustomEvents.events.home, function() {
            var chooserOptions = $(SELECTORS.CHOOSER_OPTIONS_CONTAINER).find(SELECTORS.CHOOSER_OPTION_CONTAINER);
            var previousOption = $(chooserOptions).first();
            previousOption.focus();
        });

        chooserOption.on(CustomEvents.events.end, function() {
            var chooserOptions = $(SELECTORS.CHOOSER_OPTIONS_CONTAINER).find(SELECTORS.CHOOSER_OPTION_CONTAINER);
            var nextOption = $(chooserOptions).last();
            nextOption.focus();
        });

        var showChooserOptionSummary = $(SELECTORS.SHOW_CHOOSER_OPTION_SUMMARY);

        CustomEvents.define(showChooserOptionSummary, [
            CustomEvents.events.keyboardActivate
        ]);

        showChooserOptionSummary.on(CustomEvents.events.keyboardActivate, function(e) {
            var optionSummaryElement = $(e.target).closest(SELECTORS.CHOOSER_OPTION_CONTAINER)
                .find(SELECTORS.CHOOSER_OPTION_SUMMARY_CONTAINER);
            showOptionSummary(optionSummaryElement);
        });
    };

    /**
      * Show the option summary for a particular chooser option.
      *
      * @method showOptionSummary
      * @param {jQuery} optionSummaryElement The option summary container element
      */
    var showOptionSummary = function(optionSummaryElement) {
        // Get the current scroll position of the chooser container element.
        var topPosition = $(SELECTORS.CHOOSER_CONTAINER).scrollTop();
        // Get the height of the chooser container element.
        var height = $(SELECTORS.CHOOSER_CONTAINER).outerHeight();
        // Disable the scroll of the chooser container element.
        $(SELECTORS.CHOOSER_CONTAINER).addClass('noscroll');

        setOptionSummaryPositionAndHeight(optionSummaryElement, topPosition, height);

        var optionSummaryContentElement = optionSummaryElement.find(SELECTORS.CHOOSER_OPTION_SUMMARY_CONTENT_CONTAINER);
        // Set the scroll of the type summary content element to top.
        if (optionSummaryContentElement.scrollTop() > 0) {
            optionSummaryContentElement.scrollTop(0);
        }
        // Show the particular summary overlay.
        optionSummaryElement.addClass('open');
        var cancelAction = optionSummaryElement.find(SELECTORS.CLOSE_CHOOSER_OPTION_SUMMARY);
        var addAction = optionSummaryElement.find(SELECTORS.ADD_CHOOSER_OPTION);

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
    var setOptionSummaryPositionAndHeight = function(optionSummaryElement, positionTop, height) {
        var optionSummaryContentElement = optionSummaryElement.find(SELECTORS.CHOOSER_OPTION_SUMMARY_CONTENT_CONTAINER);
        var optionSumaryActionsElement = optionSummaryElement.find(SELECTORS.CHOOSER_OPTION_SUMMARY_ACTIONS_CONTAINER);
        var contentHeight = height - optionSumaryActionsElement.outerHeight();
        optionSummaryContentElement.css({'height': contentHeight + 'px'});

        optionSummaryElement.css({'top': positionTop + 'px', 'height': height + 'px'});
    };

    /**
      * Display the module chooser.
      *
      * @method displayChooser
      * @param {EventFacade} e Triggering Event
      * @param {Object} data Object containing the data required by the chooser template
      * @returns {Promise}
      */
    var displayChooser = function(e, data) {
        return Templates.render('core_course/chooser', data)
            .then(function(html) {
                return ModalFactory.create({
                    type: ModalFactory.types.DEFAULT,
                    body: html,
                    title: data.title,
                    large: true
                }).then(function(modal) {
                    modal.getRoot().on(ModalEvents.shown, function(e) {
                        $(e.target).addClass('modchooser');
                        // Initially, omit any anchor elements from the focus order in the summary content container.
                        var optionSummaryContentAnchors = $(SELECTORS.CHOOSER_OPTION_SUMMARY_CONTENT_CONTAINER).find('a');
                        optionSummaryContentAnchors.each(function(key, anchor) {
                            $(anchor).attr('tabindex', -1);
                        });
                        // Register event listeners.
                        registerListenerEvents();
                    });

                    // We want to focus on the action select when the dialog is closed.
                    modal.getRoot().on(ModalEvents.hidden, function() {
                        $(e.target.closest('.chooser-link')).focus();
                        modal.getRoot().remove();
                    });

                    modal.show();

                    return modal;
                });
            });
    };

    return /** @alias module:core/chooser_dialogue */{
        displayChooser: displayChooser
    };
});
