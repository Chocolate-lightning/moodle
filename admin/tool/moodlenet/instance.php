<?php

require_once(__DIR__ . '/../../../config.php');

require_login();

// The integration must be enabled for this import endpoint to be active.
if (!get_config('core', 'enablemoodlenet')) {
    print_error('moodlenetnotenabled', 'tool_moodlenet');
}

$PAGE->set_url('/moodlenet/instance.php');
$PAGE->set_context(null);
$PAGE->set_pagelayout('standard');

echo $OUTPUT->header();

$renderable = new \tool_moodlenet\output\instances_page('Something');
$renderer = $PAGE->get_renderer('tool_moodlenet');
echo $renderer->render($renderable);

echo $OUTPUT->footer();
