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
 * Showcase page for Moodle Design System (MDS) components.
 *
 * Only available on sites with developer debugging enabled, which includes Behat sites.
 *
 * @package   core
 * @copyright 2026 Mathew May <mathew.solutions>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(__DIR__ . '/../../../../config.php');

global $CFG, $OUTPUT, $PAGE;

$PAGE->set_url('/lib/tests/behat/fixtures/design_system_showcase.php');
$PAGE->set_context(\core\context\system::instance());
$PAGE->set_title(get_string('pagetitle', 'core_designsystemshowcase'));
$PAGE->set_heading(get_string('pagetitle', 'core_designsystemshowcase'));

require_admin();

if (!$CFG->debugdeveloper) {
    throw new \core\exception\moodle_exception('notavailable');
}

$stringmanager = get_string_manager();

// The strings of the page. Generic words are borrowed from existing strings rather than defined again, and some are
// close matches rather than the same text, such as "Email address" for "Email". The keys are the ones the page uses.
$sharedstrings = [
    'badge_complete' => ['complete', 'core'],
    'breadcrumb' => ['breadcrumb', 'access'],
    'breadcrumb_home' => ['home', 'core'],
    'breadcrumb_showmore' => ['showmore', 'core'],
    'checkbox_notifications' => ['registrationemail', 'core'],
    'choicebox_group' => ['group', 'core'],
    'default' => ['default', 'core'],
    'disabled' => ['disabled', 'admin'],
    'dropdown_actions' => ['actions', 'core'],
    'dropdown_columns' => ['profilefieldcolumns', 'admin'],
    'dropdown_coursename' => ['coursename', 'grades'],
    'dropdown_delete' => ['delete', 'core'],
    'dropdown_duplicate' => ['duplicate', 'core'],
    'dropdown_editsettings' => ['editsettings', 'core'],
    'dropdown_email' => ['email', 'core'],
    'dropdown_export' => ['export', 'calendar'],
    'dropdown_filter' => ['filter', 'core'],
    'dropdown_lastaccess' => ['lastaccess', 'core'],
    'dropdown_lastmodified' => ['lastmodified', 'core'],
    'dropdown_moreactions' => ['moreactions', 'core'],
    'dropdown_name' => ['name', 'core'],
    'dropdown_progress' => ['progress', 'core'],
    'dropdown_sortby' => ['sortby', 'core'],
    'formsubmission_advanced' => ['advanced', 'core'],
    'formsubmission_nothing' => ['nothingtodisplay', 'core'],
    'link_back' => ['back', 'core'],
    'radio_email' => ['email', 'core'],
    'radio_no' => ['no', 'core'],
    'radio_phone' => ['phone', 'core'],
    'radio_sms' => ['sms', 'sms'],
    'radio_yes' => ['yes', 'core'],
    'selected' => ['selected', 'form'],
    'settings' => ['settings', 'core'],
    'submit' => ['submit', 'core'],
    'switch_lock' => ['lock', 'grades'],
    'switch_visibility' => ['visibilityshort', 'group'],
];

// Parameters are filled in by the page, so the same string can be used with different values.
$strings = $stringmanager->load_component_strings('core_designsystemshowcase', current_language());
foreach ($sharedstrings as $alias => [$identifier, $component]) {
    $strings[$alias] = $stringmanager->get_string($identifier, $component);
}

echo $OUTPUT->header();

echo $OUTPUT->render_react_component('core/designsystemshowcase/DesignSystemShowcase', (object) [
    'isRtl' => right_to_left(),
    'strings' => $strings,
]);

echo $OUTPUT->footer();
