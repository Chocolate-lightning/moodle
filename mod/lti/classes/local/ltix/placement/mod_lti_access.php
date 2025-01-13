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

namespace mod_lti\local\ltix\placement;

use core\context;
use core_ltix\placement\access as base_access;

/**
 * Implementation of access control for the LTI module.
 *
 * @package    mod_lti
 * @copyright  2024 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
final class mod_lti_access extends base_access {

    /**
     * @inheritDoc
     */
    public function resource_link_setup_capabilities(context $context): void {
        global $DB;
        // Check access and capabilities.
        if ($context instanceof context_course) {
            $course = $DB->get_record('course', ['id' => $context->instanceid], 'id', MUST_EXIST);
            require_login($course);
        } else if ($context instanceof context_module) {
            $cm = get_coursemodule_from_id('', $context->instanceid, 0, false, MUST_EXIST);
            require_login(null, true, $cm, true, true);
        } else {
            require_login();
        }
    }
}
