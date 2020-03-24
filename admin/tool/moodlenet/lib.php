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
 * This page lists public api for tool_moodlenet plugin.
 *
 * @package    tool_moodlenet
 * @copyright  2020 Peter Dias
 * @license    http://www.gnu.org/copyleft/gpl.html GNU
 */

defined('MOODLE_INTERNAL') || die;

/**
 * Generate the endpoint url to the user's moodlenet site.
 *
 * @param string $profileurl The user's moodlenet profile page
 * @param int $course The moodle course the mnet resource will be added to
 * @param int $section The section of the course will be added to. Defaults to the 0th element.
 * @return string the resulting endpoint
 * @throws moodle_exception
 */
function generate_mnet_endpoint(string $profileurl, int $course, int $section = 0) {
    global $CFG;
    $urlportions = explode('@', $profileurl);
    $domain = end($urlportions);
    $importurl = new moodle_url('admin/tool/moodlenet/import.php', ['course' => $course, 'section' => $section]);
    $endpoint = new moodle_url('endpoint', ['site' => $CFG->wwwroot, 'path' => $importurl->out(false)]);
    return "$domain/{$endpoint->out(false)}";
}