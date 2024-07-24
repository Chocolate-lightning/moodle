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

        // Radio rule test.
        $mform->addElement('header', 'radioheader', 'Radio: eq/neq');
        $radiogroup = [
            $mform->createElement('radio', 'rgt', '', 'Enable', '1'),
            $mform->createElement('radio', 'rgt', '', 'Disable', '2'),
            $mform->createElement('radio', 'rgt', '', 'Hide', '3'),
        ];
        $mform->addGroup($radiogroup, 'rgt_group', 'Enable/Disable/Hide', ' ', false);
        $mform->setDefault('rgt', 1);

        $mform->addElement('button', 'r_eq_btn', 'Radio EQ');
        $mform->disabledIf('r_eq_btn', 'rgt', 'eq', '2');
        $mform->hideIf('r_eq_btn', 'rgt', 'eq', '3');

        $mform->addElement('button', 'r_neq_btn', 'Radio NEQ');
        $mform->disabledIf('r_neq_btn', 'rgt', 'neq', '2');
        $mform->hideIf('r_neq_btn', 'rgt', 'neq', '3');

        // Checkboxes checked/notchecked rule test.
        $mform->addElement('header', 'checkboxheader', 'Checkboxes: checked/notchecked/eq/neq');
        $mform->setExpanded('checkboxheader');
        $ckb = [
            $mform->createElement('advcheckbox', 'hidden_ckb', 'Checked hide', ''),
            $mform->createElement('advcheckbox', 'disabled_ckb', 'Checked disable', ''),
            $mform->createElement('advcheckbox', 'hidden_uncheck_ckb', 'Not checked hide', ''),
            $mform->createElement('advcheckbox', 'disabled_uncheck_ckb', 'Not checked disable', ''),
            $mform->createElement('advcheckbox', 'eq_ckb', 'EQ Checked', ''),
            $mform->createElement('advcheckbox', 'neq_ckb', 'NEQ Checked', ''),
        ];
        $mform->addGroup($ckb, 'checkbox_test_group', 'Checked/Not checked/EQ/NEQ', ' ', false);

        $mform->addElement('button', 'checked_hidden_btn', 'Checked hidden');
        $mform->hideIf('checked_hidden_btn', 'hidden_ckb', 'checked');
        $mform->addElement('text', 'checked_hidden_txt', 'Label test');
        $mform->setType('checked_hidden_txt', PARAM_TEXT);
        $mform->hideIf('checked_hidden_txt', 'hidden_ckb', 'checked');

        $mform->addElement('button', 'checked_disabled_btn', 'Checked disabled');
        $mform->disabledIf('checked_disabled_btn', 'disabled_ckb', 'checked');

        $mform->addElement('button', 'unchecked_hidden_btn', 'Not checked hidden');
        $mform->hideIf('unchecked_hidden_btn', 'hidden_uncheck_ckb', 'notchecked');

        $mform->addElement('button', 'unchecked_disabled_btn', 'Not checked disabled');
        $mform->disabledIf('unchecked_disabled_btn', 'disabled_uncheck_ckb', 'notchecked');

        $mform->addElement('button', 'eq_ckb_btn', 'EQ ckb 1 disabled');
        $mform->disabledIf('eq_ckb_btn', 'eq_ckb', 'eq' , '1');

        $mform->addElement('button', 'neq_ckb_btn', 'NEQ ckb 0 hidden');
        $mform->hideIf('neq_ckb_btn', 'neq_ckb', 'neq' , '0');

        // Select test.
        $mform->addElement('header', 'selectheader', 'Select: eq/neq');
        $mform->setExpanded('selectheader');
        $mform->addElement('select', 'sct_int', 'Select',
            [0 => 'Enable', 1 => 'Disable', 2 => 'Hide'],
            /*['multiple' => true]*/
        );

        $mform->addElement('button', 'sct_eq_btn', 'Select EQ');
        $mform->disabledIf('sct_eq_btn', 'sct_int', 'eq', 1);
        $mform->hideIf('sct_eq_btn', 'sct_int', 'eq', 2);

        $mform->addElement('button', 'sct_neq_btn', 'Select NEQ');
        $mform->disabledIf('sct_neq_btn', 'sct_int', 'neq', 1);
        $mform->hideIf('sct_neq_btn', 'sct_int', 'neq', 0);

        // Text alpha input rule test.
        $mform->addElement('header', 'textalphaheader', 'Text alpha: eq/neq/in');
        $mform->setExpanded('textalphaheader');
        $mform->addElement('text', 'alpha_btn', 'Text input');
        $mform->setType('alpha_btn', PARAM_TEXT);

        $mform->addElement('button', 'tia_eq_btn', 'Alpha EQ');
        $mform->disabledIf('tia_eq_btn', 'alpha_btn', 'eq', 'Disable eq');
        $mform->hideIf('tia_eq_btn', 'alpha_btn', 'eq', 'Hidden eq');

        $mform->addElement('button', 'tia_neq_btn', 'Alpha NEQ');
        $mform->disabledIf('tia_neq_btn', 'alpha_btn', 'neq', 'Disable neq');
        $mform->hideIf('tia_neq_btn', 'alpha_btn', 'neq', 'Hidden neq');

        $mform->addElement('button', 'tia_in_btn', 'Alpha IN');
        $mform->disabledIf('tia_in_btn', 'alpha_btn', 'in', ['Tool', 'Rage Against The Machine']);
        $mform->hideIf('tia_in_btn', 'alpha_btn', 'in', ['MF Doom', 'USAO / Camellia / No Mana']);

        // Text int input rule test.
        $mform->addElement('header', 'textintheader', 'Text int: eq/neq/in');
        $mform->setExpanded('textintheader');
        $mform->addElement('text', 'tii_btn', 'Number input');
        $mform->setType('tii_btn', PARAM_INT);

        $mform->addElement('button', 'tii_eq_btn', 'Int EQ');
        $mform->disabledIf('tii_eq_btn', 'tii_btn', 'eq', 1);
        $mform->hideIf('tii_eq_btn', 'tii_btn', 'eq', 2);

        $mform->addElement('button', 'tii_neq_btn', 'Int NEQ');
        $mform->disabledIf('tii_neq_btn', 'tii_btn', 'neq', 3);
        $mform->hideIf('tii_neq_btn', 'tii_btn', 'neq', 4);

        $mform->addElement('button', 'tii_in_btn', 'Int IN');
        $mform->disabledIf('tii_in_btn', 'tii_btn', 'in', [9, 10]);
        $mform->hideIf('tii_in_btn', 'tii_btn', 'in', [11, 12]);

        // Date selector rule test.
        $mform->addElement('header', 'dateselectorheader', 'Date selector: ~');
        $mform->setExpanded('dateselectorheader');
        $mform->addElement('checkbox', 'ds_enb', get_string('enable'));
        $mform->setDefault('ds_enb', 1);
        $mform->addElement('checkbox', 'ds_dis', get_string('show'));
        $mform->setDefault('ds_dis', 1);
        $mform->addElement('date_selector', 'ds', 'Date selector for testing');
        $mform->disabledIf("ds", 'ds_enb');
        $mform->hideIf("ds", 'ds_dis');

        // Editor rule test.
        $mform->addElement('header', 'editorheader', 'Editor: ~');
        $mform->setExpanded('editorheader');
        $mform->addElement('checkbox', 'edt_enb', get_string('enable'));
        $mform->setDefault('edt_enb', 1);
        $mform->addElement('checkbox', 'edt_dis', get_string('show'));
        $mform->setDefault('edt_dis', 1);
        $editoroptions = [
            'subdirs' => 0,
            'maxbytes' => 0,
            'maxfiles' => 0,
            'changeformat' => 0,
            'context' => context_system::instance(),
            'noclean' => 0,
            'trusttext' => 0
        ];
        $mform->addElement('editor', 'edt', 'Editor for testing', $editoroptions);
        $mform->setDefault('edt', ['text' => 'Hello world!', 'format' => FORMAT_HTML]);
        $mform->disabledIf("edt", 'edt_enb');
        $mform->hideIf("edt", 'edt_dis');

        // Filepicker rule test.
        $mform->addElement('header', 'filepickerheader', 'Filepicker: ~');
        $mform->setExpanded('filepickerheader');
        $mform->addElement('checkbox', 'fp_dis', get_string('show'));
        $mform->setDefault('fp_dis', 1);
        $mform->addElement('filepicker', 'fp', 'Filepicker for testing', null, ['accepted_types' => '*']);
        $mform->hideIf("fp", 'fp_dis');

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
