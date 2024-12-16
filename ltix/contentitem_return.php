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
 * Handle the return from the Tool Provider after selecting a content item.
 *
 * @package    core_ltix
 * @copyright  2015 Vital Source Technologies http://vitalsource.com
 * @author     Stephen Vickers
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../config.php');

$id = required_param('id', PARAM_INT);
$contextid = required_param('contextid', PARAM_INT);

$jwt = optional_param('JWT', '', PARAM_RAW);

$context = \context_helper::instance_by_id($contextid);

$pageurl = new moodle_url('/ltix/contentitem_return.php');
$PAGE->set_url($pageurl);
$PAGE->set_pagelayout('popup');
$PAGE->set_context($context);

// Cross-Site causes the cookie to be lost if not POSTed from same site.
global $_POST;
if (!empty($_POST["repost"])) {
    // Unset the param so that LTI 1.1 signature validation passes.
    unset($_POST["repost"]);
} else if (!isloggedin()) {
    header_remove("Set-Cookie");
    $output = $PAGE->get_renderer('core_ltix');
    $page = new \core_ltix\output\repost_crosssite_page($_SERVER['REQUEST_URI'], $_POST);
    echo $output->header();
    echo $output->render($page);
    echo $output->footer();
    return;
}

if (!empty($jwt)) {
    $params = \core_ltix\oauth_helper::convert_from_jwt($id, $jwt);
    $consumerkey = $params['oauth_consumer_key'] ?? '';
    $messagetype = $params['lti_message_type'] ?? '';
    $version = $params['lti_version'] ?? '';
    $items = $params['content_items'] ?? '';
    $errormsg = $params['lti_errormsg'] ?? '';
    $msg = $params['lti_msg'] ?? '';
} else {
    $consumerkey = required_param('oauth_consumer_key', PARAM_RAW);
    $messagetype = required_param('lti_message_type', PARAM_TEXT);
    $version = required_param('lti_version', PARAM_TEXT);
    $items = optional_param('content_items', '', PARAM_RAW);
    $errormsg = optional_param('lti_errormsg', '', PARAM_TEXT);
    $msg = optional_param('lti_msg', '', PARAM_TEXT);
    \core_ltix\oauth_helper::verify_oauth_signature($id, $consumerkey);
}

// Standard checks plus hooking point for placements.
require_sesskey();
$accesshook = new \core_ltix\hook\access_control($context);
\core\di::get(\core\hook\manager::class)->dispatch($accesshook);

$redirecturl = null;
$returndata = null;
if (empty($errormsg) && !empty($items)) {
    try {
        $returndata = \core_ltix\helper::tool_configuration_from_content_item($id, $messagetype, $version, $consumerkey,
            $items);
    } catch (moodle_exception $e) {
        $errormsg = $e->getMessage();
    }
}

echo $OUTPUT->header();

// Call JS module to redirect the user to the course page or close the dialogue on error/cancel.
$PAGE->requires->js_call_amd('core_ltix/contentitem_return', 'init', [$returndata]);

echo $OUTPUT->footer();

// Add messages to notification stack for rendering later.
if ($errormsg) {
    // Content item selection has encountered an error.
    \core\notification::error($errormsg);

} else if (!empty($returndata)) {
    // Means success.
    if (!$msg) {
        $msg = get_string('successfullyfetchedtoolconfigurationfromcontent', 'core_ltix');
    }
    \core\notification::success($msg);
}
