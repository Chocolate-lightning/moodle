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
 * Grade item storage for mod_assign.
 *
 * @package   mod_assign
 * @copyright Mathew May <mathew.solutions>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

declare(strict_types = 1);

namespace mod_assign\grades;

use coding_exception;
use context;
use core_grades\component_gradeitem;
use required_capability_exception;
use stdClass;
require_once($CFG->dirroot.'/mod/assign/locallib.php');

class submissions_gradeitem extends component_gradeitem {
    protected $assign;

    /**
     * Return an instance based on the context in which it is used.
     *
     * @param context $context
     */
    public static function load_from_context(context $context): parent {
        $assign = new \assign($context, null, null);
        return static::load_from_assign($assign);
    }

    /**
     * Return an instance using the assign instance.
     *
     * @param $assign
     *
     * @return submissions_gradeitem
     */
    public static function load_from_assign($assign): self {
        $instance = new static('mod_assign', $assign->get_context(), 'submissions');
        $instance->assign = $assign;

        return $instance;
    }

    /**
     * The table name used for grading.
     *
     * @return string
     */
    protected function get_table_name(): string {
        return 'assign_grades';
    }

    /**
     * Whether grading is enabled for this item.
     *
     * @return bool
     */
    public function is_grading_enabled(): bool {
        return true;
    }

    /**
     * Whether the grader can grade the grade.
     *
     * @param stdClass $gradeduser The user being graded
     * @param stdClass $grader The user who is grading
     * @return bool
     */
    public function user_can_grade(stdClass $gradeduser, stdClass $grader): bool {
        // TODO: Validate the required capabilities.
        return true;
    }

    /**
     * Require that the user can grade, throwing an exception if not.
     *
     * @param stdClass $gradeduser The user being graded
     * @param stdClass $grader The user who is grading
     * @throws required_capability_exception
     */
    public function require_user_can_grade(stdClass $gradeduser, stdClass $grader): void {
        if (!true) {
            throw new required_capability_exception($this->assign->get_context(), 'mod/assign:grade', 'nopermissions', '');
        }
    }

    /**
     * Get the grade value for this instance.
     *
     * @return int
     */
    protected function get_gradeitem_value(): int {
        return (int) $this->assign->get_instance()->grade;
    }

    /**
     * Create an empty assign_grade for the specified user and grader.
     *
     * @param stdClass $gradeduser The user being graded
     * @param stdClass $grader The user who is grading
     * @return stdClass The newly created grade record
     * @throws \dml_exception
     */
    public function create_empty_grade(stdClass $gradeduser, stdClass $grader): stdClass {
        global $DB;

        $grade = (object) [
            'assignment' => $this->assign->get_instance()->id,
            'attemptnumber' => $this->itemnumber,
            'userid' => $gradeduser->id,
            'timemodified' => time(),
        ];
        $grade->timecreated = $grade->timemodified;

        $gradeid = $DB->insert_record($this->get_table_name(), $grade);

        return $DB->get_record($this->get_table_name(), ['id' => $gradeid]);
    }

    /**
     * Get the grade for the specified user.
     *
     * @param stdClass $gradeduser The user being graded
     * @param stdClass $grader The user who is grading
     * @return stdClass The grade value
     * @throws \dml_exception
     */
    public function get_grade_for_user(stdClass $gradeduser, stdClass $grader = null): ?stdClass {
        global $DB;

        // TODO: Add support for multiple attempts.
        $params = [
            'assignment' => $this->assign->get_instance()->id,
            'attemptnumber' => $this->itemnumber,
            'userid' => $gradeduser->id,
        ];

        $grade = $DB->get_record($this->get_table_name(), $params);

        if (empty($grade)) {
            $grade = $this->create_empty_grade($gradeduser, $grader);
        }

        return $grade ?: null;
    }

    /**
     * Get the grade status for the specified user.
     * Check if a grade obj exists & $grade->grade !== null.
     * If the user has a grade return true.
     *
     * @param stdClass $gradeduser The user being graded
     * @return bool The grade exists
     * @throws \dml_exception
     */
    public function user_has_grade(stdClass $gradeduser): bool {
        global $DB;

        $params = [
            'assignment' => $this->assign->get_instance()->id,
            'attemptnumber' => $this->itemnumber,
            'userid' => $gradeduser->id,
        ];

        $grade = $DB->get_record($this->get_table_name(), $params);

        if (empty($grade) || $grade->grade === null) {
            return false;
        }
        return true;
    }

    /**
     * Get grades for all users for the specified gradeitem.
     *
     * @return stdClass[] The grades
     * @throws \dml_exception
     */
    public function get_all_grades(): array {
        global $DB;

        return $DB->get_records($this->get_table_name(), [
            'assignment' => $this->assign->get_instance()->id,
            'attemptnumber' => $this->itemnumber,
        ]);
    }

    /**
     * Get the grade instance id.
     *
     * This relates to the iteminstance field in the grade_items
     * table.
     *
     * @return int
     */
    public function get_grade_instance_id(): int {
        return (int) $this->assign->get_instance()->id;
    }

    /**
     * Defines whether only active users in the course should be gradeable.
     *
     * @return bool Whether only active users in the course should be gradeable.
     */
    public function should_grade_only_active_users(): bool {
        global $CFG;

        $showonlyactiveenrolconfig = !empty($CFG->grade_report_showonlyactiveenrol);
        // Grade only active users enrolled in the course either when the 'grade_report_showonlyactiveenrol' user
        // preference is set to true or the current user does not have the capability to view suspended users in the
        // course. In cases where the 'grade_report_showonlyactiveenrol' user preference is not set we are falling back
        // to the set value for the 'grade_report_showonlyactiveenrol' config.
        return get_user_preferences('grade_report_showonlyactiveenrol', $showonlyactiveenrolconfig) ||
            !has_capability('moodle/course:viewsuspendedusers', \context_course::instance($this->assign->get_course()->id));
    }

    /**
     * Create or update the grade.
     *
     * @param stdClass $grade
     * @return bool Success
     * @throws \dml_exception
     * @throws \moodle_exception
     * @throws coding_exception
     */
    protected function store_grade(stdClass $grade): bool {
        global $CFG, $DB;

        if ($grade->assignment != $this->assign->get_instance()->id) {
            throw new coding_exception('Incorrect assignment provided for this grade');
        }

        if ($grade->itemnumber != $this->itemnumber) {
            throw new coding_exception('Incorrect itemnumber provided for this grade');
        }

        // Ensure that the grade is valid.
        $this->check_grade_validity($grade->grade);

        $grade->assignment = $this->assign->get_instance()->id;
        $grade->timemodified = time();

        $DB->update_record($this->get_table_name(), $grade);

        $this->assign->update_gradebook(false, $this->assign->get_instance()->id);

        return true;
    }
}
