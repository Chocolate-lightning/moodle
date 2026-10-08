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
 * Tests that the Design System showcase strings match the lang file and the PHP that provide them.
 *
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {readFileSync, readdirSync} from 'fs';
import path from 'path';
import {formatString} from '../src/designsystemshowcase/strings';

// Strings the showcase page needs from PHP, before any JavaScript runs.
const phpOnlyKeys = ['pagetitle'];

const showcaseDir = path.resolve(__dirname, '../src/designsystemshowcase');
const langFile = path.resolve(__dirname, '../../../../lang/en/designsystemshowcase.php');
const fixtureFile = path.resolve(__dirname, '../../../tests/behat/fixtures/design_system_showcase.php');

/** The identifiers defined by the showcase lang file. */
const langKeys = [...readFileSync(langFile, 'utf8').matchAll(/^\$string\['([^']+)'\]/gm)].map((match) => match[1]);

/** The keys the page borrows from other components, as listed by the PHP that provides the strings. */
const sharedKeys = [...readFileSync(fixtureFile, 'utf8').matchAll(/^ {4}'([^']+)' => \['[^']+', '[^']+'\],$/gm)]
    .map((match) => match[1]);

/** The source of the page, which looks strings up with `t('key')`. */
const pageSource = readdirSync(showcaseDir)
    .filter((file) => /(DesignSystemShowcase|Sections|Layout)\.tsx$/.test(file))
    .map((file) => readFileSync(path.join(showcaseDir, file), 'utf8'))
    .join('\n');

const usedKeys = [...pageSource.matchAll(/\bt\('([a-z_]+)'/g)].map((match) => match[1]);

describe('showcase strings', () => {
    it('are all provided by the lang file or borrowed', () => {
        expect(usedKeys.filter((key) => !langKeys.includes(key) && !sharedKeys.includes(key))).toEqual([]);
    });

    it('are all used by the page', () => {
        expect([...langKeys, ...sharedKeys].filter((key) => !phpOnlyKeys.includes(key) && !pageSource.includes(`'${key}'`)))
            .toEqual([]);
    });

    it('do not repeat strings that are borrowed from elsewhere', () => {
        expect(langKeys.filter((key) => sharedKeys.includes(key))).toEqual([]);
    });

    it('are listed once each', () => {
        expect(new Set(langKeys).size).toBe(langKeys.length);
        expect(new Set(sharedKeys).size).toBe(sharedKeys.length);
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
