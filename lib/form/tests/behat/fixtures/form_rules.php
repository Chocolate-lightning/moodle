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
 * Test page for the different form rules.
 *
 * @copyright 2024 Mathew May <mathew.solutions>
 * @package   core_form
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(__DIR__ . '/../../../../../config.php');

// defined('BEHAT_SITE_RUNNING') || die();

global $CFG, $PAGE, $OUTPUT;
require_once($CFG->libdir . '/formslib.php');
$PAGE->set_context(context_system::instance());
$PAGE->set_url('/lib/form/tests/behat/fixtures/form_rules.php');
$PAGE->set_heading('Form rules behaviour test');
$PAGE->add_body_class('limitedwidth');

require_admin();

/**
 * Class test_form_rules
 * @package core_form
 */
class test_form_rules extends moodleform {
    /**
     * Define the form.
     */
    public function definition() {
        $mform = $this->_form;

        $mform->addElement('header', 'radioheader', 'Radio: eq/neq');
        $radiogroup = [
            $mform->createElement('radio', 'radio_group_test', '', 'Enable', '1'),
            $mform->createElement('radio', 'radio_group_test', '', 'Disable', '2'),
            $mform->createElement('radio', 'radio_group_test', '', 'Hide', '3'),
        ];
        $mform->addGroup($radiogroup, 'radio_group_test_group', 'Enable/Disable/Hide', ' ', false);
        $mform->setDefault('radio_group_test', 1);

        $mform->addElement('button', 'some_eq_text', 'Radio EQ');
        $mform->disabledIf('some_eq_text', 'radio_group_test', 'eq', '2');
        $mform->hideIf('some_eq_text', 'radio_group_test', 'eq', '3');

        $mform->addElement('button', 'some_neq_text', 'Radio NEQ');
        $mform->disabledIf('some_neq_text', 'radio_group_test', 'neq', '2');
        $mform->hideIf('some_neq_text', 'radio_group_test', 'neq', '3');

        $mform->addElement('header', 'checkboxheader', 'Checkboxes: checked/notchecked');
        $mform->setExpanded('checkboxheader');
        $ckb = [
            $mform->createElement('advcheckbox', 'some_hidden_checkbox', 'Checked hide', ''),
            $mform->createElement('advcheckbox', 'some_disabled_checkbox', 'Checked disable', ''),
            $mform->createElement('advcheckbox', 'some_hidden_uncheck_checkbox', 'Not checked hide', ''),
            $mform->createElement('advcheckbox', 'some_disabled_uncheck_checkbox', 'Not checked disable', ''),
        ];
        $mform->addGroup($ckb, 'checkbox_test_group', 'Checked/Not checked', ' ', false);

        $mform->addElement('button', 'some_checked_hidden_text', 'Checked hidden');
        $mform->hideIf('some_checked_hidden_text', 'some_hidden_checkbox', 'checked');

        $mform->addElement('button', 'some_checked_disabled_text', 'Checked disabled');
        $mform->disabledIf('some_checked_disabled_text', 'some_disabled_checkbox', 'checked');

        $mform->addElement('button', 'some_unchecked_hidden_text', 'Not checked hidden');
        $mform->hideIf('some_unchecked_hidden_text', 'some_hidden_uncheck_checkbox', 'notchecked');

        $mform->addElement('button', 'some_unchecked_disabled_text', 'Not checked disabled');
        $mform->disabledIf('some_unchecked_disabled_text', 'some_disabled_uncheck_checkbox', 'notchecked');

        $mform->addElement('header', 'textalphaheader', 'Text alpha: eq/neq/in');
        $mform->setExpanded('textalphaheader');
        $mform->addElement('text', 'some_alpha_text', 'Text input');
        $mform->setType('some_alpha_text', PARAM_TEXT);

        $mform->addElement('button', 'text_eq_text', 'Alpha EQ');
        $mform->disabledIf('text_eq_text', 'some_alpha_text', 'eq', 'Disable eq');
        $mform->hideIf('text_eq_text', 'some_alpha_text', 'eq', 'Hidden eq');

        $mform->addElement('button', 'text_neq_text', 'Alpha NEQ');
        $mform->disabledIf('text_neq_text', 'some_alpha_text', 'neq', 'Disable neq');
        $mform->hideIf('text_neq_text', 'some_alpha_text', 'neq', 'Hidden neq');

        $mform->addElement('button', 'text_in_text', 'Alpha IN');
        $mform->disabledIf('text_in_text', 'some_alpha_text', 'in', ['Tool', 'Rage Against The Machine']);
        $mform->hideIf('text_in_text', 'some_alpha_text', 'in', ['$uicideboy$', 'MF Doom', 'USAO / Camellia / No Mana']);

        $mform->addElement('header', 'textintheader', 'Text int: eq/neq/in');
        $mform->setExpanded('textintheader');
        $mform->addElement('text', 'some_int_text', 'Number input');
        $mform->setType('some_int_text', PARAM_INT);

        $mform->addElement('button', 'int_eq_text', 'Int EQ');
        $mform->disabledIf('int_eq_text', 'some_int_text', 'eq', 1);
        $mform->hideIf('int_eq_text', 'some_int_text', 'eq', 2);

        $mform->addElement('button', 'int_neq_text', 'Int NEQ');
        $mform->disabledIf('int_neq_text', 'some_int_text', 'neq', 3);
        $mform->hideIf('int_neq_text', 'some_int_text', 'neq', 4);

        $mform->addElement('button', 'int_in_text', 'Int IN');
        $mform->disabledIf('int_in_text', 'some_int_text', 'in', [9, 10]);
        $mform->hideIf('int_in_text', 'some_int_text', 'in', [11, 12]);

        // $mform->addElement('header', 'dateselectorheader', 'Date selector: eq/ne/neq/noteq');
        // $mform->setExpanded('dateselectorheader');

        // TODO: Can rules reference the value inside of these or is it just one way?
        // $mform->addElement('header', 'editorheader', 'Editor: eq/ne/neq/noteq');
        // $mform->setExpanded('editorheader');
        // $mform->addElement('header', 'filepickerheader', 'Filepicker: eq/ne/neq/noteq');
        // $mform->setExpanded('filepickerheader');

        $this->add_action_buttons(false, 'Send form');
    }
}

echo $OUTPUT->header();

$form = new test_form_rules();

$data = $form->get_data();
if ($data) {
    echo "<h3>Submitted data</h3>";
    echo '<div id="submitted_data"><ul>';
    $data = (array) $data;
    foreach ($data as $field => $value) {
        echo "<li id=\"sumbmitted_{$field}\">$field: $value</li>";
    }
    echo '</ul></div>';
}
$form->display();

echo $OUTPUT->footer();
