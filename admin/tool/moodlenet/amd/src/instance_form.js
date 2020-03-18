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
 * Our basic form manager for when a user either enters
 * their profile url or just wants to browse.
 *
 * @module     tool_moodlenet/instance_form
 * @package    tool_moodlenet
 * @copyright  2020 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {validation as Validator} from 'tool_moodlenet/local/instance_form/validator';
import Selectors from 'tool_moodlenet/local/instance_form/selectors';

/**
 * Set up the form.
 *
 * @method init
 * @param {String} defaulturl Our base case / Moodle's own MoodleNet instance.
 */
export const init = (defaulturl) => {
    const page = document.querySelector(Selectors.region.instancePage);
    registerListenerEvents(page, defaulturl);
};

/**
 * Add the event listeners to our form.
 *
 * @method registerListenerEvents
 * @param {HTMLElement} page The whole page element for our form area
 * @param {String} defaulturl Our base case / Moodle's own MoodleNet instance.
 */
const registerListenerEvents = (page, defaulturl) => {
    page.addEventListener('click', async(e) => {
        // Browse without an account.
        if (e.target.matches(Selectors.action.browse)) {
            window.location = defaulturl;
        }
        // Our fake submit button / browse button.
        if (e.target.matches(Selectors.action.submit)) {
            // TODO: Spinner required.
            const input = page.querySelector(Selectors.var.mnetLink);
            const passed = await Validator(input);
            if (passed) {
                input.classList.remove('is-invalid'); // Just in case the class has been applied already.
                input.classList.add('is-valid');
                // TODO: Timeout before redirect.
                //window.location = "https://mathew.solutions";
            } else {
                // Pass a tool tip or something?
                input.classList.add('is-invalid');
            }
        }
    });
};
