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
 * A type of dialogue used as for choosing modules in a course.
 *
 * @module     core_course/modchooser
 * @package    core_course
 * @copyright  2020 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import * as ChooserDialogue from 'core_course/chooser_dialogue';
import CustomEvents from 'core/custom_interaction_events';
import * as Repository from 'core_course/local/chooser/repository';
import selectors from 'core_course/local/chooser/selectors';
import * as Templates from 'core/templates';
import * as ModalFactory from 'core/modal_factory';
import {get_string as getString} from 'core/str';

/**
 * Set up the activity chooser.
 *
 * @method init
 * @param {int} courseid Course ID to use later on in fetchModules()
 */
export const init = async(courseid) => {

    // Fetch all the modules available for a given course.
    const webserviceData = await fetchModules(courseid);

    const allSections = fetchSections();

    const sectionIds = fetchSectionIds(allSections);

    const builtModuleData = sectionIdMapper(webserviceData, sectionIds);

    const modalMap = await modalMapper(builtModuleData);

    // User interaction handlers.
    registerEventHandlers(modalMap, builtModuleData);

    enableInteraction(allSections);
};

/**
 * Call the activity webservice so we get an array of modules
 *
 * @method fetchModules
 * @param {int} courseid Course ID for the course we want modules for
 * @return {Object} The result of the Web service
 */
const fetchModules = async(courseid) => {
    const [
        data
    ] = await Promise.all([
        Repository.activityModules(courseid)
    ]);
    return data;
};

/**
 * Find all the sections on a page
 *
 * @method fetchModules
 * @return {Array} The result of querySelectors that have been spread into a array
 */
const fetchSections = () => {
    const sections = document.querySelectorAll(`${selectors.elements.section}[role="region"]`);
    const siteTopic = document.querySelectorAll(selectors.elements.sitetopic);
    const siteMenu = document.querySelectorAll(selectors.elements.sitemenu);

    return [...sections, ...siteTopic, ...siteMenu];
};

/**
 * Given a NodeList of HTMLElement nodes find their ID's
 *
 * @method fetchSectionIds
 * @param {Array} sections The sections to fetch ID's for
 * @return {Array} Array of section ID's we'll use for maps
 */
const fetchSectionIds = (sections) => {
    const sectionIds = Array.from(sections).map((section) => {
        const button = section.querySelector(`${selectors.elements.sectionmodchooser}`);
        try {
            return button.dataset.sectionid;
        } catch (e) {
            // eslint-disable-line
        }
    });
    return sectionIds;
};

/**
 * Given the web service data and an array of section ID's we want to make deep copies
 * of the WS data then add on the section ID to the addoption URL
 *
 * @method sectionIdMapper
 * @param {Object} webServiceData Our original data from the Web service call
 * @param {Array} sectionIds All of the sections we need to build modal data for
 * @return {Map} A map of K: sectionID V: [modules] with URL's built
 */
const sectionIdMapper = (webServiceData, sectionIds) => {
    const builtDataMap = new Map();
    sectionIds.forEach((id) => {
        // We need to take a fresh deep copy of the original data as an object is a reference type.
        let newData = JSON.parse(JSON.stringify(webServiceData));
        newData.allmodules.forEach((module) => {
            module.urls.addoption += '&section=' + id;
        });
        builtDataMap.set(id, newData.allmodules);
    });
    return builtDataMap;
};

/**
 * Build a modal for each section ID and store it into a map for quick access
 *
 * @method modalMapper
 * @param {Map} builtModuleData our map of section ID's & modules to generate modals for
 * @return {Map} A map of K: sectionID V: {Modal} with the modal being prebuilt
 */
const modalMapper = async(builtModuleData) => {
    const modalMap = new Map();
    const iter = builtModuleData.entries();
    // We need to use a iterator structure as it is a blocking structure.
    let result = iter.next();
    while (!result.done) {
        let sectionId = result.value[0];
        let modules = result.value[1];

        // Run a call off to a new func for filtering favs & recommended.
        const templateData = templateDataBuilder(modules);
        // This may be stuck here :/
        const modal = await buildModal(templateData);
        modalMap.set(sectionId, modal);

        result = iter.next();
    }

    return modalMap;
};

/**
 * Given an array of modules we want to figure out where & how to place them into our template object
 *
 * @method templateDataBuilder
 * @param {Array} data our modules to manipulate into a Templatable object
 * @return {Object} Our built object ready to render out
 */
const templateDataBuilder = (data) => {
    // const recommended = data.filter(mod => mod.recommended === true);
    // const favourites = data.filter(mod => mod.favourite === true);
    // Switching for the active tab.
    // foo ? foo : bar
    const builtData = {
        default: data,
    };
    return builtData;
};

/**
 * Given an object we want to prebuild a modal ready to store into a map
 *
 * @method buildModal
 * @param {Object} data The template data which contains arrays of modules
 * @return {Object} The modal for the calling section with everything already set up
 */
const buildModal = async(data) => {
    const [
        modal,
    ] = await Promise.all([
        ModalFactory.create({
            type: ModalFactory.types.DEFAULT,
            title: getString('addresourceoractivity'),
            body: Templates.render('core_course/chooser', data),
            large: true,
            templateContext: {
                classes: 'modchooser'
            }
        })
    ]);
    return modal;
};

/**
 * Now all of our setup is done we want to ensure a user can actually select a section to add a module to
 * Once a selection has been made pick out the modal & module information and pass it along
 *
 * @method registerEventHandlers
 * @param {Map} modalMap The map of modals ready to pick from when a user clicks 'Add activity'
 * @param {Map} modulesMap The map of K: sectionID V: [modules] we need to pass along so we can fetch a specific modules data
 */
const registerEventHandlers = (modalMap, modulesMap) => {
    const events = [
        'click',
        CustomEvents.events.activate,
        CustomEvents.events.keyboardActivate
    ];

    CustomEvents.define(document, events);

    // Display module chooser event listeners.
    events.forEach((event) => {
        document.addEventListener(event, (e) => {
            if (e.target.closest(selectors.elements.sectionmodchooser)) {
                const caller = e.target.closest(selectors.elements.sectionmodchooser);
                const sectionid = caller.dataset.sectionid;
                const modal = modalMap.get(sectionid);
                ChooserDialogue.displayChooser(caller, modal, modulesMap.get(sectionid));
            }
        });
    });
};

/**
 * We run this last in the file as this will now allow users to select a section to add a module to
 * The assumption is that everything is set up and ready to go
 *
 * @method enableInteraction
 * @param {Array} sections The sections we need to find buttons in so we can enable the button
 */
const enableInteraction = (sections) => {
    Array.from(sections).map((section) => {
        const button = section.querySelector(`${selectors.elements.sectionmodchooser}`);
        button.disabled = false;
    });
};
