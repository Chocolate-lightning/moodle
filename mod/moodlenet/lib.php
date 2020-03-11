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
 * This file contains a library of functions and constants for the lti module
 *
 * @package    mod_moodlenet
 * @copyright  2020 Peter Dias
 * @author     Peter Dias
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

/**
 * Return aliases of this activity. Just return a single element that redirects to the edit_form.php
 *
 * @param stdClass $defaultitem default item that would be added to the activity chooser if this callback was not present.
 *     It has properties: archetype, name, title, help, icon, link
 * @return array An array of aliases for this activity. Each element is an object with same list of properties as $defaultitem,
 *     plus an additional property, helplink.
 *     Properties title and link are required
 **/
function moodlenet_get_shortcuts(stdClass $defaultitem) {
    global $CFG, $COURSE, $OUTPUT;
    $section = $defaultitem->link->param('sr');
    $courseid = $COURSE->id;

    $type = new stdClass();
    $type->modclass = MOD_CLASS_RESOURCE;
    $type->archetype = MOD_CLASS_RESOURCE;
    $type->name     = 'mod_moodletnet';
    // Clean the name. We don't want tags here.
    $type->title    = get_string('moodlenet', 'moodlenet');
    $trimmeddescription = get_string('moodlenet_desc', 'moodlenet');
    if ($trimmeddescription != '') {
        // Clean the description. We don't want tags here.
        $type->help     = clean_param($trimmeddescription, PARAM_NOTAGS);
        $type->helplink = get_string('moodlenet_shortcut_link', 'moodlenet');
    }
    $type->icon = $OUTPUT->pix_icon('moodlenet', '', 'moodlenet', array('class' => 'icon'));
    $type->link = new moodle_url('/mod/moodlenet/edit.php', array('add' => 'moodlenet', 'return' => 0, 'course' => $courseid,
        'sr' => $section));
    $types[] = $type;
    return $types;
}
