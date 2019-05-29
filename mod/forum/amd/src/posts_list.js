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
 * This module is the highest level module for the calendar. It is
 * responsible for initialising all of the components required for
 * the calendar to run. It also coordinates the interaction between
 * components by listening for and responding to different events
 * triggered within the calendar UI.
 *
 * @module     mod_forum/posts_list
 * @package    mod_forum
 * @copyright  2019 Peter Dias
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define([
        'jquery',
        'core/templates',
        'core/notification',
        'mod_forum/selectors',
        'mod_forum/inpage_reply',
    ], function(
        $,
        Templates,
        Notification,
        Selectors,
        InPageReply
    ) {

    var EVENTS = {
        IN_PAGE_REPLY_VISIBILITY_CHANGE: 'mod-forum-in-page-reply-visibility-change'
    };

    var registerEventListeners = function(root, inpageReplyConfig) {
        root.on('click', Selectors.post.inpageReplyLink, function(e) {
            e.preventDefault();
            // After adding a reply a url hash is being generated that scrolls (points) to the newly added reply.
            // The hash being present causes this scrolling behavior to the particular reply to persists even when
            // another, non-related in-page replay link is being clicked which ultimately causes a bad user experience.
            // A particular solution for this problem would be changing the browser's history state when a url hash is
            // present.
            if (window.location.hash) {
                // Remove the fragment identifier from the url.
                var url = window.location.href.split('#')[0];
                history.pushState({}, document.title, url);
            }
            var currentTarget = $(e.currentTarget).parents(Selectors.post.forumCoreContent);
            var currentSubject = currentTarget.find(Selectors.post.forumSubject);
            var currentRoot = $(e.currentTarget).parents(Selectors.post.forumContent);
            var context = {
                postid: $(currentRoot).data('post-id'),
                "reply_url": $(e.currentTarget).attr('href'),
                sesskey: M.cfg.sesskey,
                parentsubject: currentSubject.data('replySubject'),
                canreplyprivately: $(e.currentTarget).data('can-reply-privately'),
                postformat: InPageReply.CONTENT_FORMATS.MOODLE
            };

            var currentTarget = $(e.currentTarget);
            var postContainer = currentTarget.closest(Selectors.post.post);
            var postContainerChildren = postContainer.children().not(Selectors.post.repliesContainer);
            var postContentContainer = postContainerChildren.find(Selectors.post.forumCoreContent);
            var currentSubject = postContentContainer.find(Selectors.post.forumSubject);
            // Is one of the immediate container chilren the inpage reply container?
            var inpageReplyContainer = postContainerChildren.filter(Selectors.post.inpageReplyContainer);
            if (!inpageReplyContainer.length) {
                // If not then find the first instance of it that isn't in the list of replies.
                inpageReplyContainer = postContainerChildren.find(Selectors.post.inpageReplyContainer).first();
            }

            if (!inpageReplyContainer.find(Selectors.post.inpageReplyContent).length) {
                var currentAuthorName = postContentContainer.find(Selectors.post.authorName).text();
                var context = $.extend({
                    postid: postContainer.data('post-id'),
                    "reply_url": currentTarget.attr('href'),
                    sesskey: M.cfg.sesskey,
                    parentsubject: currentSubject.html(),
                    parentauthorname: currentAuthorName,
                    canreplyprivately: currentTarget.data('can-reply-privately'),
                    postformat: InPageReply.CONTENT_FORMATS.MOODLE
                }, inpageReplyConfig.context);

                Templates.render(inpageReplyConfig.template, context)
                    .then(function(html, js) {
                        return Templates.appendNodeContents(inpageReplyContainer, html, js);
                    })
                    .then(function() {
                        var form = inpageReplyContainer.find(Selectors.post.inpageReplyContent);
                        form.attr('aria-hidden', 'false');
                        form.trigger(EVENTS.IN_PAGE_REPLY_VISIBILITY_CHANGE, true);

                        return form.slideToggle(200, function() {
                            form.find('textarea').focus();
                        });
                    })
                    .fail(Notification.exception);
            } else {
                var form = inpageReplyContainer.find(Selectors.post.inpageReplyContent);
                var isVisible = form.attr('aria-hidden') == 'false';

                if (isVisible) {
                    // Going from visible to hidden.
                    form.attr('aria-hidden', 'true');
                    form.trigger(EVENTS.IN_PAGE_REPLY_VISIBILITY_CHANGE, false);
                } else {
                    // Going from hidden to visible.
                    form.attr('aria-hidden', 'false');
                    form.trigger(EVENTS.IN_PAGE_REPLY_VISIBILITY_CHANGE, true);
                }

                form.slideToggle(200, function() {
                    if (!isVisible) {
                        // Going from hidden to visible.
                        form.find('textarea').focus();
                    }
                });
            }
        });
    };

    return {
        init: function(root, inpageReplyConfig, newPostConfig) {
            inpageReplyConfig = inpageReplyConfig ? inpageReplyConfig : {};
            inpageReplyConfig.template = inpageReplyConfig.template ? inpageReplyConfig.template : 'mod_forum/inpage_reply';
            inpageReplyConfig.context = inpageReplyConfig.context ? inpageReplyConfig.context : {};

            registerEventListeners(root, inpageReplyConfig);
            InPageReply.init(root, newPostConfig);
        },
        events: EVENTS
    };
});
