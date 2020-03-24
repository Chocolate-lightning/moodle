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
 * This file is a mishmash of JS functions we need for both the standalone (M3.7, M3.8)
 * plugin & Moodle 3.9 functions. The 3.9 Functions have a base understanding that certain
 * things exist i.e. directory structures for templates. When this feature goes 3.9+ only
 * The goal is that we can quickly gut all AMD modules into bare JS files and use ES6 guidelines.
 * Till then this will have to do.
 *
 * @module     tool_moodlenet/instance_form
 * @package    tool_moodlenet
 * @copyright  2020 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define(['tool_moodlenet/validator',
        'tool_moodlenet/selectors',
        'core/loadingicon',
        'core/templates',
        'core/notification',
        'jquery'],
    function(Validator,
             Selectors,
             LoadingIcon,
             Templates,
             Notification,
             $) {
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
            } // Our fake submit button / browse button.

            if (e.target.matches(Selectors.action.submit)) {
                var input = page.querySelector('[data-var="mnet-link"]');
                var overlay = page.querySelector(Selectors.region.spinner);
                overlay.classList.remove('d-none');
                var spinner = LoadingIcon.addIconToContainerWithPromise(overlay);
                Validator.validation(input)
                    .then(function (result) {
                        spinner.resolve();
                        overlay.classList.add('d-none');

                        if (result.result) {
                            input.classList.remove('is-invalid'); // Just in case the class has been applied already.

                            input.classList.add('is-valid');
                            setTimeout(function() {
                                window.location = result.domain;
                            }, 1000);
                        } else {
                            // Pass a tool tip or something?
                            input.classList.add('is-invalid');
                        }
                })
                    .catch();
            }
        });
    };

    var initChooser = function(data) {
        return data;
    };

    var chooserNavigateToMnet = function(showMoodleNet, footerData, carousel, modal) {
        showMoodleNet.innerHTML = '';

        // Add a spinner.
        var spinnerPromise = LoadingIcon.addIconToContainer(showMoodleNet);

        // Used later...
        var transitionPromiseResolver = null;
        var transitionPromise = new Promise(resolve => {
            transitionPromiseResolver = resolve;
        });

        $.when(
            Templates.render('tool_moodlenet/chooser_moodlenet', footerData),
            spinnerPromise,
            transitionPromise
        ).then(function([html, js]) {
                Templates.replaceNodeContents(showMoodleNet, html, js);
        }).catch(Notification.exception);

        // Move to the next slide, and resolve the transition promise when it's done.
        carousel.one('slid.bs.carousel', () => {
            transitionPromiseResolver();
        });
        // Trigger the transition between 'pages'.
        carousel.carousel(2);
        // eslint-disable-next-line max-len
        modal.setFooter(Templates.render('tool_moodlenet/chooser_footer_close_mnet', {}));
    };

    var chooserNavigateFromMnet = function(carousel, modal, footerData) {
        // Trigger the transition between 'pages'.
        carousel.carousel(0);
        // Safe to assume we have this template as of the new chooser work where this is activated from
        // we have directory structures available to us.
        modal.setFooter(Templates.render('core_course/local/activitychooser/footer', footerData));
    };

    var chooserFooterLogic = function(data, courseId, caller) {
        if (data.enabled === true) {
            data.courseID = courseId;
            data.sectionID = caller;
            if (data.installed === true) {
                // Assumption multiple mnet instances or is the URL meant to be appended to something?
                // They have added a account to their profile show then a direct link.
                if (data.advanced !== false) {
                    var userInput = data.advanced.split("@");
                    data.test = userInput[2];
                    data.user = userInput[1];
                }
                // On click show the carousel item / render it then show.
            }
            // Plugin has been removed or disabled but promo is still shown.
        }
        return data;
        // Final catch where the Admin want no references.
    };

    return {
        init: init,
        initChooser: initChooser,
        chooserNavigateToMnet: chooserNavigateToMnet,
        chooserNavigateFromMnet: chooserNavigateFromMnet,
        chooserFooterLogic: chooserFooterLogic,
    };
});
