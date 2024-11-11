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

namespace core_ltix;

defined('MOODLE_INTERNAL') || die();
global $CFG;
require_once($CFG->dirroot . '/ltix/constants.php');

use core_ltix\local\ltiopenid\registration_helper;
use core_ltix\local\ltiopenid\jwks_helper;
use core_ltix\local\ltiservice\service_helper;
use core_component;
use core_text;
use core_useragent;
use curl;
use DateTime;
use DateTimeZone;
use DOMDocument;
use DOMXPath;
use moodle_exception;
use coding_exception;
use moodle_url;
use stdClass;
use Firebase\JWT\JWT;
use ltixservice_basicoutcomes\local\service\basicoutcomes;

/**
 * Helper class specifically dealing with LTI tools.
 *
 * @package    core_ltix
 * @author     Alex Morris <alex.morris@catalyst.net.nz>
 * @copyright  2023 Catalyst IT
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class helper {

    public static function get_tools_by_domain($domain, $state = null, $courseid = null) {
        global $DB, $SITE;

        $statefilter = '';
        $coursefilter = '';

        if ($state) {
            $statefilter = 'AND t.state = :state';
        }

        if ($courseid && $courseid != $SITE->id) {
            $coursefilter = 'OR t.course = :courseid';
        }

        $coursecategory = $DB->get_field('course', 'category', ['id' => $courseid]);
        $query = "SELECT t.*
                FROM {lti_types} t
           LEFT JOIN {lti_types_categories} tc on t.id = tc.typeid
               WHERE t.tooldomain = :tooldomain
                 AND (t.course = :siteid $coursefilter)
                 $statefilter
                 AND (tc.id IS NULL OR tc.categoryid = :categoryid)";

        return $DB->get_records_sql($query, [
            'courseid' => $courseid,
            'siteid' => $SITE->id,
            'tooldomain' => $domain,
            'state' => $state,
            'categoryid' => $coursecategory
        ]);
    }

    public static function get_domain_from_url($url) {
        $matches = [];

        if (preg_match(LTI_URL_DOMAIN_REGEX, $url ?? '', $matches)) {
            return $matches[1];
        }
    }

    public static function get_tools_by_url($url, $state, $courseid = null) {
        $domain = self::get_domain_from_url($url);

        return self::get_tools_by_domain($domain, $state, $courseid);
    }

    public static function get_tool_by_url_match($url, $courseid = null, $state = LTI_TOOL_STATE_CONFIGURED) {
        $possibletools = self::get_tools_by_url($url, $state, $courseid);

        return self::get_best_tool_by_url($url, $possibletools, $courseid);
    }

    public static function get_best_tool_by_url($url, $tools, $courseid = null) {
        if (count($tools) === 0) {
            return null;
        }

        $urllower = self::get_url_thumbprint($url);

        foreach ($tools as $tool) {
            $tool->_matchscore = 0;

            $toolbaseurllower = self::get_url_thumbprint($tool->baseurl);

            if ($urllower === $toolbaseurllower) {
                // 100 points for exact thumbprint match.
                $tool->_matchscore += 100;
            } else if (substr($urllower, 0, strlen($toolbaseurllower)) === $toolbaseurllower) {
                // 50 points if tool thumbprint starts with the base URL thumbprint.
                $tool->_matchscore += 50;
            }

            // Prefer course tools over site tools.
            if (!empty($courseid)) {
                // Minus 10 points for not matching the course id (global tools).
                if ($tool->course != $courseid) {
                    $tool->_matchscore -= 10;
                }
            }
        }

        $bestmatch = array_reduce($tools, function($value, $tool) {
            if ($tool->_matchscore > $value->_matchscore) {
                return $tool;
            } else {
                return $value;
            }

        }, (object) array('_matchscore' => -1));

        // None of the tools are suitable for this URL.
        if ($bestmatch->_matchscore <= 0) {
            return null;
        }

        return $bestmatch;
    }

    public static function get_url_thumbprint($url) {
        // Parse URL requires a schema otherwise everything goes into 'path'.  Fixed 5.4.7 or later.
        if (preg_match('/https?:\/\//', $url) !== 1) {
            $url = 'http://' . $url;
        }
        $urlparts = parse_url(strtolower($url));
        if (!isset($urlparts['path'])) {
            $urlparts['path'] = '';
        }

        if (!isset($urlparts['query'])) {
            $urlparts['query'] = '';
        }

        if (!isset($urlparts['host'])) {
            $urlparts['host'] = '';
        }

        if (substr($urlparts['host'], 0, 4) === 'www.') {
            $urlparts['host'] = substr($urlparts['host'], 4);
        }

        $urllower = $urlparts['host'] . '/' . $urlparts['path'];

        if ($urlparts['query'] != '') {
            $urllower .= '?' . $urlparts['query'];
        }

        return $urllower;
    }

    /**
     * Update the database with a tool proxy instance
     *
     * @param object $config Tool proxy definition
     *
     * @return int  Record id number
     */
    public static function add_tool_proxy($config) {
        global $USER, $DB;

        $toolproxy = new \stdClass();
        if (isset($config->lti_registrationname)) {
            $toolproxy->name = trim($config->lti_registrationname);
        }
        if (isset($config->lti_registrationurl)) {
            $toolproxy->regurl = trim($config->lti_registrationurl);
        }
        if (isset($config->lti_capabilities)) {
            $toolproxy->capabilityoffered = implode("\n", $config->lti_capabilities);
        } else {
            $toolproxy->capabilityoffered = implode("\n", array_keys(self::get_capabilities()));
        }
        if (isset($config->lti_services)) {
            $toolproxy->serviceoffered = implode("\n", $config->lti_services);
        } else {
            $func = function($s) {
                return $s->get_id();
            };
            $servicenames = array_map($func, self::get_services());
            $toolproxy->serviceoffered = implode("\n", $servicenames);
        }
        if (isset($config->toolproxyid) && !empty($config->toolproxyid)) {
            $toolproxy->id = $config->toolproxyid;
            if (!isset($toolproxy->state) || ($toolproxy->state != LTI_TOOL_PROXY_STATE_ACCEPTED)) {
                $toolproxy->state = LTI_TOOL_PROXY_STATE_CONFIGURED;
                $toolproxy->guid = random_string();
                $toolproxy->secret = random_string();
            }
            $id = self::update_tool_proxy($toolproxy);
        } else {
            $toolproxy->state = LTI_TOOL_PROXY_STATE_CONFIGURED;
            $toolproxy->timemodified = time();
            $toolproxy->timecreated = $toolproxy->timemodified;
            if (!isset($toolproxy->createdby)) {
                $toolproxy->createdby = $USER->id;
            }
            $toolproxy->guid = random_string();
            $toolproxy->secret = random_string();
            $id = $DB->insert_record('lti_tool_proxies', $toolproxy);
        }

        return $id;
    }

    /**
     * Initializes an array with the services supported by the LTI module
     *
     * @return array List of services
     */
    public static function get_services() {
        $services = array();
        $definedltixservices = core_component::get_plugin_list('ltixservice');

        foreach ($definedltixservices as $name => $location) {
            $classname = "\\ltixservice_{$name}\\local\\service\\{$name}";
            $services[] = new $classname();
        }
        return $services;
    }
    /**
     * Updates a tool proxy in the database
     *
     * @param object $toolproxy Tool proxy
     *
     * @return int    Record id number
     */
    public static function update_tool_proxy($toolproxy) {
        global $DB;

        $toolproxy->timemodified = time();
        $id = $DB->update_record('lti_tool_proxies', $toolproxy);

        return $id;
    }

    /**
     * Delete a Tool Proxy
     *
     * @param int $id   Tool Proxy id
     */
    public static function delete_tool_proxy($id) {
        global $DB;
        $DB->delete_records('lti_tool_settings', array('toolproxyid' => $id));
        $tools = $DB->get_records('lti_types', array('toolproxyid' => $id));
        foreach ($tools as $tool) {
            self::delete_type($tool->id);
        }
        $DB->delete_records('lti_tool_proxies', array('id' => $id));
    }

    /**
     * Get SQL to query DB for LTI tool proxy records.
     *
     * @param bool $orphanedonly If true, return SQL to get orphaned proxies only.
     * @param bool $count If true, return SQL to get the count of the records instead of the records themselves.
     * @return string SQL.
     */
    public static function get_tool_proxy_sql(bool $orphanedonly = false, bool $count = false): string {
        if ($count) {
            $select = "SELECT count(*) as type_count";
            $sort = "";
        } else {
            // We only want the fields from lti_tool_proxies table. Must define every column to be compatible with mysqli.
            $select = "SELECT ltp.id, ltp.name, ltp.regurl, ltp.state, ltp.guid, ltp.secret, ltp.vendorcode,
                              ltp.capabilityoffered, ltp.serviceoffered, ltp.toolproxy, ltp.createdby,
                              ltp.timecreated, ltp.timemodified";
            $sort = " ORDER BY ltp.name ASC, ltp.state DESC, ltp.timemodified DESC";
        }
        $from = " FROM {lti_tool_proxies} ltp";
        if ($orphanedonly) {
            $join = " LEFT JOIN {lti_types} lt ON ltp.id = lt.toolproxyid";
            $where = " WHERE lt.toolproxyid IS null";
        } else {
            $join = "";
            $where = "";
        }

        return $select . $from . $join . $where . $sort;
    }

    /**
     * This function builds the request that must be sent to an LTI 2 tool provider
     *
     * @param object    $tool           Basic LTI tool object
     * @param array     $params         Custom launch parameters
     *
     * @return array                    Request details
     */
    public static function build_request_lti2($tool, $params) {

        $requestparams = [];

        $capabilities = self::get_capabilities();
        $enabledcapabilities = explode("\n", $tool->enabledcapability);
        foreach ($enabledcapabilities as $capability) {
            if (array_key_exists($capability, $capabilities)) {
                $val = $capabilities[$capability];
                if ($val && (substr($val, 0, 1) != '$')) {
                    if (isset($params[$val])) {
                        $requestparams[$capabilities[$capability]] = $params[$capabilities[$capability]];
                    }
                }
            }
        }

        return $requestparams;

    }

    /**
     * Processes the tool provider's response to the ContentItemSelectionRequest and builds the configuration data from the
     * selected content item. This configuration data can be then used when adding a tool into the course.
     *
     * @param int $typeid The tool type ID.
     * @param string $messagetype The value for the lti_message_type parameter.
     * @param string $ltiversion The value for the lti_version parameter.
     * @param string $consumerkey The consumer key.
     * @param string $contentitemsjson The JSON string for the content_items parameter.
     * @return stdClass The array of module information objects.
     * @throws moodle_exception
     * @throws \core_ltix\OAuthException
     */
    public static function tool_configuration_from_content_item($typeid, $messagetype, $ltiversion, $consumerkey, $contentitemsjson) {
        $tool = self::get_type($typeid);
        // Validate parameters.
        if (!$tool) {
            throw new moodle_exception('errortooltypenotfound', 'core_ltix');
        }
        // Check lti_message_type. Show debugging if it's not set to ContentItemSelection.
        // No need to throw exceptions for now since lti_message_type does not seem to be used in this processing at the moment.
        if ($messagetype !== 'ContentItemSelection') {
            debugging("lti_message_type is invalid: {$messagetype}. It should be set to 'ContentItemSelection'.",
                DEBUG_DEVELOPER);
        }

        // Check LTI versions from our side and the response's side. Show debugging if they don't match.
        // No need to throw exceptions for now since LTI version does not seem to be used in this processing at the moment.
        $expectedversion = $tool->ltiversion;
        $islti2 = ($expectedversion === LTI_VERSION_2);
        if ($ltiversion !== $expectedversion) {
            debugging("lti_version from response does not match the tool's configuration. Tool: {$expectedversion}," .
                " Response: {$ltiversion}", DEBUG_DEVELOPER);
        }

        $items = json_decode($contentitemsjson);
        if (empty($items)) {
            throw new moodle_exception('errorinvaliddata', 'core_ltix', '', $contentitemsjson);
        }
        if (!isset($items->{'@graph'}) || !is_array($items->{'@graph'})) {
            throw new moodle_exception('errorinvalidresponseformat', 'core_ltix');
        }

        $config = null;
        $items = $items->{'@graph'};
        if (!empty($items)) {
            $typeconfig = self::get_type_type_config($tool->id);
            if (count($items) == 1) {
                $config = self::content_item_to_form($tool, $typeconfig, $items[0]);
            } else {
                $multiple = [];
                foreach ($items as $item) {
                    $multiple[] = self::content_item_to_form($tool, $typeconfig, $item);
                }
                $config = new stdClass();
                $config->multiple = $multiple;
            }
        }
        return $config;
    }

    /**
     * Converts LTI 1.1 Content Item for LTI Link to Form data.
     *
     * @param object $tool Tool for which the item is created for.
     * @param object $typeconfig The tool configuration.
     * @param object $item Item populated from JSON to be converted to Form form
     *
     * @return stdClass Form config for the item
     */
    public static function content_item_to_form(object $tool, object $typeconfig, object $item): stdClass {
        global $OUTPUT;

        $config = new stdClass();
        $config->name = '';
        if (isset($item->title)) {
            $config->name = $item->title;
        }
        if (empty($config->name)) {
            $config->name = $tool->name;
        }
        if (isset($item->text)) {
            $config->introeditor = [
                'text' => $item->text,
                'format' => FORMAT_PLAIN
            ];
        } else {
            $config->introeditor = [
                'text' => '',
                'format' => FORMAT_PLAIN
            ];
        }
        if (isset($item->icon->{'@id'})) {
            $iconurl = new moodle_url($item->icon->{'@id'});
            // Assign item's icon URL to secureicon or icon depending on its scheme.
            if (strtolower($iconurl->get_scheme()) === 'https') {
                $config->secureicon = $iconurl->out(false);
            } else {
                $config->icon = $iconurl->out(false);
            }
        }
        if (isset($item->url)) {
            $url = new moodle_url($item->url);
            $config->toolurl = $url->out(false);
            $config->typeid = 0;
        } else {
            $config->typeid = $tool->id;
        }
        $config->instructorchoiceacceptgrades = LTI_SETTING_NEVER;
        $islti2 = $tool->ltiversion === LTI_VERSION_2;
        if (!$islti2 && isset($typeconfig->lti_acceptgrades)) {
            $acceptgrades = $typeconfig->lti_acceptgrades;
            if ($acceptgrades == LTI_SETTING_ALWAYS) {
                // We create a line item regardless if the definition contains one or not.
                $config->instructorchoiceacceptgrades = LTI_SETTING_ALWAYS;
                $config->grade_modgrade_point = 100;
            }
            if ($acceptgrades == LTI_SETTING_DELEGATE || $acceptgrades == LTI_SETTING_ALWAYS) {
                if (isset($item->lineItem)) {
                    $lineitem = $item->lineItem;
                    $config->instructorchoiceacceptgrades = LTI_SETTING_ALWAYS;
                    $maxscore = 100;
                    if (isset($lineitem->scoreConstraints)) {
                        $sc = $lineitem->scoreConstraints;
                        if (isset($sc->totalMaximum)) {
                            $maxscore = $sc->totalMaximum;
                        } else if (isset($sc->normalMaximum)) {
                            $maxscore = $sc->normalMaximum;
                        }
                    }
                    $config->grade_modgrade_point = $maxscore;
                    $config->lineitemresourceid = '';
                    $config->lineitemtag = '';
                    $config->lineitemsubreviewurl = '';
                    $config->lineitemsubreviewparams = '';
                    if (isset($lineitem->assignedActivity) && isset($lineitem->assignedActivity->activityId)) {
                        $config->lineitemresourceid = $lineitem->assignedActivity->activityId?:'';
                    }
                    if (isset($lineitem->tag)) {
                        $config->lineitemtag = $lineitem->tag?:'';
                    }
                    if (isset($lineitem->submissionReview)) {
                        $subreview = $lineitem->submissionReview;
                        $config->lineitemsubreviewurl = 'DEFAULT';
                        if (!empty($subreview->url)) {
                            $config->lineitemsubreviewurl = $subreview->url;
                        }
                        if (isset($subreview->custom)) {
                            $config->lineitemsubreviewparams = self::params_to_string($subreview->custom);
                        }
                    }
                }
            }
        }
        $config->instructorchoicesendname = LTI_SETTING_NEVER;
        $config->instructorchoicesendemailaddr = LTI_SETTING_NEVER;

        // Since 4.3, the launch container is dictated by the value set in tool configuration and isn't controllable by content items.
        $config->launchcontainer = LTI_LAUNCH_CONTAINER_DEFAULT;

        if (isset($item->custom)) {
            $config->instructorcustomparameters = self::params_to_string($item->custom);
        }

        // Pass an indicator to the relevant form field.
        $config->selectcontentindicator = $OUTPUT->pix_icon('i/valid', get_string('yes')) . get_string('contentselected', 'core_ltix');

        return $config;
    }

    /**
     * Converts the new Deep-Linking format for Content-Items to the old format.
     *
     * @param string $param JSON string representing new Deep-Linking format
     * @return string  JSON representation of content-items
     */
    public static function convert_content_items($param) {
        $items = [];
        $json = json_decode($param);
        if (!empty($json) && is_array($json)) {
            foreach ($json as $item) {
                if (isset($item->type)) {
                    $newitem = clone $item;
                    switch ($item->type) {
                        case 'ltiResourceLink':
                            $newitem->{'@type'} = 'LtiLinkItem';
                            $newitem->mediaType = 'application\/vnd.ims.lti.v1.ltilink';
                            break;
                        case 'link':
                        case 'rich':
                            $newitem->{'@type'} = 'ContentItem';
                            $newitem->mediaType = 'text/html';
                            break;
                        case 'file':
                            $newitem->{'@type'} = 'FileItem';
                            break;
                    }
                    unset($newitem->type);
                    if (isset($item->html)) {
                        $newitem->text = $item->html;
                        unset($newitem->html);
                    }
                    if (isset($item->iframe)) {
                        // DeepLinking allows multiple options to be declared as supported.
                        // We favor iframe over new window if both are specified.
                        $newitem->placementAdvice = new stdClass();
                        $newitem->placementAdvice->presentationDocumentTarget = 'iframe';
                        if (isset($item->iframe->width)) {
                            $newitem->placementAdvice->displayWidth = $item->iframe->width;
                        }
                        if (isset($item->iframe->height)) {
                            $newitem->placementAdvice->displayHeight = $item->iframe->height;
                        }
                        unset($newitem->iframe);
                        unset($newitem->window);
                    } else if (isset($item->window)) {
                        $newitem->placementAdvice = new stdClass();
                        $newitem->placementAdvice->presentationDocumentTarget = 'window';
                        if (isset($item->window->targetName)) {
                            $newitem->placementAdvice->windowTarget = $item->window->targetName;
                        }
                        if (isset($item->window->width)) {
                            $newitem->placementAdvice->displayWidth = $item->window->width;
                        }
                        if (isset($item->window->height)) {
                            $newitem->placementAdvice->displayHeight = $item->window->height;
                        }
                        unset($newitem->window);
                    } else if (isset($item->presentation)) {
                        // This may have been part of an early draft but is not in the final spec
                        // so keeping it around for now in case it's actually been used.
                        $newitem->placementAdvice = new stdClass();
                        if (isset($item->presentation->documentTarget)) {
                            $newitem->placementAdvice->presentationDocumentTarget = $item->presentation->documentTarget;
                        }
                        if (isset($item->presentation->windowTarget)) {
                            $newitem->placementAdvice->windowTarget = $item->presentation->windowTarget;
                        }
                        if (isset($item->presentation->width)) {
                            $newitem->placementAdvice->dislayWidth = $item->presentation->width;
                        }
                        if (isset($item->presentation->height)) {
                            $newitem->placementAdvice->dislayHeight = $item->presentation->height;
                        }
                        unset($newitem->presentation);
                    }
                    if (isset($item->icon) && isset($item->icon->url)) {
                        $newitem->icon->{'@id'} = $item->icon->url;
                        unset($newitem->icon->url);
                    }
                    if (isset($item->thumbnail) && isset($item->thumbnail->url)) {
                        $newitem->thumbnail->{'@id'} = $item->thumbnail->url;
                        unset($newitem->thumbnail->url);
                    }
                    if (isset($item->lineItem)) {
                        unset($newitem->lineItem);
                        $newitem->lineItem = new stdClass();
                        $newitem->lineItem->{'@type'} = 'LineItem';
                        $newitem->lineItem->reportingMethod = 'http://purl.imsglobal.org/ctx/lis/v2p1/Result#totalScore';
                        if (isset($item->lineItem->label)) {
                            $newitem->lineItem->label = $item->lineItem->label;
                        }
                        if (isset($item->lineItem->resourceId)) {
                            $newitem->lineItem->assignedActivity = new stdClass();
                            $newitem->lineItem->assignedActivity->activityId = $item->lineItem->resourceId;
                        }
                        if (isset($item->lineItem->tag)) {
                            $newitem->lineItem->tag = $item->lineItem->tag;
                        }
                        if (isset($item->lineItem->scoreMaximum)) {
                            $newitem->lineItem->scoreConstraints = new stdClass();
                            $newitem->lineItem->scoreConstraints->{'@type'} = 'NumericLimits';
                            $newitem->lineItem->scoreConstraints->totalMaximum = $item->lineItem->scoreMaximum;
                        }
                        if (isset($item->lineItem->submissionReview)) {
                            $newitem->lineItem->submissionReview = $item->lineItem->submissionReview;
                        }
                    }
                    $items[] = $newitem;
                }
            }
        }

        $newitems = new stdClass();
        $newitems->{'@context'} = 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem';
        $newitems->{'@graph'} = $items;

        return json_encode($newitems);
    }

    /**
     * Extracts the enabled capabilities into an array, including those implicitly declared in a parameter
     *
     * @param object $tool  Tool instance object
     *
     * @return array List of enabled capabilities
     */
    public static function get_enabled_capabilities($tool) {
        if (!isset($tool)) {
            return [];
        }
        if (!empty($tool->enabledcapability)) {
            $enabledcapabilities = explode("\n", $tool->enabledcapability);
        } else {
            $enabledcapabilities = [];
        }
        if (!empty($tool->parameter)) {
            $paramstr = str_replace("\r\n", "\n", $tool->parameter);
            $paramstr = str_replace("\n\r", "\n", $paramstr);
            $paramstr = str_replace("\r", "\n", $paramstr);
            $params = explode("\n", $paramstr);
            foreach ($params as $param) {
                $pos = strpos($param, '=');
                if (($pos === false) || ($pos < 1)) {
                    continue;
                }
                $value = trim(core_text::substr($param, $pos + 1, strlen($param)));
                if (substr($value, 0, 1) == '$') {
                    $value = substr($value, 1);
                    if (!in_array($value, $enabledcapabilities)) {
                        $enabledcapabilities[] = $value;
                    }
                }
            }
        }
        return $enabledcapabilities;
    }

    /**
     * Splits the custom parameters
     *
     * @param string    $customstr      String containing the parameters
     *
     * @return array of custom parameters
     */
    public static function split_parameters($customstr) {
        $customstr = str_replace("\r\n", "\n", $customstr);
        $customstr = str_replace("\n\r", "\n", $customstr);
        $customstr = str_replace("\r", "\n", $customstr);
        $lines = explode("\n", $customstr);  // Or should this split on "/[\n;]/"?
        $retval = [];
        foreach ($lines as $line) {
            $pos = strpos($line, '=');
            if ( $pos === false || $pos < 1 ) {
                continue;
            }
            $key = trim(core_text::substr($line, 0, $pos));
            $val = trim(core_text::substr($line, $pos + 1, strlen($line)));
            $retval[$key] = $val;
        }
        return $retval;
    }

    /**
     * Splits the custom parameters field to the various parameters
     *
     * @param object    $toolproxy      Tool proxy instance object
     * @param object    $tool           Tool instance object
     * @param array     $params         LTI launch parameters
     * @param string    $customstr      String containing the parameters
     * @param boolean   $islti2         True if an LTI 2 tool is being launched
     *
     * @return array of custom parameters
     */
    public static function split_custom_parameters($toolproxy, $tool, $params, $customstr, $islti2 = false) {
        $splitted = self::split_parameters($customstr);
        $retval = [];
        foreach ($splitted as $key => $val) {
            $val = self::parse_custom_parameter($toolproxy, $tool, $params, $val, $islti2);
            $key2 = self::map_keyname($key);
            $retval['custom_'.$key2] = $val;
            if (($islti2 || ($tool->ltiversion === LTI_VERSION_1P3)) && ($key != $key2)) {
                $retval['custom_'.$key] = $val;
            }
        }
        return $retval;
    }

    /**
     * Adds the custom parameters to an array
     *
     * @param object    $toolproxy      Tool proxy instance object
     * @param object    $tool           Tool instance object
     * @param array     $params         LTI launch parameters
     * @param array     $parameters     Array containing the parameters
     *
     * @return array    Array of custom parameters
     */
    public static function get_custom_parameters($toolproxy, $tool, $params, $parameters) {
        $retval = [];
        foreach ($parameters as $key => $val) {
            $key2 = self::map_keyname($key);
            $val = self::parse_custom_parameter($toolproxy, $tool, $params, $val, true);
            $retval['custom_'.$key2] = $val;
            if ($key != $key2) {
                $retval['custom_'.$key] = $val;
            }
        }
        return $retval;
    }

    /**
     * Parse a custom parameter to replace any substitution variables
     *
     * @param object    $toolproxy      Tool proxy instance object
     * @param object    $tool           Tool instance object
     * @param array     $params         LTI launch parameters
     * @param string    $value          Custom parameter value
     * @param boolean   $islti2         True if an LTI 2 tool is being launched
     *
     * @return string Parsed value of custom parameter
     */
    public static function parse_custom_parameter($toolproxy, $tool, $params, $value, $islti2) {
        // This is required as {${$valarr[0]}->{$valarr[1]}}" may be using the USER or COURSE var.
        global $USER, $COURSE;

        if ($value) {
            if (substr($value, 0, 1) == '\\') {
                $value = substr($value, 1);
            } else if (substr($value, 0, 1) == '$') {
                $value1 = substr($value, 1);
                $enabledcapabilities = self::get_enabled_capabilities($tool);
                if (!$islti2 || in_array($value1, $enabledcapabilities)) {
                    $capabilities = self::get_capabilities();
                    if (array_key_exists($value1, $capabilities)) {
                        $val = $capabilities[$value1];
                        if ($val) {
                            if (substr($val, 0, 1) != '$') {
                                $value = $params[$val];
                            } else {
                                $valarr = explode('->', substr($val, 1), 2);
                                $value = "{${$valarr[0]}->{$valarr[1]}}";
                                $value = str_replace('<br />' , ' ', $value);
                                $value = str_replace('<br>' , ' ', $value);
                                $value = format_string($value);
                            }
                        } else {
                            $value = self::calculate_custom_parameter($value1);
                        }
                    } else {
                        $val = $value;
                        $services = self::get_services();
                        foreach ($services as $service) {
                            $service->set_tool_proxy($toolproxy);
                            $service->set_type($tool);
                            $value = $service->parse_value($val);
                            if ($val != $value) {
                                break;
                            }
                        }
                    }
                }
            }
        }
        return $value;
    }

    /**
     * Calculates the value of a custom parameter that has not been specified earlier
     *
     * @param string    $value          Custom parameter value
     *
     * @return string Calculated value of custom parameter
     */
    public static function calculate_custom_parameter($value) {
        global $USER, $COURSE;

        switch ($value) {
            case 'Moodle.Person.userGroupIds':
                return implode(",", groups_get_user_groups($COURSE->id, $USER->id)[0]);
            case 'Context.id.history':
                return implode(",", self::get_course_history($COURSE));
            case 'CourseSection.timeFrame.begin':
                if (empty($COURSE->startdate)) {
                    return "";
                }
                $dt = new DateTime("@$COURSE->startdate", new DateTimeZone('UTC'));
                return $dt->format(DateTime::ATOM);
            case 'CourseSection.timeFrame.end':
                if (empty($COURSE->enddate)) {
                    return "";
                }
                $dt = new DateTime("@$COURSE->enddate", new DateTimeZone('UTC'));
                return $dt->format(DateTime::ATOM);
        }
        return null;
    }

    /**
     * Build the history chain for this course using the course originalcourseid.
     *
     * @param object $course course for which the history is returned.
     *
     * @return array ids of the source course in ancestry order, immediate parent 1st.
     */
    public static function get_course_history($course) {
        global $DB;
        $history = [];
        $parentid = $course->originalcourseid;
        while (!empty($parentid) && !in_array($parentid, $history)) {
            $history[] = $parentid;
            $parentid = $DB->get_field('course', 'originalcourseid', array('id' => $parentid));
        }
        return $history;
    }

    /**
     * Used for building the names of the different custom parameters
     *
     * @param string $key   Parameter name
     * @param bool $tolower Do we want to convert the key into lower case?
     * @return string       Processed name
     */
    public static function map_keyname($key, $tolower = true) {
        if ($tolower) {
            $newkey = '';
            $key = core_text::strtolower(trim($key));
            foreach (str_split($key) as $ch) {
                if ( ($ch >= 'a' && $ch <= 'z') || ($ch >= '0' && $ch <= '9') ) {
                    $newkey .= $ch;
                } else {
                    $newkey .= '_';
                }
            }
        } else {
            $newkey = $key;
        }
        return $newkey;
    }

    /**
     * Given an array of tools, filter them based on their state
     *
     * @param array $tools An array of lti_types records
     * @param int $state One of the LTI_TOOL_STATE_* constants
     * @return array
     */
    public static function filter_tool_types(array $tools, $state) {
        $return = [];
        foreach ($tools as $key => $tool) {
            if ($tool->state == $state) {
                $return[$key] = $tool;
            }
        }
        return $return;
    }

    /**
     * Given an array of tool proxies, filter them based on their state
     *
     * @param array $toolproxies An array of lti_tool_proxies records
     * @param int $state One of the LTI_TOOL_PROXY_STATE_* constants
     *
     * @return array
     */
    public static function filter_tool_proxy_types(array $toolproxies, $state) {
        $return = [];
        foreach ($toolproxies as $key => $toolproxy) {
            if ($toolproxy->state == $state) {
                $return[$key] = $toolproxy;
            }
        }
        return $return;
    }

    /**
     * Get the tool proxy instance given its GUID
     *
     * @param string  $toolproxyguid   Tool proxy GUID value
     *
     * @return object
     */
    public static function get_tool_proxy_from_guid($toolproxyguid) {
        global $DB;

        $toolproxy = $DB->get_record('lti_tool_proxies', array('guid' => $toolproxyguid));

        return $toolproxy;
    }

    /**
     * Get the tool proxy instance given its registration URL
     *
     * @param string $regurl Tool proxy registration URL
     *
     * @return array The record of the tool proxy with this url
     */
    public static function get_tool_proxies_from_registration_url($regurl) {
        global $DB;

        return $DB->get_records_sql(
            'SELECT * FROM {lti_tool_proxies}
        WHERE '.$DB->sql_compare_text('regurl', 256).' = :regurl',
            array('regurl' => $regurl)
        );
    }

    /**
     * Generates some of the tool proxy configuration based on the admin configuration details
     *
     * @param int $id
     *
     * @return mixed Tool Proxy details
     */
    public static function get_tool_proxy($id) {
        global $DB;

        $toolproxy = $DB->get_record('lti_tool_proxies', array('id' => $id));
        return $toolproxy;
    }

    /**
     * Returns lti tool proxies.
     *
     * @param bool $orphanedonly Only retrieves tool proxies that have no type associated with them
     * @return array of basicLTI types
     */
    public static function get_tool_proxies($orphanedonly) {
        global $DB;

        if ($orphanedonly) {
            $usedproxyids = array_values($DB->get_fieldset_select('lti_types', 'toolproxyid', 'toolproxyid IS NOT NULL'));
            $proxies = $DB->get_records('lti_tool_proxies', null, 'state DESC, timemodified DESC');
            foreach ($proxies as $key => $value) {
                if (in_array($value->id, $usedproxyids)) {
                    unset($proxies[$key]);
                }
            }
            return $proxies;
        } else {
            return $DB->get_records('lti_tool_proxies', null, 'state DESC, timemodified DESC');
        }
    }

    /**
     * Generates some of the tool proxy configuration based on the admin configuration details
     *
     * @param int $id
     *
     * @return mixed  Tool Proxy details
     */
    public static function get_tool_proxy_config($id) {
        $toolproxy = self::get_tool_proxy($id);

        $tp = new \stdClass();
        $tp->lti_registrationname = $toolproxy->name;
        $tp->toolproxyid = $toolproxy->id;
        $tp->state = $toolproxy->state;
        $tp->lti_registrationurl = $toolproxy->regurl;
        $tp->lti_capabilities = explode("\n", $toolproxy->capabilityoffered);
        $tp->lti_services = explode("\n", $toolproxy->serviceoffered);

        return $tp;
    }

    /**
     * Gets the tool settings
     *
     * @param int  $toolproxyid   Id of tool proxy record (or tool ID if negative)
     * @param int  $courseid      Id of course (null if system settings)
     * @param int  $instanceid    Id of course module (null if system or context settings)
     *
     * @return array  Array settings
     */
    public static function get_tool_settings($toolproxyid, $courseid = null, $instanceid = null) {
        global $DB;

        $settings = [];
        if ($toolproxyid > 0) {
            $settingsstr = $DB->get_field('lti_tool_settings', 'settings', array('toolproxyid' => $toolproxyid,
                'course' => $courseid, 'coursemoduleid' => $instanceid));
        } else {
            $settingsstr = $DB->get_field('lti_tool_settings', 'settings', array('typeid' => -$toolproxyid,
                'course' => $courseid, 'coursemoduleid' => $instanceid));
        }
        if ($settingsstr !== false) {
            $settings = json_decode($settingsstr, true);
        }
        return $settings;
    }

    /**
     * Sets the tool settings (
     *
     * @param array  $settings      Array of settings
     * @param int    $toolproxyid   Id of tool proxy record (or tool ID if negative)
     * @param int    $courseid      Id of course (null if system settings)
     * @param int    $instanceid    Id of course module (null if system or context settings)
     */
    public static function set_tool_settings($settings, $toolproxyid, $courseid = null, $instanceid = null) {
        global $DB;

        $json = json_encode($settings);
        if ($toolproxyid >= 0) {
            $record = $DB->get_record('lti_tool_settings', array('toolproxyid' => $toolproxyid,
                'course' => $courseid, 'coursemoduleid' => $instanceid));
        } else {
            $record = $DB->get_record('lti_tool_settings', array('typeid' => -$toolproxyid,
                'course' => $courseid, 'coursemoduleid' => $instanceid));
        }
        if ($record !== false) {
            $DB->update_record('lti_tool_settings', (object)array('id' => $record->id, 'settings' => $json, 'timemodified' => time()));
        } else {
            $record = new \stdClass();
            if ($toolproxyid > 0) {
                $record->toolproxyid = $toolproxyid;
            } else {
                $record->typeid = -$toolproxyid;
            }
            $record->course = $courseid;
            $record->coursemoduleid = $instanceid;
            $record->settings = $json;
            $record->timecreated = time();
            $record->timemodified = $record->timecreated;
            $DB->insert_record('lti_tool_settings', $record);
        }
    }

    public static function ensure_url_is_https($url) {
        if (!strstr($url, '://')) {
            $url = 'https://' . $url;
        } else {
            // If the URL starts with http, replace with https.
            if (stripos($url, 'http://') === 0) {
                $url = 'https://' . substr($url, 7);
            }
        }

        return $url;
    }

    public static function request_is_using_ssl() {
        global $CFG;
        return (stripos($CFG->wwwroot, 'https://') === 0);
    }

    /**
     * Initializes an array with the capabilities supported by the LTI module
     *
     * @return array List of capability names (without a dollar sign prefix)
     */
    public static function get_capabilities() {
        $capabilities = array(
            'basic-lti-launch-request' => '',
            'ContentItemSelectionRequest' => '',
            'ToolProxyRegistrationRequest' => '',
            'Context.id' => 'context_id',
            'Context.title' => 'context_title',
            'Context.label' => 'context_label',
            'Context.id.history' => null,
            'Context.sourcedId' => 'lis_course_section_sourcedid',
            'Context.longDescription' => '$COURSE->summary',
            'Context.timeFrame.begin' => '$COURSE->startdate',
            'CourseSection.title' => 'context_title',
            'CourseSection.label' => 'context_label',
            'CourseSection.sourcedId' => 'lis_course_section_sourcedid',
            'CourseSection.longDescription' => '$COURSE->summary',
            'CourseSection.timeFrame.begin' => null,
            'CourseSection.timeFrame.end' => null,
            'ResourceLink.id' => 'resource_link_id',
            'ResourceLink.title' => 'resource_link_title',
            'ResourceLink.description' => 'resource_link_description',
            'User.id' => 'user_id',
            'User.username' => '$USER->username',
            'Person.name.full' => 'lis_person_name_full',
            'Person.name.given' => 'lis_person_name_given',
            'Person.name.family' => 'lis_person_name_family',
            'Person.email.primary' => 'lis_person_contact_email_primary',
            'Person.sourcedId' => 'lis_person_sourcedid',
            'Person.name.middle' => '$USER->middlename',
            'Person.address.street1' => '$USER->address',
            'Person.address.locality' => '$USER->city',
            'Person.address.country' => '$USER->country',
            'Person.address.timezone' => '$USER->timezone',
            'Person.phone.primary' => '$USER->phone1',
            'Person.phone.mobile' => '$USER->phone2',
            'Person.webaddress' => '$USER->url',
            'Membership.role' => 'roles',
            'Result.sourcedId' => 'lis_result_sourcedid',
            'Result.autocreate' => 'lis_outcome_service_url',
            'BasicOutcome.sourcedId' => 'lis_result_sourcedid',
            'BasicOutcome.url' => 'lis_outcome_service_url',
            'Moodle.Person.userGroupIds' => null);

        return $capabilities;
    }

    /**
     * Search for a tag within an XML DOMDocument
     *
     * @param  string $url The url of the cartridge to be loaded
     * @param  array  $map The map of tags to keys in the return array
     * @param  array  $propertiesmap The map of properties to keys in the return array
     * @return array An associative array with the given keys and their values from the cartridge
     * @throws moodle_exception if the cartridge could not be loaded correctly
     */
    public static function load_cartridge($url, $map, $propertiesmap = []) {
        global $CFG;
        require_once($CFG->libdir. "/filelib.php");

        $curl = new curl();
        $response = $curl->get($url);

        // Got a completely empty response (real or error), cannot process this with
        // DOMDocument::loadXML() because it errors with ValueError. So let's throw
        // the moodle_exception before waiting to examine the errors later.
        if (trim($response) === '') {
            throw new moodle_exception('errorreadingfile', '', '', $url);
        }

        // TODO MDL-46023 Replace this code with a call to the new library.
        $origerrors = libxml_use_internal_errors(true);
        libxml_clear_errors();

        $document = new DOMDocument();
        @$document->loadXML($response, LIBXML_NONET);

        $cartridge = new DomXpath($document);

        $errors = libxml_get_errors();

        libxml_clear_errors();
        libxml_use_internal_errors($origerrors);

        if (count($errors) > 0) {
            $message = 'Failed to load cartridge.';
            foreach ($errors as $error) {
                $message .= "\n" . trim($error->message, "\n\r\t .") . " at line " . $error->line;
            }
            throw new moodle_exception('errorreadingfile', '', '', $url, $message);
        }

        $toolinfo = [];
        foreach ($map as $tag => $key) {
            $value = self::get_tag($tag, $cartridge);
            if ($value) {
                $toolinfo[$key] = $value;
            }
        }
        if (!empty($propertiesmap)) {
            foreach ($propertiesmap as $property => $key) {
                $value = self::get_tag("property", $cartridge, $property);
                if ($value) {
                    $toolinfo[$key] = $value;
                }
            }
        }

        return $toolinfo;
    }

    /**
     * Search for a tag within an XML DOMDocument
     *
     * @param  stdClass $tagname The name of the tag to search for
     * @param  XPath    $xpath   The XML to find the tag in
     * @param  XPath    $attribute The attribute to search for (if we should search for a child node with the given
     * value for the name attribute
     */
    public static function get_tag($tagname, $xpath, $attribute = null) {
        if ($attribute) {
            $result = $xpath->query('//*[local-name() = \'' . $tagname . '\'][@name="' . $attribute . '"]');
        } else {
            $result = $xpath->query('//*[local-name() = \'' . $tagname . '\']');
        }
        if ($result->length > 0) {
            return $result->item(0)->nodeValue;
        }
        return null;
    }

    /**
     * Determines if the given url is for a IMS basic cartridge
     *
     * @param  string $url The url to be checked
     * @return boolean True if the url is for a cartridge
     */
    public static function is_cartridge($url) {
        // If it is empty, it's not a cartridge.
        if (empty($url)) {
            return false;
        }
        // If it has xml at the end of the url, it's a cartridge.
        if (preg_match('/\.xml$/', $url)) {
            return true;
        }
        // Even if it doesn't have .xml, load the url to check if it's a cartridge..
        try {
            $toolinfo = self::load_cartridge($url,
                array(
                    "launch_url" => "launchurl"
                )
            );
            if (!empty($toolinfo['launchurl'])) {
                return true;
            }
        } catch (moodle_exception $e) {
            return false; // Error loading the xml, so it's not a cartridge.
        }
        return false;
    }

   /**
     * Returns all LTI tool types (preconfigured tools) visible in the given course.
     *
     * This list will contain both site level tools and course-level tools.
     *
     * @param int $courseid the id of the course.
     * @param int $userid the id of the user.
     * @param array $coursevisible options for 'coursevisible' field, which will default to
     *        [LTI_COURSEVISIBLE_PRECONFIGURED, LTI_COURSEVISIBLE_ACTIVITYCHOOSER] if omitted.
     * @return \stdClass[] the array of tool type objects.
     */
    public static function get_lti_types_by_course(int $courseid, int $userid, array $coursevisible = []): array {
        global $DB, $SITE;

        if (empty($coursevisible)) {
            $coursevisible = [LTI_COURSEVISIBLE_PRECONFIGURED, LTI_COURSEVISIBLE_ACTIVITYCHOOSER];
        }
        [$coursevisiblesql, $coursevisparams] = $DB->get_in_or_equal($coursevisible, SQL_PARAMS_NAMED, 'coursevisible');
        [$coursevisiblesql1, $coursevisparams1] = $DB->get_in_or_equal($coursevisible, SQL_PARAMS_NAMED, 'coursevisible');
        [$coursevisibleoverriddensql, $coursevisoverriddenparams] = $DB->get_in_or_equal(
            $coursevisible,
            SQL_PARAMS_NAMED,
            'coursevisibleoverridden');

        $coursecond = implode(" OR ", ["t.course = :courseid", "t.course = :siteid"]);
        $coursecategory = $DB->get_field('course', 'category', ['id' => $courseid]);
        $query = "SELECT *
                    FROM (SELECT t.*, c.coursevisible as coursevisibleoverridden
                            FROM {lti_types} t
                       LEFT JOIN {lti_types_categories} tc ON t.id = tc.typeid
                       LEFT JOIN {lti_coursevisible} c ON c.typeid = t.id AND c.courseid = $courseid
                           WHERE (t.coursevisible $coursevisiblesql
                                 OR (c.coursevisible $coursevisiblesql1 AND t.coursevisible NOT IN (:lticoursevisibleno)))
                             AND ($coursecond)
                             AND t.state = :active
                             AND (tc.id IS NULL OR tc.categoryid = :categoryid)) tt
                   WHERE tt.coursevisibleoverridden IS NULL
                      OR tt.coursevisibleoverridden $coursevisibleoverriddensql";

        return $DB->get_records_sql(
            $query,
            [
                'siteid' => $SITE->id,
                'courseid' => $courseid,
                'active' => LTI_TOOL_STATE_CONFIGURED,
                'categoryid' => $coursecategory,
                'coursevisible' => LTI_COURSEVISIBLE_ACTIVITYCHOOSER,
                'lticoursevisibleno' => LTI_COURSEVISIBLE_NO,
            ] + $coursevisparams + $coursevisparams1 + $coursevisoverriddenparams
        );
    }

    /**
     * Override coursevisible for a given tool on course level.
     *
     * @param int $tooltypeid Type ID
     * @param int $courseid Course ID
     * @param \core\context\course $context Course context
     * @param bool $showinactivitychooser Show or not show in activity chooser
     * @return bool True if the coursevisible was changed, false otherwise.
     */
    public static function override_type_showinactivitychooser(int $tooltypeid, int $courseid, \core\context\course $context,
        bool $showinactivitychooser): bool {
        global $DB;

        require_capability('moodle/ltix:addcoursetool', $context);

        $ltitype = self::get_type($tooltypeid);
        if ($ltitype && ($ltitype->coursevisible != LTI_COURSEVISIBLE_NO)) {
            $coursevisible = $showinactivitychooser ? LTI_COURSEVISIBLE_ACTIVITYCHOOSER : LTI_COURSEVISIBLE_PRECONFIGURED;
            $ltitype->coursevisible = $coursevisible;

            $config = new \stdClass();
            $config->lti_coursevisible = $coursevisible;

            if (intval($ltitype->course) != intval(get_site()->id)) {
                // It is course tool - just update it.
                self::update_type($ltitype, $config);
            } else {
                $coursecategory = $DB->get_field('course', 'category', ['id' => $courseid]);
                $sql = "SELECT COUNT(*) AS count
                      FROM {lti_types_categories} tc
                     WHERE tc.typeid = :typeid";
                $restrictedtool = $DB->count_records_sql($sql, ['typeid' => $tooltypeid]);
                if ($restrictedtool) {
                    $record = $DB->get_record('lti_types_categories', ['typeid' => $tooltypeid, 'categoryid' => $coursecategory]);
                    if (!$record) {
                        throw new \moodle_exception('You are not allowed to change this setting for this tool.');
                    }
                }

                // This is site tool, but we would like to have course level setting for it.
                $lticoursevisible = $DB->get_record('lti_coursevisible', ['typeid' => $tooltypeid, 'courseid' => $courseid]);
                if (!$lticoursevisible) {
                    $lticoursevisible = new \stdClass();
                    $lticoursevisible->typeid = $tooltypeid;
                    $lticoursevisible->courseid = $courseid;
                    $lticoursevisible->coursevisible = $coursevisible;
                    $DB->insert_record('lti_coursevisible', $lticoursevisible);
                } else {
                    $lticoursevisible->coursevisible = $coursevisible;
                    $DB->update_record('lti_coursevisible', $lticoursevisible);
                }
            }
            return true;
        }
        return false;
    }

    /**
     * Returns configuration details for the tool
     *
     * @param int $typeid Basic LTI tool typeid
     *
     * @return array        Tool Configuration
     */
    public static function get_type_config($typeid) {
        global $DB;

        $query = "SELECT name, value
                FROM {lti_types_config}
               WHERE typeid = :typeid1
           UNION ALL
              SELECT 'toolurl' AS name, baseurl AS value
                FROM {lti_types}
               WHERE id = :typeid2
           UNION ALL
              SELECT 'icon' AS name, icon AS value
                FROM {lti_types}
               WHERE id = :typeid3
           UNION ALL
              SELECT 'secureicon' AS name, secureicon AS value
                FROM {lti_types}
               WHERE id = :typeid4";

        $typeconfig = [];
        $configs = $DB->get_records_sql($query,
            array('typeid1' => $typeid, 'typeid2' => $typeid, 'typeid3' => $typeid, 'typeid4' => $typeid));

        if (!empty($configs)) {
            foreach ($configs as $config) {
                $typeconfig[$config->name] = $config->value;
            }
        }

        return $typeconfig;
    }

    public static function get_type($typeid) {
        global $DB;

        return $DB->get_record('lti_types', array('id' => $typeid));
    }

    /**
     * Returns all basicLTI tools configured by the administrator
     *
     * @param int $course
     *
     * @return array
     */
    public static function filter_get_types($course) {
        global $DB;

        if (!empty($course)) {
            $where = "WHERE t.course = :course";
            $params = array('course' => $course);
        } else {
            $where = '';
            $params = [];
        }
        $query = "SELECT t.id, t.name, t.baseurl, t.state, t.toolproxyid, t.timecreated, tp.name tpname
                FROM {lti_types} t LEFT OUTER JOIN {lti_tool_proxies} tp ON t.toolproxyid = tp.id
                {$where}";
        return $DB->get_records_sql($query, $params);
    }

    /**
     * Delete a Basic LTI configuration
     *
     * @param int $id Configuration id
     */
    public static function delete_type($id) {
        global $DB;

        // We should probably just copy the launch URL to the tool instances in this case... using a single query.
        /*
        $instances = $DB->get_records('lti', array('typeid' => $id));
        foreach ($instances as $instance) {
            $instance->typeid = 0;
            $DB->update_record('lti', $instance);
        }*/

        $DB->delete_records('lti_types', array('id' => $id));
        $DB->delete_records('lti_types_config', array('typeid' => $id));
        $DB->delete_records('lti_types_categories', array('typeid' => $id));
    }

    public static function set_state_for_type($id, $state) {
        global $DB;

        $DB->update_record('lti_types', (object) array('id' => $id, 'state' => $state));
    }

    public static function update_type($type, $config) {
        global $DB, $CFG;

        self::prepare_type_for_save($type, $config);

        if (helper::request_is_using_ssl() && !empty($type->secureicon)) {
            $clearcache = !isset($config->oldicon) || ($config->oldicon !== $type->secureicon);
        } else {
            $clearcache = isset($type->icon) && (!isset($config->oldicon) || ($config->oldicon !== $type->icon));
        }
        unset($config->oldicon);

        if ($DB->update_record('lti_types', $type)) {
            foreach ($config as $key => $value) {
                if (substr($key, 0, 4) == 'lti_' && !is_null($value)) {
                    $record = new \StdClass();
                    $record->typeid = $type->id;
                    $record->name = substr($key, 4);
                    $record->value = $value;
                    self::update_config($record);
                }
                if (substr($key, 0, 12) == 'ltixservice_' && !is_null($value)) {
                    $record = new \StdClass();
                    $record->typeid = $type->id;
                    $record->name = $key;
                    $record->value = $value;
                    self::update_config($record);
                }
            }
            if (isset($type->toolproxyid) && $type->ltiversion === LTI_VERSION_1P3) {
                // We need to remove the tool proxy for this tool to function under 1.3.
                $toolproxyid = $type->toolproxyid;
                $DB->delete_records('lti_tool_settings', array('toolproxyid' => $toolproxyid));
                $DB->delete_records('lti_tool_proxies', array('id' => $toolproxyid));
                $type->toolproxyid = null;
                $DB->update_record('lti_types', $type);
            }
            $DB->delete_records('lti_types_categories', ['typeid' => $type->id]);
            if (isset($config->lti_coursecategories) && !empty($config->lti_coursecategories)) {
                self::type_add_categories($type->id, $config->lti_coursecategories);
            }
            require_once($CFG->libdir . '/modinfolib.php');
            if ($clearcache) {
                $sql = "SELECT cm.id, cm.course
                      FROM {course_modules} cm
                      JOIN {modules} m ON cm.module = m.id
                      JOIN {lti} l ON l.course = cm.course
                     WHERE m.name = :name AND l.typeid = :typeid";

                $rs = $DB->get_recordset_sql($sql, ['name' => 'lti', 'typeid' => $type->id]);

                $courseids = [];
                foreach ($rs as $record) {
                    $courseids[] = $record->course;
                    \course_modinfo::purge_course_module_cache($record->course, $record->id);
                }
                $rs->close();
                $courseids = array_unique($courseids);
                foreach ($courseids as $courseid) {
                    rebuild_course_cache($courseid, false, true);
                }
            }
        }
    }

    public static function prepare_type_for_save($type, $config) {
        if (isset($config->lti_toolurl)) {
            $type->baseurl = $config->lti_toolurl;
            if (isset($config->lti_tooldomain)) {
                $type->tooldomain = $config->lti_tooldomain;
            } else {
                $type->tooldomain = helper::get_domain_from_url($config->lti_toolurl);
            }
        }
        if (isset($config->lti_description)) {
            $type->description = $config->lti_description;
        }
        if (isset($config->lti_typename)) {
            $type->name = $config->lti_typename;
        }
        if (isset($config->lti_ltiversion)) {
            $type->ltiversion = $config->lti_ltiversion;
        }
        if (isset($config->lti_clientid)) {
            $type->clientid = $config->lti_clientid;
        }
        if ((!empty($type->ltiversion) && $type->ltiversion === LTI_VERSION_1P3) && empty($type->clientid)) {
            $type->clientid = registration_helper::get()->new_clientid();
        } else if (empty($type->clientid)) {
            $type->clientid = null;
        }
        if (isset($config->lti_coursevisible)) {
            $type->coursevisible = $config->lti_coursevisible;
        }

        if (isset($config->lti_icon)) {
            $type->icon = $config->lti_icon;
        }
        if (isset($config->lti_secureicon)) {
            $type->secureicon = $config->lti_secureicon;
        }

        $type->forcessl = !empty($config->lti_forcessl) ? $config->lti_forcessl : 0;
        $config->lti_forcessl = $type->forcessl;
        if (isset($config->lti_contentitem)) {
            $type->contentitem = !empty($config->lti_contentitem) ? $config->lti_contentitem : 0;
            $config->lti_contentitem = $type->contentitem;
        }
        if (isset($config->lti_toolurl_ContentItemSelectionRequest)) {
            if (!empty($config->lti_toolurl_ContentItemSelectionRequest)) {
                $type->toolurl_ContentItemSelectionRequest = $config->lti_toolurl_ContentItemSelectionRequest;
            } else {
                $type->toolurl_ContentItemSelectionRequest = '';
            }
            $config->lti_toolurl_ContentItemSelectionRequest = $type->toolurl_ContentItemSelectionRequest;
        }

        $type->timemodified = time();

        unset ($config->lti_typename);
        unset ($config->lti_toolurl);
        unset ($config->lti_description);
        unset ($config->lti_ltiversion);
        unset ($config->lti_clientid);
        unset ($config->lti_icon);
        unset ($config->lti_secureicon);
    }

    /**
     * Updates a tool configuration in the database
     *
     * @param object  $config   Tool configuration
     *
     * @return mixed Record id number
     */
    public static function update_config($config) {
        global $DB;

        $old = $DB->get_record('lti_types_config', array('typeid' => $config->typeid, 'name' => $config->name));

        if ($old) {
            $config->id = $old->id;
            $return = $DB->update_record('lti_types_config', $config);
        } else {
            $return = $DB->insert_record('lti_types_config', $config);
        }
        return $return;
    }

    /**
     * Add LTI Type course category.
     *
     * @param int $typeid
     * @param string $lticoursecategories Comma separated list of course categories.
     * @return void
     */
    public static function type_add_categories(int $typeid, string $lticoursecategories = ''): void {
        global $DB;
        $coursecategories = explode(',', $lticoursecategories);
        foreach ($coursecategories as $coursecategory) {
            $DB->insert_record('lti_types_categories', ['typeid' => $typeid, 'categoryid' => $coursecategory]);
        }
    }

    public static function add_type($type, $config) {
        global $USER, $SITE, $DB;

        self::prepare_type_for_save($type, $config);

        if (!isset($type->state)) {
            $type->state = LTI_TOOL_STATE_PENDING;
        }

        if (!isset($type->ltiversion)) {
            $type->ltiversion = LTI_VERSION_1;
        }

        if (!isset($type->timecreated)) {
            $type->timecreated = time();
        }

        if (!isset($type->createdby)) {
            $type->createdby = $USER->id;
        }

        if (!isset($type->course)) {
            $type->course = $SITE->id;
        }

        // Create a salt value to be used for signing passed data to extension services
        // The outcome service uses the service salt on the instance. This can be used
        // for communication with services not related to a specific LTI instance.
        $config->lti_servicesalt = uniqid('', true);

        $id = $DB->insert_record('lti_types', $type);

        if ($id) {
            foreach ($config as $key => $value) {
                if (!is_null($value)) {
                    if (substr($key, 0, 4) === 'lti_') {
                        $fieldname = substr($key, 4);
                    } else if (substr($key, 0, 12) !== 'ltixservice_') {
                        continue;
                    } else {
                        $fieldname = $key;
                    }

                    $record = new \StdClass();
                    $record->typeid = $id;
                    $record->name = $fieldname;
                    $record->value = $value;

                    self::add_config($record);
                }
            }
            if (isset($config->lti_coursecategories) && !empty($config->lti_coursecategories)) {
                self::type_add_categories($id, $config->lti_coursecategories);
            }
        }

        return $id;
    }

    /**
     * Add a tool configuration in the database
     *
     * @param object $config   Tool configuration
     *
     * @return int Record id number
     */
    public static function add_config($config) {
        global $DB;

        return $DB->insert_record('lti_types_config', $config);
    }

    /** get Organization ID using default if no value provided
     * @param object $typeconfig
     * @return string
     */
    public static function get_organizationid($typeconfig) {
        global $CFG;
        // Default the organizationid if not specified.
        if (empty($typeconfig['organizationid'])) {
            if (($typeconfig['organizationid_default'] ?? LTI_DEFAULT_ORGID_SITEHOST) == LTI_DEFAULT_ORGID_SITEHOST) {
                $urlparts = parse_url($CFG->wwwroot);
                return $urlparts['host'];
            } else {
                return md5(get_site_identifier());
            }
        }
        return $typeconfig['organizationid'];
    }

    /**
     * Generates some of the tool configuration based on the admin configuration details
     *
     * @param int $id
     *
     * @return stdClass Configuration details
     */
    public static function get_type_type_config($id) {
        global $DB;

        $basicltitype = $DB->get_record('lti_types', array('id' => $id));
        $config = self::get_type_config($id);

        $type = new \stdClass();

        $type->lti_typename = $basicltitype->name;

        $type->typeid = $basicltitype->id;

        $type->course = $basicltitype->course;

        $type->toolproxyid = $basicltitype->toolproxyid;

        $type->lti_toolurl = $basicltitype->baseurl;

        $type->lti_ltiversion = $basicltitype->ltiversion;

        $type->lti_clientid = $basicltitype->clientid;
        $type->lti_clientid_disabled = $type->lti_clientid;

        $type->lti_description = $basicltitype->description;

        $type->lti_parameters = $basicltitype->parameter;

        $type->lti_icon = $basicltitype->icon;

        $type->lti_secureicon = $basicltitype->secureicon;

        if (isset($config['resourcekey'])) {
            $type->lti_resourcekey = $config['resourcekey'];
        }
        if (isset($config['password'])) {
            $type->lti_password = $config['password'];
        }
        if (isset($config['publickey'])) {
            $type->lti_publickey = $config['publickey'];
        }
        if (isset($config['publickeyset'])) {
            $type->lti_publickeyset = $config['publickeyset'];
        }
        if (isset($config['keytype'])) {
            $type->lti_keytype = $config['keytype'];
        }
        if (isset($config['initiatelogin'])) {
            $type->lti_initiatelogin = $config['initiatelogin'];
        }
        if (isset($config['redirectionuris'])) {
            $type->lti_redirectionuris = $config['redirectionuris'];
        }

        if (isset($config['sendname'])) {
            $type->lti_sendname = $config['sendname'];
        }
        if (isset($config['instructorchoicesendname'])) {
            $type->lti_instructorchoicesendname = $config['instructorchoicesendname'];
        }
        if (isset($config['sendemailaddr'])) {
            $type->lti_sendemailaddr = $config['sendemailaddr'];
        }
        if (isset($config['instructorchoicesendemailaddr'])) {
            $type->lti_instructorchoicesendemailaddr = $config['instructorchoicesendemailaddr'];
        }
        if (isset($config['acceptgrades'])) {
            $type->lti_acceptgrades = $config['acceptgrades'];
        }
        if (isset($config['instructorchoiceacceptgrades'])) {
            $type->lti_instructorchoiceacceptgrades = $config['instructorchoiceacceptgrades'];
        }
        if (isset($config['allowroster'])) {
            $type->lti_allowroster = $config['allowroster'];
        }
        if (isset($config['instructorchoiceallowroster'])) {
            $type->lti_instructorchoiceallowroster = $config['instructorchoiceallowroster'];
        }

        if (isset($config['customparameters'])) {
            $type->lti_customparameters = $config['customparameters'];
        }

        if (isset($config['forcessl'])) {
            $type->lti_forcessl = $config['forcessl'];
        }

        if (isset($config['organizationid_default'])) {
            $type->lti_organizationid_default = $config['organizationid_default'];
        } else {
            // Tool was configured before this option was available and the default then was host.
            $type->lti_organizationid_default = LTI_DEFAULT_ORGID_SITEHOST;
        }
        if (isset($config['organizationid'])) {
            $type->lti_organizationid = $config['organizationid'];
        }
        if (isset($config['organizationurl'])) {
            $type->lti_organizationurl = $config['organizationurl'];
        }
        if (isset($config['organizationdescr'])) {
            $type->lti_organizationdescr = $config['organizationdescr'];
        }
        if (isset($config['launchcontainer'])) {
            $type->lti_launchcontainer = $config['launchcontainer'];
        }

        if (isset($config['coursevisible'])) {
            $type->lti_coursevisible = $config['coursevisible'];
        }

        if (isset($config['contentitem'])) {
            $type->lti_contentitem = $config['contentitem'];
        }

        if (isset($config['toolurl_ContentItemSelectionRequest'])) {
            $type->lti_toolurl_ContentItemSelectionRequest = $config['toolurl_ContentItemSelectionRequest'];
        }

        if (isset($config['debuglaunch'])) {
            $type->lti_debuglaunch = $config['debuglaunch'];
        }

        if (isset($config['module_class_type'])) {
            $type->lti_module_class_type = $config['module_class_type'];
        }

        // Get the parameters from the LTI services.
        foreach ($config as $name => $value) {
            if (strpos($name, 'ltixservice_') === 0) {
                $type->{$name} = $config[$name];
            }
        }

        return $type;
    }

    /**
     * Get the total number of LTI tool types and tool proxies.
     *
     * @param bool $orphanedonly If true, only count orphaned proxies.
     * @param int $toolproxyid If not 0, only count tool types that have this tool proxy id.
     * @return int Count of tools.
     */
    public static function get_lti_types_and_proxies_count(bool $orphanedonly = false, int $toolproxyid = 0): int {
        global $DB;

        $typessql = "SELECT count(*)
                   FROM {lti_types}";
        $typesparams = [];
        if (!empty($toolproxyid)) {
            $typessql .= " WHERE toolproxyid = :toolproxyid";
            $typesparams['toolproxyid'] = $toolproxyid;
        }

        $proxiessql = helper::get_tool_proxy_sql($orphanedonly, true);

        $countsql = "SELECT ($typessql) + ($proxiessql) as total" . $DB->sql_null_from_clause();

        return $DB->count_records_sql($countsql, $typesparams);
    }

    /**
     * Get both LTI tool proxies and tool types.
     *
     * If limit and offset are not zero, a subset of the tools will be returned. Tool proxies will be counted before tool
     * types.
     * For example: If 10 tool proxies and 10 tool types exist, and the limit is set to 15, then 10 proxies and 5 types
     * will be returned.
     *
     * @param int $limit Maximum number of tools returned.
     * @param int $offset Do not return tools before offset index.
     * @param bool $orphanedonly If true, only return orphaned proxies.
     * @param int $toolproxyid If not 0, only return tool types that have this tool proxy id.
     * @return array list(proxies[], types[]) List containing array of tool proxies and array of tool types.
     */
    public static function get_lti_types_and_proxies(int $limit = 0, int $offset = 0, bool $orphanedonly = false, int $toolproxyid = 0): array {
        global $DB;

        if ($orphanedonly) {
            $orphanedproxiessql = helper::get_tool_proxy_sql($orphanedonly, false);
            $countsql = helper::get_tool_proxy_sql($orphanedonly, true);
            $proxies  = $DB->get_records_sql($orphanedproxiessql, null, $offset, $limit);
            $totalproxiescount = $DB->count_records_sql($countsql);
        } else {
            $proxies = $DB->get_records('lti_tool_proxies', null, 'name ASC, state DESC, timemodified DESC',
                '*', $offset, $limit);
            $totalproxiescount = $DB->count_records('lti_tool_proxies');
        }

        // Find new offset and limit for tool types after getting proxies and set up query.
        $typesoffset = max($offset - $totalproxiescount, 0); // Set to 0 if negative.
        $typeslimit = max($limit - count($proxies), 0); // Set to 0 if negative.
        $typesparams = [];
        if (!empty($toolproxyid)) {
            $typesparams['toolproxyid'] = $toolproxyid;
        }

        $types = $DB->get_records('lti_types', $typesparams, 'name ASC, state DESC, timemodified DESC',
            '*', $typesoffset, $typeslimit);

        return [$proxies, array_map('\core_ltix\helper::serialise_tool_type', $types)];
    }

    /**
     * Returns information on the current state of the tool type
     *
     * @param stdClass $type The tool type
     *
     * @return array An array with a text description of the state, and boolean for whether it is in each state:
     * pending, configured, rejected, unknown
     */
    public static function get_tool_type_state_info(stdClass $type) {
        $isconfigured = false;
        $ispending = false;
        $isrejected = false;
        $isunknown = false;
        switch ($type->state) {
            case LTI_TOOL_STATE_CONFIGURED:
                $state = get_string('active', 'core_ltix');
                $isconfigured = true;
                break;
            case LTI_TOOL_STATE_PENDING:
                $state = get_string('pending', 'core_ltix');
                $ispending = true;
                break;
            case LTI_TOOL_STATE_REJECTED:
                $state = get_string('rejected', 'core_ltix');
                $isrejected = true;
                break;
            default:
                $state = get_string('unknownstate', 'core_ltix');
                $isunknown = true;
                break;
        }

        return array(
            'text' => $state,
            'pending' => $ispending,
            'configured' => $isconfigured,
            'rejected' => $isrejected,
            'unknown' => $isunknown
        );
    }

    /**
     * Returns a summary of each LTI capability this tool type requires in plain language
     *
     * @param stdClass $type The tool type
     *
     * @return array An array of text descriptions of each of the capabilities this tool type requires
     */
    public static function get_tool_type_capability_groups($type) {
        $capabilities = helper::get_enabled_capabilities($type);
        $groups = [];
        $hascourse = false;
        $hasactivities = false;
        $hasuseraccount = false;
        $hasuserpersonal = false;

        foreach ($capabilities as $capability) {
            // Bail out early if we've already found all groups.
            if (count($groups) >= 4) {
                continue;
            }

            if (!$hascourse && preg_match('/^CourseSection/', $capability)) {
                $hascourse = true;
                $groups[] = get_string('courseinformation', 'core_ltix');
            } else if (!$hasactivities && preg_match('/^ResourceLink/', $capability)) {
                $hasactivities = true;
                $groups[] = get_string('courseactivitiesorresources', 'core_ltix');
            } else if (!$hasuseraccount && preg_match('/^User/', $capability) || preg_match('/^Membership/', $capability)) {
                $hasuseraccount = true;
                $groups[] = get_string('useraccountinformation', 'core_ltix');
            } else if (!$hasuserpersonal && preg_match('/^Person/', $capability)) {
                $hasuserpersonal = true;
                $groups[] = get_string('userpersonalinformation', 'core_ltix');
            }
        }

        return $groups;
    }

    /**
     * Create a new access token.
     *
     * @param int $typeid Tool type ID
     * @param string[] $scopes Scopes permitted for new token
     *
     * @return stdClass Access token
     */
    public static function new_access_token($typeid, $scopes) {
        global $DB;

        // Make sure the token doesn't exist (even if it should be almost impossible with the random generation).
        $numtries = 0;
        do {
            $numtries ++;
            $generatedtoken = md5(uniqid((string) rand(), true));
            if ($numtries > 5) {
                throw new moodle_exception('Failed to generate LTI access token');
            }
        } while ($DB->record_exists('lti_access_tokens', array('token' => $generatedtoken)));
        $newtoken = new stdClass();
        $newtoken->typeid = $typeid;
        $newtoken->scope = json_encode(array_values($scopes));
        $newtoken->token = $generatedtoken;

        $newtoken->timecreated = time();
        $newtoken->validuntil = $newtoken->timecreated + LTI_ACCESS_TOKEN_LIFE;
        $newtoken->lastaccess = null;

        $DB->insert_record('lti_access_tokens', $newtoken);

        return $newtoken;
    }

    /**
     * Allows you to load settings for an external tool type from an IMS cartridge.
     *
     * @param  string   $url     The URL to the cartridge
     * @param  stdClass $type    The tool type object to be filled in
     * @throws moodle_exception if the cartridge could not be loaded correctly
     */
    public static function load_type_from_cartridge($url, $type) {
        $toolinfo = helper::load_cartridge($url,
            array(
                "title" => "lti_typename",
                "launch_url" => "lti_toolurl",
                "description" => "lti_description",
                "icon" => "lti_icon",
                "secure_icon" => "lti_secureicon"
            ),
            array(
                "icon_url" => "lti_extension_icon",
                "secure_icon_url" => "lti_extension_secureicon"
            )
        );
        // If an activity name exists, unset the cartridge name so we don't override it.
        if (isset($type->lti_typename)) {
            unset($toolinfo['lti_typename']);
        }

        // Always prefer cartridge core icons first, then, if none are found, look at the extension icons.
        if (empty($toolinfo['lti_icon']) && !empty($toolinfo['lti_extension_icon'])) {
            $toolinfo['lti_icon'] = $toolinfo['lti_extension_icon'];
        }
        unset($toolinfo['lti_extension_icon']);

        if (empty($toolinfo['lti_secureicon']) && !empty($toolinfo['lti_extension_secureicon'])) {
            $toolinfo['lti_secureicon'] = $toolinfo['lti_extension_secureicon'];
        }
        unset($toolinfo['lti_extension_secureicon']);

        // Ensure Custom icons aren't overridden by cartridge params.
        if (!empty($type->lti_icon)) {
            unset($toolinfo['lti_icon']);
        }

        if (!empty($type->lti_secureicon)) {
            unset($toolinfo['lti_secureicon']);
        }

        foreach ($toolinfo as $property => $value) {
            $type->$property = $value;
        }
    }

    /**
     * Loads the cartridge information into the tool type, if the launch url is for a cartridge file
     *
     * @param stdClass $type The tool type object to be filled in
     */
    public static function load_type_if_cartridge($type) {
        if (!empty($type->lti_toolurl) && self::is_cartridge($type->lti_toolurl)) {
            self::load_type_from_cartridge($type->lti_toolurl, $type);
        }
    }

    /**
     * Return the type of the instance, using domain matching if no explicit type is set.
     *
     * @param  object $instance the external tool activity settings
     * @return object|null
     */
    public static function get_instance_type(object $instance): ?object {
        if (empty($instance->typeid)) {
            if (!$tool = self::get_tool_by_url_match($instance->toolurl, $instance->course)) {
                $tool = self::get_tool_by_url_match($instance->securetoolurl,  $instance->course);
            }
            return $tool;
        }
        return self::get_type($instance->typeid);
    }

    /**
     * Return the launch data required for opening the external tool.
     *
     * @param  stdClass $instance the external tool activity settings
     * @param  string $nonce  the nonce value to use (applies to LTI 1.3 only)
     * @return array the endpoint URL and parameters (including the signature)
     */
    public static function get_launch_data($instance, $nonce = '', $messagetype = 'basic-lti-launch-request', $foruserid = 0) {
        global $PAGE, $USER;
        $messagetype = $messagetype ? $messagetype : 'basic-lti-launch-request';
        $tool = self::get_instance_type($instance);
        if ($tool) {
            $typeid = $tool->id;
            $ltiversion = $tool->ltiversion;
        } else {
            $typeid = null;
            $ltiversion = LTI_VERSION_1;
        }

        if ($typeid) {
            $typeconfig = self::get_type_config($typeid);
        } else {
            // There is no admin configuration for this tool. Use configuration in the lti instance record plus some defaults.
            $typeconfig = (array)$instance;

            $typeconfig['sendname'] = $instance->instructorchoicesendname;
            $typeconfig['sendemailaddr'] = $instance->instructorchoicesendemailaddr;
            $typeconfig['customparameters'] = $instance->instructorcustomparameters;
            $typeconfig['acceptgrades'] = $instance->instructorchoiceacceptgrades;
            $typeconfig['allowroster'] = $instance->instructorchoiceallowroster;
            $typeconfig['forcessl'] = '0';
        }

        if (isset($tool->toolproxyid)) {
            $toolproxy = self::get_tool_proxy($tool->toolproxyid);
            $key = $toolproxy->guid;
            $secret = $toolproxy->secret;
        } else {
            $toolproxy = null;
            if (!empty($instance->resourcekey)) {
                $key = $instance->resourcekey;
            } else if ($ltiversion === LTI_VERSION_1P3) {
                $key = $tool->clientid;
            } else if (!empty($typeconfig['resourcekey'])) {
                $key = $typeconfig['resourcekey'];
            } else {
                $key = '';
            }
            if (!empty($instance->password)) {
                $secret = $instance->password;
            } else if (!empty($typeconfig['password'])) {
                $secret = $typeconfig['password'];
            } else {
                $secret = '';
            }
        }

        $endpoint = !empty($instance->toolurl) ? $instance->toolurl : $typeconfig['toolurl'];
        $endpoint = trim($endpoint);

        // If the current request is using SSL and a secure tool URL is specified, use it.
        if (self::request_is_using_ssl() && !empty($instance->securetoolurl)) {
            $endpoint = trim($instance->securetoolurl);
        }

        // If SSL is forced, use the secure tool url if specified. Otherwise, make sure https is on the normal launch URL.
        if (isset($typeconfig['forcessl']) && ($typeconfig['forcessl'] == '1')) {
            if (!empty($instance->securetoolurl)) {
                $endpoint = trim($instance->securetoolurl);
            }

            if ($endpoint !== '') {
                $endpoint = self::ensure_url_is_https($endpoint);
            }
        } else if ($endpoint !== '' && !strstr($endpoint, '://')) {
            $endpoint = 'http://' . $endpoint;
        }

        $orgid = self::get_organizationid($typeconfig);

        $course = $PAGE->course;
        $islti2 = isset($tool->toolproxyid);
        $allparams = self::build_request($instance, $typeconfig, $course, $typeid, $islti2, $messagetype, $foruserid);
        if ($islti2) {
            $requestparams = self::build_request_lti2($tool, $allparams);
        } else {
            $requestparams = $allparams;
        }
        $requestparams = array_merge($requestparams, self::build_standard_message($instance, $orgid, $ltiversion, $messagetype));
        $customstr = '';
        if (isset($typeconfig['customparameters'])) {
            $customstr = $typeconfig['customparameters'];
        }
        $services = self::get_services();
        foreach ($services as $service) {
            [$endpoint, $customstr] = $service->override_endpoint($messagetype,
                $endpoint, $customstr, $instance->course, $instance);
        }
        $requestparams = array_merge($requestparams, self::build_custom_parameters($toolproxy, $tool, $instance, $allparams, $customstr,
            $instance->instructorcustomparameters, $islti2));

        $launchcontainer = self::get_launch_container($instance, $typeconfig);
        $returnurlparams = array('course' => $course->id,
            'launch_container' => $launchcontainer,
            'instanceid' => $instance->id,
            'sesskey' => sesskey());

        // Add the return URL. We send the launch container along to help us avoid frames-within-frames when the user returns.
        $url = new \moodle_url('/ltix/return.php', $returnurlparams);
        $returnurl = $url->out(false);

        if (isset($typeconfig['forcessl']) && ($typeconfig['forcessl'] == '1')) {
            $returnurl = self::ensure_url_is_https($returnurl);
        }

        $target = '';
        switch($launchcontainer) {
            case LTI_LAUNCH_CONTAINER_EMBED:
            case LTI_LAUNCH_CONTAINER_EMBED_NO_BLOCKS:
                $target = 'iframe';
                break;
            case LTI_LAUNCH_CONTAINER_REPLACE_MOODLE_WINDOW:
                $target = 'frame';
                break;
            case LTI_LAUNCH_CONTAINER_WINDOW:
                $target = 'window';
                break;
        }
        if (!empty($target)) {
            $requestparams['launch_presentation_document_target'] = $target;
        }

        $requestparams['launch_presentation_return_url'] = $returnurl;

        // Add the parameters configured by the LTI services.
        if ($typeid && !$islti2) {
            $services = self::get_services();
            foreach ($services as $service) {
                $serviceparameters = $service->get_launch_parameters('basic-lti-launch-request',
                    $course->id, $USER->id , $typeid, $instance->id);
                foreach ($serviceparameters as $paramkey => $paramvalue) {
                    $requestparams['custom_' . $paramkey] = self::parse_custom_parameter($toolproxy, $tool,
                        $requestparams, $paramvalue, $islti2);
                }
            }
        }

        // Allow request params to be updated by sub-plugins.
        $plugins = core_component::get_plugin_list('ltixsource');
        foreach (array_keys($plugins) as $plugin) {
            $pluginparams = component_callback('ltixsource_'.$plugin, 'before_launch',
                array($instance, $endpoint, $requestparams), []);

            if (!empty($pluginparams) && is_array($pluginparams)) {
                $requestparams = array_merge($requestparams, $pluginparams);
            }
        }

        if ((!empty($key) && !empty($secret)) || ($ltiversion === LTI_VERSION_1P3)) {
            if ($ltiversion !== LTI_VERSION_1P3) {
                $parms = \core_ltix\oauth_helper::sign_parameters($requestparams, $endpoint, 'POST', $key, $secret);
            } else {
                $parms = \core_ltix\oauth_helper::sign_jwt($requestparams, $endpoint, $key, $typeid, $nonce);
            }

            $endpointurl = new \moodle_url($endpoint);
            $endpointparams = $endpointurl->params();

            // Strip querystring params in endpoint url from $parms to avoid duplication.
            if (!empty($endpointparams) && !empty($parms)) {
                foreach (array_keys($endpointparams) as $paramname) {
                    if (isset($parms[$paramname])) {
                        unset($parms[$paramname]);
                    }
                }
            }

        } else {
            // If no key and secret, do the launch unsigned.
            $returnurlparams['unsigned'] = '1';
            $parms = $requestparams;
        }

        return array($endpoint, $parms);
    }

    /**
     * Launch an external tool activity.
     *
     * @param stdClass $instance the external tool activity settings
     * @param int $foruserid for user param, optional
     * @return void Prints the HTML code containing the javascript code for the launch
     */
    public static function launch_tool($instance, $foruserid=0) {

        list($endpoint, $parms) = self::get_launch_data($instance, '', '', $foruserid);
        $debuglaunch = ( $instance->debuglaunch == 1 );

        $content = self::post_launch_html($parms, $endpoint, $debuglaunch);

        echo $content;
    }

    /**
     * Prepares an LTI registration request message
     *
     * @param object $toolproxy  Tool Proxy instance object
     */
    public static function register($toolproxy) {
        $endpoint = $toolproxy->regurl;

        // Change the status to pending.
        $toolproxy->state = LTI_TOOL_PROXY_STATE_PENDING;
        self::update_tool_proxy($toolproxy);

        $requestparams = self::build_registration_request($toolproxy);

        $content = self::post_launch_html($requestparams, $endpoint, false);

        echo $content;
    }

    /**
     * Gets the parameters for the regirstration request
     *
     * @param object $toolproxy Tool Proxy instance object
     * @return array Registration request parameters
     */
    public static function build_registration_request($toolproxy) {
        $key = $toolproxy->guid;
        $secret = $toolproxy->secret;

        $requestparams = [];
        $requestparams['lti_message_type'] = 'ToolProxyRegistrationRequest';
        $requestparams['lti_version'] = 'LTI-2p0';
        $requestparams['reg_key'] = $key;
        $requestparams['reg_password'] = $secret;
        $requestparams['reg_url'] = $toolproxy->regurl;

        // Add the profile URL.
        $profileservice = service_helper::get_service_by_name('profile');
        $profileservice->set_tool_proxy($toolproxy);
        $requestparams['tc_profile_url'] = $profileservice->parse_value('$ToolConsumerProfile.url');

        // Add the return URL.
        $returnurlparams = array('id' => $toolproxy->id, 'sesskey' => sesskey());
        $url = new \moodle_url('/ltix/externalregistrationreturn.php', $returnurlparams);
        $returnurl = $url->out(false);

        $requestparams['launch_presentation_return_url'] = $returnurl;

        return $requestparams;
    }

    /**
     * Build source ID
     *
     * @param int $instanceid
     * @param int $userid
     * @param string $servicesalt
     * @param null|int $typeid
     * @param null|int $launchid
     * @return stdClass
     */
    public static function build_sourcedid($instanceid, $userid, $servicesalt, $typeid = null, $launchid = null) {
        $data = new \stdClass();

        $data->instanceid = $instanceid;
        $data->userid = $userid;
        $data->typeid = $typeid;
        if (!empty($launchid)) {
            $data->launchid = $launchid;
        } else {
            $data->launchid = mt_rand();
        }

        $json = json_encode($data);

        $hash = hash('sha256', $json . $servicesalt, false);

        $container = new \stdClass();
        $container->data = $data;
        $container->hash = $hash;

        return $container;
    }

    /**
     * This function builds the request that must be sent to the tool producer
     *
     * @param object    $instance       Basic LTI instance object
     * @param array     $typeconfig     Basic LTI tool configuration
     * @param object    $course         Course object
     * @param int|null  $typeid         Basic LTI tool ID
     * @param boolean   $islti2         True if an LTI 2 tool is being launched
     * @param string    $messagetype    LTI Message Type for this launch
     * @param int       $foruserid      User targeted by this launch
     *
     * @return array                    Request details
     */
    public static function build_request($instance, $typeconfig, $course, $typeid = null, $islti2 = false,
        $messagetype = 'basic-lti-launch-request', $foruserid = 0) {
        global $USER, $CFG;

        if (empty($instance->cmid)) {
            $instance->cmid = 0;
        }

        $role = self::get_ims_role($USER, $instance->cmid, $instance->course, $islti2);

        $requestparams = array(
            'user_id' => $USER->id,
            'lis_person_sourcedid' => $USER->idnumber,
            'roles' => $role,
            'context_id' => $course->id,
            'context_label' => trim(html_to_text($course->shortname, 0)),
            'context_title' => trim(html_to_text($course->fullname, 0)),
        );
        if ($foruserid) {
            $requestparams['for_user_id'] = $foruserid;
        }
        if ($messagetype) {
            $requestparams['lti_message_type'] = $messagetype;
        }
        if (!empty($instance->name)) {
            $requestparams['resource_link_title'] = trim(html_to_text($instance->name, 0));
        }
        if (!empty($instance->cmid)) {
            $intro = format_module_intro('lti', $instance, $instance->cmid);
            $intro = trim(html_to_text($intro, 0, false));

            // This may look weird, but this is required for new lines
            // so we generate the same OAuth signature as the tool provider.
            $intro = str_replace("\n", "\r\n", $intro);
            $requestparams['resource_link_description'] = $intro;
        }
        if (!empty($instance->id)) {
            $requestparams['resource_link_id'] = $instance->id;
        }
        if (!empty($instance->resource_link_id)) {
            $requestparams['resource_link_id'] = $instance->resource_link_id;
        }
        if ($course->format == 'site') {
            $requestparams['context_type'] = 'Group';
        } else {
            $requestparams['context_type'] = 'CourseSection';
            $requestparams['lis_course_section_sourcedid'] = $course->idnumber;
        }

        if (!empty($instance->id) && !empty($instance->servicesalt) && ($islti2 ||
                $typeconfig['acceptgrades'] == LTI_SETTING_ALWAYS ||
                ($typeconfig['acceptgrades'] == LTI_SETTING_DELEGATE && $instance->instructorchoiceacceptgrades == LTI_SETTING_ALWAYS))
        ) {
            $placementsecret = $instance->servicesalt;
            $sourcedid = json_encode(self::build_sourcedid($instance->id, $USER->id, $placementsecret, $typeid));
            $requestparams['lis_result_sourcedid'] = $sourcedid;

            // Add outcome service URL.
            $serviceurl = new \moodle_url('/ltix/service.php');
            $serviceurl = $serviceurl->out();

            $forcessl = false;
            if (!empty($CFG->ltix_forcessl)) {
                $forcessl = true;
            } else if (!empty($CFG->mod_lti_forcessl)) {
                debugging('mod_lti_forcessl is deprecated. Please use ltix_forcessl instead.', DEBUG_DEVELOPER);
                $forcessl = true;
            }

            if ((isset($typeconfig['forcessl']) && ($typeconfig['forcessl'] == '1')) or $forcessl) {
                $serviceurl = self::ensure_url_is_https($serviceurl);
            }

            $requestparams['lis_outcome_service_url'] = $serviceurl;
        }

        // Send user's name and email data if appropriate.
        if ($islti2 || $typeconfig['sendname'] == LTI_SETTING_ALWAYS ||
            ($typeconfig['sendname'] == LTI_SETTING_DELEGATE && isset($instance->instructorchoicesendname)
                && $instance->instructorchoicesendname == LTI_SETTING_ALWAYS)
        ) {
            $requestparams['lis_person_name_given'] = $USER->firstname;
            $requestparams['lis_person_name_family'] = $USER->lastname;
            $requestparams['lis_person_name_full'] = fullname($USER);
            $requestparams['ext_user_username'] = $USER->username;
        }

        if ($islti2 || $typeconfig['sendemailaddr'] == LTI_SETTING_ALWAYS ||
            ($typeconfig['sendemailaddr'] == LTI_SETTING_DELEGATE && isset($instance->instructorchoicesendemailaddr)
                && $instance->instructorchoicesendemailaddr == LTI_SETTING_ALWAYS)
        ) {
            $requestparams['lis_person_contact_email_primary'] = $USER->email;
        }

        return $requestparams;
    }

    /**
     * This function builds the standard parameters for an LTI message that must be sent to the tool producer
     *
     * @param stdClass  $instance       Basic LTI instance object
     * @param string    $orgid          Organisation ID
     * @param string    $ltiversion     LTI version to be used for tool messages
     * @param string    $messagetype    The request message type. Defaults to basic-lti-launch-request if empty.
     *
     * @return array                    Message parameters
     */
    public static function build_standard_message($instance, $orgid, $ltiversion, $messagetype = 'basic-lti-launch-request') {
        global $CFG;

        $requestparams = [];

        if ($instance) {
            $requestparams['resource_link_id'] = $instance->id;
            if (property_exists($instance, 'resource_link_id') and !empty($instance->resource_link_id)) {
                $requestparams['resource_link_id'] = $instance->resource_link_id;
            }
        }

        $requestparams['launch_presentation_locale'] = current_language();

        // Make sure we let the tool know what LMS they are being called from.
        $requestparams['ext_lms'] = 'moodle-2';
        $requestparams['tool_consumer_info_product_family_code'] = 'moodle';
        $requestparams['tool_consumer_info_version'] = strval($CFG->version);

        // Add oauth_callback to be compliant with the 1.0A spec.
        $requestparams['oauth_callback'] = 'about:blank';

        $requestparams['lti_version'] = $ltiversion;
        $requestparams['lti_message_type'] = $messagetype;

        if ($orgid) {
            $requestparams["tool_consumer_instance_guid"] = $orgid;
        }
        if (!empty($CFG->ltix_institution_name)) {
            $requestparams['tool_consumer_instance_name'] = trim(html_to_text($CFG->ltix_institution_name, 0));
        } else if (!empty($CFG->mod_lti_institution_name)) {
            debugging('mod_lti_institution_name is deprecated. Please use ltix_institution_name instead.', DEBUG_DEVELOPER);
            $requestparams['tool_consumer_instance_name'] = trim(html_to_text($CFG->mod_lti_institution_name, 0));
        } else {
            $requestparams['tool_consumer_instance_name'] = get_site()->shortname;
        }
        $requestparams['tool_consumer_instance_description'] = trim(html_to_text(get_site()->fullname, 0));

        return $requestparams;
    }

    /**
     * This function builds the custom parameters
     *
     * @param object    $toolproxy      Tool proxy instance object
     * @param object    $tool           Tool instance object
     * @param object    $instance       Tool placement instance object
     * @param array     $params         LTI launch parameters
     * @param string    $customstr      Custom parameters defined for tool
     * @param string    $instructorcustomstr      Custom parameters defined for this placement
     * @param boolean   $islti2         True if an LTI 2 tool is being launched
     *
     * @return array                    Custom parameters
     */
    public static function build_custom_parameters($toolproxy, $tool, $instance, $params, $customstr, $instructorcustomstr, $islti2) {

        // Concatenate the custom parameters from the administrator and the instructor
        // Instructor parameters are only taken into consideration if the administrator
        // has given permission.
        $custom = [];
        if ($customstr) {
            $custom = self::split_custom_parameters($toolproxy, $tool, $params, $customstr, $islti2);
        }
        if ($instructorcustomstr) {
            $custom = array_merge(self::split_custom_parameters($toolproxy, $tool, $params,
                $instructorcustomstr, $islti2), $custom);
        }
        if ($islti2) {
            $custom = array_merge(self::split_custom_parameters($toolproxy, $tool, $params,
                $tool->parameter, true), $custom);
            $settings = self::get_tool_settings($tool->toolproxyid);
            $custom = array_merge($custom, self::get_custom_parameters($toolproxy, $tool, $params, $settings));
            if (!empty($instance->course)) {
                $settings = self::get_tool_settings($tool->toolproxyid, $instance->course);
                $custom = array_merge($custom, self::get_custom_parameters($toolproxy, $tool, $params, $settings));
                if (!empty($instance->id)) {
                    $settings = self::get_tool_settings($tool->toolproxyid, $instance->course, $instance->id);
                    $custom = array_merge($custom, self::get_custom_parameters($toolproxy, $tool, $params,
                        $settings));
                }
            }
        }

        return $custom;
    }

    /**
     * Builds a standard LTI Content-Item selection request.
     *
     * @param int $id The tool type ID.
     * @param stdClass $course The course object.
     * @param moodle_url $returnurl The return URL in the tool consumer (TC) that the tool provider (TP)
     *                              will use to return the Content-Item message.
     * @param string $title The tool's title, if available.
     * @param string $text The text to display to represent the content item. This value may be a long description of the content item.
     * @param array $mediatypes Array of MIME types types supported by the TC. If empty, the TC will support ltilink by default.
     * @param array $presentationtargets Array of ways in which the selected content item(s) can be requested to be opened
     *                                   (via the presentationDocumentTarget element for a returned content item).
     *                                   If empty, "frame", "iframe", and "window" will be supported by default.
     * @param bool $autocreate Indicates whether any content items returned by the TP would be automatically persisted without
     * @param bool $multiple Indicates whether the user should be permitted to select more than one item. False by default.
     *                         any option for the user to cancel the operation. False by default.
     * @param bool $unsigned Indicates whether the TC is willing to accept an unsigned return message, or not.
     *                       A signed message should always be required when the content item is being created automatically in the
     *                       TC without further interaction from the user. False by default.
     * @param bool $canconfirm Flag for can_confirm parameter. False by default.
     * @param bool $copyadvice Indicates whether the TC is able and willing to make a local copy of a content item. False by default.
     * @param string $nonce
     * @return stdClass The object containing the signed request parameters and the URL to the TP's Content-Item selection interface.
     * @throws moodle_exception When the LTI tool type does not exist.`
     * @throws coding_exception For invalid media type and presentation target parameters.
     */
    public static function build_content_item_selection_request($id, $course, moodle_url $returnurl, $title = '', $text = '', $mediatypes = [],
                                                    $presentationtargets = [], $autocreate = false, $multiple = true,
                                                    $unsigned = false, $canconfirm = false, $copyadvice = false, $nonce = '') {
        global $USER;

        $tool = self::get_type($id);
        // Validate parameters.
        if (!$tool) {
            throw new moodle_exception('errortooltypenotfound', 'core_ltix');
        }
        if (!is_array($mediatypes)) {
            throw new coding_exception('The list of accepted media types should be in an array');
        }
        if (!is_array($presentationtargets)) {
            throw new coding_exception('The list of accepted presentation targets should be in an array');
        }

        // Check title. If empty, use the tool's name.
        if (empty($title)) {
            $title = $tool->name;
        }

        $typeconfig = self::get_type_config($id);
        $key = '';
        $secret = '';
        $islti2 = false;
        $islti13 = false;
        if (isset($tool->toolproxyid)) {
            $islti2 = true;
            $toolproxy = self::get_tool_proxy($tool->toolproxyid);
            $key = $toolproxy->guid;
            $secret = $toolproxy->secret;
        } else {
            $islti13 = $tool->ltiversion === LTI_VERSION_1P3;
            $toolproxy = null;
            if ($islti13 && !empty($tool->clientid)) {
                $key = $tool->clientid;
            } else if (!$islti13 && !empty($typeconfig['resourcekey'])) {
                $key = $typeconfig['resourcekey'];
            }
            if (!empty($typeconfig['password'])) {
                $secret = $typeconfig['password'];
            }
        }
        $tool->enabledcapability = '';
        if (!empty($typeconfig['enabledcapability_ContentItemSelectionRequest'])) {
            $tool->enabledcapability = $typeconfig['enabledcapability_ContentItemSelectionRequest'];
        }

        $tool->parameter = '';
        if (!empty($typeconfig['parameter_ContentItemSelectionRequest'])) {
            $tool->parameter = $typeconfig['parameter_ContentItemSelectionRequest'];
        }

        // Set the tool URL.
        if (!empty($typeconfig['toolurl_ContentItemSelectionRequest'])) {
            $toolurl = new moodle_url($typeconfig['toolurl_ContentItemSelectionRequest']);
        } else {
            $toolurl = new moodle_url($typeconfig['toolurl']);
        }

        // Check if SSL is forced.
        if (!empty($typeconfig['forcessl'])) {
            // Make sure the tool URL is set to https.
            if (strtolower($toolurl->get_scheme()) === 'http') {
                $toolurl->set_scheme('https');
            }
            // Make sure the return URL is set to https.
            if (strtolower($returnurl->get_scheme()) === 'http') {
                $returnurl->set_scheme('https');
            }
        }
        $toolurlout = $toolurl->out(false);

        // Get base request parameters.
        $instance = new stdClass();
        $instance->course = $course->id;
        $requestparams = self::build_request($instance, $typeconfig, $course, $id, $islti2);

        // Get LTI2-specific request parameters and merge to the request parameters if applicable.
        if ($islti2) {
            $lti2params = self::build_request_lti2($tool, $requestparams);
            $requestparams = array_merge($requestparams, $lti2params);
        }

        // Get standard request parameters and merge to the request parameters.
        $orgid = self::get_organizationid($typeconfig);
        $standardparams = self::build_standard_message(null, $orgid, $tool->ltiversion, 'ContentItemSelectionRequest');
        $requestparams = array_merge($requestparams, $standardparams);

        // Get custom request parameters and merge to the request parameters.
        $customstr = '';
        if (!empty($typeconfig['customparameters'])) {
            $customstr = $typeconfig['customparameters'];
        }
        $customparams = self::build_custom_parameters($toolproxy, $tool, $instance, $requestparams, $customstr, '', $islti2);
        $requestparams = array_merge($requestparams, $customparams);

        // Add the parameters configured by the LTI services.
        if ($id && !$islti2) {
            $services = self::get_services();
            foreach ($services as $service) {
                $serviceparameters = $service->get_launch_parameters('ContentItemSelectionRequest',
                    $course->id, $USER->id , $id);
                foreach ($serviceparameters as $paramkey => $paramvalue) {
                    $requestparams['custom_' . $paramkey] = self::parse_custom_parameter($toolproxy, $tool,
                        $requestparams, $paramvalue, $islti2);
                }
            }
        }

        // Allow request params to be updated by sub-plugins.
        $plugins = core_component::get_plugin_list('ltixsource');
        foreach (array_keys($plugins) as $plugin) {
            $pluginparams = component_callback('ltixsource_' . $plugin, 'before_launch', [$instance, $toolurlout, $requestparams], []);

            if (!empty($pluginparams) && is_array($pluginparams)) {
                $requestparams = array_merge($requestparams, $pluginparams);
            }
        }

        if (!$islti13) {
            // Media types. Set to ltilink by default if empty.
            if (empty($mediatypes)) {
                $mediatypes = [
                    'application/vnd.ims.lti.v1.ltilink',
                ];
            }
            $requestparams['accept_media_types'] = implode(',', $mediatypes);
        } else {
            // Only LTI links are currently supported.
            $requestparams['accept_types'] = 'ltiResourceLink';
        }

        // Presentation targets. Supports frame, iframe, window by default if empty.
        if (empty($presentationtargets)) {
            $presentationtargets = [
                'frame',
                'iframe',
                'window',
            ];
        }
        $requestparams['accept_presentation_document_targets'] = implode(',', $presentationtargets);

        // Other request parameters.
        $requestparams['accept_copy_advice'] = $copyadvice === true ? 'true' : 'false';
        $requestparams['accept_multiple'] = $multiple === true ? 'true' : 'false';
        $requestparams['accept_unsigned'] = $unsigned === true ? 'true' : 'false';
        $requestparams['auto_create'] = $autocreate === true ? 'true' : 'false';
        $requestparams['can_confirm'] = $canconfirm === true ? 'true' : 'false';
        $requestparams['content_item_return_url'] = $returnurl->out(false);
        $requestparams['title'] = $title;
        $requestparams['text'] = $text;
        if (!$islti13) {
            $signedparams = \core_ltix\oauth_helper::sign_parameters($requestparams, $toolurlout, 'POST', $key, $secret);
        } else {
            $signedparams = \core_ltix\oauth_helper::sign_jwt($requestparams, $toolurlout, $key, $id, $nonce);
        }
        $toolurlparams = $toolurl->params();

        // Strip querystring params in endpoint url from $signedparams to avoid duplication.
        if (!empty($toolurlparams) && !empty($signedparams)) {
            foreach (array_keys($toolurlparams) as $paramname) {
                if (isset($signedparams[$paramname])) {
                    unset($signedparams[$paramname]);
                }
            }
        }

        // Check for params that should not be passed. Unset if they are set.
        $unwantedparams = [
            'resource_link_id',
            'resource_link_title',
            'resource_link_description',
            'launch_presentation_return_url',
            'lis_result_sourcedid',
        ];
        foreach ($unwantedparams as $param) {
            if (isset($signedparams[$param])) {
                unset($signedparams[$param]);
            }
        }

        // Prepare result object.
        $result = new stdClass();
        $result->params = $signedparams;
        $result->url = $toolurlout;

        return $result;
    }

    /**
     * Converts an array of custom parameters to a new line separated string.
     *
     * @param object $params list of params to concatenate
     *
     * @return string
     */
    public static function params_to_string(object $params) {
        $customparameters = [];
        foreach ($params as $key => $value) {
            $customparameters[] = "{$key}={$value}";
        }
        return implode("\n", $customparameters);
    }

    public static function get_tool_table($tools, $id) {
        global $OUTPUT;
        $html = '';

        $typename = get_string('typename', 'core_ltix');
        $baseurl = get_string('baseurl', 'core_ltix');
        $action = get_string('action', 'core_ltix');
        $createdon = get_string('createdon', 'core_ltix');

        if (!empty($tools)) {
            $html .= "
            <div id=\"{$id}_tools_container\" style=\"margin-top:.5em;margin-bottom:.5em\">
                <table id=\"{$id}_tools\">
                    <thead>
                        <tr>
                            <th>$typename</th>
                            <th>$baseurl</th>
                            <th>$createdon</th>
                            <th>$action</th>
                        </tr>
                    </thead>
            ";

            foreach ($tools as $type) {
                $date = userdate($type->timecreated, get_string('strftimedatefullshort', 'core_langconfig'));
                $accept = get_string('accept', 'core_ltix');
                $update = get_string('update', 'core_ltix');
                $delete = get_string('delete', 'core_ltix');

                if (empty($type->toolproxyid)) {
                    $baseurl = new \moodle_url('/ltix/typessettings.php', array(
                            'action' => 'accept',
                            'id' => $type->id,
                            'sesskey' => sesskey(),
                            'tab' => $id
                        ));
                    $ref = $type->baseurl;
                } else {
                    $baseurl = new \moodle_url('/ltix/toolssettings.php', array(
                            'action' => 'accept',
                            'id' => $type->id,
                            'sesskey' => sesskey(),
                            'tab' => $id
                        ));
                    $ref = $type->tpname;
                }

                $accepthtml = $OUTPUT->action_icon($baseurl,
                        new \pix_icon('t/check', $accept, '', array('class' => 'iconsmall')), null,
                        array('title' => $accept, 'class' => 'editing_accept'));

                $deleteaction = 'delete';

                if ($type->state == LTI_TOOL_STATE_CONFIGURED) {
                    $accepthtml = '';
                }

                if ($type->state != LTI_TOOL_STATE_REJECTED) {
                    $deleteaction = 'reject';
                    $delete = get_string('reject', 'core_ltix');
                }

                $updateurl = clone($baseurl);
                $updateurl->param('action', 'update');
                $updatehtml = $OUTPUT->action_icon($updateurl,
                        new \pix_icon('t/edit', $update, '', array('class' => 'iconsmall')), null,
                        array('title' => $update, 'class' => 'editing_update'));

                if (($type->state != LTI_TOOL_STATE_REJECTED) || empty($type->toolproxyid)) {
                    $deleteurl = clone($baseurl);
                    $deleteurl->param('action', $deleteaction);
                    $deletehtml = $OUTPUT->action_icon($deleteurl,
                            new \pix_icon('t/delete', $delete, '', array('class' => 'iconsmall')), null,
                            array('title' => $delete, 'class' => 'editing_delete'));
                } else {
                    $deletehtml = '';
                }
                $html .= "
                <tr>
                    <td>
                        {$type->name}
                    </td>
                    <td>
                        {$ref}
                    </td>
                    <td>
                        {$date}
                    </td>
                    <td align=\"center\">
                        {$accepthtml}{$updatehtml}{$deletehtml}
                    </td>
                </tr>
                ";
            }
            $html .= '</table></div>';
        } else {
            $html .= get_string('no_' . $id, 'core_ltix');
        }

        return $html;
    }

    /**
     * This function builds the tab for a category of tool proxies
     *
     * @param object    $toolproxies    Tool proxy instance objects
     * @param string    $id             Category ID
     *
     * @return string                   HTML for tab
     */
    public static function get_tool_proxy_table($toolproxies, $id) {
        global $OUTPUT;

        if (!empty($toolproxies)) {
            $typename = get_string('typename', 'core_ltix');
            $url = get_string('registrationurl', 'core_ltix');
            $action = get_string('action', 'core_ltix');
            $createdon = get_string('createdon', 'core_ltix');

            $html = <<< EOD
            <div id="{$id}_tool_proxies_container" style="margin-top: 0.5em; margin-bottom: 0.5em">
                <table id="{$id}_tool_proxies">
                    <thead>
                        <tr>
                            <th>{$typename}</th>
                            <th>{$url}</th>
                            <th>{$createdon}</th>
                            <th>{$action}</th>
                        </tr>
                    </thead>
    EOD;
            foreach ($toolproxies as $toolproxy) {
                $date = userdate($toolproxy->timecreated, get_string('strftimedatefullshort', 'core_langconfig'));
                $accept = get_string('register', 'core_ltix');
                $update = get_string('update', 'core_ltix');
                $delete = get_string('delete', 'core_ltix');

                $baseurl = new \moodle_url('/ltix/registersettings.php', array(
                        'action' => 'accept',
                        'id' => $toolproxy->id,
                        'sesskey' => sesskey(),
                        'tab' => $id
                    ));

                $registerurl = new \moodle_url('/ltix/register.php', array(
                    'id' => $toolproxy->id,
                    'sesskey' => sesskey(),
                    'tab' => 'tool_proxy'
                ));

                $accepthtml = $OUTPUT->action_icon($registerurl,
                        new \pix_icon('t/check', $accept, '', array('class' => 'iconsmall')), null,
                        array('title' => $accept, 'class' => 'editing_accept'));

                $deleteaction = 'delete';

                if ($toolproxy->state != LTI_TOOL_PROXY_STATE_CONFIGURED) {
                    $accepthtml = '';
                }

                if (($toolproxy->state == LTI_TOOL_PROXY_STATE_CONFIGURED) || ($toolproxy->state == LTI_TOOL_PROXY_STATE_PENDING)) {
                    $delete = get_string('cancel', 'core_ltix');
                }

                $updateurl = clone($baseurl);
                $updateurl->param('action', 'update');
                $updatehtml = $OUTPUT->action_icon($updateurl,
                        new \pix_icon('t/edit', $update, '', array('class' => 'iconsmall')), null,
                        array('title' => $update, 'class' => 'editing_update'));

                $deleteurl = clone($baseurl);
                $deleteurl->param('action', $deleteaction);
                $deletehtml = $OUTPUT->action_icon($deleteurl,
                        new \pix_icon('t/delete', $delete, '', array('class' => 'iconsmall')), null,
                        array('title' => $delete, 'class' => 'editing_delete'));
                $html .= <<< EOD
                <tr>
                    <td>
                        {$toolproxy->name}
                    </td>
                    <td>
                        {$toolproxy->regurl}
                    </td>
                    <td>
                        {$date}
                    </td>
                    <td align="center">
                        {$accepthtml}{$updatehtml}{$deletehtml}
                    </td>
                </tr>
    EOD;
            }
            $html .= '</table></div>';
        } else {
            $html = get_string('no_' . $id, 'core_ltix');
        }

        return $html;
    }

    /**
     * Gets the IMS role string for the specified user and LTI course module.
     *
     * @param mixed    $user      User object or user id
     * @param int      $cmid      The course module id of the LTI activity
     * @param int      $courseid  The course id of the LTI activity
     * @param boolean  $islti2    True if an LTI 2 tool is being launched
     *
     * @return string A role string suitable for passing with an LTI launch
     */
    public static function get_ims_role($user, $cmid, $courseid, $islti2) {
        $roles = [];

        if (empty($cmid)) {
            // If no cmid is passed, check if the user is a teacher in the course
            // This allows other modules to programmatically "fake" a launch without
            // a real LTI instance.
            $context = \context_course::instance($courseid);

            if (has_capability('moodle/course:manageactivities', $context, $user)) {
                array_push($roles, 'Instructor');
            } else {
                array_push($roles, 'Learner');
            }
        } else {
            $context = \context_module::instance($cmid);

            if (has_capability('moodle/ltix:manage', $context)) {
                array_push($roles, 'Instructor');
            } else {
                array_push($roles, 'Learner');
            }
        }

        if (!is_role_switched($courseid) && (is_siteadmin($user)) || has_capability('moodle/ltix:admin', $context)) {
            // Make sure admins do not have the Learner role, then set admin role.
            $roles = array_diff($roles, array('Learner'));
            if (!$islti2) {
                array_push($roles, 'urn:lti:sysrole:ims/lis/Administrator', 'urn:lti:instrole:ims/lis/Administrator');
            } else {
                array_push($roles, 'http://purl.imsglobal.org/vocab/lis/v2/person#Administrator');
            }
        }

        return join(',', $roles);
    }

    public static function get_shared_secrets_by_key($key) {
        global $DB;

        // Look up the shared secret for the specified key in both the types_config table (for configured tools)
        // And in the lti resource table for ad-hoc tools.
        $lti13 = LTI_VERSION_1P3;
        $query = "SELECT " . $DB->sql_compare_text('t2.value', 256) . " AS value
                    FROM {lti_types_config} t1
                    JOIN {lti_types_config} t2 ON t1.typeid = t2.typeid
                    JOIN {lti_types} type ON t2.typeid = type.id
                  WHERE t1.name = 'resourcekey'
                    AND " . $DB->sql_compare_text('t1.value', 256) . " = :key1
                    AND t2.name = 'password'
                    AND type.state = :configured1
                    AND type.ltiversion <> :ltiversion
                   UNION
                  SELECT tp.secret AS value
                    FROM {lti_tool_proxies} tp
                    JOIN {lti_types} t ON tp.id = t.toolproxyid
                  WHERE tp.guid = :key2
                    AND t.state = :configured2
                   UNION
                  SELECT password AS value
                   FROM {lti}
                  WHERE resourcekey = :key3";

        $sharedsecrets = $DB->get_records_sql($query, array('configured1' => LTI_TOOL_STATE_CONFIGURED, 'ltiversion' => $lti13,
            'configured2' => LTI_TOOL_STATE_CONFIGURED, 'key1' => $key, 'key2' => $key, 'key3' => $key));

        $values = array_map(function($item) {
            return $item->value;
        }, $sharedsecrets);

        // There should really only be one shared secret per key. But, we can't prevent
        // more than one getting entered. For instance, if the same key is used for two tool providers.
        return $values;
    }

    /**
     * Transforms a basic LTI object to an array
     *
     * @param object $ltiobject    Basic LTI object
     *
     * @return array Basic LTI configuration details
     */
    public static function get_config($ltiobject) {
        $typeconfig = (array)$ltiobject;
        $additionalconfig = self::get_type_config($ltiobject->typeid);
        $typeconfig = array_merge($typeconfig, $additionalconfig);
        return $typeconfig;
    }

    /**
     *
     * Generates some of the tool configuration based on the instance details
     *
     * @param int $id
     *
     * @return object configuration
     *
     */
    public static function get_type_config_from_instance($id) {
        global $DB;

        $instance = $DB->get_record('lti', array('id' => $id));
        $config = self::get_config($instance);

        $type = new \stdClass();
        $type->lti_fix = $id;
        if (isset($config['toolurl'])) {
            $type->lti_toolurl = $config['toolurl'];
        }
        if (isset($config['instructorchoicesendname'])) {
            $type->lti_sendname = $config['instructorchoicesendname'];
        }
        if (isset($config['instructorchoicesendemailaddr'])) {
            $type->lti_sendemailaddr = $config['instructorchoicesendemailaddr'];
        }
        if (isset($config['instructorchoiceacceptgrades'])) {
            $type->lti_acceptgrades = $config['instructorchoiceacceptgrades'];
        }
        if (isset($config['instructorchoiceallowroster'])) {
            $type->lti_allowroster = $config['instructorchoiceallowroster'];
        }

        if (isset($config['instructorcustomparameters'])) {
            $type->lti_allowsetting = $config['instructorcustomparameters'];
        }
        return $type;
    }

    /**
     * Posts the launch petition HTML
     *
     * @param array $newparms   Signed parameters
     * @param string $endpoint  URL of the external tool
     * @param bool $debug       Debug (true/false)
     * @return string
     */
    public static function post_launch_html($newparms, $endpoint, $debug=false) {
        $r = "<form action=\"" . $endpoint .
            "\" name=\"ltiLaunchForm\" id=\"ltiLaunchForm\" method=\"post\" encType=\"application/x-www-form-urlencoded\">\n";

        // Contruct html for the launch parameters.
        foreach ($newparms as $key => $value) {
            $key = htmlspecialchars($key, ENT_COMPAT);
            $value = htmlspecialchars($value, ENT_COMPAT);
            if ( $key == "ext_submit" ) {
                $r .= "<input type=\"submit\"";
            } else {
                $r .= "<input type=\"hidden\" name=\"{$key}\"";
            }
            $r .= " value=\"";
            $r .= $value;
            $r .= "\"/>\n";
        }

        if ( $debug ) {
            $r .= "<script language=\"javascript\"> \n";
            $r .= "  //<![CDATA[ \n";
            $r .= "function basicltiDebugToggle() {\n";
            $r .= "    var ele = document.getElementById(\"basicltiDebug\");\n";
            $r .= "    if (ele.style.display == \"block\") {\n";
            $r .= "        ele.style.display = \"none\";\n";
            $r .= "    }\n";
            $r .= "    else {\n";
            $r .= "        ele.style.display = \"block\";\n";
            $r .= "    }\n";
            $r .= "} \n";
            $r .= "  //]]> \n";
            $r .= "</script>\n";
            $r .= "<a id=\"displayText\" href=\"javascript:basicltiDebugToggle();\">";
            $r .= get_string("toggle_debug_data", "lti")."</a>\n";
            $r .= "<div id=\"basicltiDebug\" style=\"display:none\">\n";
            $r .= "<b>".get_string("basiclti_endpoint", "lti")."</b><br/>\n";
            $r .= $endpoint . "<br/>\n&nbsp;<br/>\n";
            $r .= "<b>".get_string("basiclti_parameters", "lti")."</b><br/>\n";
            foreach ($newparms as $key => $value) {
                $key = htmlspecialchars($key, ENT_COMPAT);
                $value = htmlspecialchars($value, ENT_COMPAT);
                $r .= "$key = $value<br/>\n";
            }
            $r .= "&nbsp;<br/>\n";
            $r .= "</div>\n";
        }
        $r .= "</form>\n";

        // Auto-submit the form if endpoint is set.
        if ($endpoint !== '' && !$debug) {
            $r .= " <script type=\"text/javascript\"> \n" .
                "  //<![CDATA[ \n" .
                "    document.ltiLaunchForm.submit(); \n" .
                "  //]]> \n" .
                " </script> \n";
        }
        return $r;
    }

    /**
     * Generate the form for initiating a login request for an LTI 1.3 message
     *
     * @param int            $courseid  Course ID
     * @param int            $cmid        LTI instance ID
     * @param stdClass|null  $instance  LTI instance
     * @param stdClass       $config    Tool type configuration
     * @param string         $messagetype   LTI message type
     * @param string         $title     Title of content item
     * @param string         $text      Description of content item
     * @param int            $foruserid Id of the user targeted by the launch
     * @return string
     */
    public static function initiate_login($courseid, $cmid, $instance, $config, $messagetype = 'basic-lti-launch-request',
            $title = '', $text = '', $foruserid = 0) {
        global $SESSION;

        $params = self::build_login_request($courseid, $cmid, $instance, $config, $messagetype, $foruserid, $title, $text);

        $r = "<form action=\"" . $config->lti_initiatelogin .
            "\" name=\"ltiInitiateLoginForm\" id=\"ltiInitiateLoginForm\" method=\"post\" " .
            "encType=\"application/x-www-form-urlencoded\">\n";

        foreach ($params as $key => $value) {
            $key = htmlspecialchars($key, ENT_COMPAT);
            $value = htmlspecialchars($value, ENT_COMPAT);
            $r .= "  <input type=\"hidden\" name=\"{$key}\" value=\"{$value}\"/>\n";
        }
        $r .= "</form>\n";

        $r .= "<script type=\"text/javascript\">\n" .
            "//<![CDATA[\n" .
            "document.ltiInitiateLoginForm.submit();\n" .
            "//]]>\n" .
            "</script>\n";

        return $r;
    }

    /**
     * Prepares an LTI 1.3 login request
     *
     * @param int            $courseid  Course ID
     * @param int            $cmid        Course Module instance ID
     * @param stdClass|null  $instance  LTI instance
     * @param stdClass       $config    Tool type configuration
     * @param string         $messagetype   LTI message type
     * @param int            $foruserid Id of the user targeted by the launch
     * @param string         $title     Title of content item
     * @param string         $text      Description of content item
     * @return array Login request parameters
     */
    public static function build_login_request($courseid, $cmid, $instance, $config, $messagetype, $foruserid=0, $title = '', $text = '') {
        global $USER, $CFG, $SESSION;
        $ltihint = [];
        if (!empty($instance)) {
            $endpoint = !empty($instance->toolurl) ? $instance->toolurl : $config->lti_toolurl;
            $launchid = 'ltilaunch'.$instance->id.'_'.rand();
            $ltihint['cmid'] = $cmid;
            $SESSION->$launchid = "{$courseid},{$config->typeid},{$cmid},{$messagetype},{$foruserid},,";
        } else {
            $endpoint = $config->lti_toolurl;
            if (($messagetype === 'ContentItemSelectionRequest') && !empty($config->lti_toolurl_ContentItemSelectionRequest)) {
                $endpoint = $config->lti_toolurl_ContentItemSelectionRequest;
            }
            $launchid = "ltilaunch_$messagetype".rand();
            $SESSION->$launchid =
                "{$courseid},{$config->typeid},,{$messagetype},{$foruserid}," . base64_encode($title) . ',' . base64_encode($text);
        }
        $endpoint = trim($endpoint);
        $services = self::get_services();
        foreach ($services as $service) {
            [$endpoint] = $service->override_endpoint($messagetype ?? 'basic-lti-launch-request', $endpoint, '', $courseid, $instance);
        }

        $ltihint['launchid'] = $launchid;
        // If SSL is forced make sure https is on the normal launch URL.
        if (isset($config->lti_forcessl) && ($config->lti_forcessl == '1')) {
            $endpoint = self::ensure_url_is_https($endpoint);
        } else if (!strstr($endpoint, '://')) {
            $endpoint = 'http://' . $endpoint;
        }

        $params = array();
        $params['iss'] = $CFG->wwwroot;
        $params['target_link_uri'] = $endpoint;
        $params['login_hint'] = $USER->id;
        $params['lti_message_hint'] = json_encode($ltihint);
        $params['client_id'] = $config->lti_clientid;
        $params['lti_deployment_id'] = $config->typeid;
        return $params;
    }

    public static function get_launch_container($lti, $toolconfig) {
        if (empty($lti->launchcontainer)) {
            $lti->launchcontainer = LTI_LAUNCH_CONTAINER_DEFAULT;
        }

        if ($lti->launchcontainer == LTI_LAUNCH_CONTAINER_DEFAULT) {
            if (isset($toolconfig['launchcontainer'])) {
                $launchcontainer = $toolconfig['launchcontainer'];
            }
        } else {
            $launchcontainer = $lti->launchcontainer;
        }

        if (empty($launchcontainer) || $launchcontainer == LTI_LAUNCH_CONTAINER_DEFAULT) {
            $launchcontainer = LTI_LAUNCH_CONTAINER_EMBED_NO_BLOCKS;
        }

        $devicetype = core_useragent::get_device_type();

        // Scrolling within the object element doesn't work on iOS or Android
        // Opening the popup window also had some issues in testing
        // For mobile devices, always take up the entire screen to ensure the best experience.
        if ($devicetype === core_useragent::DEVICETYPE_MOBILE || $devicetype === core_useragent::DEVICETYPE_TABLET ) {
            $launchcontainer = LTI_LAUNCH_CONTAINER_REPLACE_MOODLE_WINDOW;
        }

        return $launchcontainer;
    }

    /**
     * Determines if we should try to log the request
     *
     * @param string $rawbody
     * @return bool
     */
    public static function should_log_request($rawbody) {
        global $CFG;

        if (!empty($CFG->mod_lti_log_users)) {
            debugging('mod_lti_log_users is deprecated. Please use ltix_log_users instead.', DEBUG_DEVELOPER);
        }

        if (empty($CFG->ltix_log_users) && empty($CFG->mod_lti_log_users)) {
            return false;
        }

        $logusers = [];
        if (!empty($CFG->ltix_log_users)) {
            $logusers = explode(',', $CFG->ltix_log_users);
        } elseif (!empty($CFG->mod_lti_log_users)) {
            $logusers = explode(',', $CFG->mod_lti_log_users);
        }
        if (empty($logusers)) {
            return false;
        }

        try {
            $xml = new \SimpleXMLElement($rawbody);
            $ns  = $xml->getNamespaces();
            $ns  = array_shift($ns);
            $xml->registerXPathNamespace('lti', $ns);
            $requestuserid = '';
            if ($node = $xml->xpath('//lti:userId')) {
                $node = $node[0];
                $requestuserid = clean_param((string) $node, PARAM_INT);
            } else if ($node = $xml->xpath('//lti:sourcedId')) {
                $node = $node[0];
                $resultjson = json_decode((string) $node);
                $requestuserid = clean_param($resultjson->data->userid, PARAM_INT);
            }
        } catch (\Exception $e) {
            return false;
        }

        if (empty($requestuserid) or !in_array($requestuserid, $logusers)) {
            return false;
        }

        return true;
    }

    /**
     * Logs the request to a file in temp dir.
     *
     * @param string $rawbody
     */
    public static function log_request($rawbody) {
        if ($tempdir = make_temp_directory('mod_lti', false)) {
            if ($tempfile = tempnam($tempdir, 'mod_lti_request'.date('YmdHis'))) {
                $content  = "Request Headers:\n";
                foreach (\core_ltix\OAuthUtil::get_headers() as $header => $value) {
                    $content .= "$header: $value\n";
                }
                $content .= "Request Body:\n";
                $content .= $rawbody;

                file_put_contents($tempfile, $content);
                chmod($tempfile, 0644);
            }
        }
    }

    /**
     * Log an LTI response.
     *
     * @param string $responsexml The response XML
     * @param Exception $e If there was an exception, pass that too
     */
    public static function log_response($responsexml, $e = null) {
        if ($tempdir = make_temp_directory('mod_lti', false)) {
            if ($tempfile = tempnam($tempdir, 'mod_lti_response'.date('YmdHis'))) {
                $content = '';
                if ($e instanceof \Exception) {
                    $info = get_exception_info($e);

                    $content .= "Exception:\n";
                    $content .= "Message: $info->message\n";
                    $content .= "Debug info: $info->debuginfo\n";
                    $content .= "Backtrace:\n";
                    $content .= format_backtrace($info->backtrace, true);
                    $content .= "\n";
                }
                $content .= "Response XML:\n";
                $content .= $responsexml;

                file_put_contents($tempfile, $content);
                chmod($tempfile, 0644);
            }
        }
    }

    /**
     * Fetches LTI type configuration for an LTI instance
     *
     * @param stdClass $instance
     * @return array Can be empty if no type is found
     */
    public static function get_type_config_by_instance($instance) {
        $typeid = null;
        if (empty($instance->typeid)) {
            $tool = self::get_tool_by_url_match($instance->toolurl, $instance->course);
            if ($tool) {
                $typeid = $tool->id;
            }
        } else {
            $typeid = $instance->typeid;
        }
        if (!empty($typeid)) {
            return self::get_type_config($typeid);
        }
        return array();
    }

    /**
     * Enforce type config settings onto the LTI instance
     *
     * @param stdClass $instance
     * @param array $typeconfig
     */
    public static function force_type_config_settings($instance, array $typeconfig) {
        $forced = array(
            'instructorchoicesendname'      => 'sendname',
            'instructorchoicesendemailaddr' => 'sendemailaddr',
            'instructorchoiceacceptgrades'  => 'acceptgrades',
        );

        foreach ($forced as $instanceparam => $typeconfigparam) {
            if (array_key_exists($typeconfigparam, $typeconfig) && $typeconfig[$typeconfigparam] != LTI_SETTING_DELEGATE) {
                $instance->$instanceparam = $typeconfig[$typeconfigparam];
            }
        }
    }



    /**
     * Finds a service by id
     *
     * @param \core_ltix\local\ltiservice\service_base[] $services Array of services
     * @param string $resourceid  ID of resource
     *
     * @return \core_ltix\local\ltiservice\service_base Service
     */
    public static function get_service_by_resource_id($services, $resourceid) {

        $service = false;
        foreach ($services as $aservice) {
            foreach ($aservice->get_resources() as $resource) {
                if ($resource->get_id() === $resourceid) {
                    $service = $aservice;
                    break 2;
                }
            }
        }

        return $service;

    }

    /**
     * Initializes an array with the scopes for services supported by the LTI module
     * and authorized for this particular tool instance.
     *
     * @param object $type  LTI tool type
     * @param array  $typeconfig  LTI tool type configuration
     *
     * @return array List of scopes
     */
    public static function get_permitted_service_scopes($type, $typeconfig) {

        $services = self::get_services();
        $scopes = [];
        foreach ($services as $service) {
            $service->set_type($type);
            $service->set_typeconfig($typeconfig);
            $servicescopes = $service->get_permitted_scopes();
            if (!empty($servicescopes)) {
                $scopes = array_merge($scopes, $servicescopes);
            }
        }

        return $scopes;
    }

    /**
     * Extracts the named contexts from a tool proxy
     *
     * @param object $json
     *
     * @return array Contexts
     */
    public static function get_contexts($json) {

        $contexts = [];
        if (isset($json->{'@context'})) {
            foreach ($json->{'@context'} as $context) {
                if (is_object($context)) {
                    $contexts = array_merge(get_object_vars($context), $contexts);
                }
            }
        }

        return $contexts;

    }

    /**
     * Converts an ID to a fully-qualified ID
     *
     * @param array $contexts
     * @param string $id
     *
     * @return string Fully-qualified ID
     */
    public static function get_fqid($contexts, $id) {

        $parts = explode(':', $id, 2);
        if (count($parts) > 1) {
            if (array_key_exists($parts[0], $contexts)) {
                $id = $contexts[$parts[0]] . $parts[1];
            }
        }

        return $id;

    }

    /**
     * Returns the edit url for the given tool type
     *
     * @param stdClass $type The tool type
     *
     * @return string The url to edit the tool type
     */
    public static function get_tool_type_edit_url(stdClass $type) {
        $url = new moodle_url('/ltix/typessettings.php',
                            array('action' => 'update', 'id' => $type->id, 'sesskey' => sesskey(), 'returnto' => 'toolconfigure'));
        return $url->out();
    }

    /**
     * Returns the edit url for the given tool proxy.
     *
     * @param stdClass $proxy The tool proxy
     *
     * @return string The url to edit the tool type
     */
    public static function get_tool_proxy_edit_url(stdClass $proxy) {
        $url = new moodle_url('/ltix/registersettings.php',
                            array('action' => 'update', 'id' => $proxy->id, 'sesskey' => sesskey(), 'returnto' => 'toolconfigure'));
        return $url->out();
    }

    /**
     * Returns the icon for the given tool type
     *
     * @param stdClass $type The tool type
     *
     * @return string The url to the tool type's corresponding icon
     */
    public static function get_tool_type_icon_url(stdClass $type) {
        global $OUTPUT;

        $iconurl = $type->secureicon;

        if (empty($iconurl)) {
            $iconurl = $type->icon;
        }

        if (empty($iconurl)) {
            $iconurl = $OUTPUT->image_url('i/lti', 'core')->out();
        }

        return $iconurl;
    }

    /**
     * Returns the course url for the given tool type
     *
     * @param stdClass $type The tool type
     *
     * @return string The url to the course of the tool type, void if it is a site wide type
     */
    public static function get_tool_type_course_url(stdClass $type) {
        if ($type->course != 1) {
            $url = new moodle_url('/course/view.php', array('id' => $type->course));
            return $url->out();
        }
        return null;
    }

    /**
     * Returns the icon and edit urls for the tool type and the course url if it is a course type.
     *
     * @param stdClass $type The tool type
     *
     * @return array The urls of the tool type
     */
    public static function get_tool_type_urls(stdClass $type) {
        $courseurl = self::get_tool_type_course_url($type);

        $urls = array(
            'icon' => self::get_tool_type_icon_url($type),
            'edit' => self::get_tool_type_edit_url($type),
        );

        if ($courseurl) {
            $urls['course'] = $courseurl;
        }

        $url = new moodle_url('/ltix/certs.php');
        $urls['publickeyset'] = $url->out();
        $url = new moodle_url('/ltix/token.php');
        $urls['accesstoken'] = $url->out();
        $url = new moodle_url('/ltix/auth.php');
        $urls['authrequest'] = $url->out();

        return $urls;
    }

    /**
     * Returns the icon and edit urls for the tool proxy.
     *
     * @param stdClass $proxy The tool proxy
     *
     * @return array The urls of the tool proxy
     */
    public static function get_tool_proxy_urls(stdClass $proxy) {
        global $OUTPUT;

        $urls = array(
            'icon' => $OUTPUT->image_url('i/lti', 'core')->out(),
            'edit' => self::get_tool_proxy_edit_url($proxy),
        );

        return $urls;
    }

    /**
     * Returns the ids of each instance of this tool type
     *
     * @param stdClass $type The tool type
     *
     * @return array An array of ids of the instances of this tool type
     */
    public static function get_tool_type_instance_ids($type) {
        global $DB;

        return array_keys($DB->get_fieldset_select('lti', 'id', 'typeid = ?', array($type->id)));
    }

    /**
     * Serialises this tool type
     *
     * @param stdClass $type The tool type
     *
     * @return array An array of values representing this type
     */
    public static function serialise_tool_type(stdClass $type) {
        global $CFG;

        $capabilitygroups = self::get_tool_type_capability_groups($type);
        $instanceids = self::get_tool_type_instance_ids($type);
        // Clean the name. We don't want tags here.
        $name = clean_param($type->name, PARAM_NOTAGS);
        if (!empty($type->description)) {
            // Clean the description. We don't want tags here.
            $description = clean_param($type->description, PARAM_NOTAGS);
        } else {
            $description = get_string('editdescription', 'mod_lti');
        }
        return array(
            'id' => $type->id,
            'name' => $name,
            'description' => $description,
            'urls' => self::get_tool_type_urls($type),
            'state' => self::get_tool_type_state_info($type),
            'platformid' => $CFG->wwwroot,
            'clientid' => $type->clientid,
            'deploymentid' => $type->id,
            'hascapabilitygroups' => !empty($capabilitygroups),
            'capabilitygroups' => $capabilitygroups,
            // Course ID of 1 means it's not linked to a course.
            'courseid' => $type->course == 1 ? 0 : $type->course,
            'instanceids' => $instanceids,
            'instancecount' => count($instanceids)
        );
    }

    /**
     * Loads the cartridge information into the new tool, if the launch url is for a cartridge file
     *
     * @param stdClass $lti The tools config
     * @since Moodle 3.1
     */
    public static function load_tool_if_cartridge($lti) {
        if (!empty($lti->toolurl) && self::is_cartridge($lti->toolurl)) {
            self::load_tool_from_cartridge($lti->toolurl, $lti);
        }
    }

    /**
     * Allows you to load in the configuration for an external tool from an IMS cartridge.
     *
     * @param  string   $url    The URL to the cartridge
     * @param  stdClass $lti    LTI object
     * @throws moodle_exception if the cartridge could not be loaded correctly
     * @since Moodle 3.1
     */
    public static function load_tool_from_cartridge($url, $lti) {
        $toolinfo = self::load_cartridge($url,
            array(
                "title" => "name",
                "launch_url" => "toolurl",
                "secure_launch_url" => "securetoolurl",
                "description" => "intro",
                "icon" => "icon",
                "secure_icon" => "secureicon"
            ),
            array(
                "icon_url" => "extension_icon",
                "secure_icon_url" => "extension_secureicon"
            )
        );
        // If an activity name exists, unset the cartridge name so we don't override it.
        if (isset($lti->name)) {
            unset($toolinfo['name']);
        }

        // Always prefer cartridge core icons first, then, if none are found, look at the extension icons.
        if (empty($toolinfo['icon']) && !empty($toolinfo['extension_icon'])) {
            $toolinfo['icon'] = $toolinfo['extension_icon'];
        }
        unset($toolinfo['extension_icon']);

        if (empty($toolinfo['secureicon']) && !empty($toolinfo['extension_secureicon'])) {
            $toolinfo['secureicon'] = $toolinfo['extension_secureicon'];
        }
        unset($toolinfo['extension_secureicon']);

        foreach ($toolinfo as $property => $value) {
            $lti->$property = $value;
        }
    }
    /**
     * Returns available Basic LTI types
     *
     * @return array of basicLTI types
     */
    public static function get_lti_types() {
        global $DB;

        return $DB->get_records('lti_types', null, 'state DESC, timemodified DESC');
    }

    /**
     * Returns available Basic LTI types that match the given
     * tool proxy id
     *
     * @param int $toolproxyid Tool proxy id
     * @return array of basicLTI types
     */
    public static function get_lti_types_from_proxy_id($toolproxyid) {
        global $DB;

        return $DB->get_records('lti_types', array('toolproxyid' => $toolproxyid), 'state DESC, timemodified DESC');
    }

    /**
     * Replaces the mod/lti/auth.php file.
     *
     */
    public static function get_auth_endpoint() {
        global $PAGE, $SESSION, $USER, $DB, $_POST, $_SERVER;

        if (!isloggedin() && empty($_POST['repost'])) {
            header_remove("Set-Cookie");
            $PAGE->set_pagelayout('popup');
            $PAGE->set_context(\context_system::instance());
            $output = $PAGE->get_renderer('core_ltix');
            $page = new \core_ltix\output\repost_crosssite_page($_SERVER['REQUEST_URI'], $_POST);
            echo $output->header();
            echo $output->render($page);
            echo $output->footer();
            return;
        }

        $scope = optional_param('scope', '', PARAM_TEXT);
        $responsetype = optional_param('response_type', '', PARAM_TEXT);
        $clientid = optional_param('client_id', '', PARAM_TEXT);
        $redirecturi = optional_param('redirect_uri', '', PARAM_URL);
        $loginhint = optional_param('login_hint', '', PARAM_TEXT);
        $ltimessagehintenc = optional_param('lti_message_hint', '', PARAM_TEXT);
        $state = optional_param('state', '', PARAM_TEXT);
        $responsemode = optional_param('response_mode', '', PARAM_TEXT);
        $nonce = optional_param('nonce', '', PARAM_TEXT);
        $prompt = optional_param('prompt', '', PARAM_TEXT);

        $ok = !empty($scope) && !empty($responsetype) && !empty($clientid) &&
            !empty($redirecturi) && !empty($loginhint) &&
            !empty($nonce);

        if (!$ok) {
            $error = 'invalid_request';
        }
        $ltimessagehint = json_decode($ltimessagehintenc);
        $ok = $ok && isset($ltimessagehint->launchid);
        if (!$ok) {
            $error = 'invalid_request';
            $desc = 'No launch id in LTI hint';
        }
        if ($ok && ($scope !== 'openid')) {
            $ok = false;
            $error = 'invalid_scope';
        }
        if ($ok && ($responsetype !== 'id_token')) {
            $ok = false;
            $error = 'unsupported_response_type';
        }
        if ($ok) {
            $launchid = $ltimessagehint->launchid;
            list($courseid, $typeid, $id, $messagetype, $foruserid, $titleb64, $textb64) = explode(',', $SESSION->$launchid, 7);
            unset($SESSION->$launchid);
            $config = self::get_type_type_config($typeid);
            $ok = ($clientid === $config->lti_clientid);
            if (!$ok) {
                $error = 'unauthorized_client';
            }
        }
        if ($ok && ($loginhint !== $USER->id)) {
            $ok = false;
            $error = 'access_denied';
        }

        // If we're unable to load up config; we cannot trust the redirect uri for POSTing to.
        if (empty($config)) {
            throw new moodle_exception('invalidrequest', 'error');
        } else {
            $uris = array_map("trim", explode("\n", $config->lti_redirectionuris));
            if (!in_array($redirecturi, $uris)) {
                throw new moodle_exception('invalidrequest', 'error');
            }
        }
        if ($ok) {
            if (isset($responsemode)) {
                $ok = ($responsemode === 'form_post');
                if (!$ok) {
                    $error = 'invalid_request';
                    $desc = 'Invalid response_mode';
                }
            } else {
                $ok = false;
                $error = 'invalid_request';
                $desc = 'Missing response_mode';
            }
        }
        if ($ok && !empty($prompt) && ($prompt !== 'none')) {
            $ok = false;
            $error = 'invalid_request';
            $desc = 'Invalid prompt';
        }

        if ($ok) {
            $course = $DB->get_record('course', array('id' => $courseid), '*', MUST_EXIST);
            if ($id) {
                $cm = get_coursemodule_from_id('lti', $id, 0, false, MUST_EXIST);
                $context = \context_module::instance($cm->id);
                require_login($course, true, $cm);
                require_capability('mod/lti:view', $context);
                $lti = $DB->get_record('lti', array('id' => $cm->instance), '*', MUST_EXIST);
                $lti->cmid = $cm->id;
                list($endpoint, $params) = self::get_launch_data($lti, $nonce, $messagetype, $foruserid);
            } else {
                require_login($course);
                $context = \context_course::instance($courseid);
                require_capability('moodle/course:manageactivities', $context);
                require_capability('moodle/ltix:addcoursetool', $context);
                // Set the return URL. We send the launch container along to help us avoid frames-within-frames when the user returns.
                $returnurlparams = [
                    'course' => $courseid,
                    'id' => $typeid,
                    'sesskey' => sesskey()
                ];
                $returnurl = new \moodle_url('/ltix/contentitem_return.php', $returnurlparams);
                // Prepare the request.
                $title = base64_decode($titleb64);
                $text = base64_decode($textb64);
                $request = self::build_content_item_selection_request($typeid, $course, $returnurl, $title, $text,
                    [], [], false, true, false, false, false, $nonce);
                $endpoint = $request->url;
                $params = $request->params;
            }
        } else {
            $params['error'] = $error;
            if (!empty($desc)) {
                $params['error_description'] = $desc;
            }
        }
        if (isset($state)) {
            $params['state'] = $state;
        }
        unset($SESSION->lti_message_hint);
        $r = '<form action="' . $redirecturi . "\" name=\"ltiAuthForm\" id=\"ltiAuthForm\" " .
            "method=\"post\" enctype=\"application/x-www-form-urlencoded\">\n";
        if (!empty($params)) {
            foreach ($params as $key => $value) {
                $key = htmlspecialchars($key, ENT_COMPAT);
                $value = htmlspecialchars($value, ENT_COMPAT);
                $r .= "  <input type=\"hidden\" name=\"{$key}\" value=\"{$value}\"/>\n";
            }
        }
        $r .= "</form>\n";
        $r .= "<script type=\"text/javascript\">\n" .
            "//<![CDATA[\n" .
            "document.ltiAuthForm.submit();\n" .
            "//]]>\n" .
            "</script>\n";
        echo $r;
    }

    /**
     * Replaces the mod/lti/certs.php file.
     *
     */
    public static function get_certs_endpoint() {

        @header('Content-Type: application/json; charset=utf-8');

        echo json_encode(jwks_helper::get_jwks(), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    }

    /**
     * Replaces the mod/lti/token.php file.
     *
     */
    public static function get_token_endpoint() {
        global $DB;

        $response = new \core_ltix\local\ltiservice\response();

        $contenttype = isset($_SERVER['CONTENT_TYPE']) ? explode(';', $_SERVER['CONTENT_TYPE'], 2)[0] : '';

        $ok = ($_SERVER['REQUEST_METHOD'] === 'POST') && ($contenttype === 'application/x-www-form-urlencoded');
        $error = 'invalid_request';

        $clientassertion = optional_param('client_assertion', '', PARAM_TEXT);
        $clientassertiontype = optional_param('client_assertion_type', '', PARAM_TEXT);
        $granttype = optional_param('grant_type', '', PARAM_TEXT);
        $scope = optional_param('scope', '', PARAM_TEXT);

        if ($ok) {
            $ok = !empty($clientassertion) && !empty($clientassertiontype) &&
                !empty($granttype) && !empty($scope);
        }

        if ($ok) {
            $ok = ($clientassertiontype === 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer') &&
                ($granttype === 'client_credentials');
            $error = 'unsupported_grant_type';
        }

        if ($ok) {
            $parts = explode('.', $clientassertion);
            $ok = (count($parts) === 3);
            if ($ok) {
                $payload = JWT::urlsafeB64Decode($parts[1]);
                $claims = json_decode($payload, true);
                $ok = !is_null($claims) && !empty($claims['sub']);
            }
            $error = 'invalid_request';
        }

        if ($ok) {
            $tool = $DB->get_record('lti_types', array('clientid' => $claims['sub']));
            if ($tool) {
                try {
                    \core_ltix\oauth_helper::verify_jwt_signature($tool->id, $claims['sub'], $clientassertion);
                    $ok = true;
                } catch (\Exception $e) {
                    $error = $e->getMessage();
                    $ok = false;
                }
            } else {
                $error = 'invalid_client';
                $ok = false;
            }
        }

        if ($ok) {
            $scopes = array();
            $requestedscopes = explode(' ', $scope);
            $typeconfig = self::get_type_config($tool->id);
            $permittedscopes = self::get_permitted_service_scopes($tool, $typeconfig);
            $scopes = array_intersect($requestedscopes, $permittedscopes);
            $ok = !empty($scopes);
            $error = 'invalid_scope';
        }

        if ($ok) {
            $token = self::new_access_token($tool->id, $scopes);
            $expiry = LTI_ACCESS_TOKEN_LIFE;
            $permittedscopes = implode(' ', $scopes);
            $body = <<< EOD
            {
              "access_token" : "{$token->token}",
              "token_type" : "Bearer",
              "expires_in" : {$expiry},
              "scope" : "{$permittedscopes}"
            }
            EOD;
        } else {
            $response->set_code(400);
            $body = <<< EOD
            {
              "error" : "{$error}"
            }
            EOD;
        }

        $response->set_body($body);

        $response->send();
    }

    /**
     * wraps mod/lti/service.php and ltix/service.php into a function
     */
    public static function get_service_endpoint() {
        global $DB, $PAGE;

        $rawbody = file_get_contents("php://input");

        $logrequests  = self::should_log_request($rawbody);
        $errorhandler = new service_exception_handler($logrequests);

        // Register our own error handler so we can always send valid XML response.
        set_exception_handler(array($errorhandler, 'handle'));

        if ($logrequests) {
            self::log_request($rawbody);
        }

        $ok = true;
        $type = null;
        $toolproxy = false;

        $consumerkey = \core_ltix\oauth_helper::get_oauth_key_from_headers(null, array(basicoutcomes::SCOPE_BASIC_OUTCOMES));
        if ($consumerkey === false) {
            throw new \Exception('Missing or invalid consumer key or access token.');
        } else if (is_string($consumerkey)) {
            $toolproxy = self::get_tool_proxy_from_guid($consumerkey);
            if ($toolproxy !== false) {
                $secrets = array($toolproxy->secret);
            } else if (!empty($tool)) {
                $secrets = array($typeconfig['password']);
            } else {
                $secrets = self::get_shared_secrets_by_key($consumerkey);
            }
            $sharedsecret = service_helper::verify_message($consumerkey, self::get_shared_secrets_by_key($consumerkey), $rawbody);
            if ($sharedsecret === false) {
                throw new \Exception('Message signature not valid');
            }
        }

        // TODO MDL-46023 Replace this code with a call to the new library.
        $xml = simplexml_load_string($rawbody);
        if (!$xml) {
            throw new \Exception('Invalid XML content');
        }

        $body = $xml->imsx_POXBody;
        foreach ($body->children() as $child) {
            $messagetype = $child->getName();
        }

        // We know more about the message, update error handler to send better errors.
        $errorhandler->set_message_id(\core_ltix\local\ltiservice\service_helper::parse_message_id($xml));
        $errorhandler->set_message_type($messagetype);

        switch ($messagetype) {
            case 'replaceResultRequest':
                $parsed = \core_ltix\local\ltiservice\service_helper::parse_grade_replace_message($xml);

                $ltiinstance = $DB->get_record('lti', array('id' => $parsed->instanceid));

                if (!\core_ltix\local\ltiservice\service_helper::accepts_grades($ltiinstance)) {
                    throw new \Exception('Tool does not accept grades');
                }

                \core_ltix\local\ltiservice\service_helper::verify_sourcedid($ltiinstance, $parsed);
                \core_ltix\local\ltiservice\service_helper::set_session_user($parsed->userid);

                $gradestatus = \core_ltix\local\ltiservice\service_helper::update_grade($ltiinstance, $parsed->userid, $parsed->launchid, $parsed->gradeval);

                if (!$gradestatus) {
                    throw new \Exception('Grade replace response');
                }

                $responsexml = \core_ltix\local\ltiservice\service_helper::get_response_xml(
                    'success',
                    'Grade replace response',
                    $parsed->messageid,
                    'replaceResultResponse'
                );

                echo $responsexml->asXML();

                break;

            case 'readResultRequest':
                $parsed = \core_ltix\local\ltiservice\service_helper::parse_grade_read_message($xml);

                $ltiinstance = $DB->get_record('lti', array('id' => $parsed->instanceid));

                if (!\core_ltix\local\ltiservice\service_helper::accepts_grades($ltiinstance)) {
                    throw new \Exception('Tool does not accept grades');
                }

                // Getting the grade requires the context is set.
                $context = \context_course::instance($ltiinstance->course);
                $PAGE->set_context($context);

                \core_ltix\local\ltiservice\service_helper::verify_sourcedid($ltiinstance, $parsed);

                $grade = \core_ltix\local\ltiservice\service_helper::read_grade($ltiinstance, $parsed->userid);

                $responsexml = \core_ltix\local\ltiservice\service_helper::get_response_xml(
                    'success',  // Empty grade is also 'success'.
                    'Result read',
                    $parsed->messageid,
                    'readResultResponse'
                );

                $node = $responsexml->imsx_POXBody->readResultResponse;
                $node = $node->addChild('result')->addChild('resultScore');
                $node->addChild('language', 'en');
                $node->addChild('textString', isset($grade) ? $grade : '');

                echo $responsexml->asXML();

                break;

            case 'deleteResultRequest':
                $parsed = \core_ltix\local\ltiservice\service_helper::parse_grade_delete_message($xml);

                $ltiinstance = $DB->get_record('lti', array('id' => $parsed->instanceid));

                if (!\core_ltix\local\ltiservice\service_helper::accepts_grades($ltiinstance)) {
                    throw new \Exception('Tool does not accept grades');
                }

                \core_ltix\local\ltiservice\service_helper::verify_sourcedid($ltiinstance, $parsed);
                \core_ltix\local\ltiservice\service_helper::set_session_user($parsed->userid);

                $gradestatus = \core_ltix\local\ltiservice\service_helper::delete_grade($ltiinstance, $parsed->userid);

                if (!$gradestatus) {
                    throw new \Exception('Grade delete request');
                }

                $responsexml = \core_ltix\local\ltiservice\service_helper::get_response_xml(
                    'success',
                    'Grade delete request',
                    $parsed->messageid,
                    'deleteResultResponse'
                );

                echo $responsexml->asXML();

                break;

            default:
                // Fire an event if we get a web service request which we don't support directly.
                // This will allow others to extend the LTI services, which I expect to be a common
                // use case, at least until the spec matures.
                $data = new stdClass();
                $data->body = $rawbody;
                $data->xml = $xml;
                $data->messageid = \core_ltix\local\ltiservice\service_helper::parse_message_id($xml);
                $data->messagetype = $messagetype;
                $data->consumerkey = $consumerkey;
                $data->sharedsecret = $sharedsecret;
                $eventdata = array();
                $eventdata['other'] = array();
                $eventdata['other']['messageid'] = $data->messageid;
                $eventdata['other']['messagetype'] = $messagetype;
                $eventdata['other']['consumerkey'] = $consumerkey;

                // Before firing the event, allow subplugins a chance to handle.
                if (\core_ltix\local\ltiservice\service_helper::extend_lti_services($data)) {
                    break;
                }

                // If an event handler handles the web service, it should set this global to true
                // So this code knows whether to send an "operation not supported" or not.
                global $ltiwebservicehandled;
                $ltiwebservicehandled = false;

                try {
                    $event = \core_ltix\event\unknown_service_api_called::create($eventdata);
                    $event->set_message_data($data);
                    $event->trigger();
                } catch (\Exception $e) {
                    $ltiwebservicehandled = false;
                }

                if (!$ltiwebservicehandled) {
                    $responsexml = \core_ltix\local\ltiservice\service_helper::get_response_xml(
                        'unsupported',
                        'unsupported',
                        \core_ltix\local\ltiservice\service_helper::parse_message_id($xml),
                        $messagetype
                    );

                    echo $responsexml->asXML();
                }

                break;
        }

    }

    /**
     * wraps mod/lti/services.php and ltix/services.php into a function
     */
    public static function get_services_endpoint() {
        $response = new \core_ltix\local\ltiservice\response();

        $isget = $response->get_request_method() === local\ltiservice\resource_base::HTTP_GET;
        $isdelete = $response->get_request_method() === local\ltiservice\resource_base::HTTP_DELETE;

        if ($isget) {
            $response->set_accept(isset($_SERVER['HTTP_ACCEPT']) ? $_SERVER['HTTP_ACCEPT'] : '');
        } else {
            $response->set_content_type(isset($_SERVER['CONTENT_TYPE']) ? explode(';', $_SERVER['CONTENT_TYPE'], 2)[0] : '');
        }

        $ok = false;
        $path = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';

        $accept = $response->get_accept();
        $contenttype = $response->get_content_type();

        $services = self::get_services();
        foreach ($services as $service) {
            $resources = $service->get_resources();
            foreach ($resources as $resource) {
                if (($isget && !empty($accept) && (strpos($accept, '*/*') === false) &&
                        !in_array($accept, $resource->get_formats())) ||
                    ((!$isget && !$isdelete) && !in_array($contenttype, $resource->get_formats()))) {
                    continue;
                }
                $template = $resource->get_template();
                $template = preg_replace('/{config_type}/', '(toolproxy|tool)', $template);
                $template = preg_replace('/\{[a-zA-Z_]+\}/', '[^/]+', $template);
                $template = preg_replace('/\(([0-9a-zA-Z_\-,\/]+)\)/', '(\\1|)', $template);
                $template = str_replace('/', '\/', $template);
                if (preg_match("/^{$template}$/", $path) === 1) {
                    $ok = true;
                    break 2;
                }
            }
        }
        if (!$ok) {
            $response->set_code(400);
            $response->set_reason("No handler found for {$path} {$accept} {$contenttype}");
        } else {
            $body = file_get_contents('php://input');
            $response->set_request_data($body);
            if (in_array($response->get_request_method(), $resource->get_methods())) {
                $resource->execute($response);
            } else {
                $response->set_code(405);
            }
        }
        $response->send();

    }

}
