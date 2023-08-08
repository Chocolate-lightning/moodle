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
 * Allow admins to purge 'orphaned' conversions that were made when the feedback type was not enabled for the assignment.
 *
 * Inspired by the example CLI script provided on MDL-71909 written by Leon Stringer.
 *
 * @package   assignfeedback_editpdf
 * @copyright 2023 Mathew May <mathew.solutions>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('CLI_SCRIPT', true);

use \assignfeedback_editpdf\document_services;

global $CFG, $DB;

require(__DIR__ . '/../../../../../config.php');
require_once("{$CFG->libdir}/clilib.php");
require_once("../../../locallib.php");

// Now get cli options.
list($options, $unrecognized) = cli_get_params(
    [
        'help' => false,
        'courseid' => 0,
    ],
    [
        'h' => 'help',
        'c' => 'courseid',
    ]
);

if ($unrecognized) {
    $unrecognized = implode("\n  ", $unrecognized);
    cli_error(get_string('cliunknowoption', 'admin', $unrecognized));
}

if ($options['help']) {
    $help =
        "Delete converted submissions that were made when the plugin was disabled.

Options:
-h, --help                  Print out this help
-c, --courseid              Course identifier (id) in which we look for assign activities and editpdf conversions. If not specified
                            we check every single assign activity.
Example:
\$ sudo -u www-data /usr/bin/php mod/feedback/editpdf/cli/delete_disabled_conversions.php -c=123
";

    echo $help;
    die;
}

$fs = get_file_storage();
$assignset = [];

// Get all assign activities in the course.
if (!empty($options['courseid'])) {
    $courseid = $options['courseid'];
    $assigncms = get_fast_modinfo($courseid)->get_instances_of('assign');
    $assignset = array_values($assigncms);
} else {
    // Get all courses with assign activities.
    $courses = core_course_category::search_courses(['modulelist' => 'assign']);
    foreach ($courses as $course) {
        // Get all assign activities in the course.
        $assigncms = get_fast_modinfo($course->id)->get_instances_of('assign');
        $assignset = array_merge($assignset, array_values($assigncms));
    }
}

// Loop through all assign activities.
foreach ($assignset as $assigncm) {
    $assign = new \assign($assigncm->context, null, null);
    $editpdfins = $assign->get_feedback_plugin_by_type('editpdf');

    // The editpdf is disabled for this assign instance. Check for files to remove.
    if (!$editpdfins->is_visible() || !$editpdfins->is_enabled()) {
        $fileareas = $editpdfins->get_file_areas();
        foreach ($fileareas as $filearea => $notused) {
            // Delete pdf files.
            $fs->delete_area_files($assigncm->context->id, document_services::COMPONENT, $filearea);
        }
        cli_writeln("Assignment with id: {$assigncm->id} has had editpdf files removed if they existed.");
    } else {
        cli_writeln("Assignment with id: {$assigncm->id} has editpdf enabled. No files removed.");
    }
}

cli_writeln("Execution complete.");
