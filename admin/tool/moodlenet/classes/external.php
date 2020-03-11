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
 * This is the external API for this component.
 *
 * @package    tool_moodlenet
 * @copyright  2020 Mathew May {@link https://mathew.solutions}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace tool_moodlenet;

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir .'/externallib.php');
require_once($CFG->libdir . '/filelib.php');

use external_api;
use external_function_parameters;
use external_value;
use external_single_structure;
use curl;

/**
 * This is the external API for this component.
 *
 * @copyright  2020 Mathew May {@link https://mathew.solutions}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class external extends external_api {

    /**
     * verify_webfinger parameters
     *
     * @return external_function_parameters
     */
    public static function verify_webfinger_parameters() {
        return new external_function_parameters(
            array(
                'profileurl' => new external_value(PARAM_RAW, 'The profile url that the user has given us', VALUE_REQUIRED),
            )
        );
    }

    /**
     * Figure out if the passed content resolves with a WebFinger account.
     *
     * @param string $profileurl The profile url that the user states exists
     * @return array Contains the result and domain if any
     * @throws \invalid_parameter_exception
     */
    public static function verify_webfinger(string $profileurl) {
        global $USER;

        $params = self::validate_parameters(self::verify_webfinger_parameters(), ['profileurl' => $profileurl]);
        try {
            $mnetprofile = new moodlenet_user_profile($params['profileurl'], $USER->id);
        } catch (\Exception $e) {
            return [
                'result' => false,
                'message' => get_string('profilevalidationfail', 'tool_moodlenet'),
            ];
        }

        $userlink = profile_manager::get_moodlenet_profile_link($mnetprofile);

        // There were no problems verifying the account so lets store it.
        if($userlink['result'] === true) {
            profile_manager::save_moodlenet_user_profile($mnetprofile);
        }
        return $userlink;
    }

    /**
     * verify_webfinger return.
     *
     * @return \external_description
     */
    public static function verify_webfinger_returns() {
        return new external_single_structure([
            'result' => new external_value(PARAM_BOOL, 'Was the passed content a valid WebFinger?'),
            'message' => new external_value(PARAM_TEXT, 'Our message for the user'),
            'domain' => new external_value(PARAM_RAW, 'Domain to redirect the user to', VALUE_OPTIONAL),
        ]);
    }
}
