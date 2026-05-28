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
 * Demo for the Design System.
 *
 * @package   core
 * @copyright Andrew Nicols <andrew@nicols.co.uk>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('./config.php');

$PAGE->set_url('/ds.php');
$PAGE->set_context(\core\context\system::instance());
$PAGE->set_title('Design System Demo');
$PAGE->requires->css('/lib/designsystemcss.php');
echo $OUTPUT->header();

echo html_writer::div('', '', [
    'id' => 'design-system-demo',
    'data-react-component' => '@moodle/lms/core/DesignDemo',
]);

echo $OUTPUT->footer();
