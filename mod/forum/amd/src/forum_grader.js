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
 * @module     mod_forum/forum_grader
 * @package    mod_forum
 * @copyright  2019 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery', 'core/ajax', 'core/notification', 'mod_forum/repository', 'core/templates', 'core_grades/unified_grader'],
    function($, ajax, notification, Repository, Templates, UnifiedGrader) {

        /**
         * UnifiedGrading class.
         *
         * @class ForumGrader
         */
        var ForumGrader = function() {

            var userid = $('[data-region="unified-grader"]').data('first-userid');

            var cmid = $('[data-region="unified-grader"]').data('cmid');

            Repository.getDiscussionByUserID(userid, cmid)
                .then(function(context) {
                    return Templates.render('mod_forum/forum_discussion_posts', context);
                })
                .then(function(html, js) {
                    // When this whole chain is moved to plugin then we will call the unified grader here passing html & js
                    UnifiedGrader.UnifiedGrading();
                    return UnifiedGrader.UnifiedGradingRenderModuleContent(html, js);
                })
                .catch(Notification.exception);
        };

        return ForumGrader;
    });
