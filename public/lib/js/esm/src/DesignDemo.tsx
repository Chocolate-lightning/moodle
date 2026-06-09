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

import {ActivityIcon, Badge, Checkbox, Button, CloseButton, Radio} from "@moodlehq/design-system";
import {FC} from "react";

interface ExampleProps {
}

// startIcon={<i aria-hidden="true" className="fa-solid fa-calendar"/>}
const Example: FC<ExampleProps> = () => {
    return (
        <div className="d-flex flex-column activity-item">
            <div className="d-flex flex-row align-items-center activity">
                <div className="d-flex activity-checkbox">
                <Checkbox
                hideLabel
                label="Select PDF activity 120"
                name="settings"
                value="remember-this-setting"
                />
                </div>
                <div className="d-flex activity-icon">
                <ActivityIcon
                alt="The PDF activity icon"
                icon="file-pdf"
                size="md"
                variant="default"
                />
                </div>
                <div className="d-flex flex-column activity-content">
                    <div className="d-flex activity-title">
                        <p className="mb-0">Course Syllabus & Reading List</p>
                    </div>
                    <div className="d-flex activity-subtitle">
                        <p className="mb-0">Download the slides</p>
                    </div>
                </div>
                <div className="d-flex ms-auto activity-dropdown">Dropdown: Coming Soon</div>
            </div>
            <div className="d-flex flex-row activity-badges">
                <div className="d-flex activity-badge">
                <Badge
                startIcon={<i aria-hidden="true" className="fa-solid fa-calendar"/>}
                label="Opens: Monday, 14 January, 8.30 AM"
                subtle
                variant="secondary"
                />
                </div>
                <div className="d-flex activity-badge">
                <Badge
                startIcon={<i aria-hidden="true" className="fa-solid fa-clock"/>}
                label="Closes: Monday, 30 January, 8.30 AM"
                subtle
                variant="warning"
                />
                </div>
            </div>
        </div>
    );
};

export default Example;
