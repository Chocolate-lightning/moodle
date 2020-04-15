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
 * Contains the import_processor class.
 *
 * @package tool_moodlenet
 * @copyright 2020 Jake Dallimore <jrhdallimore@gmail.com>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace tool_moodlenet\local;

/**
 * The import_processor class.
 *
 * The import_processor objects provide a means to import a remote resource into a course section, delegating the handling of
 * content to the relevant module, via its dndupload_handler callback.
 *
 * @copyright 2020 Jake Dallimore <jrhdallimore@gmail.com>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class import_processor {

    /** @var object The course that we are uploading to */
    protected $course = null;

    /** @var int The section number we are uploading to */
    protected $section = null;

    /** @var object The course module that has been created */
    protected $cm = null;

    /** @var \context_course $context the course context to which the import applies.*/
    protected $context;

    /** @var import_handler_registry $handlerregistry registry object to use for cross checking the supplied handler.*/
    protected $handlerregistry;

    /** @var import_handler_info $handlerinfo information about the module handling the import.*/
    protected $handlerinfo;

    /** @var \stdClass $user the user conducting the import.*/
    protected $user;

    /** @var int $useruploadlimit the upload limit for the user conducting the import.*/
    protected $useruploadlimit;

    /** @var remote_resource $remoteresource the remote resource being imported.*/
    protected $remoteresource;

    /**
     * The import_processor constructor.
     *
     * @param \stdClass $course the course object.
     * @param int $section the section number in the course, starting at 0.
     * @param remote_resource $remoteresource the remote resource to import.
     * @param import_handler_info $handlerinfo information about which module is handling the import.
     * @param import_handler_registry $handlerregistry A registry of import handlers, to use for validation.
     * @throws \coding_exception If any of the params are invalid.
     */
    public function __construct(\stdClass $course, int $section, remote_resource $remoteresource, import_handler_info $handlerinfo,
            import_handler_registry $handlerregistry) {

        global $DB, $USER;
        $this->course = $course;
        $this->context = \context_course::instance($this->course->id);

        if ($section < 0) {
            throw new \coding_exception("Invalid section number $section. Must be > 0.");
        }
        $this->section = $section;
        $this->handlerregistry = $handlerregistry;
        $this->user = $USER;
        $this->remoteresource = $remoteresource;

        $this->useruploadlimit = get_user_max_upload_file_size($this->context, get_config('core', 'maxbytes'),
            $this->course->maxbytes, 0, $this->user);

        if (!$DB->get_record('modules', array('name' => $handlerinfo->get_module_name()))) {
            throw new \coding_exception("Module {$handlerinfo->get_module_name()} does not exist");
        }
        $this->handlerinfo = $handlerinfo;

        // Ensure the supplied handler is valid for the file extension of the remote resource.
        $extension = $this->remoteresource->get_extension();
        $handlers = $this->handlerregistry->get_file_handlers_for_extension($extension);
        $supported = !empty(array_filter($handlers, function($handler) {
            return $handler->get_module_name() == $this->handlerinfo->get_module_name();
        }));
        if (!$supported) {
            throw new \coding_exception("Module {$this->handlerinfo->get_module_name()} does not support extension '$extension'.");
        }
    }

    /**
     * Run the import process, including file download, module creation and cleanup (cache purge, etc).
     *
     * @throws \coding_exception if the module cannot support the extension of the remote resource.
     * @throws \moodle_exception if the file exceeds the user's upload limits for the course.
     */
    public function process() {
        // Before starting a potentially lengthy download, try to ensure the file size does not exceed the upload size restrictions
        // for the user. This is a time saving measure.
        // This is a naive check, that serves only to catch files if they provide the content length header.
        // Because of potential content encoding (compression), the stored file will be checked again after download as well.
        $size = $this->remoteresource->get_download_size() ?? -1;
        if ($this->size_exceeds_upload_limit($size)) {
            throw new \moodle_exception('uploadlimitexceeded', 'tool_moodlenet', '', ['filesize' => $size,
                'uploadlimit' => $this->useruploadlimit]);
        }

        // Download the file into a request directory and scan it.
        [$filepath, $filename] = $this->remoteresource->download_to_requestdir();
        \core\antivirus\manager::scan_file($filepath, $filename, true);

        // Check the final size of file against the user upload limits.
        $localsize = filesize(sprintf('%s/%s', $filepath, $filename));
        if ($this->size_exceeds_upload_limit($localsize)) {
            throw new \moodle_exception('uploadlimitexceeded', 'tool_moodlenet', '', ['filesize' => $localsize,
                'uploadlimit' => $this->useruploadlimit]);
        }

        // Store in the user draft file area.
        $storedfile = $this->create_user_draft_stored_file($filename, $filepath);

        // Create a course module to hold the new instance.
        $this->create_course_module();

        // Ask the module to set itself up, using the dndupload_handle hook.
        $moduledata = $this->prepare_module_data($storedfile->get_itemid());
        $instanceid = plugin_callback('mod', $this->handlerinfo->get_module_name(), 'dndupload', 'handle', [$moduledata],
            'invalidfunction');
        if ($instanceid == 'invalidfunction') {
            $name = $this->handlerinfo->get_module_name();
            throw new \coding_exception("$name does not support drag and drop upload (missing {$name}_dndupload_handle function)");
        }

        // Finish setting up the course module.
        $this->finish_setup_course_module($instanceid);
    }

    /**
     * Does the size exceed the upload limit for the current import, taking into account user and core settings.
     *
     * @param int $sizeinbytes
     * @return bool true if exceeded, false otherwise.
     */
    protected function size_exceeds_upload_limit(int $sizeinbytes): bool {
        $maxbytes = get_user_max_upload_file_size($this->context, get_config('core', 'maxbytes'), $this->course->maxbytes, 0,
            $this->user);
        if ($maxbytes != USER_CAN_IGNORE_FILE_SIZE_LIMITS && $sizeinbytes > $maxbytes) {
            return true;
        }
        return false;
    }

    /**
     * Create a file in the user drafts ready for use by plugins implementing dndupload_handle().
     *
     * @param string $filename the name of the file on disk
     * @param string $path the path where the file is stored on disk
     * @return \stored_file
     */
    protected function create_user_draft_stored_file(string $filename, string $path): \stored_file {
        global $CFG;

        $record = new \stdClass();
        $record->filearea = 'draft';
        $record->component = 'user';
        $record->filepath = '/';
        $record->itemid   = file_get_unused_draft_itemid();
        $record->license  = $CFG->sitedefaultlicense;
        $record->author   = '';
        $record->filename = clean_param($filename, PARAM_FILE);
        $record->contextid = \context_user::instance($this->user->id)->id;
        $record->userid = $this->user->id;

        $fullpathwithname = sprintf('%s/%s', $path, $filename);

        $fs = get_file_storage();

        return  $fs->create_file_from_pathname($record, $fullpathwithname);
    }

    /**
     * Create the course module to hold the file/content that has been uploaded.
     */
    protected function create_course_module(): void {
        global $CFG;
        require_once($CFG->dirroot . '/course/modlib.php');
        list($module, $context, $cw, $cm, $data) = prepare_new_moduleinfo_data($this->course, $this->handlerinfo->get_module_name(),
            $this->section);
        $data->visible = false; // The module is created in a hidden state.
        $data->coursemodule = $data->id = add_course_module($data);
        $this->cm = $data;
    }

    /**
     * Creates the data to pass to the dndupload_handle() hooks.
     *
     * @param int $draftitemid the itemid of the draft file.
     * @return \stdClass the data object.
     */
    protected function prepare_module_data(int $draftitemid): \stdClass {
        $data = new \stdClass();
        $data->type = 'Files';
        $data->course = $this->course;
        $data->draftitemid = $draftitemid;
        $data->coursemodule = $this->cm->id;
        $data->displayname = $this->remoteresource->get_name();
        return $data;
    }

    /**
     * Finish off any course module setup, such as adding to the course section and firing events.
     *
     * @param int $instanceid id returned by the mod when it was created.
     */
    protected function finish_setup_course_module($instanceid): void {
        global $DB;

        if (!$instanceid) {
            // Something has gone wrong - undo everything we can.
            course_delete_module($this->cm->id);
            throw new \moodle_exception('errorcreatingactivity', 'moodle', '', $this->handlerinfo->get_module_name());
        }

        // Note the section visibility.
        $visible = get_fast_modinfo($this->course)->get_section_info($this->section)->visible;

        $DB->set_field('course_modules', 'instance', $instanceid, array('id' => $this->cm->id));

        // Rebuild the course cache after update action.
        rebuild_course_cache($this->course->id, true);

        course_add_cm_to_section($this->course, $this->cm->id, $this->section);

        set_coursemodule_visible($this->cm->id, $visible);
        if (!$visible) {
            $DB->set_field('course_modules', 'visibleold', 1, array('id' => $this->cm->id));
        }

        // Retrieve the final info about this module.
        $info = get_fast_modinfo($this->course, $this->user->id);
        if (!isset($info->cms[$this->cm->id])) {
            // The course module has not been properly created in the course - undo everything.
            course_delete_module($this->cm->id);
            throw new \moodle_exception('errorcreatingactivity', 'moodle', '', $this->handlerinfo->get_module_name());
        }
        $mod = $info->get_cm($this->cm->id);

        // Trigger course module created event.
        $event = \core\event\course_module_created::create_from_cm($mod);
        $event->trigger();
    }
}

