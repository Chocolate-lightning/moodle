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
 * Allow the user to search for learners within the grader report.
 * Have to basically search twice on the dataset to avoid passing around massive csv params whilst allowing debouncing.
 *
 * @module    gradereport_grader/search
 * @copyright 2023 Mathew May <mathew.solutions>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import GradebookSearchClass from 'gradereport_grader/search/search_class';
import * as Repository from 'gradereport_grader/search/repository';
import {get_strings as getStrings} from 'core/str';
import Url from 'core/url';
import * as Templates from 'core/templates';

const bannedFilterFields = ['profileimageurlsmall', 'profileimageurl', 'id', 'link', 'matchingField', 'matchingFieldName'];

// Define our standard lookups.
const selectors = {
    component: '.user-search',
    courseid: '[data-region="courseid"]',
};
const component = document.querySelector(selectors.component);
const courseID = component.querySelector(selectors.courseid).dataset.courseid;

export default class UserSearch extends GradebookSearchClass {

    // A map of user profile field names that is human-readable.
    profilestringmap = null;

    constructor() {
        super();
    }

    /**
     * Build the content then replace the node.
     */
    async renderDropdown() {
        const {html, js} = await Templates.renderForPromise('gradereport_grader/search/resultset', {
            users: this.results,
            hasusers: this.results.length > 0,
            total: this.dataset.length,
            found: this.results.length,
            searchterm: this.searchTerm,
            selectall: this.selectAllResultsLink(),
        });
        Templates.replaceNodeContents(this.searchDropdown, html, js);
    }

    /**
     * Get the data we will be searching against in this component.
     *
     * @returns {Promise<*>}
     */
    fetchDataset() {
        return Repository.userFetch(courseID).then((r) => r.users);
    }

    /**
     * Dictate to the search component how and what we want to match upon.
     *
     * @returns {Array} The users that match the given criteria.
     */
    async filterDataset() {
        // Conditionally fetch the users we want to search upon.
        this.dataset = this.dataset || await this.fetchDataset();

        return this.dataset.filter((user) => Object.keys(user).some((key) => {
            if (user[key] === "" || bannedFilterFields.includes(key)) {
                return false;
            }
            return user[key].toString().toLowerCase().includes(this.preppedSearchTerm);
        }));
    }

    /**
     * Given we have a subset of the dataset, set the field that we matched upon to inform the end user.
     *
     * @returns {Array} The results with the matched fields inserted.
     */
    async filterMatchDataset() {
        // Conditionally grab the user profile field name string map.
        this.profilestringmap = this.profilestringmap || await fetchRequiredStrings();

        this.results = this.matchedResults.map((user) => {
            for (const [key, value] of Object.entries(user)) {
                const valueString = value.toString().toLowerCase();
                if (!valueString.includes(this.preppedSearchTerm)) {
                    continue;
                }
                // Ensure we have a good string, otherwise fallback to the key.
                user.matchingFieldName = this.profilestringmap.get(key) ?? key;
                user.matchingField = valueString.replace(
                    this.preppedSearchTerm,
                    `<span class="font-weight-bold">${this.searchTerm}</span>`
                );
                user.link = this.selectOneLink(user.id);
                break;
            }
            return user;
        });
    }

    /**
     * The handler for when a user interacts with the component.
     *
     * @param {Event} e The triggering event that we are working with.
     */
    clickHandler(e) {
        super.clickHandler(e);
        if (e.target === this.currentViewAll && e.button === 0) {
            window.location = this.selectAllResultsLink();
        }
    }

    /**
     * The handler for when a user presses a key within the component.
     *
     * @param {Event} e The triggering event that we are working with.
     */
    keyHandler(e) {
        super.keyHandler(e);

        if (e.target === this.currentViewAll && (e.key === 'Enter' || e.key === 'Space')) {
            window.location = this.selectAllResultsLink();
        }

        // Switch the key presses to handle keyboard nav.
        switch (e.key) {
            case 'Enter':
            case ' ':
                if (document.activeElement === this.searchInput) {
                    if (e.key === ' ') {
                        break;
                    } else {
                        window.location = this.selectAllResultsLink();
                        break;
                    }
                }
                if (document.activeElement === this.clearSearchButton) {
                    this.closeSearch();
                    break;
                }
                e.preventDefault();
                window.location = e.target.closest('.dropdown-item').href;
                break;
        }
    }

    /**
     * Build up the view all link.
     *
     * @returns {string|*}
     */
    selectAllResultsLink() {
        return Url.relativeUrl('/grade/report/grader/index.php', {
            id: courseID,
            searchvalue: this.searchTerm
        }, false);
    }

    /**
     * Build up the view all link that is dedicated to a particular result.
     *
     * @param {Number} userID The ID of the user selected.
     * @returns {string|*}
     */
    selectOneLink(userID) {
        return Url.relativeUrl('/grade/report/grader/index.php', {
            id: courseID,
            searchvalue: this.searchTerm,
            userid: userID,
            }, false);
    }

    static init() {
        return new UserSearch();
    }
}

/**
 * Given the set of profile fields we can possibly search, fetch their strings,
 * so we can report to screen readers the field that matched.
 *
 * @returns {Promise<void>}
 */
const fetchRequiredStrings = () => {
    const requiredStrings = [
        'username',
        'firstname',
        'lastname',
        'email',
        'city',
        'country',
        'department',
        'institution',
        'idnumber',
        'phone1',
        'phone2',
    ];
    return getStrings(requiredStrings.map((key) => ({key})))
        .then((stringArray) => new Map(
            requiredStrings.map((key, index) => ([key, stringArray[index]]))
        ));
};
