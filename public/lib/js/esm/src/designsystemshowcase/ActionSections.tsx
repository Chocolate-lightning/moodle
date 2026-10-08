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
 * Showcase sections for action and navigation components: buttons, dropdowns, links and tooltips.
 *
 * @module     core/designsystemshowcase/ActionSections
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {
    Button, ButtonProps, CloseButton, Dropdown, DropdownItemAction, DropdownItemCustom, DropdownItemDivider,
    DropdownItemExpandable, DropdownItemGroup, DropdownItemHeader, DropdownItemMultiselect, DropdownItemSelect,
    DropdownProps, FavouriteButton, Link, NavPill, Pagination, Tooltip, TooltipProps,
} from '@moodlehq/design-system';
import type {ButtonVariant} from '@moodlehq/design-system/components/button';
import {FC, useState} from 'react';
import {Example, Section, allOf, icon, noop} from '@moodle/lms/core/designsystemshowcase/Layout';
import {useShowcaseStrings} from '@moodle/lms/core/designsystemshowcase/strings';

const buttonVariants = allOf<ButtonVariant>({
    primary: true, secondary: true, danger: true, ghost: true, 'outline-primary': true, 'outline-secondary': true,
    'outline-danger': true,
});
const sizes = allOf<NonNullable<ButtonProps['size']>>({sm: true, md: true, lg: true});
const dropdownAppearances = allOf<NonNullable<DropdownProps['appearance']>>({emphasis: true, 'default': true, subtle: true});
const dropdownSizes = allOf<NonNullable<DropdownProps['size']>>({md: true, sm: true});
const tooltipPlacements = allOf<NonNullable<TooltipProps['placement']>>({top: true, bottom: true, left: true, right: true});

export const ButtonSection: FC = () => {
    const t = useShowcaseStrings();

    return (
        <Section expectation={t('button_expectation')} id="button" title={t('section_button')}>
            <Example label={t('button_variants')}>
                {buttonVariants.map((variant) => (
                    <Button key={variant} label={variant} variant={variant} />
                ))}
            </Example>
            <Example label={t('disabled')}>
                {buttonVariants.map((variant) => (
                    <Button disabled key={variant} label={variant} variant={variant} />
                ))}
            </Example>
            <Example label={t('button_sizes')}>
                {sizes.map((size) => (
                    <Button key={size} label={size} size={size} />
                ))}
            </Example>
            <Example label={t('button_withicons')}>
                <Button label={t('button_starticon')} startIcon={icon('plus')} />
                <Button endIcon={icon('arrow-right')} label={t('button_endicon')} variant="secondary" />
                <Button
                    endIcon={icon('chevron-down')}
                    label={t('button_both')}
                    startIcon={icon('filter')}
                    variant="outline-primary"
                />
            </Example>
            <Example label={t('button_icononly')}>
                {sizes.map((size) => (
                    <Button aria-label={t('settings')} key={size} size={size} startIcon={icon('gear')} variant="ghost" />
                ))}
            </Example>
        </Section>
    );
};

export const CloseButtonSection: FC = () => {
    const t = useShowcaseStrings();

    return (
        <Section expectation={t('closebutton_expectation')} id="closebutton" title={t('section_closebutton')}>
            <Example label={t('closebutton_sizes')}>
                {sizes.map((size) => (
                    <CloseButton aria-label={t('closebutton_label', size)} key={size} size={size} />
                ))}
            </Example>
            <Example label={t('disabled')}>
                {sizes.map((size) => (
                    <CloseButton aria-label={t('closebutton_label', size)} disabled key={size} size={size} />
                ))}
            </Example>
        </Section>
    );
};

export const DropdownSection: FC = () => {
    const t = useShowcaseStrings();

    return (
        <Section expectation={t('dropdown_expectation')} id="dropdown" title={t('section_dropdown')}>
            <Example label={t('dropdown_itemtypes')}>
                <Dropdown label={t('dropdown_label')}>
                    <DropdownItemHeader label={t('dropdown_header')} />
                    <DropdownItemDivider />
                    <DropdownItemAction label={t('dropdown_action')} />
                    <DropdownItemAction description={t('dropdown_description')} label={t('dropdown_action')} />
                    <DropdownItemAction label={t('dropdown_withicon')} startIcon={icon('pen')} />
                    <DropdownItemAction disabled label={t('dropdown_disabledaction')} />
                    <DropdownItemAction href="#dropdown-link" label={t('dropdown_link')} />
                    <DropdownItemAction
                        href="https://moodle.org"
                        label={t('dropdown_externallink')}
                        rel="noopener noreferrer"
                        target="_blank"
                    />
                </Dropdown>
                <Dropdown label={t('dropdown_sortby')}>
                    <DropdownItemSelect label={t('dropdown_coursename')} selected />
                    <DropdownItemSelect description={t('dropdown_mostrecent')} label={t('dropdown_lastmodified')} />
                    <DropdownItemSelect label={t('dropdown_progress')} startIcon={icon('chart-simple')} />
                    <DropdownItemSelect disabled label={t('disabled')} />
                </Dropdown>
                <Dropdown label={t('dropdown_columns')}>
                    <DropdownItemMultiselect checked label={t('dropdown_name')} />
                    <DropdownItemMultiselect checked description={t('dropdown_primaryaddress')} label={t('dropdown_email')} />
                    <DropdownItemMultiselect label={t('dropdown_lastaccess')} />
                    <DropdownItemMultiselect disabled label={t('disabled')} />
                </Dropdown>
                <Dropdown label={t('dropdown_actions')}>
                    <DropdownItemGroup label={t('dropdown_manage')}>
                        <DropdownItemAction label={t('dropdown_editsettings')} />
                        <DropdownItemAction label={t('dropdown_duplicate')} />
                    </DropdownItemGroup>
                    <DropdownItemGroup label={t('dropdown_dangerzone')}>
                        <DropdownItemAction label={t('dropdown_delete')} variant="danger" />
                        <DropdownItemAction
                            description={t('dropdown_cannotundo')}
                            label={t('dropdown_deletepermanently')}
                            startIcon={icon('trash')}
                            variant="danger"
                        />
                    </DropdownItemGroup>
                    <DropdownItemExpandable label={t('dropdown_moreoptions')}>
                        <DropdownItemAction label={t('dropdown_export')} />
                        <DropdownItemAction label={t('dropdown_archive')} />
                    </DropdownItemExpandable>
                    <DropdownItemExpandable disabled label={t('dropdown_disabledsubmenu')}>
                        <DropdownItemAction label={t('dropdown_unreachable')} />
                    </DropdownItemExpandable>
                    <DropdownItemCustom>
                        <div className="px-3 py-2">{t('dropdown_custom')}</div>
                    </DropdownItemCustom>
                </Dropdown>
            </Example>
            <Example label={t('dropdown_appearances')}>
                {dropdownAppearances.map((appearance) => (
                    dropdownSizes.map((size) => (
                        <Dropdown
                            appearance={appearance}
                            key={`${appearance}-${size}`}
                            label={`${appearance} ${size}`}
                            size={size}
                        >
                            <DropdownItemAction label={t('dropdown_action')} />
                        </Dropdown>
                    ))
                ))}
            </Example>
            <Example label={t('dropdown_triggers')}>
                <Dropdown label={t('dropdown_navpill')} variant="nav-pill">
                    <DropdownItemAction label={t('dropdown_action')} />
                </Dropdown>
                <Dropdown label={t('dropdown_filter')} startIcon={icon('filter')}>
                    <DropdownItemAction label={t('dropdown_action')} />
                </Dropdown>
                <Dropdown iconOnly label={t('dropdown_moreactions')} startIcon={icon('ellipsis-vertical')}>
                    <DropdownItemAction label={t('dropdown_action')} />
                </Dropdown>
            </Example>
            <Example label={t('dropdown_placement')}>
                <Dropdown label={t('dropdown_topstart')} placement="top-start">
                    <DropdownItemAction label={t('dropdown_opensabove')} />
                </Dropdown>
                <Dropdown label={t('dropdown_bottomend')} placement="bottom-end">
                    <DropdownItemAction label={t('dropdown_alignedtoend')} />
                </Dropdown>
                <Dropdown label={t('dropdown_matchwidth')} matchTriggerWidth>
                    <DropdownItemAction label={t('dropdown_samewidth')} />
                </Dropdown>
            </Example>
        </Section>
    );
};

export const FavouriteButtonSection: FC = () => {
    const t = useShowcaseStrings();
    const [favourite, setFavourite] = useState(true);

    return (
        <Section expectation={t('favouritebutton_expectation')} id="favouritebutton" title={t('section_favouritebutton')}>
            <Example label={t('favouritebutton_toggle')}>
                <FavouriteButton
                    aria-label={favourite ? t('favouritebutton_remove') : t('favouritebutton_add')}
                    onClick={() => setFavourite(!favourite)}
                    selected={favourite}
                />
                <FavouriteButton aria-label={t('favouritebutton_adddisabled')} disabled />
                <FavouriteButton aria-label={t('favouritebutton_removedisabled')} disabled selected />
            </Example>
        </Section>
    );
};

export const LinkSection: FC = () => {
    const t = useShowcaseStrings();

    return (
        <Section expectation={t('link_expectation')} id="link" title={t('section_link')}>
            <Example label={t('link_variants')}>
                <Link href="#link-default" label={t('default')} onClick={noop} />
                <Link href="#link-secondary" label={t('link_secondary')} onClick={noop} variant="secondary" />
                <Link disabled href="#link-disabled" label={t('disabled')} onClick={noop} />
            </Example>
            <Example label={t('link_icons')}>
                <Link href="#link-start" label={t('link_back')} onClick={noop} startIcon={icon('arrow-left')} />
                <Link
                    endIcon={icon('arrow-up-right-from-square')}
                    href="https://moodle.org"
                    label={t('link_external')}
                    target="_blank"
                />
            </Example>
            <Example label={t('link_comparison')}>
                <Link href="#link-inline" label={t('link_designsystem')} onClick={noop} />
                <a href="#link-theme">{t('link_theme')}</a>
            </Example>
        </Section>
    );
};

export const NavPillSection: FC = () => {
    const t = useShowcaseStrings();

    return (
        <Section expectation={t('navpill_expectation')} id="navpill" title={t('section_navpill')}>
            <Example label={t('navpill_states')}>
                <NavPill href="#navpill-selected" label={t('selected')} selected />
                <NavPill href="#navpill-default" label={t('default')} />
                <NavPill disabled href="#navpill-disabled" label={t('disabled')} />
            </Example>
        </Section>
    );
};

export const PaginationSection: FC = () => {
    const t = useShowcaseStrings();
    const [currentPage, setCurrentPage] = useState(1);
    const [groupedPage, setGroupedPage] = useState(5);

    return (
        <Section expectation={t('pagination_expectation')} id="pagination" title={t('section_pagination')}>
            <Example label={t('pagination_full', `${currentPage} / 10`)}>
                <Pagination currentPage={currentPage} onPageChange={setCurrentPage} totalPages={10} />
            </Example>
            <Example label={t('pagination_grouped', `${groupedPage} / 50`)}>
                <Pagination currentPage={groupedPage} onPageChange={setGroupedPage} totalPages={50} variant="grouped" />
            </Example>
            <Example label={t('disabled')}>
                <Pagination currentPage={3} disabled onPageChange={noop} totalPages={10} />
            </Example>
        </Section>
    );
};

export const TooltipSection: FC = () => {
    const t = useShowcaseStrings();

    return (
        <Section expectation={t('tooltip_expectation')} id="tooltip" title={t('section_tooltip')}>
            <Example label={t('tooltip_dark')}>
                {tooltipPlacements.map((placement) => (
                    <Tooltip key={placement} label={t('tooltip_text')} placement={placement}>
                        <Button label={placement} variant="secondary" />
                    </Tooltip>
                ))}
            </Example>
            <Example label={t('tooltip_light')}>
                {tooltipPlacements.map((placement) => (
                    <Tooltip key={placement} label={t('tooltip_text')} placement={placement} variant="light">
                        <Button label={placement} variant="outline-secondary" />
                    </Tooltip>
                ))}
            </Example>
            <Example label={t('tooltip_icononly')}>
                <Tooltip label={t('settings')}>
                    <Button aria-label={t('settings')} startIcon={icon('gear')} variant="ghost" />
                </Tooltip>
                <Tooltip label={t('tooltip_long')}>
                    <Button label={t('tooltip_longtrigger')} variant="secondary" />
                </Tooltip>
            </Example>
        </Section>
    );
};
