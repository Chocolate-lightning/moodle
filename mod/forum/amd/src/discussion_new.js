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
 * Module for viewing a discussion.
 *
 * @module     mod_forum/discussion_new
 * @package    mod_forum
 * @copyright  2019 Ryan Wyllie <ryan@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(
[
    'jquery',
    'core/auto_rows',
    'core/custom_interaction_events',
    'mod_forum/selectors',
    'mod_forum/discussion',
    'mod_forum/posts_list',
    'mod_forum/lock_toggle',
    'mod_forum/favourite_toggle',
    'mod_forum/pin_toggle'
],
function(
    $,
    AutoRows,
    CustomEvents,
    Selectors,
    Discussion,
    PostsList,
    LockToggle,
    FavouriteToggle,
    Pin
) {

    var registerEventListeners = function(root) {
        var replyFormContainer = root.find('[data-region="inline-reply-content"]');

        AutoRows.init(root);

        var cancelReply = function(postContainer, postReplyFormContainer, replyButton, replyVisibilityToggleContainer) {
            postReplyFormContainer.addClass('hidden');
            postReplyFormContainer.empty();
            replyButton.attr('data-active', false);

            if (replyVisibilityToggleContainer.length) {
                var repliesContainer = postContainer.children('[data-region="replies-container"]');

                replyVisibilityToggleContainer.addClass('hidden');
                repliesContainer.removeClass('hidden');
            }
        }

        /*
        root.on('click', '[data-action="reply"]', function(e) {
            e.preventDefault();

            var replyButton = $(e.target);
            var active = replyButton.attr('data-active') == 'true';
            var postContainer = replyButton.closest('[data-region="post"]');
            var postReplyFormContainer = postContainer.children('[data-region="in-line-reply-container"]');
            var replyVisibilityToggleContainer = postContainer.children('[data-region="reply-visibility-toggle-container"]');

            if (active) {
                cancelReply(postContainer, postReplyFormContainer, replyButton, replyVisibilityToggleContainer);
            } else {
                var postAuthorName = postContainer.children('[data-content="forum-post"]').find('[data-region="author-name"]').text();
                var postRepliesContainer = postContainer.children('[data-region="replies-container"]');
                var replyForm = replyFormContainer.children().first().clone();
                replyForm.find('textarea').attr('placeholder', 'Replying to ' + postAuthorName + '...');
                replyForm.appendTo(postReplyFormContainer);
                postReplyFormContainer.removeClass('hidden');
                replyButton.attr('data-active', true);
                replyForm.find('textarea').focus();

                if (replyVisibilityToggleContainer.length) {
                    var showButton = replyVisibilityToggleContainer.find('[data-action="show-replies"]');
                    var hideButton = replyVisibilityToggleContainer.find('[data-action="hide-replies"]');
                    var repliesContainer = postContainer.children('[data-region="replies-container"]');

                    if (repliesContainer.children().length) {
                        showButton.removeClass('hidden');
                        hideButton.addClass('hidden');
                        replyVisibilityToggleContainer.removeClass('hidden');
                        repliesContainer.addClass('hidden');
                    }
                }
            }
        });
        */

        root.on('click', '[data-cancel-reply]', function(e) {
            e.preventDefault();

            var cancelButton = $(e.target);
            var postContainer = cancelButton.closest('[data-region="post"]');
            var postReplyFormContainer = postContainer.children('[data-region="in-line-reply-container"]');
            var replyVisibilityToggleContainer = postContainer.children('[data-region="reply-visibility-toggle-container"]');
            var replyButton = postContainer.children('[data-content="forum-post"]').find('[data-action="reply"]');

            cancelReply(postContainer, postReplyFormContainer, replyButton, replyVisibilityToggleContainer);
        });

        root.on('click', '[data-action="show-replies"]', function(e) {
            var showButton = $(e.target).closest('[data-action="show-replies"]');
            var buttonContainer = showButton.parent();
            var hideButton = buttonContainer.find('[data-action="hide-replies"]');
            var postContainer = buttonContainer.closest('[data-region="post"]');
            var repliesContainer = postContainer.children('[data-region="replies-container"]');

            repliesContainer.removeClass('hidden');
            hideButton.removeClass('hidden');
            showButton.addClass('hidden');
        });

        root.on('click', '[data-action="hide-replies"]', function(e) {
            var hideButton = $(e.target).closest('[data-action="hide-replies"]');
            var buttonContainer = hideButton.parent();
            var showButton = buttonContainer.find('[data-action="show-replies"]');
            var postContainer = buttonContainer.closest('[data-region="post"]');
            var repliesContainer = postContainer.children('[data-region="replies-container"]');

            repliesContainer.addClass('hidden');
            showButton.removeClass('hidden');
            hideButton.addClass('hidden');
        });
    };

    return {
        init: function(root) {
            registerEventListeners(root);
            Discussion.init(root);
            PostsList.init(root);

            var discussionToolsContainer = $('[data-container="discussion-tools"]');
            LockToggle.init(discussionToolsContainer);
            FavouriteToggle.init(discussionToolsContainer);
            Pin.init(discussionToolsContainer);
        }
    };
});
