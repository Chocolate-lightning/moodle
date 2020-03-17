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
 * @package    tool_analytics
 * @copyright  2019 David Monllao {@link http://www.davidmonllao.com}
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
 * @copyright  2019 David Monllao {@link http://www.davidmonllao.com}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class external extends external_api {

    /**
     * potential_contexts parameters.
     *
     * @since  Moodle 3.8
     * @return external_function_parameters
     */
    public static function test_parameters() {
        return new external_function_parameters(
            array(
                'query' => new external_value(PARAM_RAW, 'Foo', VALUE_REQUIRED)
            )
        );
    }

    /**
     * @param  string $query
     * @return array an array of contexts
     */
    public static function test(string $query = null) {

        $params = self::validate_parameters(self::test_parameters(), ['query' => $query]);
        $input = explode("@", $params['query']);

        $url = "https://".$input[2]."/.well-known/webfinger?resource=acct%3A".$input[1]."%40".$input[2];
        $curl = new curl();
        $curl->head($url);
        $info = $curl->get_info();
        echo $info;
        $out = $curl->get($url);

        $data = json_decode($out);
        if (!empty($curl->error)) {
            echo 'curl-request-timeout';
        } else {
            if (isset($data->code) && $data->code == 'http-unreachable') {
                echo 'http-unreachable';
            } else {
                echo 'available';
            }
        }
        echo $out;
        die();
        return false;
    }

    /**

     */
    public static function test_returns() {
        return new external_single_structure([
            'result' => new external_value(PARAM_BOOL, 'foo bar')
        ]);
    }
}
