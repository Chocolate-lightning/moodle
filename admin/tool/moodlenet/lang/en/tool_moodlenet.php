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
$string['browsemoodlenet'] = "Browse Official HQ MoodleNet";
$string['enablemoodlenet'] = 'Enable integration with MoodleNet instances';
$string['enablemoodlenetinfo'] = 'If enabled, and provided the MoodleNet plugin is installed, users can import content from MoodleNet into this site.';
$string['errorduringdownload'] = 'An error occurred while downloading the file: {$a}';
$string['invalidmoodlenetprofile'] = '$userprofile is not correctly formatted';
$string['forminfo'] = "It will be automatically saved on your Moodle profile.";
$string['importconfirm'] = 'You are about to add the resource "{$a->resourcename}" to the course "{$a->coursename}". Please confirm if this is what you intend to do.';
$string['importconfirmnocourse'] = 'You are about to add the resource "{$a->resourcename}". Please confirm if this is what you intend to do.';
$string['instancedescription'] = "Description of what you can find on MoodleNet and that you will be directed out of the Moodle site.<br />
        Description of what you can find on MoodleNet and that you will be directed out of the Moodle site.<br />
        Description of what you can find on MoodleNet and that you will be directed out of the Moodle site.<br />
        Description of what you can find on MoodleNet and that you will be directed out of the Moodle site.<br />
        <br />
        Upon an successful input you will be redirected to either hq.moodle.net or your entered domain.";
$string['instancepagetitle'] = 'Instance page';
$string['instancepageheader'] = 'Navigate to a MoodleNet instance';
$string['instanceplaceholder'] = '@yourprofile@moodle.net';
$string['inputhelp'] = 'Browse yours by entering your MoodleNet profile URL';
$string['missinginvalidpostdata'] = 'The resource information from MoodleNet is either missing, or is in an incorrect format.
If this happens repeatedly, please contact the site administrator.';
$string['mnetprofile'] = 'MoodleNet profile';
$string['mnetprofiledesc'] = '<p>Enter in your MoodleNet profile details here to be redirected to your profile while visiting MoodleNet. Do not delete.</p>';
$string['moodlenetnotenabled'] = 'The MoodleNet integration must be enabled before resource imports can be processed.
To enable this feature, see the \'enablemoodlenet\' setting.';
$string['or'] = "Or";
$string['pluginname'] = 'MoodleNet';
$string['privacy:metadata:profilefieldpurpose'] = 'Information is stored in a custom user profile field.';
$string['profilevalidationerror'] = 'There was a problem trying to validate your profile URL';
$string['profilevalidationfail'] = 'Please enter a valid MoodleNet profile URL';
$string['profilevalidationpass'] = 'Looks good!';
$string['saveandgo'] = "Save and go";
$string['uploadlimitexceeded'] = 'The file size {$a->filesize} exceeds the user upload limit of {$a->uploadlimit} bytes.';
