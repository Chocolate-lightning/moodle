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
 * Strings for the tool_moodlenet component.
 *
 * @package     tool_moodlenet
 * @category    string
 * @copyright   2020 Jake Dallimore <jrhdallimore@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$string['addingaresource'] = 'Adding a resource from MoodleNet';
$string['aria:enterprofile'] = "Enter your MoodleNet profile URL";
$string['aria:footermessage'] = "Browse for content on MoodleNet";
$string['browsecontentmoodlenet'] = "Or browse for content on MoodleNet";
$string['clearsearch'] = "Clear search";
$string['connectandbrowse'] = "Connect to and browse:";
$string['defaultmoodlenet'] = "Default MoodleNet URL";
$string['defaultmoodlenet_desc'] = "The Moodle HQ run instance of MoodleNet";
$string['defaultmoodlenet_desc'] = "The URL to either Moodle HQ's MoodleNet instance, or your preferred instance.";
$string['defaultmoodlenetname'] = "MoodleNet instance name";
$string['defaultmoodlenetname_desc'] = 'The name of either Moodle HQ\'s MoodleNet instance or your preferred MoodleNet instance to browse on.';
$string['enablemoodlenet'] = 'Enable MoodleNet integration';
$string['enablemoodlenet_desc'] = 'Enabling the integration allows users with the \'xx\' capability to browse MoodleNet from the
activity chooser and import MoodleNet resources into their course. It also allows users to push backups from MoodleNet into Moodle.
';
$string['errorduringdownload'] = 'An error occurred while downloading the file: {$a}';
$string['forminfo'] = "It will be automatically saved on your Moodle profile.";
$string['footermessage'] = "Or, browse for content on";
$string['instancedescription'] = "MoodleNet is an open social media platform for educators, with a focus on the collaborative curation of collections of open resources. ";
$string['instanceplaceholder'] = '@yourprofile@moodle.net';
$string['inputhelp'] = 'Or if you have a MoodleNet account already, enter your MoodleNet profile:';
$string['invalidmoodlenetprofile'] = '$userprofile is not correctly formatted';
$string['importconfirm'] = 'You are about to add the resource "{$a->resourcename}" to the course "{$a->coursename}". Please confirm if this is what you intend to do.';
$string['importconfirmnocourse'] = 'You are about to add the resource "{$a->resourcename}". Please confirm if this is what you intend to do.';
$string['importformatselectguidingtext'] = 'In which format would you like the resource "{$a->name}" to be added to your course?';
$string['importformatselectheader'] = 'Choose the resource display format';
$string['missinginvalidpostdata'] = 'The resource information from MoodleNet is either missing, or is in an incorrect format.
If this happens repeatedly, please contact the site administrator.';
$string['mnetprofile'] = 'MoodleNet profile';
$string['mnetprofiledesc'] = '<p>Enter in your MoodleNet profile details here to be redirected to your profile while visiting MoodleNet.</p>';
$string['moodlenetsettings'] = 'MoodleNet settings';
$string['moodlenetnotenabled'] = 'The MoodleNet integration must be enabled before resource imports can be processed.
To enable this feature, see the \'enablemoodlenet\' setting.';
$string['notification'] = 'You are currently adding the resource "{$a->name}". Navigate to the course you want to add the content to, or <a href="{$a->cancellink}">Cancel</a>.';
$string['searchcourses'] = "Search courses";
$string['selectacourseinfo'] = 'Please select the course in which the resource "{$a}" will be added';
$string['selecthelp'] = 'We have narrowed down the list of courses where you have the permission to create resources. If you can not find a course, please contact your Moodle administrator.';
$string['selectpagetitle'] = 'Select page';
$string['pluginname'] = 'MoodleNet';
$string['privacy:metadata'] = "The MoodleNet tool only facilitates communication with MoodleNet. It stores no data.";
$string['profilevalidationerror'] = 'There was a problem trying to validate your profile URL';
$string['profilevalidationfail'] = 'Please enter a valid MoodleNet profile URL';
$string['profilevalidationpass'] = 'Your profile has been saved, you will be redirected in a moment.';
$string['saveandgo'] = "Save and go";
$string['uploadlimitexceeded'] = 'The file size {$a->filesize} exceeds the user upload limit of {$a->uploadlimit} bytes.';
