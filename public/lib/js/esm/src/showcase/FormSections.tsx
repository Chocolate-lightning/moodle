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
 * Showcase sections for form controls, plus a native form submission check.
 *
 * @module     core/showcase/FormSections
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {Button, Checkbox, Choicebox, Radio, Switch} from '@moodlehq/design-system';
import type {SwitchLabelSide, SwitchVariant} from '@moodlehq/design-system/components/switch';
import {ChangeEvent, FC, FormEvent, useState} from 'react';
import {Example, Section, allOf, icon, noop} from '@moodle/lms/core/showcase/Layout';
import {useShowcaseStrings} from '@moodle/lms/core/showcase/strings';

const switchVariants = allOf<SwitchVariant>({enable: true, visibility: true, lock: true});
const switchLabelSides = allOf<SwitchLabelSide>({start: true, end: true});

export const CheckboxSection: FC = () => {
    const t = useShowcaseStrings();

    return (
        <Section expectation={t('checkbox_expectation')} id="checkbox" title={t('section_checkbox')}>
            <Example label={t('checkbox_states')}>
                <Checkbox label={t('unchecked')} name="checkbox-states" value="unchecked" />
                <Checkbox defaultChecked label={t('checked')} name="checkbox-states" onChange={noop} value="checked" />
                <Checkbox indeterminate label={t('checkbox_indeterminate')} name="checkbox-states" value="indeterminate" />
                <Checkbox disabled label={t('disabled')} name="checkbox-states" value="disabled" />
                <Checkbox
                    defaultChecked
                    disabled
                    label={t('disabledchecked')}
                    name="checkbox-states"
                    value="disabled-checked"
                />
            </Example>
            <Example label={t('invalid')}>
                <Checkbox invalid label={t('checkbox_invalidnofeedback')} name="checkbox-invalid" value="a" />
                <Checkbox
                    invalid
                    invalidFeedback={t('checkbox_acceptfeedback')}
                    label={t('checkbox_accept')}
                    name="checkbox-invalid"
                    required
                    value="b"
                />
            </Example>
            <Example label={t('checkbox_extras')}>
                <Checkbox
                    label={t('checkbox_notifications')}
                    name="checkbox-extra"
                    supportingText={t('checkbox_notificationshelp')}
                    value="notify"
                />
                <Checkbox hideLabel label={t('checkbox_hiddenlabel')} name="checkbox-extra" value="row" />
                <div style={{maxWidth: '20rem'}}>
                    <Checkbox label={t('checkbox_long')} name="checkbox-extra" value="long" />
                </div>
            </Example>
        </Section>
    );
};

export const ChoiceboxSection: FC = () => {
    const t = useShowcaseStrings();

    return (
        <Section expectation={t('choicebox_expectation')} id="choicebox" title={t('section_choicebox')}>
            <Example label={t('choicebox_icons')}>
                <Choicebox icon={icon('star')} label={t('choicebox_star')} name="choicebox" value="star" />
                <Choicebox icon={icon('check')} label={t('choicebox_check')} name="choicebox" value="check" />
                <Choicebox icon={icon('font')} label={t('choicebox_font')} name="choicebox" value="font" />
            </Example>
            <Example label={t('choicebox_supporting')}>
                <Choicebox
                    label={t('choicebox_individual')}
                    name="choicebox-extra"
                    supportingText={t('choicebox_individualhelp')}
                    value="individual"
                />
                <Choicebox
                    label={t('choicebox_group')}
                    name="choicebox-extra"
                    supportingText={t('choicebox_grouphelp')}
                    value="group"
                />
                <Choicebox disabled label={t('disabled')} name="choicebox-extra" value="disabled" />
                <Choicebox
                    defaultChecked
                    disabled
                    label={t('disabledchecked')}
                    name="choicebox-disabled"
                    value="disabled-checked"
                />
            </Example>
        </Section>
    );
};

export const RadioSection: FC = () => {
    const t = useShowcaseStrings();

    return (
        <Section expectation={t('radio_expectation')} id="radio" title={t('section_radio')}>
            <Example label={t('radio_group')}>
                <Radio label={t('radio_phone')} name="contact" value="phone" />
                <Radio label={t('radio_sms')} name="contact" value="sms" />
                <Radio defaultChecked label={t('radio_email')} name="contact" value="email" />
            </Example>
            <Example label={t('disabled')}>
                <Radio disabled label={t('disabled')} name="radio-disabled" value="a" />
                <Radio defaultChecked disabled label={t('disabledchecked')} name="radio-disabled" value="b" />
            </Example>
            <Example label={t('invalid')}>
                <Radio invalid label={t('radio_yes')} name="radio-invalid" value="yes" />
                <Radio
                    invalid
                    invalidFeedback={t('radio_invalidfeedback')}
                    label={t('radio_no')}
                    name="radio-invalid"
                    value="no"
                />
            </Example>
            <Example label={t('radio_extras')}>
                <Radio hideLabel label={t('radio_hiddenlabel')} name="radio-extra" value="row" />
                <div style={{maxWidth: '20rem'}}>
                    <Radio label={t('radio_long')} name="radio-extra" value="long" />
                </div>
            </Example>
        </Section>
    );
};

export const SwitchSection: FC = () => {
    const t = useShowcaseStrings();
    const [checked, setChecked] = useState(true);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setChecked(event.currentTarget.checked);
    };

    return (
        <Section expectation={t('switch_expectation')} id="switch" title={t('section_switch')}>
            <Example label={t('switch_variants')}>
                <Switch checked={checked} label={t('switch_controlled')} onChange={handleChange} />
                <Switch defaultChecked label={t('switch_visibility')} variant="visibility" />
                <Switch defaultChecked label={t('switch_lock')} variant="lock" />
            </Example>
            <Example label={t('switch_labelside')}>
                {switchLabelSides.map((labelSide) => (
                    <Switch key={labelSide} label={labelSide} labelSide={labelSide} />
                ))}
                <Switch hideLabel label={t('switch_hiddenlabel')} />
            </Example>
            <Example label={t('disabled')}>
                <Switch disabled label={t('disabled')} />
                {switchVariants.map((variant) => (
                    <Switch defaultChecked disabled key={variant} label={variant} variant={variant} />
                ))}
            </Example>
            <Example label={t('switch_longlabel')}>
                <div style={{maxWidth: '15rem'}}>
                    <Switch label={t('switch_long')} />
                </div>
            </Example>
        </Section>
    );
};

export const FormSubmissionSection: FC = () => {
    const t = useShowcaseStrings();
    const [submitted, setSubmitted] = useState<[string, string][] | null>(null);

    // Show what the browser would post, so the name and value of each control can be checked.
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted([...data.entries()].map(([name, value]) => [name, String(value)]));
    };

    return (
        <Section expectation={t('formsubmission_expectation')} id="formsubmission" title={t('section_formsubmission')}>
            <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
                <Checkbox label={t('formsubmission_updates')} name="updates" value="yes" />
                <div className="d-flex flex-column gap-2">
                    <Radio label={t('radio_phone')} name="method" value="phone" />
                    <Radio defaultChecked label={t('radio_email')} name="method" value="email" />
                </div>
                <Switch defaultChecked label={t('formsubmission_visible')} name="visible" value="1" />
                <div className="d-flex flex-wrap gap-3">
                    <Choicebox label={t('formsubmission_beginner')} name="level" value="beginner" />
                    <Choicebox label={t('formsubmission_advanced')} name="level" value="advanced" />
                </div>
                <div>
                    <Button label={t('submit')} type="submit" />
                </div>
            </form>
            {submitted && (
                <pre className="mt-3 p-3 bg-light border" data-testid="ds-form-result">
                    {submitted.length
                        ? submitted.map(([name, value]) => `${name}=${value}`).join('\n')
                        : t('formsubmission_nothing')}
                </pre>
            )}
        </Section>
    );
};
