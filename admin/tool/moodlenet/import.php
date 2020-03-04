<?php

require_once(__DIR__ . '/../../../config.php');

// The integration must be enabled for this import endpoint to be active.
if (!get_config('core', 'enablemoodlenet')) {
    print_error('moodlenetnotenabled', 'tool_moodlenet');
}

// The POST data must be present and valid.
if (!empty($_POST)) {
    if (!empty($_POST['resourceurl']) && !empty($_POST['originurl'])) {
        // Take the params we need, create a local URL, and redirect to it.
        // This allows us to hook into the 'wantsurl' capability of the auth system.
        $resourceurl = validate_param($_POST['resourceurl'], PARAM_URL);
        $resourceurl = urlencode($resourceurl);

        $originurl = validate_param($_POST['originurl'], PARAM_URL);
        $originurl = urlencode($originurl);

        $url = new moodle_url('/admin/tool/moodlenet/index.php', ['resourceurl' => $resourceurl, 'origin' => $originurl]);

        redirect($url);
    }
}

// Invalid or missing POST data. Show an error to the user.
print_error('missinginvalidpostdata', 'tool_moodlenet');
