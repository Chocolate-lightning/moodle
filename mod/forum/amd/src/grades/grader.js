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
 * @module     mod_forum/grades/grader
 * @package    mod_forum
 * @copyright  2019 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import * as Selectors from './grader/selectors';
import Repository from 'mod_forum/repository';
import Templates from 'core/templates';
import * as Grader from '../local/grades/unified_grader';
import Notification from 'core/notification';
import CourseRepository from 'core_course/repository';

const templateNames = {
    contentRegion: 'mod_forum/forum_grader_discussion_posts',
};

const getWholeForumFunctions = (cmid) => {
    const getPostContextFunction = () => {
        return (userid) => {
            return Repository.getDiscussionByUserID(userid, cmid);
        };
    };

    const getContentForUserIdFunction = () => {
        const postContextFunction = getPostContextFunction(cmid);
        return (userid) => {
            return postContextFunction(userid)
                .then((context) => {
                    return Templates.render(templateNames.contentRegion, context);
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

    return {
        getPostContext: getPostContextFunction(),
        getContentForUserId: getContentForUserIdFunction(),
        getUsersForCmidFunction: getUsersForCmidFunction()
    };
};

const findGradableNode = (node) => {
    return node.closest(Selectors.gradableItem);
};

export const registerLaunchListeners = () => {
    document.addEventListener('click', (e) => {
        if (e.target.matches(Selectors.launch)) {
            const rootNode = findGradableNode(e.target);

            if (!rootNode) {
                throw Error('Unable to find a gradable item');
            }

            if (rootNode.matches(Selectors.gradableItems.wholeForum)) {
                const wholeForumFunctions = getWholeForumFunctions(rootNode.dataset.cmid);

                Grader.launch({
                    cmid: rootNode.dataset.cmid,
                    groupid: rootNode.dataset.groupid,
                    initialUserId: rootNode.dataset.initialuserid,
                    getContentForUserId: wholeForumFunctions.getContentForUserId,
                    getUsersForCmidFunction: wholeForumFunctions.getUsersForCmidFunction,
                });

                e.preventDefault();
            } else {
                throw Error('Unable to find a valid gradable item');
            }
        }
    });
};
