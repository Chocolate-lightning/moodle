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
 * Unit tests for the profile manager
 *
 * @package    tool_moodlenet
 * @category   test
 * @copyright  2020 Adrian Greeve <adrian@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

global $CFG;

/**
 * Class profile_manager tests
 */
class tool_moodlenet_profile_manager_testcase extends advanced_testcase {

    /**
     * Test that on this site we do not use the user table to hold moodle net profile information.
     */
    public function test_official_profile_exists() {
        $this->assertFalse(\tool_moodlenet\profile_manager::official_profile_exists());
    }

    /**
     * Test the return of a moodle net profile.
     */
    public function test_get_moodlenet_user_profile() {
        global $DB;
        $this->resetAfterTest();

        $user = $this->getDataGenerator()->create_user();

        $fieldname = \tool_moodlenet\profile_manager::get_profile_field_name();

        // The shortname is unique so we can grab the record from there.
        $field = $DB->get_record('user_info_field', ['shortname' => $fieldname]);

        $userprofiledata = '@matt@hq.mnet';

        $data = (object) [
            'userid' => $user->id,
            'fieldid' => $field->id,
            'data' => $userprofiledata
        ];

        $DB->insert_record('user_info_data', $data);

        $result = \tool_moodlenet\profile_manager::get_moodlenet_user_profile($user->id);
        $this->assertEquals($userprofiledata, $result->get_profile_name());
    }

    /**
     * Test the creation of a user profile category.
     */
    public function test_create_user_profile_category() {
        global $DB;
        $this->resetAfterTest();

        $basecategoryname = get_string('pluginname', 'tool_moodlenet');

        \tool_moodlenet\profile_manager::create_user_profile_category();
        $categoryname = \tool_moodlenet\profile_manager::get_category_name();
        $this->assertEquals($basecategoryname . 1, $categoryname);
        \tool_moodlenet\profile_manager::create_user_profile_category();

        $recordcount = $DB->count_records('user_info_category', ['name' => $basecategoryname]);
        $this->assertEquals(1, $recordcount);

        // Test the duplication of categories to ensure a unique name is always used.
        $categoryname = \tool_moodlenet\profile_manager::get_category_name();
        $this->assertEquals($basecategoryname . 2, $categoryname);
        \tool_moodlenet\profile_manager::create_user_profile_category();
        $categoryname = \tool_moodlenet\profile_manager::get_category_name();
        $this->assertEquals($basecategoryname . 3, $categoryname);
    }

    /**
     * Test the creating of the custom user profile field to hold the moodle net profile.
     */
    public function test_create_user_profile_text_field() {
        global $DB;
        $this->resetAfterTest();

        $categoryid = \tool_moodlenet\profile_manager::create_user_profile_category();
        \tool_moodlenet\profile_manager::create_user_profile_text_field($categoryid);

        $shortname = \tool_moodlenet\profile_manager::get_profile_field_name();

        $record = $DB->get_record('user_info_field', ['shortname' => $shortname]);
        $this->assertEquals($shortname, $record->shortname);
        $this->assertEquals($categoryid, $record->categoryid);

        // Test for a unique name if 'mnetprofile' is already in use.
        \tool_moodlenet\profile_manager::create_user_profile_text_field($categoryid);
        $profilename = \tool_moodlenet\profile_manager::get_profile_field_name();
        $shortname = \tool_moodlenet\profile_manager::get_profile_field_name();
        $this->assertEquals($shortname, $profilename);

        \tool_moodlenet\profile_manager::create_user_profile_text_field($categoryid);
        $profilename = \tool_moodlenet\profile_manager::get_profile_field_name();
        $shortname = \tool_moodlenet\profile_manager::get_profile_field_name();
        $this->assertEquals($shortname, $profilename);
    }

    /**
     * Test that the user moodlenet profile is saved.
     */
    public function test_save_moodlenet_user_profile() {
        $this->resetAfterTest();

        $user = $this->getDataGenerator()->create_user();
        $profilename = '@matt@hq.mnet';

        $moodlenetprofile = new \tool_moodlenet\moodlenet_user_profile($profilename, $user->id);

        \tool_moodlenet\profile_manager::save_moodlenet_user_profile($moodlenetprofile);

        $profile = \tool_moodlenet\profile_manager::get_moodlenet_user_profile($user->id);
        $this->assertEquals($profilename, $profile->get_profile_name());
    }

    /**
     * Test that deleting the category will result in it being regenerated with the save being successful.
     */
    public function test_save_moodlenet_user_profile_deleted_category() {
        global $DB;

        $this->resetAfterTest();

        $user = $this->getDataGenerator()->create_user();
        $profilename = '@matt@hq.mnet';

        $categoryname = \tool_moodlenet\profile_manager::get_category_name();
        $DB->delete_records('user_info_category', ['name' => $categoryname]);

        $record = $DB->get_records('user_info_category');
        $this->assertEmpty($record);

        $moodlenetprofile = new \tool_moodlenet\moodlenet_user_profile($profilename, $user->id);
        \tool_moodlenet\profile_manager::save_moodlenet_user_profile($moodlenetprofile);

        $profile = \tool_moodlenet\profile_manager::get_moodlenet_user_profile($user->id);
        $this->assertEquals($profilename, $profile->get_profile_name());

        $record = $DB->get_records('user_info_category');
        $this->assertCount(1, $record);
    }

    /**
     * Test that deleting the field will result in it being regenerated with the save being successful.
     */
    public function test_save_moodlenet_user_profile_deleted_field() {
        global $DB;

        $this->resetAfterTest();

        $user = $this->getDataGenerator()->create_user();
        $profilename = '@matt@hq.mnet';

        $fieldname = \tool_moodlenet\profile_manager::get_profile_field_name();
        $DB->delete_records('user_info_field', ['shortname' => $fieldname]);

        $record = $DB->get_records('user_info_field');
        $this->assertEmpty($record);

        $moodlenetprofile = new \tool_moodlenet\moodlenet_user_profile($profilename, $user->id);
        \tool_moodlenet\profile_manager::save_moodlenet_user_profile($moodlenetprofile);

        $profile = \tool_moodlenet\profile_manager::get_moodlenet_user_profile($user->id);
        $this->assertEquals($profilename, $profile->get_profile_name());

        $record = $DB->get_records('user_info_field');
        $this->assertCount(1, $record);
    }

    /**
     * Test that deleting the category and field will result in both being regenerated with the save being successful.
     */
    public function test_save_moodlenet_user_profile_deleted_category_and_field() {
        global $DB;

        $this->resetAfterTest();

        $user = $this->getDataGenerator()->create_user();
        $profilename = '@matt@hq.mnet';

        $fieldname = \tool_moodlenet\profile_manager::get_profile_field_name();
        $DB->delete_records('user_info_field', ['shortname' => $fieldname]);

        // Delete field and category.
        $record = $DB->get_records('user_info_field');
        $this->assertEmpty($record);

        $categoryname = \tool_moodlenet\profile_manager::get_category_name();
        $DB->delete_records('user_info_category', ['name' => $categoryname]);

        $record = $DB->get_records('user_info_category');
        $this->assertEmpty($record);

        // Create and then save the profile.
        $moodlenetprofile = new \tool_moodlenet\moodlenet_user_profile($profilename, $user->id);
        \tool_moodlenet\profile_manager::save_moodlenet_user_profile($moodlenetprofile);

        $profile = \tool_moodlenet\profile_manager::get_moodlenet_user_profile($user->id);
        $this->assertEquals($profilename, $profile->get_profile_name());

        $record = $DB->get_records('user_info_field');
        $this->assertCount(1, $record);

        $record = $DB->get_records('user_info_category');
        $this->assertCount(1, $record);
    }
}
