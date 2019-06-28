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
 * Discussion list renderer.
 *
 * @package    mod_forum
 * @copyright  2019 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_forum\local\renderers;

defined('MOODLE_INTERNAL') || die();

use mod_forum\local\entities\forum as forum_entity;
use mod_forum\local\factories\legacy_data_mapper as legacy_data_mapper_factory;
use mod_forum\local\factories\exporter as exporter_factory;
use mod_forum\local\factories\vault as vault_factory;
use mod_forum\local\factories\url as url_factory;
use mod_forum\local\managers\capability as capability_manager;
use mod_forum\local\vaults\discussion_list as discussion_list_vault;
use renderer_base;
use stdClass;
use core\output\notification;
use mod_forum\local\factories\builder as builder_factory;

require_once($CFG->dirroot . '/mod/forum/lib.php');

/**
 * The discussion list renderer.
 *
 * @package    mod_forum
 * @copyright  2019 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class grader {
    /** @var forum_entity The forum being rendered */
    private $forum;

    /** @var stdClass The DB record for the forum being rendered */
    private $forumrecord;

    /** @var renderer_base The renderer used to render the view */
    private $renderer;

    /** @var legacy_data_mapper_factory $legacydatamapperfactory Legacy data mapper factory */
    private $legacydatamapperfactory;

    /** @var exporter_factory $exporterfactory Exporter factory */
    private $exporterfactory;

    /** @var vault_factory $vaultfactory Vault factory */
    private $vaultfactory;

    /** @var capability_manager $capabilitymanager Capability manager */
    private $capabilitymanager;

    /** @var url_factory $urlfactory URL factory */
    private $urlfactory;

    /** @var array $notifications List of notification HTML */
    private $notifications;

    /** @var builder_factory $builderfactory Builder factory */
    private $builderfactory;

    /** @var callable $postprocessfortemplate Function to process exported posts before template rendering */
    private $postprocessfortemplate;

    /** @var string $template The template to use when displaying */
    private $template;

    /**
     * Constructor for a new discussion list renderer.
     *
     * @param   forum_entity        $forum The forum entity to be rendered
     * @param   renderer_base       $renderer The renderer used to render the view
     * @param   legacy_data_mapper_factory $legacydatamapperfactory The factory used to fetch a legacy record
     * @param   exporter_factory    $exporterfactory The factory used to fetch exporter instances
     * @param   vault_factory       $vaultfactory The factory used to fetch the vault instances
     * @param   builder_factory     $builderfactory The factory used to fetch the builder instances
     * @param   capability_manager  $capabilitymanager The managed used to check capabilities on the forum
     * @param   url_factory         $urlfactory The factory used to create URLs in the forum
     * @param   string              $template
     * @param   notification[]      $notifications A list of any notifications to be displayed within the page
     * @param   callable|null       $postprocessfortemplate Callback function to process discussion lists for templates
     */
    public function __construct(
        forum_entity $forum,
        renderer_base $renderer,
        legacy_data_mapper_factory $legacydatamapperfactory,
        exporter_factory $exporterfactory,
        vault_factory $vaultfactory,
        builder_factory $builderfactory,
        capability_manager $capabilitymanager,
        url_factory $urlfactory,
        string $template,
        array $notifications = [],
        callable $postprocessfortemplate = null
    ) {
        $this->forum = $forum;
        $this->renderer = $renderer;
        $this->legacydatamapperfactory = $legacydatamapperfactory;
        $this->exporterfactory = $exporterfactory;
        $this->vaultfactory = $vaultfactory;
        $this->builderfactory = $builderfactory;
        $this->capabilitymanager = $capabilitymanager;

        $this->urlfactory = $urlfactory;
        $this->notifications = $notifications;
        $this->postprocessfortemplate = $postprocessfortemplate;
        $this->template = $template;

        $forumdatamapper = $this->legacydatamapperfactory->get_forum_data_mapper();
        $this->forumrecord = $forumdatamapper->to_legacy_object($forum);
    }

    /**
     * Render for the specified user.
     *
     * @param   stdClass    $user The user to render for
     * @param   cm_info     $cm The course module info for this discussion list
     * @param   int         $groupid The group to render
     * @param   int         $sortorder The sort order to use when selecting the discussions in the list
     * @param   int         $pageno The zero-indexed page number to use
     * @param   int         $pagesize The number of discussions to show on the page
     * @return  string      The rendered content for display
     */
    public function render(stdClass $user, \cm_info $cm, ?int $groupid, ?int $sortorder, ?int $pageno, ?int $pagesize) : string {
        global $PAGE;

        $forum = $this->forum;

        $forumexporter = $this->exporterfactory->get_forum_exporter(
            $user,
            $this->forum,
            $groupid
        );

        $pagesize = $this->get_page_size($pagesize);
        $pageno = $this->get_page_number($pageno);

        // Count all forum discussion posts.
        $alldiscussionscount = mod_forum_count_all_discussions($forum, $user, $groupid);

        // Get all forum discussion summaries.
        $discussions = mod_forum_get_discussion_summaries($forum, $user, $groupid, $sortorder, $pageno, $pagesize);

        $capabilitymanager = $this->capabilitymanager;
        $hasanyactions = false;
        $hasanyactions = $hasanyactions || $capabilitymanager->can_favourite_discussion($user);
        $hasanyactions = $hasanyactions || $capabilitymanager->can_pin_discussions($user);
        $hasanyactions = $hasanyactions || $capabilitymanager->can_manage_forum($user);

        $forumview = [
            'forum' => (array) $forumexporter->export($this->renderer),
            'hasanyactions' => $hasanyactions,
            'groupchangemenu' => groups_print_activity_menu(
                $cm,
                $this->urlfactory->get_forum_view_url_from_forum($forum),
                true
            ),
            'hasmore' => ($alldiscussionscount > $pagesize),
            'settings' => [
                'excludetext' => true,
                'togglemoreicon' => true
            ],
            'totaldiscussioncount' => $alldiscussionscount,
            'visiblediscussioncount' => count($discussions)
        ];

        if (!$discussions) {
            return $this->renderer->render_from_template($this->template, $forumview);
        }

        if ($this->postprocessfortemplate !== null) {
            // We've got some post processing to do!
            $exportedposts = ($this->postprocessfortemplate) ($discussions, $user, $forum);
        }

        $baseurl = new \moodle_url($PAGE->url, array('o' => $sortorder));

        $forumview = array_merge(
            $forumview,
            [
                'pagination' => $this->renderer->render(new \paging_bar($alldiscussionscount, $pageno, $pagesize, $baseurl, 'p')),
            ],
            $exportedposts
        );

        return $this->renderer->render_from_template($this->template, $forumview);
    }

    /**
     * Fetch the page size to use when displaying the page.
     *
     * @param   int         $pagesize The number of discussions to show on the page
     * @return  int         The normalised page size
     */
    private function get_page_size(?int $pagesize) : int {
        if (null === $pagesize || $pagesize <= 0) {
            $pagesize = discussion_list_vault::PAGESIZE_DEFAULT;
        }

        return $pagesize;
    }

    /**
     * Fetch the current page number (zero-indexed).
     *
     * @param   int         $pageno The zero-indexed page number to use
     * @return  int         The normalised page number
     */
    private function get_page_number(?int $pageno) : int {
        if (null === $pageno || $pageno < 0) {
            $pageno = 0;
        }

        return $pageno;
    }
}
