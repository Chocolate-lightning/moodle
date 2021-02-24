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
 * Allow users to search courses dynamically.
 *
 * @module     block_myoverview/search_courses
 * @package    block_myoverview
 * @copyright  2021 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import * as Ajax from 'core/ajax';
import * as Templates from 'core/templates';
import * as Selectors from 'block_myoverview/selectors';
import * as Notification from 'core/notification';
import {debounce} from 'core/utils';

/**
 * Set up the page.
 *
 * @method init
 * @param {string} importIdString the string ID of the import.
 */
export const init = () => {
    const page = document.querySelector(Selectors.region.selectPage);
    registerListenerEvents(page);
    addCourses(page);
};

/**
 * Renders the 'no-courses' template.
 *
 * @param {HTMLElement} areaReplace the DOM node to replace.
 * @returns {Promise}
 */
const renderNoCourses = (areaReplace) => {
    return Templates.renderPix('courses', 'tool_moodlenet').then(function(img) {
        return img;
    }).then((img) => {
        const temp = document.createElement('div');
        temp.innerHTML = img.trim();
        return Templates.render('core_course/no-courses', {
            nocoursesimg: temp.firstChild.src
        });
    }).then((html, js) => {
        Templates.replaceNodeContents(areaReplace, html, js);
        areaReplace.classList.add('mx-auto');
        areaReplace.classList.add('w-25');
        return;
    });
};

/**
 * Render the course cards for those supplied courses.
 *
 * @param {HTMLElement} areaReplace the DOM node to replace.
 * @param {Array<courses>} courses the courses to render.
 * @returns {Promise}
 */
const renderCourses = (areaReplace, courses) => {
    return Templates.render('block_myoverview/view-cards', {
        courses: courses
    }).then((html, js) => {
        Templates.replaceNodeContents(areaReplace, html, js);
        areaReplace.classList.remove('mx-auto');
        areaReplace.classList.remove('w-25');
        return;
    });
};

/**
 * For a given input, the page & what to replace fetch courses and manage icons too.
 *
 * @method searchCourses
 * @param {string} inputValue What to search for
 * @param {HTMLElement} page The whole page element for our page
 * @param {HTMLElement} areaReplace The Element to replace the contents of
 */
const searchCourses = function(inputValue, page, areaReplace) {
    const searchIcon = page.querySelector(Selectors.region.searchIcon);
    const clearIcon = page.querySelector(Selectors.region.clearIcon);

    if (inputValue !== '') {
        searchIcon.classList.add('d-none');
        clearIcon.parentElement.classList.remove('d-none');
    } else {
        searchIcon.classList.remove('d-none');
        clearIcon.parentElement.classList.add('d-none');
    }
    const args = {
        searchvalue: inputValue,
    };
    Ajax.call([{
        methodname: 'tool_moodlenet_search_courses',
        args: args
    }])[0].then((result) => {
        if (result.courses.length === 0) {
            return renderNoCourses(areaReplace);
        } else {
            return renderCourses(areaReplace, result.courses);
        }
    }).catch(Notification.exception);
};

/**
 * Add the event listeners to our page.
 *
 * @method registerListenerEvents
 * @param {HTMLElement} page The whole page element for our page
 */
const registerListenerEvents = (page) => {
    const input = page.querySelector(Selectors.region.searchInput);
    const courseArea = page.querySelector(Selectors.region.courses);
    const clearIcon = page.querySelector(Selectors.region.clearIcon);
    clearIcon.addEventListener('click', () => {
        input.value = '';
        searchCourses('', page, courseArea);
    });

    input.addEventListener('input', debounce(() => {
        searchCourses(input.value, page, courseArea);
    }, 300));
};

/**
 * Fetch the courses to show the user. We use the same WS structure & template as the search for consistency.
 *
 * @method addCourses
 * @param {HTMLElement} page The whole page element for our course page
 */
const addCourses = (page) => {
    const courseArea = page.querySelector(Selectors.region.courses);
    searchCourses('', page, courseArea);
};
