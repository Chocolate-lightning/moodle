<?php

require_once(__DIR__ . '/../../../config.php');

require_login();

// The integration must be enabled for this import endpoint to be active.
if (!get_config('core', 'enablemoodlenet')) {
    print_error('moodlenetnotenabled', 'tool_moodlenet');
}

$url = new moodle_url('/admin/tool/moodlenet/instance.php');
$PAGE->set_url($url);
$PAGE->set_context(null);
$PAGE->set_pagelayout('standard');
$PAGE->set_title('Integrate!!!');
$PAGE->set_heading('OH WOW!');

echo $OUTPUT->header();

$renderable = new \tool_moodlenet\output\instances_page('Something');
$renderer = $PAGE->get_renderer('tool_moodlenet');
echo $renderer->render($renderable);

$form = new \tool_moodlenet\form\instance_form();
if ($data = $form->get_data()) {
    require_sesskey();

    print_object($data);
}
$test = $form->render();
print_object($test);
$form->display();
echo $OUTPUT->footer();
