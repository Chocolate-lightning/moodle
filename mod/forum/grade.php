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
 * Displays the forum grading page.
 *
 * @package   mod_forum
 * @copyright 2019 Mathew May <mathew.solutions>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');

$cmid = required_param('id', PARAM_INT);
$userid = required_param('userid', PARAM_INT);

list($course, $cm) = get_course_and_cm_from_cmid($cmid);

require_course_login($course, false, $cm);

$PAGE->set_context(context_module::instance($cmid));
$PAGE->set_title(get_string('forumgrader', 'mod_forum'));

$url = new moodle_url('/mod/forum/grade.php', array('id' => $cmid, 'userid' => $userid));

$PAGE->set_url($url);

$PAGE->set_heading($course->fullname);

echo $OUTPUT->header();

$output = $PAGE->get_renderer('core_grades');

$renderable = new \core_grades\output\grade_interface($cmid, $userid);

echo $output->render_grader_interface($renderable, 'mod_forum/forum_grader_wrapper');

echo $OUTPUT->footer();
