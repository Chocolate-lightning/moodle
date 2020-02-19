import {debounce} from 'core/utils';
import selectors from 'core_course/local/activitychooser/selectors';
import * as Templates from 'core/templates';

export const search = (userArray) => {
    const searchInput = document.querySelector(selectors.actions.searchInput);

    // Debounce the search input so that it only executes 300 milliseconds after the user has finished typing.
    searchInput.addEventListener('input', debounce(() => {
        renderSearchResults(searchForUsers(userArray, searchInput.value));
    }, 300));
};

/**
 * Find the list of users who's names include the given search term.
 *
 * @param {Array} userArray List of users for the grader
 * @param {String} searchTerm The search term to match
 * @return {Array}
 */
const searchForUsers = (userArray, searchTerm) => {
    // The user didn't search for anything so pass pack the entire array.
    if (searchTerm === '') {
        return userArray;
    }

    // Filter down the user array to anything that includes the search in any capacity
    return userArray.filter((user) => {
        return user.nickName.toLowerCase().includes(searchTerm.toLowerCase());
    });
};

const renderSearchResults = async(searchResultsData) => {
    const searchResultsContainer = document.querySelector(selectors.regions.searchResults);
    const templateData = {
        'results': searchResultsData
    };
    // Build up the html & js ready to place into the help section.
    const {html, js} = await Templates.renderForPromise('core_course/training', templateData);
    await Templates.replaceNodeContents(searchResultsContainer, html, js);
};
