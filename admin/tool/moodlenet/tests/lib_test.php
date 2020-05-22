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
 * Unit tests for tool_moodlenet lib
 *
 * @package    tool_moodlenet
 * @copyright  2020 Peter Dias
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->dirroot . '/admin/tool/moodlenet/lib.php');

/**
 * Test moodlenet functions
 */
class tool_moodlenet_lib_testcase extends advanced_testcase {

    /**
     * Test the generate_mnet_endpoint function
     *
     * @dataProvider get_endpoints_provider
     * @param string $profileurl
     * @param int $course
     * @param int $section
     * @param string $expected
     */
    public function test_generate_mnet_endpoint($profileurl, $course, $section, $expected) {
        $endpoint = generate_mnet_endpoint($profileurl, $course, $section);
        $this->assertEquals($expected, $endpoint);
    }

    /**
     * Test the moodlenet_add_resource_redirect_url function
     */
    public function test_moodlenet_add_resource_redirect_url() {
        $this->resetAfterTest();
        $course = 1;
        $section = 3;
        $user = $this->getDataGenerator()->create_user();
        $this->setUser($user);
        $profilename = "@moodlenetprofile@moodle.net";

        // If no moodlenet profile has been set.
        $expected = new moodle_url("/admin/tool/moodlenet/instance.php?course=$course&section=$section");
        $endpoint = component_callback('tool_moodlenet', 'add_resource_redirect_url', [$course, $section]);
        $this->assertEquals($expected->out(false), $endpoint);

        // If a moodlenet profile has been set.
        $moodlenetprofile = new \tool_moodlenet\moodlenet_user_profile($profilename, $user->id);

        \tool_moodlenet\profile_manager::save_moodlenet_user_profile($moodlenetprofile);
        global $CFG;
        $expected = 'moodle.net/endpoint?site=' . urlencode($CFG->wwwroot)
            . '&path=' . urlencode("admin/tool/moodlenet/import.php?course=$course&section=$section");
        $endpoint = component_callback('tool_moodlenet', 'add_resource_redirect_url', [$course, $section]);
        $this->assertEquals($expected, $endpoint);
    }

    /**
     * Dataprovider for test_generate_mnet_endpoint
     *
     * @return array
     */
    public function get_endpoints_provider() {
        global $CFG;
        return [
            [
                '@name@domain.name',
                1,
                2,
                'https://domain.name/' . MOODLENET_DEFAULT_ENDPOINT . '?site=' . urlencode($CFG->wwwroot)
                    . '&course=1&section=2'
            ],
            [
                'domain.name',
                1,
                2,
                'domain.name/endpoint?site=' . urlencode($CFG->wwwroot)
                    . '&path=' . urlencode('admin/tool/moodlenet/import.php?course=1&section=2')
            ],
            [
                '@profile@name@domain.name',
                1,
                2,
                'https://domain.name/' . MOODLENET_DEFAULT_ENDPOINT . '?site=' . urlencode($CFG->wwwroot)
                    . '&course=1&section=2'
            ],
            [
                'https://domain.name',
                1,
                2,
                'https://domain.name/' . MOODLENET_DEFAULT_ENDPOINT . '?site=' . urlencode($CFG->wwwroot)
                    . '&course=1&section=2'
            ]
        ];
    }
}
