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
        AutoRows.init(root);

        root.on(PostsList.events.IN_PAGE_REPLY_VISIBILITY_CHANGE, Selectors.post.inpageReplyContent, function(e, isVisible) {
            var inpageReplyContent = $(e.target).closest(Selectors.post.inpageReplyContent);
            var postContainer = inpageReplyContent.closest(Selectors.post.post);
            var replyVisibilityToggleContainer = postContainer.children(Selectors.post.replyVisibilityToggleContainer);
            var repliesContainer = postContainer.children(Selectors.post.repliesContainer);
            var hasReplies = repliesContainer.children().length > 0;

            if (replyVisibilityToggleContainer.length && hasReplies) {
                var showButton = replyVisibilityToggleContainer.find(Selectors.post.showReplies);
                var hideButton = replyVisibilityToggleContainer.find(Selectors.post.hideReplies);

                if (isVisible) {
                    repliesContainer.slideUp(200, function() {
                        showButton.removeClass('hidden');
                        hideButton.addClass('hidden');
                        replyVisibilityToggleContainer.removeClass('hidden');
                    });
                } else {
                    replyVisibilityToggleContainer.addClass('hidden');
                    repliesContainer.slideDown(200);
                }
            }
        });

        root.on('click', Selectors.post.showReplies, function(e) {
            var showButton = $(e.target).closest(Selectors.post.showReplies);
            var buttonContainer = showButton.closest(Selectors.post.replyVisibilityToggleContainer);
            var hideButton = buttonContainer.find(Selectors.post.hideReplies);
            var postContainer = buttonContainer.closest(Selectors.post.post);
            var repliesContainer = postContainer.children(Selectors.post.repliesContainer);

            repliesContainer.slideDown(200);
            hideButton.removeClass('hidden');
            showButton.addClass('hidden');
        });

        root.on('click', Selectors.post.hideReplies, function(e) {
            var hideButton = $(e.target).closest(Selectors.post.hideReplies);
            var buttonContainer = hideButton.parent();
            var showButton = buttonContainer.find(Selectors.post.showReplies);
            var postContainer = buttonContainer.closest(Selectors.post.post);
            var repliesContainer = postContainer.children(Selectors.post.repliesContainer);

            repliesContainer.slideUp(200);
            showButton.removeClass('hidden');
            hideButton.addClass('hidden');
        });
    };

    return {
        init: function(root, context) {
            registerEventListeners(root);
            Discussion.init(root);
            PostsList.init(
                root,
                {
                    template: 'mod_forum/inpage_reply_new',
                    context: context
                },
                {
                    template: 'mod_forum/forum_discussion_post_new_reply',
                    context: {}
                }
            );

            var discussionToolsContainer = $('[data-container="discussion-tools"]');
            LockToggle.init(discussionToolsContainer);
            FavouriteToggle.init(discussionToolsContainer);
            Pin.init(discussionToolsContainer);
        }
    };
});
