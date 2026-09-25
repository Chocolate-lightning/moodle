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
 * Showcase sections for display components: icons, avatars, badges, breadcrumbs and progress.
 *
 * @module     core/showcase/DisplaySections
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {
    ActivityIcon, Avatar, AvatarSize, Badge, BadgeProps, Breadcrumb, ProgressBar, ProgressBarProps,
} from '@moodlehq/design-system';
import type {ActivityIconContainer, ActivityIconSize} from '@moodlehq/design-system/components/activity-icon';
import {FC} from 'react';
import config from '@moodle/lms/core/config';
import {Example, Section, allOf, icon} from '@moodle/lms/core/showcase/Layout';
import {useShowcaseStrings} from '@moodle/lms/core/showcase/strings';

// The design system does not export the list of activity icon names, so this one has to be kept up to date by hand.
const activityIcons = [
    'assignment', 'quiz', 'workshop', 'database', 'forum', 'glossary', 'wiki', 'bigbluebutton', 'chat',
    'choice', 'feedback', 'survey', 'h5p', 'ims-package', 'lesson', 'scorm-package', 'book', 'external-tool',
    'file', 'folder', 'page', 'text-and-media', 'url', 'subsection', 'file-pdf', 'file-image', 'file-unknown',
];
const activityIconSizes = allOf<ActivityIconSize>({sm: true, md: true, lg: true, xl: true});
const activityIconContainers = allOf<ActivityIconContainer>({none: true, 'default': true, large: true});
const avatarSizes = allOf<AvatarSize>({xs: true, sm: true, md: true, lg: true, xl: true, xxl: true});
const badgeVariants = allOf<NonNullable<BadgeProps['variant']>>({
    primary: true, secondary: true, success: true, danger: true, warning: true, info: true,
});
const progressStatuses = allOf<NonNullable<ProgressBarProps['status']>>({
    'in-progress': true, loading: true, error: true, warning: true,
});
const progressLabelVariants = allOf<NonNullable<ProgressBarProps['labelVariant']>>({
    'title-and-count': true, title: true, inline: true, none: true,
});

export const ActivityIconSection: FC = () => {
    const t = useShowcaseStrings();

    return (
        <Section expectation={t('activityicon_expectation')} id="activityicon" title={t('section_activityicon')}>
            <Example label={t('activityicon_all')}>
                {activityIcons.map((name) => (
                    <ActivityIcon alt={name} icon={name} key={name} />
                ))}
            </Example>
            {activityIconContainers.map((container) => (
                <Example key={container} label={t('activityicon_container', container)}>
                    {activityIconSizes.map((size) => (
                        <ActivityIcon alt="" container={container} icon="assignment" key={size} size={size} />
                    ))}
                </Example>
            ))}
        </Section>
    );
};

export const AvatarSection: FC = () => {
    const t = useShowcaseStrings();

    return (
        <Section expectation={t('avatar_expectation')} id="avatar" title={t('section_avatar')}>
            <Example label={t('avatar_image')}>
                {avatarSizes.map((size) => (
                    <Avatar alt={t('avatar_name')} imageSrc={`${config.wwwroot}/pix/u/f1.png`} key={size} size={size} />
                ))}
            </Example>
            <Example label={t('avatar_initials')}>
                {avatarSizes.map((size) => (
                    <Avatar alt={t('avatar_name')} initials={t('avatar_initialsvalue')} key={size} size={size} />
                ))}
            </Example>
            <Example label={t('avatar_silhouette')}>
                {avatarSizes.map((size) => (
                    <Avatar alt={t('avatar_name')} initials="" key={size} size={size} />
                ))}
            </Example>
            <Example label={t('avatar_broken')}>
                <Avatar
                    alt={t('avatar_name')}
                    imageSrc={`${config.wwwroot}/pix/u/does-not-exist.png`}
                    initials={t('avatar_initialsvalue')}
                />
            </Example>
        </Section>
    );
};

export const BadgeSection: FC = () => {
    const t = useShowcaseStrings();

    return (
        <Section expectation={t('badge_expectation')} id="badge" title={t('section_badge')}>
            <Example label={t('default')}>
                {badgeVariants.map((variant) => (
                    <Badge key={variant} label={variant} variant={variant} />
                ))}
            </Example>
            <Example label={t('badge_subtle')}>
                {badgeVariants.map((variant) => (
                    <Badge key={variant} label={variant} subtle variant={variant} />
                ))}
            </Example>
            <Example label={t('badge_pill')}>
                {badgeVariants.map((variant) => (
                    <Badge key={variant} label={variant} pill variant={variant} />
                ))}
            </Example>
            <Example label={t('badge_icons')}>
                <Badge label={t('badge_complete')} startIcon={icon('circle-check')} variant="success" />
                <Badge endIcon={icon('arrow-up-right-from-square')} label={t('badge_external')} subtle variant="info" />
                <Badge label={t('badge_overdue')} pill startIcon={icon('triangle-exclamation')} variant="danger" />
            </Example>
        </Section>
    );
};

export const BreadcrumbSection: FC = () => {
    const t = useShowcaseStrings();
    const trail = [
        {href: '#home', label: t('breadcrumb_home')},
        {href: '#faculty', label: t('breadcrumb_faculty')},
        {href: '#program', label: t('breadcrumb_program')},
        {href: '#another', label: t('breadcrumb_another')},
    ];
    const current = {label: t('breadcrumb_current')};

    return (
        <Section expectation={t('breadcrumb_expectation')} id="breadcrumb" title={t('breadcrumb')}>
            <div className="d-flex flex-column gap-3">
                {[2, 3, 4, 5].map((count) => (
                    <Example
                        key={count}
                        label={t(count > 4 ? 'breadcrumb_itemsoverflow' : 'breadcrumb_items', count)}
                    >
                        <Breadcrumb
                            ariaLabel={t('breadcrumb')}
                            items={[...trail.slice(0, count - 1), current]}
                            overflowAriaLabel={t('breadcrumb_showmore')}
                        />
                    </Example>
                ))}
            </div>
        </Section>
    );
};

export const ProgressBarSection: FC = () => {
    const t = useShowcaseStrings();

    // The bar fills the width of its container, so each one is constrained to keep the rows comparable.
    const bar = (props: ProgressBarProps) => (
        <div className="w-100" style={{maxWidth: '30rem'}}>
            <ProgressBar count={t('progressbar_count')} title={t('progressbar_title')} {...props} />
        </div>
    );

    return (
        <Section expectation={t('progressbar_expectation')} id="progressbar" title={t('section_progressbar')}>
            {progressStatuses.map((status) => (
                <Example key={status} label={t('progressbar_status', status)}>
                    {bar({status, value: 50})}
                </Example>
            ))}
            <Example label={t('progressbar_animated')}>
                {/* Only the loading status animates. The animated prop does nothing on its own. */}
                {bar({animated: true, status: 'loading', value: 50})}
            </Example>
            {progressLabelVariants.map((labelVariant) => (
                <Example key={labelVariant} label={t('progressbar_labelvariant', labelVariant)}>
                    {bar({labelVariant, value: 75})}
                </Example>
            ))}
            <Example label={t('progressbar_empty')}>
                {bar({value: 0})}
            </Example>
            <Example label={t('progressbar_complete')}>
                {bar({value: 100})}
            </Example>
        </Section>
    );
};
