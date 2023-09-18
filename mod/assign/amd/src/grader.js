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
 * This module will tie together all the different calls the gradable module will make.
 *
 * @module     mod_assign/grades/grader
 * @copyright  2023 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import Ajax from 'core/ajax';
import * as Selectors from 'mod_assign/grader/selectors';
import * as Grader from 'core_grades/local/grader';
import Notification from 'core/notification';
import Templates from 'core/templates';
import CourseRepository from 'core_course/repository';
import {relativeUrl} from 'core/url';

/**
 * Get the submissions for the user and cmid provided.
 *
 * @param {number} userid
 * @param {number} moduleid
 * @return {*|Promise}
 */
const getSubmissionByUserID = (userid, moduleid) => {
    // TODO: This would need to be changed to use the file API & tinyMCE API to get the content.
    const request = {
        methodname: 'mod_assign_get_submission_status',
        args: {
            assignid: moduleid,
            userid: userid,
        },
    };
    return Ajax.call([request])[0];
};

/**
 * Curried function with module id set, this is then used in unified grader as a fetch a users content.
 *
 * @param {Number} moduleid
 */
const getContentForUserIdFunction = (moduleid) => (userid) => {
    return getSubmissionByUserID(userid, moduleid)
        .then(context => {
            return Templates.render('mod_assign/grades/grader/submission', context);
        })
        .catch(Notification.exception);
};

/**
 * Curried function with CMID set, this is then used in unified grader as a fetch users call.
 * The function curried fetches all users in a course for a given CMID.
 *
 * @param {Number} cmid
 * @param {Number} groupID
 * @param {Boolean} onlyActive Whether to fetch only the active enrolled users or all enrolled users in the course.
 * @return {Array} Array of users for a given context.
 */
const getUsersForCmidFunction = (cmid, groupID, onlyActive) => async() => {
    const context = await CourseRepository.getUsersFromCourseModuleID(cmid, groupID, onlyActive);

    return context.users;
};


const findGradableNode = node => node.closest(Selectors.gradableItem);

/**
 * Launch the Grader.
 *
 * @param {HTMLElement} rootNode the root HTML element describing what is to be graded
 * @param {object} param
 * @param {bool} [param.focusOnClose=null]
 */
const launchSubmissionGrading = async(rootNode, {
    focusOnClose = null,
} = {}) => {
    const data = rootNode.dataset;
    const gradingPanelFunctions = await Grader.getGradingPanelFunctions(
        'mod_assign',
        data.contextid,
        data.gradingComponent,
        data.gradingComponentSubtype,
        data.gradableItemtype
    );

    const groupID = data.group ? data.group : 0;
    const onlyActive = data.gradeOnlyActiveUsers;

    await Grader.launch(
        getUsersForCmidFunction(data.cmid, groupID, onlyActive),
        getContentForUserIdFunction(data.moduleId),
        gradingPanelFunctions.getter,
        gradingPanelFunctions.setter,
        {
            groupid: data.groupid,
            initialUserId: data.initialuserid,
            moduleName: data.name,
            courseName: data.courseName,
            courseUrl: relativeUrl('/course/view.php', {id: data.courseId}),
            sendStudentNotifications: data.sendStudentNotifications,
            focusOnClose,
        }
    );
};

/**
 * Launch the Grader.
 *
 * @param {HTMLElement} rootNode the root HTML element describing what is to be graded
 * @param {object} param
 * @param {bool} [param.focusOnClose=null]
 */
const launchViewGrading = async(rootNode, {
    focusOnClose = null,
} = {}) => {
    const data = rootNode.dataset;
    const gradingPanelFunctions = await Grader.getGradingPanelFunctions(
        'mod_assign',
        data.contextid,
        data.gradingComponent,
        data.gradingComponentSubtype,
        data.gradableItemtype
    );

    await Grader.view(
        gradingPanelFunctions.getter,
        data.userid,
        data.name,
        {
            groupid: data.groupid,
            initialUserId: data.initialuserid,
            moduleName: data.name,
            courseName: data.courseName,
            courseUrl: relativeUrl('/course/view.php', {id: data.courseId}),
            sendStudentNotifications: data.sendStudentNotifications,
            focusOnClose,
        }
    );
};

/**
 * Register listeners to launch the grading panel.
 */
export const registerLaunchListeners = () => {
    document.addEventListener('click', async(e) => {
        if (e.target.matches(Selectors.launch)) {
            const rootNode = findGradableNode(e.target);

            if (!rootNode) {
                throw Error('Unable to find a gradable item');
            }

            if (rootNode.matches(Selectors.gradableItems.wholeAssign)) {
                // Note: The preventDefault must be before any async function calls because the function becomes async
                // at that point and the default action is implemented.
                e.preventDefault();
                try {
                    await launchSubmissionGrading(rootNode, {
                        focusOnClose: e.target,
                    });
                } catch (error) {
                    Notification.exception(error);
                }
            } else {
                throw Error('Unable to find a valid gradable item');
            }
        }
        if (e.target.matches(Selectors.viewGrade)) {
            e.preventDefault();
            const rootNode = findGradableNode(e.target);

            if (!rootNode) {
                throw Error('Unable to find a gradable item');
            }

            if (rootNode.matches(Selectors.gradableItems.wholeAssign)) {
                // Note: The preventDefault must be before any async function calls because the function becomes async
                // at that point and the default action is implemented.
                e.preventDefault();
                try {
                    await launchViewGrading(rootNode, {
                        focusOnClose: e.target,
                    });
                } catch (error) {
                    Notification.exception(error);
                }
            } else {
                throw Error('Unable to find a valid gradable item');
            }
        }
    });
};
