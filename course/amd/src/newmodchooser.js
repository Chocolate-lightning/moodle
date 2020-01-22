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
 * @since      3.9
 */

//import * as ChooserDialogue from 'core_course/chooser_dialogue';
//import CustomEvents from 'core/custom_interaction_events';
import * as Repository from 'core_course/local/chooser/repository';
import selectors from 'core_course/local/chooser/selectors';
import * as Templates from 'core/templates';
import * as ModalFactory from 'core/modal_factory';
import {get_string as getString} from 'core/str';

export const init = async(courseid) => {

    // Fetch all the modules available for a given course.
    const webserviceData = await fetchModules(courseid);

    const sectionIds = fetchSectionIds();

    const builtModuleData = await sectionIdMapper(webserviceData, sectionIds);

    const modalMap = await modalMapper(builtModuleData);

    // User interaction handlers.
    registerEventHandlers(modalMap);

    enableInteraction();
};

const fetchModules = async(courseid) => {
    const [
        data
    ] = await Promise.all([
        Repository.activityModules(courseid)
    ]);
    return data;
};

const fetchSectionIds = () => {
    const sections = document.querySelectorAll(`${selectors.elements.section}[role="region"]`);
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

const buildBaseModal = async() => {
    const [
        modal,
    ] = await Promise.all([
        ModalFactory.create({
            type: ModalFactory.types.DEFAULT,
            title: await getString('addresourceoractivity'),
            large: true
        })
    ]);
    return modal;
};

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

const modalMapper = async(builtModuleData) => {
    const modalMap = new Map();
    const iter = builtModuleData.entries();
    // We need to use a iterator structure as it is a blocking structure.
    let result = iter.next();
    while (!result.done) {
        let key = result.value[0];
        let value = result.value[1];

        // This may be stuck here :/
        const modal = await buildBaseModal();

        // Run a call off to a new func for filtering favs & recommended.
        const templateData = templateDataBuilder(value);
        const body = await Templates.render('core_course/chooser', templateData);
        await modal.setBody(body);
        modalMap.set(key, modal);

        result = iter.next();
    }

    return modalMap;
};

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

const registerEventHandlers = (modalMap) => {
    /*const events = [
        'click',
        CustomEvents.events.activate,
        CustomEvents.events.keyboardActivate
    ];

    CustomEvents.define(document, events);

    // Display module chooser event listeners.
    events.forEach((event) => {
        document.addEventListener(event, async(e) => {
            window.console.log(e.currentTarget);
            if (e.currentTarget.matches(selectors.elements.sectionmodchooser)) {
                window.console.log(e);
                window.console.log(modalMap);
                const caller = document.querySelector(`#${e.currentTarget.id}`);
                //const sectionid = caller.dataset.sectionid;
                window.console.log(caller);
                //ChooserDialogue.displayChooser(e, builtModuleInfo);
            }
        });
    });*/
    document.addEventListener('click', (e) => {
        if (e.target.matches(selectors.elements.sectionmodchooser)) {
            window.console.log(e);
            window.console.log(modalMap);
            const caller = document.querySelector(`#${e.target.id}`);
            const sectionid = caller.dataset.sectionid;
            window.console.log(sectionid);
            const temp = modalMap.get(sectionid);
            temp.show();
        } else {
            window.console.log("e");
            window.console.log(e);
        }
    });
};

const enableInteraction = () => {
    const sections = document.querySelectorAll(`${selectors.elements.section}[role="region"]`);
    Array.from(sections).map((section) => {
        const button = section.querySelector(`${selectors.elements.sectionmodchooser}`);
        button.disabled = false;
    });
};
