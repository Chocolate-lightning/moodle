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
 * Tests that the Design System showcase strings match the lang file they are loaded from.
 *
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {readFileSync} from 'fs';
import path from 'path';
import {formatString, sharedStrings, showcaseComponent, showcaseStringKeys} from '../src/showcase/strings';

// Strings the showcase page needs from PHP, before any JavaScript runs.
const phpOnlyKeys = ['pagetitle'];

/** Read the identifiers defined by a component's English lang file. */
const readLangKeys = (component: string): string[] => {
    // Plugins keep their lang files in their own directory; everything else is a core lang file.
    const dir = component.startsWith('tool_')
        ? `../../../../admin/tool/${component.replace('tool_', '')}/lang/en`
        : '../../../../lang/en';
    const file = path.resolve(__dirname, dir, `${component === 'core' ? 'moodle' : component.replace('core_', '')}.php`);
    return [...readFileSync(file, 'utf8').matchAll(/^\$string\['([^']+)'\]/gm)].map((match) => match[1]);
};

const langKeys = readLangKeys(showcaseComponent);

describe('showcase strings', () => {
    it('are all defined in the lang file', () => {
        expect(showcaseStringKeys.filter((key) => !langKeys.includes(key))).toEqual([]);
    });

    it('are all used by the page', () => {
        expect(langKeys.filter((key) => !showcaseStringKeys.includes(key as never) && !phpOnlyKeys.includes(key)))
            .toEqual([]);
    });

    it('do not repeat strings that are borrowed from elsewhere', () => {
        expect(showcaseStringKeys.filter((key) => key in sharedStrings)).toEqual([]);
    });

    it('only borrow strings that exist', () => {
        const missing = Object.entries(sharedStrings)
            .filter(([, {key, component}]) => !readLangKeys(component).includes(key))
            .map(([alias]) => alias);
        expect(missing).toEqual([]);
    });

    it('are listed once each', () => {
        expect(new Set(showcaseStringKeys).size).toBe(showcaseStringKeys.length);
    });
});

describe('formatString', () => {
    it('returns the string untouched without parameters', () => {
        expect(formatString('Close ({$a})')).toBe('Close ({$a})');
    });

    it('replaces every {$a} with a single value', () => {
        expect(formatString('{$a} of {$a}', 3)).toBe('3 of 3');
    });

    it('replaces each {$a->name} from an object', () => {
        expect(formatString('{$a->value} of {$a->total}', {value: 3, total: 10})).toBe('3 of 10');
    });
});
