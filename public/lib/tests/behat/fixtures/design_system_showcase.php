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

// Right-to-left checks need a right-to-left language pack. Prefer Arabic, as the most widely installed one,
// but use any other installed one rather than skipping the checks.
$stringmanager = get_string_manager();
$rtllang = 'ar';
$rtllanginstalled = $stringmanager->translation_exists($rtllang, false);
if (!$rtllanginstalled) {
    foreach (array_keys($stringmanager->get_list_of_translations(true)) as $lang) {
        if ($stringmanager->get_string('thisdirection', 'langconfig', null, $lang) === 'rtl') {
            $rtllang = $lang;
            $rtllanginstalled = true;
            break;
        }
    }
}

$langimporturl = null;
if (\core\component::get_plugin_directory('tool', 'langimport')) {
    $langimporturl = (new \core\url('/admin/tool/langimport/index.php'))->out(false);
}

echo $OUTPUT->header();

echo \core\output\html_writer::div('', '', [
    'data-react-component' => '@moodle/lms/core/DesignSystemShowcase',
    'data-react-props' => json_encode([
        'isRtl' => right_to_left(),
        'rtlLang' => $rtllang,
        'rtlLangInstalled' => $rtllanginstalled,
        'rtlUrl' => (new \core\url($PAGE->url, ['lang' => $rtllang]))->out(false),
        'ltrUrl' => (new \core\url($PAGE->url, ['lang' => 'en']))->out(false),
        'langImportUrl' => $langimporturl,
    ]),
]);

echo $OUTPUT->footer();
