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
 * Language strings for the Design System showcase page.
 *
 * @module     core/showcase/strings
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {FC, PropsWithChildren, createContext, useContext, useEffect, useState} from 'react';
import {getStrings} from '@moodle/lms/core/stringUtils';

/** The lang file in public/lang/en that holds the showcase strings. */
export const showcaseComponent = 'core_designsystemshowcase';

/**
 * The strings the showcase defines for itself.
 *
 * All strings are requested in one batch, so the page renders once with all of its text. Keep this in step with
 * lang/en/designsystemshowcase.php: a key missing from here fails to compile where it is used, and the unit tests
 * fail when the two lists differ.
 */
export const showcaseStringKeys = [
    'activityicon_all',
    'activityicon_container',
    'activityicon_expectation',
    'avatar_broken',
    'avatar_expectation',
    'avatar_image',
    'avatar_initials',
    'avatar_initialsvalue',
    'avatar_name',
    'avatar_silhouette',
    'badge_expectation',
    'badge_external',
    'badge_icons',
    'badge_overdue',
    'badge_pill',
    'badge_subtle',
    'breadcrumb_another',
    'breadcrumb_current',
    'breadcrumb_expectation',
    'breadcrumb_faculty',
    'breadcrumb_items',
    'breadcrumb_itemsoverflow',
    'breadcrumb_program',
    'button_both',
    'button_endicon',
    'button_expectation',
    'button_icononly',
    'button_sizes',
    'button_starticon',
    'button_variants',
    'button_withicons',
    'checkbox_accept',
    'checkbox_acceptfeedback',
    'checkbox_expectation',
    'checkbox_extras',
    'checkbox_hiddenlabel',
    'checkbox_indeterminate',
    'checkbox_invalidnofeedback',
    'checkbox_long',
    'checkbox_notificationshelp',
    'checkbox_states',
    'checked',
    'choicebox_check',
    'choicebox_expectation',
    'choicebox_font',
    'choicebox_grouphelp',
    'choicebox_icons',
    'choicebox_individual',
    'choicebox_individualhelp',
    'choicebox_star',
    'choicebox_supporting',
    'closebutton_expectation',
    'closebutton_label',
    'closebutton_sizes',
    'contents',
    'disabledchecked',
    'dropdown_action',
    'dropdown_alignedtoend',
    'dropdown_appearances',
    'dropdown_archive',
    'dropdown_bottomend',
    'dropdown_cannotundo',
    'dropdown_custom',
    'dropdown_dangerzone',
    'dropdown_deletepermanently',
    'dropdown_description',
    'dropdown_disabledaction',
    'dropdown_disabledsubmenu',
    'dropdown_expectation',
    'dropdown_externallink',
    'dropdown_header',
    'dropdown_itemtypes',
    'dropdown_label',
    'dropdown_link',
    'dropdown_manage',
    'dropdown_matchwidth',
    'dropdown_moreoptions',
    'dropdown_mostrecent',
    'dropdown_navpill',
    'dropdown_opensabove',
    'dropdown_placement',
    'dropdown_primaryaddress',
    'dropdown_samewidth',
    'dropdown_topstart',
    'dropdown_triggers',
    'dropdown_unreachable',
    'dropdown_withicon',
    'expectation',
    'favouritebutton_add',
    'favouritebutton_adddisabled',
    'favouritebutton_expectation',
    'favouritebutton_remove',
    'favouritebutton_removedisabled',
    'favouritebutton_toggle',
    'formsubmission_beginner',
    'formsubmission_expectation',
    'formsubmission_updates',
    'formsubmission_visible',
    'invalid',
    'link_comparison',
    'link_designsystem',
    'link_expectation',
    'link_external',
    'link_icons',
    'link_secondary',
    'link_theme',
    'link_variants',
    'navpill_expectation',
    'navpill_states',
    'pagination_expectation',
    'pagination_full',
    'pagination_grouped',
    'progressbar_animated',
    'progressbar_complete',
    'progressbar_count',
    'progressbar_empty',
    'progressbar_expectation',
    'progressbar_labelvariant',
    'progressbar_status',
    'progressbar_title',
    'radio_expectation',
    'radio_extras',
    'radio_group',
    'radio_hiddenlabel',
    'radio_invalidfeedback',
    'radio_long',
    'reload_ltr',
    'reload_rtl',
    'render_help',
    'render_ltr',
    'render_rtl',
    'rtl_missing',
    'section_activityicon',
    'section_avatar',
    'section_badge',
    'section_button',
    'section_checkbox',
    'section_choicebox',
    'section_closebutton',
    'section_dropdown',
    'section_favouritebutton',
    'section_formsubmission',
    'section_link',
    'section_navpill',
    'section_pagination',
    'section_progressbar',
    'section_radio',
    'section_switch',
    'section_tooltip',
    'switch_controlled',
    'switch_expectation',
    'switch_hiddenlabel',
    'switch_labelside',
    'switch_long',
    'switch_longlabel',
    'switch_variants',
    'tooltip_dark',
    'tooltip_expectation',
    'tooltip_icononly',
    'tooltip_light',
    'tooltip_long',
    'tooltip_longtrigger',
    'tooltip_text',
    'unchecked',
] as const;

/**
 * Generic words the showcase borrows from existing strings, rather than defining its own copies. Some are close
 * matches rather than the same text, such as "Email address" for "Email".
 *
 * The property names are the keys used by the page.
 */
export const sharedStrings = {
    'badge_complete': {key: 'complete', component: 'core'},
    'breadcrumb': {key: 'breadcrumb', component: 'access'},
    'breadcrumb_home': {key: 'home', component: 'core'},
    'breadcrumb_showmore': {key: 'showmore', component: 'core'},
    'checkbox_notifications': {key: 'registrationemail', component: 'core'},
    'choicebox_group': {key: 'group', component: 'core'},
    'close': {key: 'closebuttontitle', component: 'core'},
    'default': {key: 'default', component: 'core'},
    'disabled': {key: 'disabled', component: 'admin'},
    'dropdown_actions': {key: 'actions', component: 'core'},
    'dropdown_columns': {key: 'profilefieldcolumns', component: 'admin'},
    'dropdown_coursename': {key: 'coursename', component: 'grades'},
    'dropdown_delete': {key: 'delete', component: 'core'},
    'dropdown_duplicate': {key: 'duplicate', component: 'core'},
    'dropdown_editsettings': {key: 'editsettings', component: 'core'},
    'dropdown_email': {key: 'email', component: 'core'},
    'dropdown_export': {key: 'export', component: 'calendar'},
    'dropdown_filter': {key: 'filter', component: 'core'},
    'dropdown_lastaccess': {key: 'lastaccess', component: 'core'},
    'dropdown_lastmodified': {key: 'lastmodified', component: 'core'},
    'dropdown_moreactions': {key: 'moreactions', component: 'core'},
    'dropdown_name': {key: 'name', component: 'core'},
    'dropdown_progress': {key: 'progress', component: 'core'},
    'dropdown_sortby': {key: 'sortby', component: 'core'},
    'formsubmission_advanced': {key: 'advanced', component: 'core'},
    'formsubmission_nothing': {key: 'nothingtodisplay', component: 'core'},
    'link_back': {key: 'back', component: 'core'},
    'radio_email': {key: 'email', component: 'core'},
    'radio_no': {key: 'no', component: 'core'},
    'radio_phone': {key: 'phone', component: 'core'},
    'radio_sms': {key: 'sms', component: 'sms'},
    'radio_yes': {key: 'yes', component: 'core'},
    'rtl_install': {key: 'langimport', component: 'tool_langimport'},
    'selected': {key: 'selected', component: 'form'},
    'settings': {key: 'settings', component: 'core'},
    'submit': {key: 'submit', component: 'core'},
    'switch_lock': {key: 'lock', component: 'grades'},
    'switch_visibility': {key: 'visibilityshort', component: 'group'},
} as const;

export type ShowcaseStringKey = typeof showcaseStringKeys[number] | keyof typeof sharedStrings;

/** A value for the placeholder in a string: `{$a}` for a single value, or `{$a->name}` for each property. */
export type StringParams = string | number | Record<string, string | number>;

export type Translate = (key: ShowcaseStringKey, params?: StringParams) => string;

/**
 * Fill in the placeholders of a language string.
 *
 * The strings are fetched once without parameters, so the same string can be used with different values.
 */
export const formatString = (value: string, params?: StringParams): string => {
    if (params === undefined) {
        return value;
    }
    if (typeof params === 'object') {
        return Object.entries(params).reduce(
            (result, [name, replacement]) => result.replaceAll(`{$a->${name}}`, String(replacement)),
            value,
        );
    }
    return value.replaceAll('{$a}', String(params));
};

const ShowcaseStringsContext = createContext<Translate | null>(null);

/**
 * Loads the showcase strings and renders its children once they are all available.
 */
export const ShowcaseStringsProvider: FC<PropsWithChildren> = ({children}) => {
    const [translate, setTranslate] = useState<Translate | null>(null);

    useEffect(() => {
        let cancelled = false;
        const requests = [
            ...showcaseStringKeys.map((key) => ({alias: key, key, component: showcaseComponent})),
            ...Object.entries(sharedStrings).map(([alias, {key, component}]) => ({alias, key, component})),
        ];
        getStrings(requests).then((values) => {
            if (!cancelled) {
                const strings = new Map<string, string>(requests.map(({alias}, index) => [alias, values[index]]));
                setTranslate(() => (key: ShowcaseStringKey, params?: StringParams) => (
                    formatString(strings.get(key) ?? key, params)
                ));
            }
            return values;
        });
        return () => {
            cancelled = true;
        };
    }, []);

    // Wait for the strings, so no component ever renders with an empty label.
    return translate && <ShowcaseStringsContext.Provider value={translate}>{children}</ShowcaseStringsContext.Provider>;
};

/**
 * Get the function that looks up a showcase string.
 */
export const useShowcaseStrings = (): Translate => {
    const translate = useContext(ShowcaseStringsContext);
    if (!translate) {
        throw new Error('useShowcaseStrings must be used inside ShowcaseStringsProvider');
    }
    return translate;
};
