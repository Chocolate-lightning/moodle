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
 * Design System Demo page.
 *
 * @module     core/designDemo
 * @copyright  Andrew Lyons <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {ActivityIcon, Avatar, Badge, Button, Checkbox, Choicebox, CloseButton,
    FavouriteButton, Radio, Link, NavPill, Pagination, ProgressBar} from "@moodlehq/design-system";
import { FC, PropsWithChildren } from "react";

interface ExampleProps {
}

const Example: FC<ExampleProps> = () => {
    return (
        <>
            <div>
                <h3>Activity Icon</h3>
                <ActivityIcon
                    alt=""
                    icon="assignment"
                    size="md"
                    variant="default"
                />
            </div>
            <div>
                <h3>Avatar</h3>
                <div className="d-flex align-items-center gap-2">
                    <Avatar
                        alt="Jane Doe"
                        initials="JD"
                        imageSrc="https://picsum.photos/seed/mds-avatar/96/96"
                    />
                    <Avatar
                        alt="Jane Doe"
                        initials="JD"
                    />
                    <Avatar
                        alt="Jane Doe"
                        initials="JD"
                        size="sm"
                    />
                    <Avatar
                        alt="Jane Doe"
                        initials=""
                        size="xl"
                    />
                </div>
            </div>
            <div>
                <h3>Button</h3>
                <Button
                    label="Button"
                />
            </div>
            <div>
                <h3>Badge</h3>
                <Badge
                    label="حالة"
                    startIcon={<i aria-hidden="true" className="fa-solid fa-circle-check" />}
                />
            </div >
            <div>
                <h3>Checkbox</h3>
                <Checkbox
                    defaultChecked
                    label="Remember this setting"
                    name="settings"
                    onChange={() => { }}
                    value="remember-this-setting"
                />
            </div>
            <div>
                <h3>Choicebox</h3>
                <Choicebox
                    icon={<i className="fa-solid fa-star" />}
                    label="Label star text"
                    name="choicebox"
                />
                <Choicebox
                    icon={<i className="fa-solid fa-check" />}
                    label="Label check text"
                    name="choicebox"
                />
                <Choicebox
                    icon={<i className="fa-solid fa-font" />}
                    label="Label font text"
                    name="choicebox"
                />
            </div>
            <div>
                <h3>Close Button</h3>
                <CloseButton
                    aria-label="Close"
                    disabled
                    size="md"
                />
            </div>
            <div>
                <h3>Favourite Button</h3>
                <FavouriteButton
                    aria-label="Add to favourites"
                    onClick={() => {}}
                    selected
                />
            </div>
            <div>
                <h3>Link</h3>
                <Link
                    href="#storybook-link"
                    label="Link"
                    onClick={() => { }}
                    startIcon={<i aria-hidden="true" className="fa-solid fa-arrow-left"/>}
                />
            </div>
            <div>
                <h3>Navigation Pill</h3>
                <NavPill
                    href="#"
                    label="Label"
                    selected
                />
            </div>
            <div>
                <h3>Pagination</h3>
                <Pagination
                    currentPage={1}
                    onPageChange={() => {}}
                    totalPages={10}
                />
            </div>
            <div>
                <h3>Progress Bar</h3>
                <ProgressBar
                    count="5 of 10"
                    max={100}
                    min={0}
                    title="Uploading files"
                    value={50}
                />
            </div>
            <div>
                <h3>Radio Input</h3>
                <Radio
                    label="Phone"
                    name="contact"
                    value="phone"
                />

                <Radio
                    label="SMS"
                    name="contact"
                    value="sms"
                />

                <Radio
                    defaultChecked
                    label="Email"
                    name="contact"
                    value="email"
                />
            </div>
        </>
    );
};

export default Example;