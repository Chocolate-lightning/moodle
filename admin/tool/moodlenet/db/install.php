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
 * Moodle.net tool installation.
 *
 * @package    tool_moodlenet
 * @copyright  2020 Adrian Greeve <adrian@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Install script for tool_moodlenet
 */
function xmldb_tool_moodlenet_install() {
    global $DB, $CFG;

    // If there is no moodlenet user profile then create a custom profile field to hold that information.
    if (\tool_moodlenet\profile_manager::official_profile_exists()) {
        return;
    }

    // Create the moodlenet user profile category.
    $categoryid = \tool_moodlenet\profile_manager::create_user_profile_category();

    // Add our moodlenet profile field.
    \tool_moodlenet\profile_manager::create_user_profile_text_field($categoryid);

}
