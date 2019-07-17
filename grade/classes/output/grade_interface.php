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
 * Build user content before we render it out.
 *
 * @package   core_grades
 * @copyright 2019 Mathew May <mathew.solutions>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace core_grades\output;
defined('MOODLE_INTERNAL') || die();

use renderable;
use stdClass;
use templatable;

/**
 * Callable class that we instantiated.
 *
 * @package   core_grades
 * @copyright 2019 Mathew May <mathew.solutions>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class grade_interface implements renderable, templatable {

    /**
     * The CMID of the module we are going to work with.
     *
     * @var int
     */
    protected $cmid;

    /**
     * User id that we want to fetch content for.
     *
     * @var int
     */
    protected $userid;

    /**
     * grade_interface constructor.
     *
     * @param int $cmid
     * @param int $userid
     */
    public function __construct($cmid, $userid) {
        $this->cmid = $cmid;
        $this->userid = $userid;
    }

    /**
     * Export the data.
     *
     * @param renderer_base $output
     * @return stdClass
     */
    public function export_for_template(\renderer_base $output) {
        global $DB;

        $data = new stdClass();

        $data->cmid = $this->cmid;
        $data->userid = $this->userid;

        // This information will be converted in MDL-66080 to fetch via WS.
        if ($this->userid) {
            $user = $DB->get_record('user', ['id' => (int)$this->userid], '*', IGNORE_MISSING);

            $data->userfirstname = $user->firstname;
            $data->userlastname = $user->lastname;
            $data->useremail = $user->email;
        }

        return $data;
    }
}
