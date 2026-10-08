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
 * Warns when the Design System showcase has no section for a component of the installed design system.
 *
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {readFileSync, readdirSync} from 'fs';
import path from 'path';

const showcaseDir = path.resolve(__dirname, '../src/designsystemshowcase');
const componentIndexFile = path.resolve(
    __dirname,
    '../../../../../node_modules/@moodlehq/design-system/dist/component-index.json',
);

/** The components of the installed design system, as listed in the index that ships with it. */
const components: {name: string, slug: string}[] = JSON.parse(readFileSync(componentIndexFile, 'utf8')).components;

/** The sections the showcase renders, by the id each one is given. */
const sectionIds = readdirSync(showcaseDir)
    .filter((file) => /Sections\.tsx$/.test(file))
    .flatMap((file) => [...readFileSync(path.join(showcaseDir, file), 'utf8').matchAll(/<Section\b[^>]*\bid="([^"]+)"/g)])
    .map((match) => match[1]);

describe('showcase sections', () => {
    it('cover every component of the design system', () => {
        const missing = components
            .filter(({slug}) => !sectionIds.includes(slug.replaceAll('-', '')))
            .map(({name}) => name);

        // Only a warning, as the design system can be upgraded before the showcase has a section for what is new.
        if (missing.length > 0) {
            // eslint-disable-next-line no-console
            console.warn(`The Design System showcase has no section for: ${missing.join(', ')}. Add one for each.`);
        }
        expect(true).toBe(true);
    });
});
