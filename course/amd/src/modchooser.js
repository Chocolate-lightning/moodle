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
 * @since      3.9
 */

import * as ChooserDialogue from 'core_course/chooser_dialogue';
import CustomEvents from 'core/custom_interaction_events';
import * as Repository from 'core_course/local/chooser/repository';
import selectors from 'core_course/local/chooser/selectors';

/**
 * Mutate the moduleInfo {} to add the section onto the addoption url.
 *
 * @method moduleInfoFormatter
 * @param {EventFacade} e Triggering Event
 * @param {Object} moduleInfo Object containing the data required by the chooser template
 * @param {HTMLElement} section The selector to limit scope to
 *
 * @return {Object} moduleInfo Object that now has the section information attached
 */
const moduleInfoFormatter = (e, moduleInfo, section) => {
    let sectionid;
    // Set the section for this version of the dialogue.

    const siteTopic = document.querySelector(`${selectors.elements.sitetopic}`);
    const siteMenu = document.querySelector(`${selectors.elements.sitemenu}`);

    if (siteTopic !== null) {
        // The site topic has a sectionid of 1.
        sectionid = 1;
    } else if (siteMenu !== null) {
        // The block site menu has a sectionid of 0.
        sectionid = 0;
    } else if (e.target.id) {
        const caller = section.querySelector(`#${e.target.id}`);
        sectionid = caller.dataset.sectionid;
    }

    // If the sectionid exists, append the section parameter to the add module url.
    if (sectionid !== undefined) {
        moduleInfo.allmodules.forEach((module) => {
            module.urls.addoption += '&section=' + sectionid;
        });
    }
    return moduleInfo;
};

/**
 * For each sections 'Add activity or resource' we want to wrap the dom into a link
 * and add some event handlers for click and keyboards
 *
 * @method sectionEventHandler
 * @param {HTMLElement} section The selector to limit scope to
 * @param {Object} moduleInfo Object containing the data required by the chooser template
 */
const sectionEventHandler = (section, moduleInfo) => {
    const chooserSpan = section.querySelector(selectors.elements.sectionmodchooser);
    if (chooserSpan === null) {
        return;
    }

    const events = [
        'click',
        CustomEvents.events.activate,
        CustomEvents.events.keyboardActivate
    ];

    CustomEvents.define(chooserSpan, events);

    // Display module chooser event listeners.
    events.forEach((event) => {
        chooserSpan.addEventListener(event, (e) => {
            e.preventDefault();
            const builtModuleInfo = moduleInfoFormatter(e, moduleInfo, section);
            ChooserDialogue.displayChooser(e, builtModuleInfo);
        });
    });
};

/**
 * Find all instances of sections on the current course page and then fire off to our event builder
 *
 * @method setupForSection
 * @param {Object} moduleInfo Object containing the data required by the chooser template
 */
const setupForSection = (moduleInfo) => {
    // TODO: check if needed.
    document.querySelectorAll(selectors.elements.sitetopic).forEach((section) => {
        sectionEventHandler(section, moduleInfo);
    });

    // Setup for standard course topics.
    document.querySelectorAll(selectors.elements.section).forEach((section) => {
        sectionEventHandler(section, moduleInfo);
    });

    // TODO: check if needed.
    document.querySelectorAll(selectors.elements.sitemenu).forEach((section) => {
        sectionEventHandler(section, moduleInfo);
    });
};

/**
 * Set up the activity chooser.
 *
 * @method init
 * @param {int} courseid Course ID for the course we want modules for
 */
export const init = async(courseid) => {
    const [
        moduleInfo
    ] = await Promise.all([
        Repository.activityModules(courseid)
    ]);

    setupForSection(moduleInfo);
};
