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
 * This module will tie together all of the different calls the gradable module will make.
 *
 * @module     core_grades/unified_grader
 * @package    core_grades
 * @copyright  2019 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import Templates from 'core/templates';
import Selectors from './selectors';

const getHelpers = (config) => {
    const displayContent = (html, js) => {
        return Templates.replaceNode(Selectors.regions.moduleReplace, html, js);
    };

    const showUser = (userid) => {
        config
            .getContentForUserId(userid)
            .then(displayContent)
            .catch(Notification.exception);
    };


    const registerEventListeners = () => {
        // We have no event listeners to register yet.
    };

    return {
        registerEventListeners,
        showUser,
    };
};

export const init = (config) => {
    const {
        showUser,
        registerEventListeners,
    } = getHelpers(config);

    if (config.initialUserId) {
        showUser(config.initialUserId);
    }

    registerEventListeners();

    // You might instantiate the user selector here, and pass it the function displayContentForUser as the thing to call
    // when it has selected a user.
};
