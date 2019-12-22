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
 * A type of dialogue used as for choosing modules in a course.
 *
 * @module     core_course/modchooser
 * @package    core_course
 * @copyright  2019 Mihail Geshoski <mihail@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      3.8
 */
define(
    [
        'core/yui',
        'jquery',
        'core_course/chooser_dialogue',
        'core/custom_interaction_events',
    ],
    function(
        Y,
        $,
        ChooserDialogue,
        CustomEvents
    ) {

    /**
     * Class names for different elements.
     *
     * @private
     * @type {Object}
     */
    var CSS = {
        PAGECONTENT: 'body',
        SECTION: null,
        SECTIONMODCHOOSER: 'span.section-modchooser-link',
        SITEMENU: '.block_site_main_menu',
        SITETOPIC: 'div.sitetopic'
    };

    /**
     * Display the module chooser.
     *
     * @method displayModChooser
     * @param {EventFacade} e Triggering Event
     * @param {Object} data Object containing the data required by the chooser template
     */
    var displayModChooser = function(e, data) {
        var sectionid;
        // Set the section for this version of the dialogue.
        if ($(e.currentTarget).parents(CSS.SITETOPIC).length) {
            // The site topic has a sectionid of 1.
            sectionid = 1;
        } else if ($(e.currentTarget).parents(CSS.SECTION).length) {
            var section = $(e.currentTarget).parents(CSS.SECTION);
            sectionid = section.attr('id').replace('section-', '');
        } else if ($(e.currentTarget).parents(CSS.SITEMENU).length) {
            // The block site menu has a sectionid of 0.
            sectionid = 0;
        }
        // If the sectionid exists, append the section parameter to the add module url.
        if (sectionid !== undefined) {
            data.options.forEach(function(option) {
                option.urls.addoption += '&section=' + sectionid;
            });
        }

        ChooserDialogue.displayChooser(e, data);
    };

    /**
     * Update any section areas within the scope of the specified
     * selector with AJAX equivalents.
     *
     * @method _setupForSection
     * @private
     * @param {jQuery} section The selector to limit scope to
     * @param {Object} data Object containing the data required by the chooser template
     * @return void
     */
    var _setupForSection = function(section, data) {
        var chooserspan = $(section).find(CSS.SECTIONMODCHOOSER);
        if (!chooserspan.length) {
            return;
        }
        var modchooserlink = $(chooserspan).children().wrapAll("<a href='#' />");

        CustomEvents.define(modchooserlink, [
            CustomEvents.events.activate,
            CustomEvents.events.keyboardActivate
        ]);

        // Display module chooser event listeners.
        modchooserlink.on(CustomEvents.events.activate, function(e) {
            e.preventDefault();
            displayModChooser(e, data);
        });

        modchooserlink.on(CustomEvents.events.keyboardActivate, function(e) {
            e.preventDefault();
            displayModChooser(e, data);
        });
    };

    /**
     * Update any section areas within the scope of the specified
     * selector with AJAX equivalents.
     *
     * @method setupForSection
     * @param {Object} data Object containing the data required by the chooser template
     * @param {String} baseselector The selector to limit scope to
     */
    var setupForSection = function(data, baseselector) {
        if (!baseselector) {
            baseselector = CSS.PAGECONTENT;
        }
        // Setup for site topics.
        $(baseselector).find(CSS.SITETOPIC).each(function() {
            _setupForSection(this, data);
        });
        // Setup for standard course topics.
        if (CSS.SECTION) {
            $(baseselector).find(CSS.SECTION).each(function() {
                _setupForSection(this, data);
            });
        }

        // Setup for the block site menu.
        $(baseselector).find(CSS.SITEMENU).each(function() {
            _setupForSection(this, data);
        });
    };

    /**
     * Set up the activity chooser.
     *
     * @method initializer
     * @param {Object} data Object containing the data required by the chooser template
     */
    var initializer = function(data) {
        Y.use('moodle-course-coursebase', function() {
            var sectionclass = M.course.format.get_sectionwrapperclass();
            if (sectionclass) {
                CSS.SECTION = '.' + sectionclass;
            }
            // Initialize existing sections and register for dynamically created sections.
            setupForSection(data);
        });
    };

    return /** @alias module:core_course/modchooser */{
        init: initializer
    };
});
