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
 * Our basic form manager for when a user either enters
 * their profile url or just wants to browse.
 *
 * @module     tool_moodlenet/instance_form
 * @package    tool_moodlenet
 * @copyright  2020 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define(['core/ajax', 'core/templates','tool_moodlenet/selectors'], function(Ajax, Templates, Selectors) {
    /**
     * Set up the page.
     *
     * @method init
     */
    var init = function init(userid) {
        var page = document.querySelector(Selectors.region.selectPage);
        registerListenerEvents(page);
        addCourses(page, userid);
    };

    /**
     * Add the event listeners to our form.
     *
     * @method registerListenerEvents
     * @param {HTMLElement} page The whole page element for our form area
     */
    var registerListenerEvents = function registerListenerEvents(page) {
        window.console.log(page);
        page.addEventListener('click', function(e) {
            // Browse without an account.
            if (e.target.matches(Selectors.action.search)) {
                var input = page.querySelector('#searchinput');
                window.console.log(input);
                var args = {
                    criterianame: 'search',
                    criteriavalue: input.value,
                };
                Ajax.call([{
                    methodname: 'core_course_search_courses',
                    args: args
                }])[0].then(function(result) {
                    window.console.log(result.courses);
                    result.courses.forEach(function(course) {
                        course.name = course.fullnamedisplay;
                        course.showshortname = true;
                    });
                    window.console.log(page.querySelector('[data-region="search-results-container"]'));
                    return result;
                }).then(function(result) {
                    Templates.render('core_course/coursecards', {courses: result.courses}).then(function(html, js) {
                        Templates.replaceNodeContents(page.querySelector('[data-region="search-results-container"]'), html, js);
                        return;
                    });
                }).catch();
            }
        });
    };

    var addCourses = function(page, userid) {
        var courseArea = page.querySelector(Selectors.region.courses);
        window.console.log(courseArea);
        window.console.log(userid);
        var args = {
            userid: userid,
            limit: 15,
        };
        Ajax.call([{
            methodname: 'core_course_get_recent_courses',
            args: args
        }])[0].then(function(result) {
            result.forEach(function(course) {
                course.name = course.fullnamedisplay;
                course.showshortname = true;
            });
            window.console.log(result);
            return result;
        }).then(function(result) {
            Templates.render('core_course/coursecards', {courses: result}).then(function(html, js) {
                Templates.replaceNodeContents(courseArea, html, js);
                return;
            });
        }).catch();
    };

    return {
        init: init,
    };
});
