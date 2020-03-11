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

define(['tool_moodlenet/validator', 'tool_moodlenet/selectors', 'core/loadingicon'],
    function(Validator, Selectors, LoadingIcon) {
    /**
     * Set up the form.
     *
     * @method init
     * @param {String} defaulturl Our base case / Moodle's own MoodleNet instance.
     */
    var init = function init(defaulturl) {
        var page = document.querySelector(Selectors.region.instancePage);
        registerListenerEvents(page, defaulturl);
    };

    /**
     * Add the event listeners to our form.
     *
     * @method registerListenerEvents
     * @param {HTMLElement} page The whole page element for our form area
     * @param {String} defaulturl Our base case / Moodle's own MoodleNet instance.
     */
    var registerListenerEvents = function registerListenerEvents(page, defaulturl) {
        page.addEventListener('click', function(e) {
            // Browse without an account.
            if (e.target.matches(Selectors.action.browse)) {
                window.location = defaulturl;
            }

            // Our fake submit button / browse button.
            if (e.target.matches(Selectors.action.submit)) {
                var input = page.querySelector('[data-var="mnet-link"]');
                var overlay = page.querySelector(Selectors.region.spinner);
                var validationArea = document.querySelector(Selectors.region.validationArea);

                overlay.classList.remove('d-none');
                var spinner = LoadingIcon.addIconToContainerWithPromise(overlay);
                Validator.validation(input)
                    .then(function(result) {
                        spinner.resolve();
                        overlay.classList.add('d-none');
                        if (result.result) {
                            input.classList.remove('is-invalid'); // Just in case the class has been applied already.
                            input.classList.add('is-valid');
                            validationArea.innerText = result.message;
                            validationArea.classList.remove('text-error');
                            validationArea.classList.add('text-success');
                            // Give the user some time to see their input is valid.
                            setTimeout(function() {
                                window.location = result.domain;
                            }, 1000);
                        } else {
                            input.classList.add('is-invalid');
                            validationArea.innerText = result.message;
                            validationArea.classList.add('text-error');
                        }
                }).catch();
            }
        });
    };

    return {
        init: init,
    };
});
