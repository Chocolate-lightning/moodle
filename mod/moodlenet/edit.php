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
 * MoodleNet edit page
 *
 * @package    mod_moodlenet
 * @copyright  2020 Peter Dias
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
require_once('../../config.php');
require_once('lib.php');

$course = required_param('course', PARAM_INT);            // Course ID.
$section   = required_param('section', PARAM_INT);     // Section Id.

if (!$course = get_course($course)) {
    print_error('coursemisconf');
}

require_login($course, false);

$tool = core_plugin_manager::instance()->get_plugin_info('tool_moodlenet');

if ($tool) {
    $action = component_callback('tool_moodlenet', 'add_resource_redirect_url', [$course->id, $section], null);
} else {
    // This shouldn't happen because of the dependency in version.php.
    print_error('toolmoodlenetrequired', 'mod_moodlenet', '');
}

redirect($action);
