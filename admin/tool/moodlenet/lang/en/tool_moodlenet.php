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
$string['clearsearch'] = "Clear search";
$string['enablemoodlenet'] = 'Enable the MoodleNet integration';
$string['enablemoodlenetinfo'] = 'Enabling the integration allows users with the \'xx\' capability to browse MoodleNet from the
activity chooser and import MoodleNet resources into their course. It also allows users to push backups from MoodleNet into Moodle.
';
$string['errorduringdownload'] = 'An error occurred while downloading the file: {$a}';
$string['importconfirm'] = 'You are about to add the resource "{$a->resourcename}" to the course "{$a->coursename}". Please confirm if this is what you intend to do.';
$string['importconfirmnocourse'] = 'You are about to add the resource "{$a->resourcename}". Please confirm if this is what you intend to do.';
$string['importformatselectguidingtext'] = 'In which format would you like the resource "{$a->name}" to be added to your course?';
$string['importformatselectheader'] = 'Choose the resource display format';
$string['missinginvalidpostdata'] = 'The resource information from MoodleNet is either missing, or is in an incorrect format.
If this happens repeatedly, please contact the site administrator.';
$string['mnetprofile'] = 'MoodleNet profile';
$string['mnetprofiledesc'] = '<p>Enter in your MoodleNet profile details here to be redirected to your profile while visiting MoodleNet.</p>';
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
$string['profilevalidationpass'] = 'Looks good!';
$string['uploadlimitexceeded'] = 'The file size {$a->filesize} exceeds the user upload limit of {$a->uploadlimit} bytes.';
