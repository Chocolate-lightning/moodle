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
 *
 * @module     mod_forum/forum_grader
 * @package    mod_forum
 * @copyright  2019 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Notification from 'core/notification';
import Templates from 'core/templates';
import * as UnifiedGrader from 'core_grades/unified_grader';

import Repository from './repository';
import CourseRepository from 'core_course/repository';

const templateNames = {
    contentRegion: 'mod_forum/forum_grader_discussion_posts',
    userRegion: 'mod_forum/user_navigator',
};

const getPostContextFunction = (cmid) => {
    return (userid) => {
        return Repository.getDiscussionByUserID(userid, cmid);
    };
};

const getContentForUserIdFunction = (cmid, templateName) => {
    const postContextFunction = getPostContextFunction(cmid);
    return (userid) => {
        return postContextFunction(userid)
            .then((context) => {
                return Templates.render(templateName, context);
            })
            .catch(Notification.exception);
    };
};

const getUsersForCmidFunction = () => {
    return (cmid) => {
        return CourseRepository.getUsersFromCourseModuleID(cmid)
            .then((context) => {
                return context;
            })
            .catch(Notification.exception);
    };
};

export const init = (rootElementId) => {
    const rootNode = document.querySelector(`#${rootElementId}`).querySelector('[data-region="unified-grader"]');
    const cmid = rootNode.dataset.cmid;

    return UnifiedGrader.init({
        root: rootNode,
        cmid: cmid,
        initialUserId: rootNode.dataset.firstUserid,
        getContentForUserId: getContentForUserIdFunction(cmid, templateNames.contentRegion),
        getUsersForCmidFunction: getUsersForCmidFunction(),

        // Example for future.
        // saveGradeForUser: getGradeFunction(cmid),
    });
};
