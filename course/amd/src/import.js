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
 * Our primary import JS that'll handle files being adding to a course programmatically.
 *
 * @module     core_course/import
 * @package    core_course
 * @copyright  2020 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import selectors from 'core_course/local/import/selectors';
import CustomEvents from 'core/custom_interaction_events';
import * as Templates from 'core/templates';

/**
 * Set up the activity chooser.
 *
 * @method init
 * @param {number} courseid The ID of the course we are in.
 */
export const init = (courseid) => {

    setupSectionAreas();

    // Need to add handlers after areas have been set up.
    registerListenerEvents(courseid);

};

/**
 * Setup the section areas for users to select where to add a file.
 *
 * @method setupSectionAreas
 */
const setupSectionAreas = async() => {
    const {html, js} = await Templates.renderForPromise('core_course/local/import/section_handler', {});
    const sections = document.querySelectorAll(selectors.elements.sections);
    Array.prototype.map.call(sections, async(section) => {
        const content = section.querySelector('.section');
        await Templates.appendNodeContents(content, html, js);
    });
};

/**
 * Listen for and handle the users selection.
 *
 * @method registerListenerEvents
 * @param {number} courseid The ID of the course we are in.
 */
const registerListenerEvents = (courseid) => {
    const events = [
        'click',
        CustomEvents.events.activate,
        CustomEvents.events.keyboardActivate
    ];

    CustomEvents.define(document, events);

    // Display module chooser event listeners.
    events.forEach((event) => {
        document.addEventListener(event, async(e) => {
            if (e.target.closest(selectors.actions.sectionHandlerArea)) {
                window.console.log('Call handler in MDL-68371');
                window.console.log(`Course ID: ${courseid}`);
                // TODO: When MDL-68235 we can use the following.
                //const fullSection = e.target.closest(selectors.elements.sections);
                //const sectionID = fullSection.dataset.sectionid;
                //window.console.log(`Section ID: ${sectionID}`);
                // Call off to dialouge created in MDL-68372.
            }
        });
    });
};
