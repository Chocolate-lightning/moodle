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
 * A repo for the collapsing in the grader report.
 *
 * @module    gradereport_grader/collapse/repository
 * @copyright 2022 Mathew May <mathew.solutions>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import ajax from 'core/ajax';

/**
 * Given a user ID, we want to fetch the users' report preferences.
 *
 * @method userFetch
 * @param {int} userID ID of the user to fetch the preferences of.
 * @return {object} jQuery promise
 */
export const prefFetch = (userID) => {
    const request = {
        methodname: 'core_user_get_user_preferences',
        args: {
            userid: userID,
            name: 'grade_report_grader_collapsed_columns',
        },
    };
    return ajax.call([request])[0];
};

/**
 * Given a preference array of objects, we want to set the users' report preferences.
 *
 * @method prefSet
 * @param {array} prefs Array of objects containing the preferences we need to update.
 * @return {object} jQuery promise
 */
export const prefSet = (prefs) => {
    var request = {
        methodname: 'core_user_set_user_preferences',
        args: {
            preferences: prefs
        }
    };
    return ajax.call([request])[0];
};

/**
 * Fetch all the information on gradeitems we'll need in the column collapser.
 *
 * @method gradeItems
 * @param {Number} courseid What course to fetch the gradeitems for
 * @return {object} jQuery promise
 */
export const gradeItems = (courseid) => {
    const request = {
        methodname: 'core_grades_get_gradeitems',
        args: {
            courseid: courseid,
        },
    };
    return ajax.call([request])[0];
};
