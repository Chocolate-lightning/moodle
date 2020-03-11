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
 * @module     tool_moodlenet/local/instance_form/validator
 * @package    tool_moodlenet
 * @copyright  2020 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import Ajax from 'core/ajax';

/**
 * Handle form validation
 *
 * @method validation
 * @param {HTMLElement} inputElement The element the user entered text into.
 * @return {Boolean} Was the users' entry a valid profile URL?
 */
export const validation = async(inputElement) => {
    const inputValue = inputElement.value;

    // They didn't submit anything or they gave us a simple string that we can't do anything with.
    if (inputValue === "" || !inputValue.includes("@")) {
        return false;
    }

    const inputSplit = inputValue.split("@");

    const args = {
        name: null,
        domain: null
    };

    if (inputSplit.length === 2) {
        // It'll either be an email or WebFinger entry.
        args.name = inputSplit[0];
        args.domain = inputSplit[1];
    } else if (inputSplit.length === 3) {
        // We may have a profile link as MoodleNet gives to the user.
        args.name = inputSplit[1];
        args.domain = inputSplit[2];
    } else {
        return false;
    }

    const result = await Ajax.call([{
        methodname: 'tool_moodlenet_verify_webfinger',
        args: args
    }])[0].then((result) => {
        return result;
    }).catch();
    return result;
};
