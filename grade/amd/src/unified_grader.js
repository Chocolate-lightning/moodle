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
import * as UserPaginator from './unified_grader_user_paginator';

const getHelpers = (config) => {
    const displayContent = (html, js) => {
        let widget = document.createElement('div');
        widget.className = "grader-module-content-display col-sm-12";
        widget.dataset.replace = "grader-module-content";
        widget.innerHTML = html;
        return Templates.replaceNode(Selectors.regions.moduleReplace, widget, js);
    };

    const displayUsers = (html) => {
        return Templates.replaceNode(Selectors.regions.gradingReplace, html);
    };

    const getUsers = (cmid) => {
        return config
            .getUsersForCmidFunction(cmid)
            .catch(Notification.exception);
    };
    const showUser = (userid) => {
        config
            .getContentForUserId(userid)
            .then(displayContent)
            .catch(Notification.exception);
    };

    const renderUserContent = (index, user) => {
        config.getContentForUserId(user.id)
            .then((html, js) => {
                let widget = document.createElement('div');
                widget.className = "grader-module-content-display col-sm-12";
                widget.dataset.replace = "grader-module-content";
                widget.innerHTML = html;
                return Templates.replaceNode(Selectors.regions.moduleReplace, widget, js);
            });
    };

    const renderUserPicker = (state) => {
        const userNames = state.map(user => ({firstname: user.firstname, lastname: user.lastname, userid: user.id}));
        const picker = UserPaginator.createPicker(userNames, 0, renderUserContent);
        return picker;

    };
    const registerEventListeners = () => {
        // We have no event listeners to register yet.
    };

    return {
        showUser,
        getUsers,
        renderUserPicker,
        displayUsers,
        registerEventListeners,
    };
};

export const init = (config) => {
    const {
        showUser,
        getUsers,
        renderUserPicker,
        displayUsers,
        registerEventListeners,
    } = getHelpers(config);

    if (config.initialUserId) {
        showUser(config.initialUserId);
    }

    getUsers(config.cmid)
        .then(state => {
            renderUserPicker(state.users)
                .then((picker) => {
                    displayUsers(picker);
            });
        })
        .catch();

    registerEventListeners();

    // You might instantiate the user selector here, and pass it the function displayContentForUser as the thing to call
    // when it has selected a user.
};
