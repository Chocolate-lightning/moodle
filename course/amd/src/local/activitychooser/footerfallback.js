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

import $ from 'jquery';
import selectors from 'core_course/local/activitychooser/selectors';

/**
 * Create the custom listener that would handle anything in the footer.
 *
 * @param {Event} e The event being triggered.
 * @param {Object} footerData The data generated from the exporter.
 * @param {Object} modal The chooser modal.
 */
export const footerClickListener = function(e, footerData, modal) {
    // From the help screen go back to the module overview.
    if (e.target.closest(selectors.actions.closeOption)) {
        const carousel = $(modal.getBody()[0].querySelector(selectors.regions.carousel));
        modal.setFooter(footerData.customfootertemplate);
        // Trigger the transition between 'pages'.
        carousel.carousel('prev');
        carousel.on('slid.bs.carousel', () => {
            const allModules = modal.getBody()[0].querySelector(selectors.regions.modules);
            const caller = allModules.querySelector(selectors.regions.getModuleSelector(e.target.dataset.modname));
            caller.focus();
        });
    }
};
