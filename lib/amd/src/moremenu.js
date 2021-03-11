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
 * Moves wrapping navigation items into a more menu.
 *
 * @module     core/moremenu
 * @package    core
 * @copyright  2021 Moodle
 * @author     Bas Brands <bas@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {classUtil} from 'core/utils';

/**
 * Moremenu selectors.
 */
const Selectors = {
    regions: {
        moredropdown: '[data-region="moredropdown"]',
    },
    classes: {
        dropdownitem: 'dropdown-item',
        dropdownmoremenu: 'dropdownmoremenu',
        hidden: 'd-none',
        nav: 'nav',
        navlink: 'nav-link',
        observed: 'observed',
    }
};

/**
 * Simple object of sizes to respond to so we can easily modify as required.
 */
const Sizes = {
    medium: 768
};

/**
 * Auto Collapse navigation items that wrap into a dropdown menu.
 *
 * @param {HTMLElement} menu The navbar container.
 */
const autoCollapse = menu => {

    let navHeight = menu.offsetHeight;
    let maxHeight = menu.parentNode.offsetHeight;

    if (document.body.clientWidth < Sizes.medium) {
        navHeight = maxHeight;
    }

    const dropdownMenu = menu.querySelector(Selectors.regions.moredropdown);
    const dropdown = menu.querySelector('.' + Selectors.classes.dropdownmoremenu);

    if (navHeight >= maxHeight) {

        dropdown.classList.remove(Selectors.classes.hidden);

        if ('children' in menu) {
            const menuNodes = Array.from(menu.children).reverse();
            menuNodes.forEach(item => {
                if (!item.classList.contains(Selectors.classes.dropdownmoremenu)) {
                    if (menu.offsetHeight > maxHeight) {
                        const lastNode = menu.removeChild(item);
                        const navLink = lastNode.querySelector('.' + Selectors.classes.navlink);
                        if (navLink && !navLink.hasAttribute('role')) {
                            // Adding the menuitem role so the dropdown includes the
                            // Accessibility improvements from theme/boost/amd/src/aria.js
                            navLink.setAttribute('role', 'menuitem');
                        }
                        classUtil('replace', navLink, Selectors.classes.navlink, Selectors.classes.dropdownitem);
                        dropdownMenu.prepend(lastNode);
                    }
                }
            });
        }
    } else {

        dropdown.classList.add(Selectors.classes.hidden);

        if ('children' in dropdownMenu) {
            const menuNodes = Array.from(dropdownMenu.children);
            menuNodes.forEach(item => {
                if (document.body.clientWidth < Sizes.medium || menu.offsetHeight < maxHeight) {
                    const lastNode = dropdownMenu.removeChild(item);
                    const navLink = lastNode.querySelector('.' + Selectors.classes.dropdownitem);
                    if (navLink) {
                        const currentAttribute = navLink.getAttribute('role');
                        if (currentAttribute === 'menuitem') {
                            navLink.removeAttribute('role');
                        }
                    }
                    classUtil('replace', navLink, Selectors.classes.dropdownitem, Selectors.classes.navlink);
                    menu.insertBefore(lastNode, dropdown);
                }
            });
        }
        if (document.body.clientWidth > Sizes.medium) {
            navHeight = menu.offsetHeight;
            if (navHeight > maxHeight) {
                autoCollapse(menu);
            }
        }
    }

    // Unsure if the added abstraction here is really useful.
    classUtil('add', menu.parentNode, Selectors.classes.observed);
};

/**
 * Initialise the more menus.
 *
 * @param {HTMLElement} menu The navbar moremenu.
 */
export default menu => {
    autoCollapse(menu);
    window.addEventListener('resize', () => {
        autoCollapse(menu);
    });
};
