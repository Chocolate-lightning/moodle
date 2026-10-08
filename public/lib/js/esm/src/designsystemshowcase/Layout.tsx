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
 * Shared layout pieces for the Design System showcase page.
 *
 * @module     core/designsystemshowcase/Layout
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {FC, PropsWithChildren, ReactNode} from 'react';
import {useShowcaseStrings} from '@moodle/lms/core/designsystemshowcase/strings';

// Handler for examples that need a callback but have no behaviour to show.
export const noop = (): void => undefined;

export const icon = (name: string) => <i aria-hidden="true" className={`fa-solid fa-${name}`} />;

/**
 * List every member of a string union type.
 *
 * The argument is checked against the type in both directions: a member missing from it, or one the
 * component no longer has, fails to compile. This keeps the examples in step with the component's own types.
 *
 * @example allOf<AvatarSize>({xs: true, sm: true, md: true, lg: true, xl: true, xxl: true})
 */
export const allOf = <T extends string>(members: Record<T, true>): T[] => Object.keys(members) as T[];

export const sectionId = (id: string): string => `ds-${id}`;

interface SectionProps {
    /** Stable, untranslated name for the component, used for the anchor and test ids. */
    id: string;
    title: string;
    /** What the tester should confirm for this component, shown next to the examples. */
    expectation?: string;
}

/**
 * A titled block for one component. Keeps the page structure consistent and gives each
 * section an anchor so specific components can be linked to directly.
 */
export const Section: FC<PropsWithChildren<SectionProps>> = ({id, title, expectation, children}) => {
    const t = useShowcaseStrings();
    const anchor = sectionId(id);

    return (
        <section className="mb-5 pb-4 border-bottom" aria-labelledby={anchor}>
            <h2 className="h3 mb-3" id={anchor}>{title}</h2>
            {expectation && (
                <p className="alert alert-info py-2" data-testid={`${anchor}-expectation`}>
                    <strong>{t('expectation')}</strong> {expectation}
                </p>
            )}
            {children}
        </section>
    );
};

interface ExampleProps {
    label: ReactNode;
}

/**
 * One captioned row of variants within a section, so testers can refer to exactly what they are checking.
 */
export const Example: FC<PropsWithChildren<ExampleProps>> = ({label, children}) => (
    <div className="mb-3">
        <div className="small text-muted mb-2">{label}</div>
        <div className="d-flex flex-wrap align-items-center gap-3">{children}</div>
    </div>
);
