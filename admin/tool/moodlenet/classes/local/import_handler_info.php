<?php
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
 * Contains the import_handler_info class.
 *
 * @package tool_moodlenet
 * @copyright 2020 Jake Dallimore <jrhdallimore@gmail.com>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace tool_moodlenet\local;

/**
 * The import_handler_info class.
 *
 * An import_handler_info object represent an extension handler for a particular module.
 *
 * @copyright 2020 Jake Dallimore <jrhdallimore@gmail.com>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class import_handler_info {

    /** @var string $extension the extension. */
    protected $extension;

    /** @var string $modulename the name of the module. */
    protected $modulename;

    /** @var string $description the description. */
    protected $description;

    /**
     * The import_handler_info constructor.
     *
     * @param string $extension the extension this handler will be responsible for.
     * @param string $modulename the name of the module handling the file extension. E.g. 'label'.
     * @param string $description A description of how the module handles files of this extension type.
     */
    public function __construct(string $extension, string $modulename, string $description) {
        if (empty($extension)) {
            throw new \coding_exception("Extension cannot be empty.");
        }
        if (empty($modulename)) {
            throw new \coding_exception("Module name cannot be empty.");
        }
        if (empty($description)) {
            throw new \coding_exception("Description cannot be empty.");
        }
        $this->extension = $extension;
        $this->modulename = $modulename;
        $this->description = $description;
    }

    /**
     * Get the extension.
     *
     * @return string the extension, e.g. 'txt'.
     */
    public function get_extension(): string {
        return $this->extension;
    }

    /**
     * Get the name of the module.
     *
     * @return string the module name, e.g. 'label'.
     */
    public function get_module_name(): string {
        return $this->modulename;
    }

    /**
     * Get a human readable, localised description of how the file is handled by the module.
     *
     * @return string the localised description.
     */
    public function get_description(): string {
        return $this->description;
    }
}
