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

namespace core_ltix\hook;

use context;

/**
 * Base access control for the LTI placements.
 *
 * @package    core_ltix
 * @copyright  2024 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[\core\attribute\label('Hook dispatched within the content item selection process.')]
#[\core\attribute\tags('ltix', 'access')]
final class access_control {
    public function __construct(
        /** @var context The context to run checks against. */
        private readonly context $context) {
    }

    public function get_context(): context {
        return $this->context;
    }
}
