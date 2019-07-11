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
 *
 * @module     core_grades/unified_grader
 * @package    core_grades
 * @copyright  2019 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery', 'core/ajax', 'core/notification', 'core/templates'],
    function($, ajax, notification, Templates) {

        /**
         * This will do the lifting for the JS hooks that are standardized.
         *
         * @class UnifiedGrading
         */
        var UnifiedGrading = function() {

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

        /**
         * This takes the content given to it by the module specific JS
         * it'll then do a replace on the module content area in the grader.
         *
         * @class UnifiedGradingRenderModuleContent
         */
        var UnifiedGradingRenderModuleContent = function(html, js) {
            Templates.replaceNode($(".grader-module-content-display"), html, js)
                .catch(Notification.exception);
        };

        return {
            UnifiedGrading: UnifiedGrading,
            UnifiedGradingRenderModuleContent : UnifiedGradingRenderModuleContent,
        };
    });
