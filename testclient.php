<?php

// Site config - set these.
$DEFAULTSITE = 'http://localhost/master';
$DEFAULTCOURSE = 2;
$DEFAULTSECTION = 1;

// Are we handling the case where the user started in Moodle?
$site = $_GET['site'] ?? null;
$path = $_GET['path'] ?? null;
$allcases = true;
if ($site && $path) {
    $moodlesite = urldecode($site);
    $endpoint = urldecode($path);
    if (substr($endpoint, 0, 1) !== '/') {
        $endpoint = '/'.$endpoint;
    }
    $query = parse_url($moodlesite.$endpoint, PHP_URL_QUERY);
    parse_str($query, $params);
    $course = $params['course'];
    $section = $params['section'];
    $allcases = false;
} else {
    $endpoint = '/admin/tool/moodlenet/import.php';
    $moodlesite = $DEFAULTSITE;
    $course = $DEFAULTCOURSE;
    $section = $DEFAULTSECTION;
}

$resource = (object) [
    'url' => 'https://team.moodle.net/uploads/01E394TX0TXVCQ1DN0D48JKBRT/cat.png',
    'info' => (object) [
        'name' => 'A cat picture',
        'summary' => 'This is a cat picture, taken from somewhere on the "internet": test'
    ]
];
$resource2 = (object) [
    'url' => 'https://team.moodle.net/uploads/01E1GPC7V8EV829WBPTW64ZN4B/backup-moodle2-course-2-course_1-20190909-1514.mbz',
    'info' => (object) [
        'name' => 'A backup file',
        'summary' => 'This is a Moodle course backup taken from MoodleNet'
    ]
];

echo '
<html>
<head>
<style>
    body {
        font-size:11pt;
        color:#333333;
    }
    
    form {
        margin-bottom: 0px;
    }
    
    .wrapper {
        margin:auto;
        width:60%;
        border: solid 1px #bbbbbb;
        padding:10px;
    }
    
    .info {
        display: flex;
    }
    
    .stats {
        margin-left:10px;
    }
    
    .icon {
        width:50px;
        height:50px;
    }
    
    .valid {
        color:green;
    }
    
    .invalid {
        color:red;
    }
</style>
</head>
<body>
<br>
<div class="wrapper">
    <h3>A list of MoodleNet resources</h3>
</div>
<br>
';

if (!$site || $allcases) {
    // PNG case - no course or section.
    echo '
    <div class="wrapper">
        <div class="info">
            <img class="icon" src="' . $resource->url . '" alt="A cat" title="' . $resource->info->name . '"/>
            <div class="stats">
            Use case: User starts in MoodleNet (no course or section)<br>
            File type: png<br>
            Name: '.$resource->info->name.'<br>
            Summary: '.$resource->info->summary.'<br>
            Action: ' . htmlspecialchars($moodlesite . $endpoint) . '<br>
            POST data: <span class="valid">Valid</span>
            </div>
        </div>
        <br>
        <form name="testForm" id="testForm" action="' . $moodlesite . $endpoint . '" method="post">
            <input type="hidden" name="resourceurl" value="' . $resource->url . '"/>
            <input type="hidden" name="resource_info" value="' . htmlspecialchars(json_encode($resource->info)) . '">
            <select name="type">
                <option value="file" selected>File</option>
                <option value="link" >Link</option>
            </select>
            <input type="hidden" name="course" value="">
            <input type="hidden" name="section" value="">
            <input type="submit" value="Send to Moodle">
        </form>
    </div>
    <br>';
}

if ($site || $allcases) {
    // PNG case - course and section provided.
    echo '
    <div class="wrapper">
        <div class="info">
            <img class="icon" src="' . $resource->url . '" alt="A cat" title="' . $resource->url . '"/>
            <div class="stats">
            Use case: User starts in Moodle (course and section provided)<br>
            File type: png<br>
            Name: '.$resource->info->name.'<br>
            Summary: '.$resource->info->summary.'<br>
            Action: ' . htmlspecialchars($moodlesite . $endpoint) . '<br>
            POST data: <span class="valid">Valid</span>
            </div>
        </div>
        <br>
        <form name="testForm" id="testForm" action="' . $moodlesite . $endpoint . '" method="post">
            <input type="hidden" name="resourceurl" value="' . $resource->url . '"/>
            <input type="hidden" name="resource_info" value="' . htmlspecialchars(json_encode($resource->info)) . '">
            <select name="type">
                <option value="file" selected>File</option>
                <option value="link" >Link</option>
            </select>
            <input type="hidden" name="course" value="' . $course . '">
            <input type="hidden" name="section" value="' . $section . '">
            <input type="submit" value="Send to Moodle">
        </form>
    </div>
    <br>';
}

if (!$site || $allcases) {
    // MBZ case - no course or section.
    echo '
    <div class="wrapper">
        <div class="info">
            <img class="icon" src="https://moodlenet.prototype.moodledemo.net/theme/image.php/boost/core/1586999600/f/moodle-80" alt="Moodle backup file" title="' . $resource2->url . '"/>
            <div class="stats">
            Use case: User starts in Moodlenet (no course or section)<br>
            File type: mbz<br>
            Name: '.$resource2->info->name.'<br>
            Summary: '.$resource2->info->summary.'<br>
            Action: ' . htmlspecialchars($moodlesite . $endpoint) . '<br>
            POST data: <span class="valid">Valid</span>
            </div>
        </div>
        <br>
        <form name="testForm" id="testForm" action="' . $moodlesite . $endpoint . '" method="post">
            <input type="hidden" name="resourceurl" value="' . $resource2->url . '"/>
            <input type="hidden" name="resource_info" value="' . htmlspecialchars(json_encode($resource2->info)) . '">
            <select name="type">
                <option value="file" selected>File</option>
                <option value="link" >Link</option>
            </select>
            <input type="submit" value="Send to Moodle">
        </form>
    </div>
    <br>';
}

if ($site || $allcases) {
    // MBZ case - course and section provided.
    echo '
    <div class="wrapper">
        <div class="info">
            <img class="icon" src="https://moodlenet.prototype.moodledemo.net/theme/image.php/boost/core/1586999600/f/moodle-80" alt="Moodle backup file" title="' . $resource2->url . '"/>
            <div class="stats">
            Use case: User starts in Moodle (course and section provided)<br>
            File type: mbz<br>
            Name: '.$resource2->info->name.'<br>
            Summary: '.$resource2->info->summary.'<br>
            Action: ' . htmlspecialchars($moodlesite . $endpoint) . '<br>
            POST data: <span class="valid">Valid</span>
            </div>
        </div>
        <br>
        <form name="testForm" id="testForm" action="' . $moodlesite . $endpoint . '" method="post">
            <input type="hidden" name="resourceurl" value="' . $resource2->url . '"/>
            <input type="hidden" name="resource_info" value="' . htmlspecialchars(json_encode($resource2->info)) . '">
            <select name="type">
                <option value="file" selected>File</option>
                <option value="link" >Link</option>
            </select>
            <input type="hidden" name="course" value="' . $course . '">
            <input type="hidden" name="section" value="' . $section . '">
            <input type="submit" value="Send to Moodle">
        </form>
    </div>
    <br>';
}

if ($allcases) {
    // Invalid case - POST data missing resourceurl param.
    echo '
    <div class="wrapper">
        <div class="info">
            <img class="icon" src="https://moodlenet.prototype.moodledemo.net/theme/image.php/boost/core/1586999600/f/moodle-80" alt="Moodle backup file" title="' . $resource2->url . '"/>
            <div class="stats">
            Use case: invalid data<br>
            File type: mbz<br>
            Name: '.$resource2->info->name.'<br>
            Summary: '.$resource2->info->summary.'<br>
            Action: ' . htmlspecialchars($moodlesite . $endpoint) . '<br>
            POST data: <span class="invalid">Invalid</span>
            </div>
        </div>
        <br>
        <form action="' . $moodlesite . $endpoint . '" method="post">
            <input type="hidden" name="broken" value="' . $resource2->url . '"/>
            <input type="submit" value="Send to Moodle">
        </form>
    </div>
    <br>';
}

echo '
</div>
</body>
</html>';

