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
export const validation = async(inputElement) => {
    const inputValue = inputElement.value;
    window.console.log(inputValue.split("@"));
    // They didn't submit anything.
    if (inputValue === "") {
        return false;
    }
    // Simple string that we can't do anything with beside check if it is a domain.
    if (!inputValue.includes("@")) {
        // Check if we are getting a domain entry.
        //return !!inputValue.includes(".moodle.net");
        return false;

    } else {
        const inputSplit = inputValue.split("@");

        // Check if we have one @. It'll either be an email or WebFinger entry.
        if (inputSplit.length === 2) {
            // Will need to check both parts of the split. i.e. if both sides are empty.
            window.console.log("email or WebFinger");
            return false;
            // return true;
        }
        // Check if we have two @.
        if (inputSplit.length === 3) {
            // Check the direction of the domain vs username
            window.console.log("Fully passed domain & username in some format");
            // Figure out where the domain is.
            window.console.log('nani');
            const foo = await Ajax.call([{
                methodname: 'tool_moodlenet_test',
                args: {
                    query: inputValue,
                }
            }])[0].then(async(result) => {
                return result;
            }).catch();
            window.console.log(foo);
            return foo;
        }
        // We only accept the above two counts of @.
        return false;
    }
};
