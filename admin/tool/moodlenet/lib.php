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

/**
 * A convenience function to either get the user's mnet profile OR the url to the page that would set that.
 *
 * @param int $course The course that we want to add the moodlenet resource
 * @param int $section The section that we want to add the moodlenet resource. Defaults to 0 for other than Topic format
 * @return string A URL pointing to the next step in the process. If a moodlenet profile has been set then we use it
 *                  else we return a URL pointing to the page where they can set this up.
 * @throws moodle_exception
 */
function tool_moodlenet_add_resource_redirect_url(int $course, int $section = 0): string {
    global $USER;
    $profile = \tool_moodlenet\profile_manager::get_moodlenet_user_profile($USER->id);
    if ($profile) {
        return generate_mnet_endpoint($profile->get_domain(), $course, $section);
    } else {
        $url = new moodle_url('/admin/tool/moodlenet/instance.php');
        return $url->out(false);
    }
}