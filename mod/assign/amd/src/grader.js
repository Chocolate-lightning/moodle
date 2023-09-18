import * as Selectors from './grader/selectors';
import * as Grader from 'core_grades/local/grader';
import Repository from './grader/repo';
import Notification from 'core/notification';
import Templates from 'core/templates';
import CourseRepository from 'core_course/repository';
import {relativeUrl} from 'core/url';

/**
 * Curried function with CMID set, this is then used in unified grader as a fetch a users content.
 *
 * @param {Number} cmid
 */
const getContentForUserIdFunction = (cmid) => (userid) => {
    /**
     * Given the parent function is called with the second param set execute the partially executed function.
     *
     * @param {Number} userid
     */
    return Repository.foo(userid, cmid)
        .then((context) => {
            return Templates.render('gradereport_singleview/page_toggler', context);
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
const launchWholeForumGrading = async(rootNode, {
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
        getContentForUserIdFunction(data.cmid),
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
                    await launchWholeForumGrading(rootNode, {
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
