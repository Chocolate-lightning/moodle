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
 * Puts the plugin actions into the admin settings tree.
 *
 * @package     tool_moodlenet
 * @copyright   2020 Jake Dallimore <jrhdallimore@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $advancedsettings = $ADMIN->locate('optionalsubsystems');

    $temp = new admin_setting_configcheckbox('tool_moodlenet/enablemoodlenet', get_string('enablemoodlenet', 'tool_moodlenet'),
            new lang_string('enablemoodlenetinfo', 'tool_moodlenet'), 1, 1, 0);
    $advancedsettings->add($temp);

    $temp = new admin_setting_configtext('tool_moodlenet/defaultmoodlenet', get_string('defaultmoodlenet', 'tool_moodlenet'),
        new lang_string('defaultmoodlenetinfo', 'tool_moodlenet'), 'https://team.moodle.net');
    $advancedsettings->add($temp);
}
