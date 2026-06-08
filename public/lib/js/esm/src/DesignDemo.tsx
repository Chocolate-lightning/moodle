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

// import {ActivityIcon, Badge, Button, Checkbox, CloseButton, Radio} from "@moodlehq/design-system";
import {Button, CloseButton, Radio} from "@moodlehq/design-system";
import {FC} from "react";

interface ExampleProps {
}

const Example: FC<ExampleProps> = () => {
    return (
        <div className="table-responsive">
            <table className="table table-striped align-middle">
                <thead>
                    <tr>
                        <th scope="col">Component</th>
                        <th scope="col">Example</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row">ActivityIcon</th>
                        <td>
                            {/* <ActivityIcon
                                alt=""
                                icon="assignment"
                                size="md"
                                variant="default"
                            /> */}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Button</th>
                        <td>
                            <Button
                                label="Button"
                            />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Badge</th>
                        <td>
                            {/* <Badge
                                label="حالة"
                                startIcon={<i aria-hidden="true" className="fa-solid fa-circle-check" />}
                            /> */}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Radio</th>
                        <td>
                            <div className="d-flex flex-column gap-2">
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
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">CloseButton</th>
                        <td>
                            <CloseButton
                                aria-label="Close"
                                disabled
                                size="md"
                            />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Checkbox</th>
                        <td>
                            {/* <Checkbox
                                defaultChecked
                                label="Remember this setting"
                                name="settings"
                                onChange={() => null}
                                value="remember-this-setting"
                            /> */}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Example;
