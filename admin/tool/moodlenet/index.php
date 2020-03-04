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
 * Index page.
 *
 * @package     tool_moodlenet
 * @copyright   2020 Jake Dallimore <jrhdallimore@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(__DIR__ . '/../../../config.php');
require_once($CFG->dirroot .'/course/lib.php');

$resourceurl = required_param('resourceurl', PARAM_RAW);
$resourceurl = urldecode($resourceurl);
$course = optional_param('course', null, PARAM_INT);
$section = optional_param('section', null, PARAM_INT);

// TODO: Might be a course context if we have that param in the URL, so check/set these two accordingly.
require_login();
$PAGE->set_context(context_system::instance());

// Page setup.
$PAGE->set_pagelayout('standard');
$PAGE->set_title("Some import handler page thingy");
$PAGE->set_heading("Dummy index page");
$url = new moodle_url('/admin/tool/moodlenet/index.php');
$PAGE->set_url($url);

// Dummy page.
echo $OUTPUT->header();
\core\notification::info("
Resource: " . $resourceurl . "
<br> Course: $course
<br> Section $section");
echo $OUTPUT->footer();
