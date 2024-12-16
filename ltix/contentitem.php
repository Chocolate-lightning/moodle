<?php
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
 * Handle sending a user to a tool provider to initiate a content-item selection.
 *
 * @package    core_ltix
 * @copyright  2024 Mihail Geshoski <mihail@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../config.php');
require_once($CFG->dirroot . '/mod/lti/lib.php');
require_once($CFG->dirroot . '/mod/lti/locallib.php');

$id = required_param('id', PARAM_INT);
$contextid = required_param('contextid', PARAM_INT);
$title = optional_param('title', '', PARAM_TEXT);
$text = optional_param('text', '', PARAM_RAW);

$context = \context_helper::instance_by_id($contextid);

// TODO: Expand the expected context beyond just course.
// Currently, the expected context is always course due to the lack flexibility of the methods that are used for constructing
// the login or the content item selection request. This should be improved once these calls are replaced by the builder API.

$config = \core_ltix\helper::get_type_type_config($id);
if ($config->lti_ltiversion === LTI_VERSION_1P3) {
    if (!isset($SESSION->lti_initiatelogin_status)) {
        echo \core_ltix\helper::initiate_login($context->get_course_context()->instanceid, 0, null, $config,
            'ContentItemSelectionRequest', $title, $text);
        exit;
    } else {
        unset($SESSION->lti_initiatelogin_status);
    }
}

$course = $DB->get_record('course', ['id' => $context->get_course_context()->instanceid], '*', MUST_EXIST);

// Standard checks plus hooking point for placements.
$accesshook = new \core_ltix\hook\access_control($context);
\core\di::get(\core\hook\manager::class)->dispatch($accesshook);

// Set the return URL. We send the launch container along to help us avoid frames-within-frames when the user returns.
$returnurlparams = [
    'contextid' => $course->get_context()->id,
    'id' => $id,
    'sesskey' => sesskey()
];
$returnurl = new \moodle_url('/ltix/contentitem_return.php', $returnurlparams);

// Prepare the request.
$request = \core_ltix\helper::build_content_item_selection_request($id, $course, $returnurl, $title, $text, [], []);

// Get the launch HTML.
$content = \core_ltix\helper::post_launch_html($request->params, $request->url, false);

echo $content;
