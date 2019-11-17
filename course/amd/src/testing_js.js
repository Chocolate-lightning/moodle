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
 * TODO: This is just a temp file to mess with JS.
 *
 * @module     core_course/testing_js
 * @package    core_course
 * @copyright  2019 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Selectors from './local/activitychooser/testing_selectors';
import * as Modal from 'core/modal_factory';
import * as ModalEvents from 'core/modal_events';
import Templates from 'core/templates';
import {debounce} from 'core/utils';
import {addIconToContainerWithPromise} from 'core/loadingicon';

const fakeObject = () => {
    let i = 1;
    let foo = [];
    while (i < 15) {
        foo.push({
            id: i,
            name: `Not easy ${i}`,
            modUrl: `mod_${i}/icon.svg`,
            someAttr: `idk_${i}`,
            anotherAttr: `f${i}oo_${i}`,
        });
        i++;
    }

    return {results: foo};
};

const searchManagement = async(root, exampleData) => {
    const searchInput = root.querySelector(Selectors.regions.userSearch);
    const resultsArea = root.querySelector(Selectors.regions.searchResults);
    const filterForm = root.querySelector(Selectors.regions.filterSearch);

    // Just show all results by default.
    const {html, js} = await Templates.renderForPromise('core_course/testing_item', exampleData);
    Templates.replaceNodeContents(resultsArea, html, js);
    const formElements = filterForm.elements;
    // Debounce the search input so that it only executes 300 milliseconds after the user has finished typing.
    searchInput.addEventListener('input', debounce(async() => {
        const results = funcForDebounce(exampleData, searchInput.value, formElements);
        const {html, js} = await Templates.renderForPromise('core_course/testing_item', {results: results});
        Templates.replaceNodeContents(resultsArea, html, js);
    }, 300));
};

const funcForDebounce = (exampleData, searchValue, formElements) => {
    searchValue = searchValue.toLowerCase();
    if (searchValue === '') {
        return exampleData.results;
    }
    // Check if any elements are checked.
    // If any are checked we want to know exactly which ones.
    const activeFilters = Array.prototype.filter.call(formElements.checks, (input) => {
        return input.checked;
    });

    if (activeFilters.length > 0) {
        // Whittle down the Data based on our active filters.
        return exampleData.results.filter((element) => {
            return Array.prototype.some.call(activeFilters, (filter) => {
                return element[filter.dataset.restrict].toLowerCase().includes(searchValue);
            });
        });
    } else {
        // Default search if no filters selected.
        return exampleData.results.filter((el) => {
            return el.name.toLowerCase().includes(searchValue);
        });
    }
};

const modalManagement = async(root, exampleData) => {
    const modal = await Modal.create({
        title: 'Dummy Modal',
        large: true,
        type: Modal.types.CANCEL
    });

    const testingDiv = root.querySelector(Selectors.regions.testingDiv);

    const {html, js} = await Templates.renderForPromise('core_course/testing_item', exampleData);

    await Templates.replaceNodeContents(testingDiv, html, js);
    modal.setBody(testingDiv.outerHTML);
    // Uncomment below to see the example data items in a Modal.
    //modal.show();
    // Handle hidden event.
    modal.getRoot().on(ModalEvents.hidden, () => {
        // Destroy when hidden.
        modal.destroy();
    });
};

export const init = async(root) => {
    const rootDiv = document.querySelector(root);
    const spinner = addIconToContainerWithPromise(root);
    // TODO Move all the wrapper code into the modal rather than half and half.
    //document.createElement('div');
    const exampleData = fakeObject();
    await modalManagement(rootDiv, exampleData);
    searchManagement(rootDiv, exampleData);
    spinner.resolve();
};
