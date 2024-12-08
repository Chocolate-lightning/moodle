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

require_once($CFG->dirroot . '/ltix/OAuth.php');
require_once($CFG->dirroot . '/ltix/TrivialStore.php');
require_once($CFG->libdir . '/filelib.php');

use cache;
use core_ltix\local\ltiopenid\jwks_helper;
use Exception;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use moodle_exception;
use stdClass;
use core_ltix\OAuthException;
use core_ltix\OAuthserver;
use core_ltix\OAuthRequest;
use core_ltix\OAuthSignatureMethod_HMAC_SHA1;
use core_ltix\TrivialOAuthDataStore;

/**
 * Helper class specifically dealing with LTI OAuth.
 *
 * @package    core_ltix
 * @author     Alex Morris <alex.morris@catalyst.net.nz>
 * @copyright  2023 Catalyst IT
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class oauth_helper {

    /**
     * Signs the petition to launch the external tool using OAuth
     *
     * @param array  $oldparms     Parameters to be passed for signing
     * @param string $endpoint     url of the external tool
     * @param string $method       Method for sending the parameters (e.g. POST)
     * @param string $oauthconsumerkey
     * @param string $oauthconsumersecret
     * @return array|null
     */
    public static function sign_parameters($oldparms, $endpoint, $method, $oauthconsumerkey, $oauthconsumersecret) {

        $parms = $oldparms;

        $testtoken = '';

        // TODO: Switch to core oauthlib once implemented - MDL-30149.
        $hmacmethod = new OAuthSignatureMethod_HMAC_SHA1();
        $testconsumer = new OAuthConsumer($oauthconsumerkey, $oauthconsumersecret, null);
        $accreq = OAuthRequest::from_consumer_and_token($testconsumer, $testtoken, $method, $endpoint, $parms);
        $accreq->sign_request($hmacmethod, $testconsumer, $testtoken);

        $newparms = $accreq->get_parameters();

        return $newparms;
    }

    /**
     * Verifies the OAuth signature of an incoming message.
     *
     * @param int $typeid The tool type ID.
     * @param string $consumerkey The consumer key.
     * @return stdClass Tool type
     * @throws moodle_exception
     * @throws lti\OAuthException
     */
    public static function verify_oauth_signature($typeid, $consumerkey) {
        $tool = helper::get_type($typeid);
        // Validate parameters.
        if (!$tool) {
            throw new moodle_exception('errortooltypenotfound', 'core_ltix');
        }
        $typeconfig = helper::get_type_config($typeid);

        if (isset($tool->toolproxyid)) {
            $toolproxy = helper::get_tool_proxy($tool->toolproxyid);
            $key = $toolproxy->guid;
            $secret = $toolproxy->secret;
        } else {
            $toolproxy = null;
            if (!empty($typeconfig['resourcekey'])) {
                $key = $typeconfig['resourcekey'];
            } else {
                $key = '';
            }
            if (!empty($typeconfig['password'])) {
                $secret = $typeconfig['password'];
            } else {
                $secret = '';
            }
        }

        if ($consumerkey !== $key) {
            throw new moodle_exception('errorincorrectconsumerkey', 'core_ltix');
        }

        $store = new TrivialOAuthDataStore();
        $store->add_consumer($key, $secret);
        $server = new OAuthServer($store);
        $method = new OAuthSignatureMethod_HMAC_SHA1();
        $server->add_signature_method($method);
        $request = OAuthRequest::from_request();
        try {
            $server->verify_request($request);
        } catch (OAuthException $e) {
            throw new OAuthException("OAuth signature failed: " . $e->getMessage());
        }

        return $tool;
    }

    /**
     * Return the mapping for standard message types to JWT message_type claim.
     *
     * @return array
     */
    public static function get_jwt_message_type_mapping() {
        return array(
            'basic-lti-launch-request' => 'LtiResourceLinkRequest',
            'ContentItemSelectionRequest' => 'LtiDeepLinkingRequest',
            'LtiDeepLinkingResponse' => 'ContentItemSelection',
            'LtiSubmissionReviewRequest' => 'LtiSubmissionReviewRequest',
        );
    }

    /**
     * Return the mapping for standard message parameters to JWT claim.
     *
     * @return array
     */
    public static function get_jwt_claim_mapping() {
        $mapping = [];
        $services = \core_ltix\helper::get_services();
        foreach ($services as $service) {
            $mapping = array_merge($mapping, $service->get_jwt_claim_mappings());
        }
        $mapping = array_merge($mapping, [
            'accept_copy_advice' => [
                'suffix' => 'dl',
                'group' => 'deep_linking_settings',
                'claim' => 'accept_copy_advice',
                'isarray' => false,
                'type' => 'boolean'
            ],
            'accept_media_types' => [
                'suffix' => 'dl',
                'group' => 'deep_linking_settings',
                'claim' => 'accept_media_types',
                'isarray' => true
            ],
            'accept_multiple' => [
                'suffix' => 'dl',
                'group' => 'deep_linking_settings',
                'claim' => 'accept_multiple',
                'isarray' => false,
                'type' => 'boolean'
            ],
            'accept_presentation_document_targets' => [
                'suffix' => 'dl',
                'group' => 'deep_linking_settings',
                'claim' => 'accept_presentation_document_targets',
                'isarray' => true
            ],
            'accept_types' => [
                'suffix' => 'dl',
                'group' => 'deep_linking_settings',
                'claim' => 'accept_types',
                'isarray' => true
            ],
            'accept_unsigned' => [
                'suffix' => 'dl',
                'group' => 'deep_linking_settings',
                'claim' => 'accept_unsigned',
                'isarray' => false,
                'type' => 'boolean'
            ],
            'auto_create' => [
                'suffix' => 'dl',
                'group' => 'deep_linking_settings',
                'claim' => 'auto_create',
                'isarray' => false,
                'type' => 'boolean'
            ],
            'can_confirm' => [
                'suffix' => 'dl',
                'group' => 'deep_linking_settings',
                'claim' => 'can_confirm',
                'isarray' => false,
                'type' => 'boolean'
            ],
            'content_item_return_url' => [
                'suffix' => 'dl',
                'group' => 'deep_linking_settings',
                'claim' => 'deep_link_return_url',
                'isarray' => false
            ],
            'content_items' => [
                'suffix' => 'dl',
                'group' => '',
                'claim' => 'content_items',
                'isarray' => true
            ],
            'data' => [
                'suffix' => 'dl',
                'group' => 'deep_linking_settings',
                'claim' => 'data',
                'isarray' => false
            ],
            'text' => [
                'suffix' => 'dl',
                'group' => 'deep_linking_settings',
                'claim' => 'text',
                'isarray' => false
            ],
            'title' => [
                'suffix' => 'dl',
                'group' => 'deep_linking_settings',
                'claim' => 'title',
                'isarray' => false
            ],
            'lti_msg' => [
                'suffix' => 'dl',
                'group' => '',
                'claim' => 'msg',
                'isarray' => false
            ],
            'lti_log' => [
                'suffix' => 'dl',
                'group' => '',
                'claim' => 'log',
                'isarray' => false
            ],
            'lti_errormsg' => [
                'suffix' => 'dl',
                'group' => '',
                'claim' => 'errormsg',
                'isarray' => false
            ],
            'lti_errorlog' => [
                'suffix' => 'dl',
                'group' => '',
                'claim' => 'errorlog',
                'isarray' => false
            ],
            'context_id' => [
                'suffix' => '',
                'group' => 'context',
                'claim' => 'id',
                'isarray' => false
            ],
            'context_label' => [
                'suffix' => '',
                'group' => 'context',
                'claim' => 'label',
                'isarray' => false
            ],
            'context_title' => [
                'suffix' => '',
                'group' => 'context',
                'claim' => 'title',
                'isarray' => false
            ],
            'context_type' => [
                'suffix' => '',
                'group' => 'context',
                'claim' => 'type',
                'isarray' => true
            ],
            'for_user_id' => [
                'suffix' => '',
                'group' => 'for_user',
                'claim' => 'user_id',
                'isarray' => false
            ],
            'lis_course_offering_sourcedid' => [
                'suffix' => '',
                'group' => 'lis',
                'claim' => 'course_offering_sourcedid',
                'isarray' => false
            ],
            'lis_course_section_sourcedid' => [
                'suffix' => '',
                'group' => 'lis',
                'claim' => 'course_section_sourcedid',
                'isarray' => false
            ],
            'launch_presentation_css_url' => [
                'suffix' => '',
                'group' => 'launch_presentation',
                'claim' => 'css_url',
                'isarray' => false
            ],
            'launch_presentation_document_target' => [
                'suffix' => '',
                'group' => 'launch_presentation',
                'claim' => 'document_target',
                'isarray' => false
            ],
            'launch_presentation_height' => [
                'suffix' => '',
                'group' => 'launch_presentation',
                'claim' => 'height',
                'isarray' => false
            ],
            'launch_presentation_locale' => [
                'suffix' => '',
                'group' => 'launch_presentation',
                'claim' => 'locale',
                'isarray' => false
            ],
            'launch_presentation_return_url' => [
                'suffix' => '',
                'group' => 'launch_presentation',
                'claim' => 'return_url',
                'isarray' => false
            ],
            'launch_presentation_width' => [
                'suffix' => '',
                'group' => 'launch_presentation',
                'claim' => 'width',
                'isarray' => false
            ],
            'lis_person_contact_email_primary' => [
                'suffix' => '',
                'group' => null,
                'claim' => 'email',
                'isarray' => false
            ],
            'lis_person_name_family' => [
                'suffix' => '',
                'group' => null,
                'claim' => 'family_name',
                'isarray' => false
            ],
            'lis_person_name_full' => [
                'suffix' => '',
                'group' => null,
                'claim' => 'name',
                'isarray' => false
            ],
            'lis_person_name_given' => [
                'suffix' => '',
                'group' => null,
                'claim' => 'given_name',
                'isarray' => false
            ],
            'lis_person_sourcedid' => [
                'suffix' => '',
                'group' => 'lis',
                'claim' => 'person_sourcedid',
                'isarray' => false
            ],
            'user_id' => [
                'suffix' => '',
                'group' => null,
                'claim' => 'sub',
                'isarray' => false
            ],
            'user_image' => [
                'suffix' => '',
                'group' => null,
                'claim' => 'picture',
                'isarray' => false
            ],
            'roles' => [
                'suffix' => '',
                'group' => '',
                'claim' => 'roles',
                'isarray' => true
            ],
            'role_scope_mentor' => [
                'suffix' => '',
                'group' => '',
                'claim' => 'role_scope_mentor',
                'isarray' => false
            ],
            'deployment_id' => [
                'suffix' => '',
                'group' => '',
                'claim' => 'deployment_id',
                'isarray' => false
            ],
            'lti_message_type' => [
                'suffix' => '',
                'group' => '',
                'claim' => 'message_type',
                'isarray' => false
            ],
            'lti_version' => [
                'suffix' => '',
                'group' => '',
                'claim' => 'version',
                'isarray' => false
            ],
            'resource_link_description' => [
                'suffix' => '',
                'group' => 'resource_link',
                'claim' => 'description',
                'isarray' => false
            ],
            'resource_link_id' => [
                'suffix' => '',
                'group' => 'resource_link',
                'claim' => 'id',
                'isarray' => false
            ],
            'resource_link_title' => [
                'suffix' => '',
                'group' => 'resource_link',
                'claim' => 'title',
                'isarray' => false
            ],
            'tool_consumer_info_product_family_code' => [
                'suffix' => '',
                'group' => 'tool_platform',
                'claim' => 'product_family_code',
                'isarray' => false
            ],
            'tool_consumer_info_version' => [
                'suffix' => '',
                'group' => 'tool_platform',
                'claim' => 'version',
                'isarray' => false
            ],
            'tool_consumer_instance_contact_email' => [
                'suffix' => '',
                'group' => 'tool_platform',
                'claim' => 'contact_email',
                'isarray' => false
            ],
            'tool_consumer_instance_description' => [
                'suffix' => '',
                'group' => 'tool_platform',
                'claim' => 'description',
                'isarray' => false
            ],
            'tool_consumer_instance_guid' => [
                'suffix' => '',
                'group' => 'tool_platform',
                'claim' => 'guid',
                'isarray' => false
            ],
            'tool_consumer_instance_name' => [
                'suffix' => '',
                'group' => 'tool_platform',
                'claim' => 'name',
                'isarray' => false
            ],
            'tool_consumer_instance_url' => [
                'suffix' => '',
                'group' => 'tool_platform',
                'claim' => 'url',
                'isarray' => false
            ]
        ]);
        return $mapping;
    }

    /**
     * Converts the message paramters to their equivalent JWT claim and signs the payload to launch the external tool using JWT
     *
     * @param array  $parms        Parameters to be passed for signing
     * @param string $endpoint     url of the external tool
     * @param string $oauthconsumerkey
     * @param string $typeid       ID of LTI tool type
     * @param string $nonce        Nonce value to use
     * @return array|null
     */
    public static function sign_jwt($parms, $endpoint, $oauthconsumerkey, $typeid = 0, $nonce = '') {
        global $CFG;

        if (empty($typeid)) {
            $typeid = 0;
        }
        $messagetypemapping = self::get_jwt_message_type_mapping();
        if (isset($parms['lti_message_type']) && array_key_exists($parms['lti_message_type'], $messagetypemapping)) {
            $parms['lti_message_type'] = $messagetypemapping[$parms['lti_message_type']];
        }
        if (isset($parms['roles'])) {
            $roles = explode(',', $parms['roles']);
            $newroles = array();
            foreach ($roles as $role) {
                if (strpos($role, 'urn:lti:role:ims/lis/') === 0) {
                    $role = 'http://purl.imsglobal.org/vocab/lis/v2/membership#' . substr($role, 21);
                } else if (strpos($role, 'urn:lti:instrole:ims/lis/') === 0) {
                    $role = 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#' . substr($role, 25);
                } else if (strpos($role, 'urn:lti:sysrole:ims/lis/') === 0) {
                    $role = 'http://purl.imsglobal.org/vocab/lis/v2/system/person#' . substr($role, 24);
                } else if ((strpos($role, '://') === false) && (strpos($role, 'urn:') !== 0)) {
                    $role = "http://purl.imsglobal.org/vocab/lis/v2/membership#{$role}";
                }
                $newroles[] = $role;
            }
            $parms['roles'] = implode(',', $newroles);
        }

        $now = time();
        if (empty($nonce)) {
            $nonce = bin2hex(openssl_random_pseudo_bytes(10));
        }
        $claimmapping = self::get_jwt_claim_mapping();
        $payload = array(
            'nonce' => $nonce,
            'iat' => $now,
            'exp' => $now + 60,
        );
        $payload['iss'] = $CFG->wwwroot;
        $payload['aud'] = $oauthconsumerkey;
        $payload[LTI_JWT_CLAIM_PREFIX . '/claim/deployment_id'] = strval($typeid);
        $payload[LTI_JWT_CLAIM_PREFIX . '/claim/target_link_uri'] = $endpoint;

        foreach ($parms as $key => $value) {
            $claim = LTI_JWT_CLAIM_PREFIX;
            if (array_key_exists($key, $claimmapping)) {
                $mapping = $claimmapping[$key];
                $type = $mapping["type"] ?? "string";
                if ($mapping['isarray']) {
                    $value = explode(',', $value);
                    sort($value);
                } else if ($type == 'boolean') {
                    $value = isset($value) && ($value == 'true');
                }
                if (!empty($mapping['suffix'])) {
                    $claim .= "-{$mapping['suffix']}";
                }
                $claim .= '/claim/';
                if (is_null($mapping['group'])) {
                    $payload[$mapping['claim']] = $value;
                } else if (empty($mapping['group'])) {
                    $payload["{$claim}{$mapping['claim']}"] = $value;
                } else {
                    $claim .= $mapping['group'];
                    $payload[$claim][$mapping['claim']] = $value;
                }
            } else if (strpos($key, 'custom_') === 0) {
                $payload["{$claim}/claim/custom"][substr($key, 7)] = $value;
            } else if (strpos($key, 'ext_') === 0) {
                $payload["{$claim}/claim/ext"][substr($key, 4)] = $value;
            }
        }

        $privatekey = jwks_helper::get_private_key();
        $jwt = JWT::encode($payload, $privatekey['key'], 'RS256', $privatekey['kid']);

        $newparms = array();
        $newparms['id_token'] = $jwt;

        return $newparms;
    }

    /**
     * Verifies the JWT signature using a JWK keyset.
     *
     * @param string $jwtparam JWT parameter value.
     * @param string $keyseturl The tool keyseturl.
     * @param string $clientid The tool client id.
     *
     * @return object The JWT's payload as a PHP object
     * @throws moodle_exception
     * @throws UnexpectedValueException     Provided JWT was invalid
     * @throws SignatureInvalidException    Provided JWT was invalid because the signature verification failed
     * @throws BeforeValidException         Provided JWT is trying to be used before it's eligible as defined by 'nbf'
     * @throws BeforeValidException         Provided JWT is trying to be used before it's been created as defined by 'iat'
     * @throws ExpiredException             Provided JWT has since expired, as defined by the 'exp' claim
     */
    public static function verify_with_keyset($jwtparam, $keyseturl, $clientid) {
        // Attempts to retrieve cached keyset.
        $cache = cache::make('core', 'ltix_keyset');
        $keyset = $cache->get($clientid);

        try {
            if (empty($keyset)) {
                throw new moodle_exception('errornocachedkeysetfound', 'core_ltix');
            }
            $keysetarr = json_decode($keyset, true);
            // JWK::parseKeySet uses RS256 algorithm by default.
            $keys = JWK::parseKeySet($keysetarr);
            $jwt = JWT::decode($jwtparam, $keys);
        } catch (Exception $e) {
            // Something went wrong, so attempt to update cached keyset and then try again.
            $keyset = download_file_content($keyseturl);
            $keysetarr = json_decode($keyset, true);

            // Fix for firebase/php-jwt's dependency on the optional 'alg' property in the JWK.
            // The fix_jwks_alg() call only fixes a single, matched key and will leave others present (which may be missing alg
            // too). Remaining keys missing alg are excluded since they cannot be used for decoding anyway (no match to JWT kid).
            $keysetarr = jwks_helper::fix_jwks_alg($keysetarr, $jwtparam);
            $keysetarr['keys'] = array_filter($keysetarr['keys'], fn($key) => isset($key['alg']));

            // JWK::parseKeySet uses RS256 algorithm by default.
            $keys = JWK::parseKeySet($keysetarr);
            $jwt = JWT::decode($jwtparam, $keys);
            // If sucessful, updates the cached keyset.
            $cache->set($clientid, $keyset);
        }
        return $jwt;
    }

    /**
     * Verifies the JWT signature of an incoming message.
     *
     * @param int $typeid The tool type ID.
     * @param string $consumerkey The consumer key.
     * @param string $jwtparam JWT parameter value
     *
     * @return stdClass Tool type
     * @throws moodle_exception
     * @throws UnexpectedValueException     Provided JWT was invalid
     * @throws SignatureInvalidException    Provided JWT was invalid because the signature verification failed
     * @throws BeforeValidException         Provided JWT is trying to be used before it's eligible as defined by 'nbf'
     * @throws BeforeValidException         Provided JWT is trying to be used before it's been created as defined by 'iat'
     * @throws ExpiredException             Provided JWT has since expired, as defined by the 'exp' claim
     */
    public static function verify_jwt_signature($typeid, $consumerkey, $jwtparam) {
        $tool = helper::get_type($typeid);

        // Validate parameters.
        if (!$tool) {
            throw new moodle_exception('errortooltypenotfound', 'core_ltix');
        }
        if (isset($tool->toolproxyid)) {
            throw new moodle_exception('JWT security not supported with LTI 2');
        }

        $typeconfig = helper::get_type_config($typeid);

        $key = $tool->clientid ?? '';

        if ($consumerkey !== $key) {
            throw new moodle_exception('errorincorrectconsumerkey', 'core_ltix');
        }

        if (empty($typeconfig['keytype']) || $typeconfig['keytype'] === LTI_RSA_KEY) {
            $publickey = $typeconfig['publickey'] ?? '';
            if (empty($publickey)) {
                throw new moodle_exception('No public key configured');
            }
            // Attemps to verify jwt with RSA key.
            JWT::decode($jwtparam, new Key($publickey, 'RS256'));
        } else if ($typeconfig['keytype'] === LTI_JWK_KEYSET) {
            $keyseturl = $typeconfig['publickeyset'] ?? '';
            if (empty($keyseturl)) {
                throw new moodle_exception('No public keyset configured');
            }
            // Attempts to verify jwt with jwk keyset.
            self::verify_with_keyset($jwtparam, $keyseturl, $tool->clientid);
        } else {
            throw new moodle_exception('Invalid public key type');
        }

        return $tool;
    }

    /**
     * Verfies the JWT and converts its claims to their equivalent message parameter.
     *
     * @param int    $typeid
     * @param string $jwtparam   JWT parameter
     *
     * @return array  message parameters
     * @throws moodle_exception
     */
    public static function convert_from_jwt($typeid, $jwtparam) {

        $params = array();
        $parts = explode('.', $jwtparam);
        $ok = (count($parts) === 3);
        if ($ok) {
            $payload = JWT::urlsafeB64Decode($parts[1]);
            $claims = json_decode($payload, true);
            $ok = !is_null($claims) && !empty($claims['iss']);
        }
        if ($ok) {
            self::verify_jwt_signature($typeid, $claims['iss'], $jwtparam);
            $params['oauth_consumer_key'] = $claims['iss'];
            foreach (self::get_jwt_claim_mapping() as $key => $mapping) {
                $claim = LTI_JWT_CLAIM_PREFIX;
                if (!empty($mapping['suffix'])) {
                    $claim .= "-{$mapping['suffix']}";
                }
                $claim .= '/claim/';
                if (is_null($mapping['group'])) {
                    $claim = $mapping['claim'];
                } else if (empty($mapping['group'])) {
                    $claim .= $mapping['claim'];
                } else {
                    $claim .= $mapping['group'];
                }
                if (isset($claims[$claim])) {
                    $value = null;
                    if (empty($mapping['group'])) {
                        $value = $claims[$claim];
                    } else {
                        $group = $claims[$claim];
                        if (is_array($group) && array_key_exists($mapping['claim'], $group)) {
                            $value = $group[$mapping['claim']];
                        }
                    }
                    if (!empty($value) && $mapping['isarray']) {
                        if (is_array($value)) {
                            if (is_array($value[0])) {
                                $value = json_encode($value);
                            } else {
                                $value = implode(',', $value);
                            }
                        }
                    }
                    if (!is_null($value) && is_string($value) && (strlen($value) > 0)) {
                        $params[$key] = $value;
                    }
                }
                $claim = LTI_JWT_CLAIM_PREFIX . '/claim/custom';
                if (isset($claims[$claim])) {
                    $custom = $claims[$claim];
                    if (is_array($custom)) {
                        foreach ($custom as $key => $value) {
                            $params["custom_{$key}"] = $value;
                        }
                    }
                }
                $claim = LTI_JWT_CLAIM_PREFIX . '/claim/ext';
                if (isset($claims[$claim])) {
                    $ext = $claims[$claim];
                    if (is_array($ext)) {
                        foreach ($ext as $key => $value) {
                            $params["ext_{$key}"] = $value;
                        }
                    }
                }
            }
        }
        if (isset($params['content_items'])) {
            $params['content_items'] = helper::convert_content_items($params['content_items']);
        }
        $messagetypemapping = self::get_jwt_message_type_mapping();
        if (isset($params['lti_message_type']) && array_key_exists($params['lti_message_type'], $messagetypemapping)) {
            $params['lti_message_type'] = $messagetypemapping[$params['lti_message_type']];
        }
        return $params;
    }

    /**
     * Verify key exists, creates them.
     *
     * @return \lang_string|string|void
     */
    public static function verify_private_key() {
        $key = get_config('core_ltix', 'privatekey');

        // If we already generated a valid key, no need to check.
        if (empty($key)) {

            // Create the private key.
            $kid = bin2hex(openssl_random_pseudo_bytes(10));
            set_config('kid', $kid, 'core_ltix');
            $config = array(
                "digest_alg" => "sha256",
                "private_key_bits" => 2048,
                "private_key_type" => OPENSSL_KEYTYPE_RSA,
            );
            $res = openssl_pkey_new($config);
            openssl_pkey_export($res, $privatekey);

            if (!empty($privatekey)) {
                set_config('privatekey', $privatekey, 'core_ltix');
            } else {
                return get_string('opensslconfiginvalid', 'core_ltix');
            }
        }

        return '';
    }

    /**
     *
     * @param int $typeid LTI type ID.
     * @param string[] $scopes  Array of scopes which give permission for the current request.
     *
     * @return string|int|boolean  The OAuth consumer key, the LTI type ID for the validated bearer token,
                                 true for requests not requiring a scope, otherwise false.
    */
    public static function get_oauth_key_from_headers($typeid = null, $scopes = null) {
        global $DB;

        $now = time();

        $requestheaders = OAuthUtil::get_headers();

        if (isset($requestheaders['Authorization'])) {
            if (substr($requestheaders['Authorization'], 0, 6) == "OAuth ") {
                $headerparameters = OAuthUtil::split_header($requestheaders['Authorization']);

                return format_string($headerparameters['oauth_consumer_key']);
            } else if (empty($scopes)) {
                return true;
            } else if (substr($requestheaders['Authorization'], 0, 7) == 'Bearer ') {
                $tokenvalue = trim(substr($requestheaders['Authorization'], 7));
                $conditions = array('token' => $tokenvalue);
                if (!empty($typeid)) {
                    $conditions['typeid'] = intval($typeid);
                }
                $token = $DB->get_record('lti_access_tokens', $conditions);
                if ($token) {
                    // Log token access.
                    $DB->set_field('lti_access_tokens', 'lastaccess', $now, array('id' => $token->id));
                    $permittedscopes = json_decode($token->scope);
                    if ((intval($token->validuntil) > $now) && !empty(array_intersect($scopes, $permittedscopes))) {
                        return intval($token->typeid);
                    }
                }
            }
        }
        return false;
    }

    public static function handle_oauth_body_post($oauthconsumerkey, $oauthconsumersecret, $body, $requestheaders = null) {

        if ($requestheaders == null) {
            $requestheaders = OAuthUtil::get_headers();
        }

        // Must reject application/x-www-form-urlencoded.
        if (isset($requestheaders['Content-type'])) {
            if ($requestheaders['Content-type'] == 'application/x-www-form-urlencoded' ) {
                throw new OAuthException("OAuth request body signing must not use application/x-www-form-urlencoded");
            }
        }

        if (isset($requestheaders['Authorization']) && (substr($requestheaders['Authorization'], 0, 6) == "OAuth ")) {
            $headerparameters = OAuthUtil::split_header($requestheaders['Authorization']);
            $oauthbodyhash = $headerparameters['oauth_body_hash'];
        }

        if ( ! isset($oauthbodyhash)  ) {
            throw new OAuthException("OAuth request body signing requires oauth_body_hash body");
        }

        // Verify the message signature.
        $store = new TrivialOAuthDataStore();
        $store->add_consumer($oauthconsumerkey, $oauthconsumersecret);

        $server = new OAuthServer($store);

        $method = new OAuthSignatureMethod_HMAC_SHA1();
        $server->add_signature_method($method);
        $request = OAuthRequest::from_request();

        try {
            $server->verify_request($request);
        } catch (\Exception $e) {
            $message = $e->getMessage();
            throw new OAuthException("OAuth signature failed: " . $message);
        }

        $postdata = $body;

        $hash = base64_encode(sha1($postdata, true));

        if ( $hash != $oauthbodyhash ) {
            throw new OAuthException("OAuth oauth_body_hash mismatch");
        }

        return $postdata;
    }
}
