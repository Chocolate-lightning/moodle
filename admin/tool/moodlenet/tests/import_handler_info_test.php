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
 * Unit tests for the import_handler_info class.
 *
 * @package    tool_moodlenet
 * @category   test
 * @copyright  2020 Jake Dallimore <jrhdallimore@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace tool_moodlenet\local\tests;

use core\session\exception;
use tool_moodlenet\local\import_handler_info;

defined('MOODLE_INTERNAL') || die();

/**
 * Class tool_moodlenet_import_handler_info_testcase, providing test cases for the import_handler_info class.
 */
class tool_moodlenet_import_handler_info_testcase extends \advanced_testcase {

    /**
     * Test the getters of this object.
     *
     * @dataProvider handler_info_data_provider
     * @param string $extension the file extension.
     * @param string $modname the name of the mod.
     * @param string $description description of the mod.
     * @param bool $expectexception whether we expect an exception during init or not.
     */
    public function test_initialisation($extension, $modname, $description, $expectexception) {
        $this->resetAfterTest();
        // Skip those cases we cannot init.
        if ($expectexception) {
            $this->expectException(\coding_exception::class);
            $handlerinfo = new import_handler_info($extension, $modname, $description);
        }

        $handlerinfo = new import_handler_info($extension, $modname, $description);

        $this->assertEquals($extension, $handlerinfo->get_extension());
        $this->assertEquals($modname, $handlerinfo->get_module_name());
        $this->assertEquals($description, $handlerinfo->get_description());
    }


    /**
     * Data provider for creation of import_handler_info objects.
     *
     * @return array the data for creation of the info object.
     */
    public function handler_info_data_provider() {
        return [
            'Label handles the png extension' => ['png', 'label', 'Add a label to the course', false],
            'Resource handles any file extension' => ['*', 'resource', 'Add a file resource to the course', false],
            'Missing file extension' => ['', 'resource', 'Add a file resource to the course', true],
            'Missing module name' => ['*', '', 'Add a file resource to the course', true],
            'Missing description' => ['*', 'resource', '', true],

        ];
    }
}
