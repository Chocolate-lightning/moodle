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
 * Renderer.
 *
 * @package    tool_moodlenet
 * @copyright  2020 Mathew May {@link https://mathew.solutions}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace tool_moodlenet\output;

defined('MOODLE_INTERNAL') || die();

use plugin_renderer_base;

define('DEFAULT_MOODLE_NET_LINK', 'https://team.moodle.net');

/**
 * Renderer class.
 *
 * @package    tool_moodlenet
 * @copyright  2020 Mathew May {@link https://mathew.solutions}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class renderer extends plugin_renderer_base {

    /**
     * Defer to template.
     *
     * @param \tool_moodlenet\output\instances_page $instancespage
     * @return string HTML
     */
    protected function render_instances_page(\tool_moodlenet\output\instances_page $instancespage): string {
        $this->page->requires->js_call_amd('tool_moodlenet/instance_form', 'init', ['defaulturl' => DEFAULT_MOODLE_NET_LINK]);

        $data = $instancespage->export_for_template($this);
        return parent::render_from_template('tool_moodlenet/instances_page', $data);
    }

}
