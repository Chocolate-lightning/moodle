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

namespace mod_lti;

/**
 * Unit tests for mod_lti upgradelib.
 *
 * @package    mod_lti
 * @copyright  2025 Jake Dallimore <jrhdallimore@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
final class upgradelib_test extends \advanced_testcase {

    /**
     * Prepares things before this test case is initialised.
     *
     * @return void
     */
    public static function setUpBeforeClass(): void {
        global $CFG;
        require_once($CFG->dirroot . '/mod/lti/db/upgradelib.php');
        parent::setUpBeforeClass();
    }

    /**
     * Helper to fetch a list of tool placements with config.
     *
     * TODO: remove this method + update test code when the placement API supports returning a list of tool placements.
     * This currently returns a stdClass representation of the placement + config.
     *
     * @param int $toolid the id of the tool.
     * @return stdClass[] the array of stdClass placements.
     */
    protected function get_tool_placements(int $toolid): array {
        global $DB;

        $placementsql = <<<EOF
            SELECT p.id AS id, tool.id AS toolid, pt.type AS placementtype
              FROM {lti_types} tool
              JOIN {lti_placement} p ON (p.toolid = tool.id)
              JOIN {lti_placement_type} pt ON (pt.id = p.placementtypeid)
             WHERE tool.id = :toolid
        EOF;
        $placements = $DB->get_records_sql($placementsql, ['toolid' => $toolid]);

        // Init empty config. It is populated from DB below.
        array_map(function ($placement) {
            $placement->config = [];
        }, $placements);

        $placementsconfigsql = <<<EOF
                SELECT p.id AS placementid, pc.id AS configid, pc.name AS name, pc.value AS value
                  FROM {lti_types} tool
                  JOIN {lti_placement} p ON (p.toolid = tool.id)
                  JOIN {lti_placement_config} pc ON (pc.placementid = p.id)
                 WHERE tool.id = :toolid
              ORDER BY tool.id
            EOF;
        $placementsconfigrs = $DB->get_recordset_sql($placementsconfigsql, ['toolid' => $toolid]);
        foreach ($placementsconfigrs as $record) {
            $placements[$record->placementid]->config[$record->name] = $record->value;
        }
        $placementsconfigrs->close();

        return $placements;
    }

    /**
     * Test covering the creation of placements for existing tools during upgrade.
     *
     * @covers lti_migration_upgrade_helper::create_default_placements
     * @return void
     */
    public function test_migration_helper_create_default_placements(): void {
        $this->resetAfterTest();
        global $DB;

        /** @var mod_lti_generator $ltigenerator */
        $ltigenerator = $this->getDataGenerator()->get_plugin_generator('mod_lti');

        $course1 = $this->getDataGenerator()->create_course();
        $course2 = $this->getDataGenerator()->create_course();

        // Create some tools configured in slightly different ways, representative of existing tool states.
        $tools = [];

        // Hidden in courses and without deep linking support.
        $tool1id = $ltigenerator->create_tool_types([
            'name' => 'Test tool 1',
            'description' => 'Good example description',
            'tooldomain' => 'example.com',
            'baseurl' => 'https://example.com/launch',
            'coursevisible' => \core_ltix\constants::LTI_COURSEVISIBLE_NO,
            'lti_contentitem' => 0,
        ]);
        $tools[] = [
            'id' => $tool1id,
            'expected_placement' => false,
        ];

        // Available to courses (but not enabled by default) with deep linking explicitly set.
        $tool2id = $ltigenerator->create_tool_types([
            'name' => 'Test tool 2',
            'description' => 'Another example description',
            'tooldomain' => 'example.com',
            'baseurl' => 'https://example.com/launch',
            'coursevisible' => \core_ltix\constants::LTI_COURSEVISIBLE_PRECONFIGURED,
            'lti_contentitem' => 1,
            'lti_toolurl_ContentItemSelectionRequest' => 'https://example.com/deep_link_launch',
        ]);
        $tools[] = [
            'id' => $tool2id,
            'expected_placement' => true,
            'expected_placement_config' => [
                'default_usage' => 'disabled',
                'supports_deep_linking' => '1',
                'deep_linking_url' => 'https://example.com/deep_link_launch',
            ],
        ];

        // Available and enabled in courses and with deep linking set, but without explicit deep linking URL set.
        $tool3id = $ltigenerator->create_tool_types([
            'name' => 'Test tool 3',
            'description' => 'Another example description',
            'tooldomain' => 'example.com',
            'baseurl' => 'https://example.com/launch',
            'coursevisible' => \core_ltix\constants::LTI_COURSEVISIBLE_ACTIVITYCHOOSER,
            'lti_contentitem' => 1,
        ]);
       $tools[] = [
            'id' => $tool3id,
            'expected_placement' => true,
            'expected_placement_config' => [
                'default_usage' => 'enabled',
                'supports_deep_linking' => '1',
            ],
        ];

        // Available in courses, and has existing lti_coursevisible rows in several courses: one enabled, one disabled.
        $tool4id = $ltigenerator->create_tool_types([
            'name' => 'Test tool 4',
            'description' => 'Good example description',
            'tooldomain' => 'example.com',
            'baseurl' => 'https://example.com/launch',
            'coursevisible' => \core_ltix\constants::LTI_COURSEVISIBLE_PRECONFIGURED,
            'lti_contentitem' => 1,
            'lti_toolurl_ContentItemSelectionRequest' => 'https://example.com/deep_link_launch',
        ]);
        // Create some legacy lti_coursevisible records (the "Show in activity chooser" on course tools view),
        // which need to be mapped to placement statuses.
        $ltigenerator->create_legacy_lti_coursevisible(
            $tool4id,
            $course1->id,
            \core_ltix\constants::LTI_COURSEVISIBLE_PRECONFIGURED,
        );
        $ltigenerator->create_legacy_lti_coursevisible(
            $tool4id,
            $course2->id,
            \core_ltix\constants::LTI_COURSEVISIBLE_ACTIVITYCHOOSER,
        );

        $tools[] = [
            'id' => $tool4id,
            'expected_placement' => true,
            'expected_placement_config' => [
                'default_usage' => 'disabled',
                'supports_deep_linking' => '1',
                'deep_linking_url' => 'https://example.com/deep_link_launch',
            ],
            'expected_placement_statuses' => [
                [
                    'contextid' => \core\context\course::instance($course1->id)->id,
                    'status' => \core_ltix\constants::LTI_COURSEVISIBLE_PRECONFIGURED,
                ],
                [
                    'contextid' => \core\context\course::instance($course2->id)->id,
                    'status' => \core_ltix\constants::LTI_COURSEVISIBLE_ACTIVITYCHOOSER,
                ],
            ],
        ];

        // Hidden tool but has legacy context-level coursevisible overrides.
        // Because it's a hidden tool, no placement, nor placement statuses are created as part of migration.
        $tool5id = $ltigenerator->create_tool_types([
            'name' => 'Test tool 5',
            'description' => 'Good example description',
            'tooldomain' => 'example.com',
            'baseurl' => 'https://example.com/launch',
            'coursevisible' => \core_ltix\constants::LTI_COURSEVISIBLE_NO,
            'lti_contentitem' => 1,
            'lti_toolurl_ContentItemSelectionRequest' => 'https://example.com/deep_link_launch',
        ]);
        // Create a legacy lti_coursevisible record (the "Show in activity chooser" on course tools view),
        // which needs to be mapped to placement statuses.
        $ltigenerator->create_legacy_lti_coursevisible(
            $tool5id,
            $course1->id,
            \core_ltix\constants::LTI_COURSEVISIBLE_ACTIVITYCHOOSER,
        );
        $tools[] = [
            'id' => $tool5id,
            'expected_placement' => false,
        ];

        // Course tool with "Show in activity chooser" set.
        // The legacy behaviour was to directly update tool->coursevisible for status, so no placement status is expected.
        // The placement config value 'default_usage' reflects the current status of placement at the course context.
        $tool6id = $ltigenerator->create_course_tool_types([
            'name' => 'course tool defaulting to legacy "show in activity chooser"',
            'baseurl' => 'http://example2.com/tool/4',
            'course' => $course1->id,
            'coursevisible' => \core_ltix\constants::LTI_COURSEVISIBLE_ACTIVITYCHOOSER,
        ]);
        $tools[] = [
            'id' => $tool6id,
            'expected_placement' => true,
            'expected_placement_config' => [
                'default_usage' => 'enabled',
            ],
            'expected_placement_statuses' => [],
        ];

        // Course tool with "Show in activity chooser" disabled.
        // The legacy behaviour was to directly update tool->coursevisible for status, so no placement status is expected.
        // The placement config value 'default_usage' reflects the current status of the placement at the course context.
        $tool7id = $ltigenerator->create_course_tool_types([
            'name' => 'course tool with "Show in activity chooser" disabled',
            'baseurl' => 'http://example2.com/tool/7',
            'course' => $course2->id,
            'coursevisible' => \core_ltix\constants::LTI_COURSEVISIBLE_PRECONFIGURED,
            'lti_contentitem' => 1,
        ]);
        $tools[] = [
            'id' => $tool7id,
            'expected_placement' => true,
            'expected_placement_config' => [
                'default_usage' => 'disabled',
                'supports_deep_linking' => '1',
            ],
            'expected_placement_statuses' => [],
        ];

        // A site tool in the pending state should have placements created for it, if applicable.
        $tool8id = $ltigenerator->create_tool_types([
            'name' => 'Test tool 8',
            'description' => 'Good example description',
            'tooldomain' => 'example.com',
            'baseurl' => 'https://example.com/launch',
            'coursevisible' => \core_ltix\constants::LTI_COURSEVISIBLE_ACTIVITYCHOOSER,
            'lti_contentitem' => 1,
            'lti_toolurl_ContentItemSelectionRequest' => 'https://example.com/deep_link_launch',
            'state' => \core_ltix\constants::LTI_TOOL_STATE_PENDING,
        ]);
        $tools[] = [
            'id' => $tool8id,
            'expected_placement' => true,
            'expected_placement_config' => [
                'default_usage' => 'enabled',
                'supports_deep_linking' => '1',
                'deep_linking_url' => 'https://example.com/deep_link_launch',
            ],
            'expected_placement_statuses' => [],
        ];

        // LTI 1p3 tool (all above are 1p1). Placements are not version specific and must be created the same.
        $tool9id = $ltigenerator->create_tool_types([
            'name' => 'Test tool 9',
            'description' => 'Good example description',
            'tooldomain' => 'example.com',
            'baseurl' => 'https://example.com/launch',
            'coursevisible' => \core_ltix\constants::LTI_COURSEVISIBLE_ACTIVITYCHOOSER,
            'lti_contentitem' => 1,
            'ltiversion' => \core_ltix\constants::LTI_VERSION_1P3,
        ]);
        $tools[] = [
            'id' => $tool9id,
            'expected_placement' => true,
            'expected_placement_config' => [
                'default_usage' => 'enabled',
                'supports_deep_linking' => '1',
            ],
            'expected_placement_statuses' => [],
        ];

        $migrationhelper = new lti_migration_upgrade_helper();
        $migrationhelper->create_default_placements();

        // Verify the task updated the relevant tools, creating a single placement and its associated config for each one.
        foreach ($tools as $tool) {
            $placements = $this->get_tool_placements($tool['id']);
            if (!$tool['expected_placement']) {
                $this->assertEmpty($placements);
                continue;
            }
            $this->assertCount(1, $placements);
            $placement = array_pop($placements);

            // Verify correct placement.
            $this->assertEquals($tool['id'], $placement->toolid);
            $this->assertEquals('mod_lti:activityplacement', $placement->placementtype);

            // Verify correct placement config.
            $this->assertEquals(count($tool['expected_placement_config']), count($placement->config));
            foreach($tool['expected_placement_config'] as $expectedconfigname => $expectedconfigvalue) {
                $this->assertEquals($expectedconfigvalue, $placement->config[$expectedconfigname]);
            }

            // Verify correct placement statuses.
            if (isset($tool['expected_placement_statuses'])) {
                $placementstatuses = $DB->get_records_menu('lti_placement_status', ['placementid' => $placement->id], '',
                    'contextid, status');
                $this->assertEquals(count($tool['expected_placement_statuses']), count($placementstatuses));
                foreach ($tool['expected_placement_statuses'] as $expectedplacementstatus) {
                    $this->assertArrayHasKey($expectedplacementstatus['contextid'], $placementstatuses);
                    $this->assertEquals($expectedplacementstatus['status'], $placementstatuses[$expectedplacementstatus['contextid']]);
                }
            }
        }
    }

    /**
     * Test covering the creation of links for existing tools during upgrade.
     *
     * @covers lti_migration_upgrade_helper::create_resource_links
     * @return void
     */
    public function test_create_resource_links(): void {
        $this->resetAfterTest();
        global $DB;

        /** @var mod_lti_generator $ltigenerator */
        $ltigenerator = $this->getDataGenerator()->get_plugin_generator('mod_lti');

        $course1 = $this->getDataGenerator()->create_course();
        $course2 = $this->getDataGenerator()->create_course();

        // Site tool.
        $tool1id = $ltigenerator->create_tool_types([
            'name' => 'Test tool 1',
            'description' => 'Good example description',
            'tooldomain' => 'example.com',
            'baseurl' => 'https://example.com/launch',
            'coursevisible' => \core_ltix\constants::LTI_COURSEVISIBLE_ACTIVITYCHOOSER,
            'lti_contentitem' => 1,
        ]);
        // A link created using tool1 in course 1.
        $tool1instance1 = $ltigenerator->create_instance([
            'course' => $course1->id,
            'typeid' => $tool1id,
        ]);
        // Another link created using tool1 in course 2.
        $tool1instance2 = $ltigenerator->create_instance([
            'course' => $course2->id,
            'typeid' => $tool1id,
        ]);

        // Course tool.
        $tool2id = $ltigenerator->create_course_tool_types([
            'name' => 'Test tool 2',
            'description' => 'Good example description',
            'tooldomain' => 'example2.com',
            'baseurl' => 'https://example2.com/launch',
            'coursevisible' => \core_ltix\constants::LTI_COURSEVISIBLE_ACTIVITYCHOOSER,
            'lti_contentitem' => 1,
            'course' => $course1->id,
        ]);
        // A link created using tool2 in course 2.
        $tool2instance = $ltigenerator->create_instance([
            'course' => $course2->id,
            'typeid' => $tool2id,
        ]);

        // Manually configured instance (legacy).
        $manuallyconfigureinstance = $ltigenerator->create_instance([
            'course' => $course1->id,
            'toolurl' => 'https://example3.com/launch',
            'typeid' => null,
        ]);

        // The ids of all lti instances.
        $instanceids = [
            $tool1instance1->id,
            $tool1instance2->id,
            $tool2instance->id,
            $manuallyconfigureinstance->id,
        ];

        // Delete all existing resource links that may have been created when generating the instances.
        $DB->delete_records('lti_resource_link');

        // Create the links, verifying that a link is created for each lti instance, and has the same id.
        $migrationhelper = new lti_migration_upgrade_helper();
        $migrationhelper->create_resource_links();

        $links = $DB->get_records('lti_resource_link');
        $linkids = array_column($links, 'id');
        $this->assertEquals($instanceids, $linkids);

        // Insert another link, verifying that the table sequence has been reset properly as part of the link creation.
        $newlink = new \core_ltix\local\lticore\models\resource_link(0, (object) [
            'typeid' => 4,
            'component' => 'mod_lti',
            'itemtype' => 'mod_lti:activityplacement',
            'itemid' => 432,
            'contextid' => 33,
            'url' => (new \moodle_url('http://tool.example.com/my/resource'))->out(false),
            'title' => 'My resource',
        ]);
        $newlink->save();
        $this->assertEquals(max($instanceids) + 1, $newlink->get('id'));
    }
}
