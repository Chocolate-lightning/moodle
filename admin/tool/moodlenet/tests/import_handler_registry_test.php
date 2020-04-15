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
 * Unit tests for the import_handler_registry class.
 *
 * @package    tool_moodlenet
 * @category   test
 * @copyright  2020 Jake Dallimore <jrhdallimore@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace tool_moodlenet\local\tests;

use tool_moodlenet\local\import_handler_registry;
use tool_moodlenet\local\import_handler_info;

defined('MOODLE_INTERNAL') || die();

/**
 * Class tool_moodlenet_import_handler_registry_testcase, providing test cases for the import_handler_registry class.
 */
class tool_moodlenet_import_handler_registry_testcase extends \advanced_testcase {

    /**
     * Test confirming that the extension IS case sensitive and that different results are returned depending on case.
     */
    public function test_get_file_handlers_for_extension_case_sensitivity() {
        $this->resetAfterTest();

        $course = $this->getDataGenerator()->create_course();
        $teacher = $this->getDataGenerator()->create_and_enrol($course, 'editingteacher');
        $ihr = new import_handler_registry($course, $teacher);

        $lchandlers = $ihr->get_file_handlers_for_extension('png');
        $uchandlers = $ihr->get_file_handlers_for_extension('PNG');
        $this->assertNotEquals(count($lchandlers), count($uchandlers));
    }

    /**
     * Test confirming the return format is an array of import_handler_info type objects.
     */
    public function test_get_file_handlers_for_extension_format() {
        $this->resetAfterTest();

        $course = $this->getDataGenerator()->create_course();
        $teacher = $this->getDataGenerator()->create_and_enrol($course, 'editingteacher');
        $ihr = new import_handler_registry($course, $teacher);

        $handlers = $ihr->get_file_handlers_for_extension('png');
        $this->assertIsArray($handlers);

        foreach ($handlers as $handler) {
            $this->assertInstanceOf(import_handler_info::class, $handler);
        }
    }

    /**
     * Test confirming that the results are scoped to the provided user.
     */
    public function test_get_file_handlers_for_extension_user_scoping() {
        $this->resetAfterTest();

        $course = $this->getDataGenerator()->create_course();
        $student = $this->getDataGenerator()->create_and_enrol($course, 'student');
        $teacher = $this->getDataGenerator()->create_and_enrol($course, 'editingteacher');
        $studentihr = new import_handler_registry($course, $student);
        $teacherihr = new import_handler_registry($course, $teacher);

        $this->assertEmpty($studentihr->get_file_handlers_for_extension('png'));
        $this->assertNotEmpty($teacherihr->get_file_handlers_for_extension('png'));
    }

    /**
     * Test confirming that we can find a unique handler based on its extension and plugin name.
     */
    public function test_get_file_handler_for_extension_and_plugin() {
        $this->resetAfterTest();

        $course = $this->getDataGenerator()->create_course();
        $teacher = $this->getDataGenerator()->create_and_enrol($course, 'editingteacher');
        $ihr = new import_handler_registry($course, $teacher);

        $this->assertInstanceOf(import_handler_info::class, $ihr->get_file_handler_for_extension_and_plugin('png', 'label'));
    }
}
