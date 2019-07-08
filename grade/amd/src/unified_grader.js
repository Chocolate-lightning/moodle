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
 * Javascript to handle changing users via the user selector in the header.
 *
 * @module     core_grades/unified_grader
 * @package    core_grades
 * @copyright  2019 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery'],
    function($) {

        /**
         * UnifiedGrading class.
         *
         * @class UnifiedGrading
         * @param {String} selector
         */
        var UnifiedGrading = function(selector) {
            this._regionSelector = selector;
            this._region = $(selector);

            //var userid = $('[data-region="unified-grader"]').data('first-userid');

            $(".user-nav-toggle").click(function(){
                $(".grader-user-navigation").toggle();
            });

            $(".module-content-toggle").click(function(){
                $(".grader-module-content").toggle();
            });

            $(".grading-panel-toggle").click(function(){
                $(".grader-grading-panel").toggle();
            });

            $(".grading-actions-toggle").click(function(){
                $(".grader-grading-actions").toggle();
            });
        };


        return UnifiedGrading;
    });
