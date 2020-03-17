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
 * @module     tool_moodlenet/instance_form
 * @package    tool_moodlenet
 * @copyright  2020 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {validation as validator} from 'tool_moodlenet/local/instance_form/validator';

export const init = () => {
    const page = document.querySelector('[data-region="moodle-net"]');
    registerListenerEvents(page);
};

const registerListenerEvents = (page) => {
    page.addEventListener('click', async(e) => {
        // Browse with a account.
        if (e.target.matches('[data-action="browse"]')) {
            //window.location = "https://moodle.org";
        }
        // Our fake submit button / browse button.
        if (e.target.matches('[data-action="submit"]')) {
            const input = page.querySelector('[data-var="mnet-link"]');
            const passed = await validator(input);
            if (passed) {
                input.classList.remove('is-invalid'); // Just in case the class has been applied already.
                input.classList.add('is-valid');
                //window.location = "https://mathew.solutions";
            } else {
                // Pass a tool tip or something?
                input.classList.add('is-invalid');
            }
        }
    });
};
