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
 * Design System showcase page.
 *
 * Renders MDS components in situ so they can be verified against the LMS theme and Bootstrap.
 *
 * @module     core/designsystemshowcase/DesignSystemShowcase
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {Button} from '@moodlehq/design-system';
import {FC, useEffect, useRef, useState} from 'react';
import {
    ButtonSection, CloseButtonSection, DropdownSection, FavouriteButtonSection, LinkSection, NavPillSection,
    PaginationSection, TooltipSection,
} from '@moodle/lms/core/designsystemshowcase/ActionSections';
import {
    ActivityIconSection, AvatarSection, BadgeSection, BreadcrumbSection, ProgressBarSection,
} from '@moodle/lms/core/designsystemshowcase/DisplaySections';
import {
    CheckboxSection, ChoiceboxSection, FormSubmissionSection, RadioSection, SwitchSection,
} from '@moodle/lms/core/designsystemshowcase/FormSections';
import {ShowcaseStrings, ShowcaseStringsProvider, useShowcaseStrings} from '@moodle/lms/core/designsystemshowcase/strings';

interface ContentsEntry {
    id: string;
    title: string;
}

interface DesignSystemShowcaseProps {
    /** Whether the page is being rendered in a right-to-left language, with the RTL theme CSS loaded. */
    isRtl: boolean;
    /** The strings of the page, by key. */
    strings: ShowcaseStrings;
}

const Showcase: FC<DesignSystemShowcaseProps> = ({isRtl}) => {
    const t = useShowcaseStrings();
    const [dir, setDir] = useState<'ltr' | 'rtl'>(isRtl ? 'rtl' : 'ltr');
    const [contents, setContents] = useState<ContentsEntry[]>([]);
    const sectionsRef = useRef<HTMLDivElement>(null);

    // Build the contents from the rendered headings, so it can never drift from the sections below.
    useEffect(() => {
        const headings = sectionsRef.current?.querySelectorAll<HTMLElement>('section > h2[id]') ?? [];
        setContents([...headings].map((heading) => ({id: heading.id, title: heading.textContent ?? ''})));
    }, []);

    return (
        <div className="container py-5" dir={dir}>
            <div className="d-flex flex-wrap justify-content-end gap-2 mb-4">
                <Button
                    label={dir === 'ltr' ? t('render_rtl') : t('render_ltr')}
                    onClick={() => setDir(dir === 'ltr' ? 'rtl' : 'ltr')}
                    title={t('render_help')}
                    variant="outline-secondary"
                />
            </div>
            <nav aria-labelledby="ds-contents" className="card card-body mb-5">
                <h2 className="h5 mb-3" id="ds-contents">{t('contents')}</h2>
                <ul className="list-unstyled row row-cols-2 row-cols-md-3 row-cols-lg-4 gy-2 mb-0">
                    {contents.map(({id, title}) => (
                        <li className="col" key={id}>
                            <a href={`#${id}`}>{title}</a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div ref={sectionsRef}>
                <ActivityIconSection />
                <AvatarSection />
                <BadgeSection />
                <BreadcrumbSection />
                <ButtonSection />
                <CheckboxSection />
                <ChoiceboxSection />
                <CloseButtonSection />
                <DropdownSection />
                <FavouriteButtonSection />
                <LinkSection />
                <NavPillSection />
                <PaginationSection />
                <ProgressBarSection />
                <RadioSection />
                <SwitchSection />
                <TooltipSection />
                <FormSubmissionSection />
            </div>
        </div>
    );
};

const DesignSystemShowcase: FC<DesignSystemShowcaseProps> = (props) => (
    <ShowcaseStringsProvider strings={props.strings}>
        <Showcase {...props} />
    </ShowcaseStringsProvider>
);

export default DesignSystemShowcase;
