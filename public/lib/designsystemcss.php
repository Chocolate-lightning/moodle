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
 * Serve the design system package CSS for demo pages.
 *
 * @package    core
 * @copyright  2026
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('NO_DEBUG_DISPLAY', true);
define('ABORT_AFTER_CONFIG', true);
require('../config.php');
require_once($CFG->dirroot . '/lib/csslib.php');

/**
 * Extract top-level CSS rules matching component selectors and scope them.
 *
 * This is intentionally lightweight for demo use. It only processes simple
 * top-level rules and leaves nested at-rules untouched.
 *
 * @param string $csscontent Full stylesheet content.
 * @param string $scopeselector Selector prefix used to increase specificity.
 * @param array $componentprefixes CSS selector fragments to match.
 * @return string
 */
function local_extract_scoped_component_css(string $csscontent, string $scopeselector, array $componentprefixes): string {
    $rules = [];

    $pattern = '/(^|})\s*([^@{}][^{}]*)\{([^{}]*)\}/m';
    if (!preg_match_all($pattern, $csscontent, $matches, PREG_SET_ORDER)) {
        return '';
    }

    foreach ($matches as $match) {
        $selectorlist = trim($match[2]);
        $body = trim($match[3]);

        if ($selectorlist === '' || $body === '') {
            continue;
        }

        $selectorlower = strtolower($selectorlist);
        $matchescomponent = false;
        foreach ($componentprefixes as $prefix) {
            if (strpos($selectorlower, strtolower($prefix)) !== false) {
                $matchescomponent = true;
                break;
            }
        }

        if (!$matchescomponent) {
            continue;
        }

        $selectors = array_filter(array_map('trim', explode(',', $selectorlist)));
        if (empty($selectors)) {
            continue;
        }

        $scopedselectors = array_map(
            static fn(string $selector): string => $scopeselector . ' ' . $selector,
            $selectors,
        );

        $rules[] = implode(",\n", $scopedselectors) . " {\n" . $body . "\n}";
    }

    return implode("\n\n", $rules);
}

$candidates = [
    // Public webroot layout where the bundle lives one level above dirroot.
    $CFG->dirroot . '/../lib/bundles/design-system/js/index.css',
    // Traditional layout where the bundle lives inside dirroot.
    $CFG->dirroot . '/lib/bundles/design-system/js/index.css',
];

$cssfile = null;
foreach ($candidates as $candidate) {
    if (is_readable($candidate)) {
        $cssfile = $candidate;
        break;
    }
}

if ($cssfile === null) {
    css_send_css_not_found();
}

$overridecss = <<<'CSS'
/* DS demo hotfix: ensure DS input states win over bundled Bootstrap form-check rules. */
.mds-form-check .mds-form-check-input,
.mds-checkbox .mds-checkbox-input {
    margin: 0;
    float: none;
}

.mds-form-check-input:focus,
.mds-form-check-input.is-invalid:focus,
.mds-checkbox-input:focus,
.mds-checkbox-input.is-invalid:focus {
    box-shadow: none;
    outline: none;
}

.mds-form-check-input:focus-visible {
    outline: var(--mds-stroke-weight-md) solid var(--mds-focus-default);
    outline-offset: var(--mds-spacing-offset);
    box-shadow: none;
}

.mds-form-check-input.is-invalid:focus-visible {
    outline: var(--mds-stroke-weight-md) solid var(--mds-border-feedback-danger);
    outline-offset: var(--mds-spacing-offset);
    box-shadow: none;
}

.mds-checkbox-input:focus-visible {
    outline: var(--mds-stroke-weight-md) solid var(--mds-focus-default);
    outline-offset: var(--mds-spacing-offset);
    box-shadow: none;
}

.mds-checkbox-input.is-invalid:focus-visible {
    outline: var(--mds-stroke-weight-md) solid var(--mds-border-feedback-danger);
    outline-offset: var(--mds-spacing-offset);
    box-shadow: none;
}

.mds-form-check-input:focus:not(:checked),
.mds-checkbox-input:focus:not(:checked):not(:indeterminate) {
    border-color: var(--mds-border-interactive-secondary-default);
}

.mds-form-check-input.is-invalid:focus:not(:checked),
.mds-checkbox-input.is-invalid:focus:not(:checked):not(:indeterminate) {
    border-color: var(--mds-border-interactive-danger-default);
}
CSS;

$csscontent = file_get_contents($cssfile);
if ($csscontent === false) {
    css_send_css_not_found();
}

$componentprefixes = [
    '.mds-activity-icon',
    '.mds-badge',
    '.mds-btn',
    '.mds-checkbox',
    '.mds-checkbox-input',
    '.mds-close-button',
    '.mds-form-check',
    '.mds-form-check-input',
];

$scopedcomponentcss = local_extract_scoped_component_css(
    $csscontent,
    '#design-system-demo',
    $componentprefixes,
);

$finalcss = $csscontent . "\n\n" . $scopedcomponentcss . "\n\n" . $overridecss . "\n";

$etag = sha1_file($cssfile) . '-' . sha1($scopedcomponentcss) . '-' . sha1($overridecss);
$ifnonematch = $_SERVER['HTTP_IF_NONE_MATCH'] ?? '';
$ifmodsince = $_SERVER['HTTP_IF_MODIFIED_SINCE'] ?? '';
if ($ifnonematch !== '' || $ifmodsince !== '') {
    css_send_unmodified(filemtime($cssfile), $etag);
}

css_send_cached_css_content($finalcss, $etag);
