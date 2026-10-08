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
 * The page's PHP resolves every string and passes them in as a prop, as the other React components do, so there is
 * nothing to fetch in the browser. Strings that take a parameter keep their placeholder, and are filled in here.
 *
 * @module     core/designsystemshowcase/strings
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {FC, PropsWithChildren, createContext, useContext} from 'react';

/** The strings of the page, by key. */
export type ShowcaseStrings = Record<string, string>;

/** The key of a string in the page's strings. */
export type ShowcaseStringKey = string;

/** A value for the placeholder in a string: `{$a}` for a single value, or `{$a->name}` for each property. */
export type StringParams = string | number | Record<string, string | number>;

export type Translate = (key: ShowcaseStringKey, params?: StringParams) => string;

/**
 * Fill in the placeholders of a language string.
 *
 * The strings are provided without parameters, so the same string can be used with different values.
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
 * Makes the strings of the page available to its children.
 */
export const ShowcaseStringsProvider: FC<PropsWithChildren<{strings: ShowcaseStrings}>> = ({strings, children}) => {
    const translate: Translate = (key, params) => formatString(strings[key] ?? key, params);
    return <ShowcaseStringsContext.Provider value={translate}>{children}</ShowcaseStringsContext.Provider>;
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
