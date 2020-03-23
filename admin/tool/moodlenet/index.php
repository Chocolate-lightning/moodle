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
 * Landing page for all imports from MoodleNet.
 *
 * This page asks the user to confirm the import process, and takes them to the relevant next step.
 *
 * @package     tool_moodlenet
 * @copyright   2020 Jake Dallimore <jrhdallimore@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

use tool_moodlenet\local\remote_resource;
use tool_moodlenet\local\url;
use tool_moodlenet\local\import_backup_helper;

require_once(__DIR__ . '/../../../config.php');
require_once($CFG->dirroot .'/course/lib.php');

$resourceurl = required_param('resourceurl', PARAM_RAW);
$resourceurl = urldecode($resourceurl);
$course = optional_param('course', null, PARAM_INT);
$section = optional_param('section', null, PARAM_INT);
$cancel = optional_param('cancel', null, PARAM_TEXT);
$continue = optional_param('continue', null, PARAM_TEXT);

require_login($course, false);
if ($course) {
    require_capability('moodle/course:manageactivities', context_course::instance($course));
}

// Handle the form submits.
// This page POSTs to self to verify the sesskey for the confirm action.
// The next page will either be:
// - 1. The restore process for a course or module, if the file is an mbz file.
// - 2. The 'select a course' tool page, if course and section are not provided.
// - 3. The 'select what to do with the content' tool page, provided course and section are present.
// - 4. The dashboard, if the user decides to cancel and course or section is not found.
// - 5. The course home, if the user decides to cancel but the course and section are found.
if ($cancel) {
    $url = !empty($course) ? new \moodle_url('/course/view.php', ['id' => $course]) : new \moodle_url('/');
    redirect($url);
} else if ($continue) {
    confirm_sesskey();

    $remoteresource = new remote_resource(new curl(), new url($resourceurl));
    $extension = $remoteresource->get_extension();

    // Handle backups.
    if (strtolower($extension) == 'mbz') {
        if (empty($course)) {
            // Find a course that the user has permission to upload a backup file.
            // This is likely to be very slow on larger sites.
            $context = import_backup_helper::get_context_for_user($USER->id);

            if (is_null($context)) {
                print_error('nopermissions', 'error', '', get_string('restore:uploadfile', 'core_role'));
            }
        } else {
            $context = context_course::instance($course);
        }

        $importbackuphelper = new import_backup_helper($remoteresource, $USER, $context);
        $storedfile = $importbackuphelper->get_stored_file();

        $url = new \moodle_url('/backup/restorefile.php', [
            'component' => $storedfile->get_component(),
            'filearea' => $storedfile->get_filearea(),
            'itemid' => $storedfile->get_itemid(),
            'filepath' => $storedfile->get_filepath(),
            'filename' => $storedfile->get_filename(),
            'filecontextid' => $storedfile->get_contextid(),
            'contextid' => $context->id,
            'action' => 'choosebackupfile'
        ]);
        redirect($url);
    }

    // Handle adding files to a course.
    // Course and section data present and confirmed. Redirect to the option select view.
    if (!is_null($course) && !is_null($section)) {
        redirect(new \moodle_url('/admin/tool/moodlenet/options.php', [
            'resourceurl' => urlencode($resourceurl),
            'course' => $course,
            'section' => $section,
        ]));
    }
    if (is_null($course)) {
        redirect(new \moodle_url('/admin/tool/moodlenet/select.php', [
            'resourceurl' => urlencode($resourceurl),
        ]));
    }
    // TODO: Extend conditional to handle cases where course needs to be selected or when the file is an mbz.
}

$remoteresource = new remote_resource(new curl(), new url($resourceurl));
$extension = $remoteresource->get_extension();

// Display the page.
$PAGE->set_context(context_system::instance());
$PAGE->set_pagelayout('base');
$PAGE->set_title(get_string('addingaresource', 'tool_moodlenet'));
$PAGE->set_heading(get_string('addingaresource', 'tool_moodlenet'));
$url = new moodle_url('/admin/tool/moodlenet/index.php');
$PAGE->set_url($url);
$renderer = $PAGE->get_renderer('core');

echo $OUTPUT->header();

// Relevant confirmation form.
$context = $context = [
    'resourceurl' => $resourceurl,
    'resourcename' => $remoteresource->get_name() . '.' . $remoteresource->get_extension(),
    'sesskey' => sesskey()
];
if (!is_null($course) && !is_null($section)) {
    $course = get_course($course);
    $context = array_merge($context, [
        'course' => $course->id,
        'coursename' => $course->shortname,
        'section' => $section
    ]);
}
echo $renderer->render_from_template('tool_moodlenet/import_confirmation', $context);

echo $OUTPUT->footer();
