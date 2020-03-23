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
 * Select page renderable.
 *
 * @package    tool_moodlenet
 * @copyright  2020 Mathew May {@link https://mathew.solutions}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace tool_moodlenet\output;

use tool_moodlenet\local\remote_resource;
use tool_moodlenet\local\url;

defined('MOODLE_INTERNAL') || die;

/**
 * Select page renderable.
 *
 * @package    tool_moodlenet
 * @copyright  2020 Mathew May {@link https://mathew.solutions}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class select_page implements \renderable, \templatable {

    /**
     * @var $resouceurl
     */
    protected $resouceurl;

    /**
     * Inits the Select page renderable.
     *
     * @param string $resourceurl The resource the user wants to add
     */
    public function __construct(string $resourceurl) {
        $this->resouceurl = $resourceurl;
    }

    /**
     * Export the data.
     *
     * @param \renderer_base $output
     * @return \stdClass
     */
    public function export_for_template(\renderer_base $output): \stdClass {

        // Prepare the context object.
        $data = new \stdClass();
        $data->resourceurl = $this->resouceurl;
        $remoteresource = new remote_resource(new \curl(), new url($this->resouceurl));
        $data->name = $remoteresource->get_name(). '.' . $remoteresource->get_extension();
        $data->cancellink = new \moodle_url('/my');

        return $data;
    }
}
