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
 * Contains the import_handler_registry class.
 *
 * @package tool_moodlenet
 * @copyright 2020 Jake Dallimore <jrhdallimore@gmail.com>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace tool_moodlenet\local;

/**
 * The import_handler_registry class.
 *
 * The import_handler_registry objects represent a register of modules handling various file extensions for a given course and user.
 * Only modules which are available to the user in the course are included in the register for that user.
 *
 * @copyright 2020 Jake Dallimore <jrhdallimore@gmail.com>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class import_handler_registry {

    /**
     * @var array array of import_handler_info objects.
     */
    protected $filehandlers = [];

    /**
     * @var \context_course the course context object.
     */
    protected $context;

    /**
     * @var \stdClass a course object.
     */
    protected $course;

    /**
     * @var \stdClass a user object.
     */
    protected $user;

    /**
     * The import_handler_registry constructor.
     *
     * @param \stdClass $course the course, which impacts available handlers.
     * @param \stdClass $user the user, which impacts available handlers.
     */
    public function __construct(\stdClass $course, \stdClass $user) {
        $this->course = $course;
        $this->user = $user;
        $this->context = \context_course::instance($course->id);

        // Generate the full list of handlers for all extensions for this user and course.
        $this->populate_handlers();
    }

    /**
     * Return an array of handlers supporting the given extension.
     *
     * @param string $extension the extension to check
     * @return array the array of import_handler_info objects.
     */
    public function get_file_handlers_for_extension(string $extension): array {
        $exthandlers = [];
        foreach ($this->filehandlers as $key => $fhandler) {
            if ($fhandler->get_extension() == '*' || $fhandler->get_extension() == $extension) {
                $exthandlers[] = $fhandler;
            }
        }
        return $exthandlers;
    }

    /**
     * Return the import_handler_info object for the given extension and plugin name, or null if not found.
     *
     * @param string $extension the extension to check for.
     * @param string $modname the module name to check for.
     * @return import_handler_info|null the import_handler_info object, if found, otherwise null.
     */
    public function get_file_handler_for_extension_and_plugin(string $extension, string $modname): ?import_handler_info {
        foreach ($this->filehandlers as $key => $fhandler) {
            if (($fhandler->get_extension() == '*' || $fhandler->get_extension() == $extension)
                && $fhandler->get_module_name() == $modname) {
                    return $fhandler;
            }
        }
        return null;
    }

    /**
     * Build up a list of extension handlers by leveraging the dndupload_register callbacks.
     */
    protected function populate_handlers() {
        // Get the list of mods enabled at site level first. We need to cross check this.
        $pluginman = \core_plugin_manager::instance();
        $sitemods = $pluginman->get_plugins_of_type('mod');
        $sitedisabledmods = array_filter($sitemods, function(\core\plugininfo\mod $modplugininfo){
            return !$modplugininfo->is_enabled();
        });
        $sitedisabledmods = array_map(function($modplugininfo) {
            return $modplugininfo->name;
        }, $sitedisabledmods);

        // Loop through all modules to find the registered handlers.
        $mods = get_plugin_list_with_function('mod', 'dndupload_register');
        foreach ($mods as $component => $funcname) {
            list($modtype, $modname) = \core_component::normalize_component($component);
            if (!empty($sitedisabledmods) && array_key_exists($modname, $sitedisabledmods)) {
                continue; // Module is disabled at the site level.
            }
            if (!course_allowed_module($this->course, $modname, $this->user)) {
                continue; // User does not have permission to add this module to the course.
            }

            if (!$resp = component_callback($component, 'dndupload_register')) {
                continue;
            };

            if (isset($resp['files'])) {
                foreach ($resp['files'] as $file) {
                    $this->register_file_handler($file['extension'], $modname, $file['message']);
                }
            }
        }
    }

    /**
     * Adds a file extension handler to the list.
     *
     * @param string $extension the extension, e.g. 'png'.
     * @param string $module the name of the module handling this extension
     * @param string $message the message describing how the module handles the extension.
     */
    protected function register_file_handler(string $extension, string $module, string $message) {
        $extension = strtolower($extension);
        $handler = new import_handler_info($extension, $module, $message);
        $this->filehandlers[] = $handler;
    }
}

