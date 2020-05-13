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
 * This is the main endpoint which MoodleNet instances POST to.
 *
 * This converts the POST into a GET for a secured page, so the $wantsurl aspect of auth can be leveraged.
 *
 * Once the POST is converted to a GET request for admin/tool/moodlenet/index.php with relevant params, the user will either:
 * - If not authenticated, they will be asked to login, after which they will see the confirmation page.
 * - If authenticated, they will see the confirmation page.
 *
 * @package     tool_moodlenet
 * @copyright   2020 Jake Dallimore <jrhdallimore@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(__DIR__ . '/../../../config.php');

// The integration must be enabled for this import endpoint to be active.
if (!get_config('tool_moodlenet', 'enablemoodlenet')) {
    print_error('moodlenetnotenabled', 'tool_moodlenet');
}

$course = optional_param('course', null, PARAM_INT);
$section = optional_param('section', null, PARAM_INT);

// The POST data must be present and valid.
if (!empty($_POST)) {
    if (!empty($_POST['resourceurl'])) {
        // Take the params we need, create a local URL, and redirect to it.
        // This allows us to hook into the 'wantsurl' capability of the auth system.
        $resourceurl = validate_param($_POST['resourceurl'], PARAM_URL);
        $resourceurl = urlencode($resourceurl);

        // Build the URL to fetch.
        $url = new moodle_url('/admin/tool/moodlenet/index.php', ['resourceurl' => $resourceurl]);

        if (!is_null($course)) {
            $url->param('course', $course);
        }
        if (!is_null($section)) {
            $url->param('section', $section);
        }

        redirect($url);
    }
}

// Invalid or missing POST data. Show an error to the user.
print_error('missinginvalidpostdata', 'tool_moodlenet');
