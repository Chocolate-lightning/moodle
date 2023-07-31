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
 * Class that defines the bulk move action in the gradebook setup page.
 *
 * @module     core_grades/bulkactions/edit/tree/move
 * @copyright  2023 Mihail Geshoski <mihail@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import BulkAction from 'core/bulkactions/bulk_action';
import {get_string as getString} from 'core/str';
import ModalFactory from 'core/modal_factory';
import Notification from 'core/notification';
import Templates from 'core/templates';
import Ajax from 'core/ajax';
import $ from 'jquery';
import ModalEvents from 'core/modal_events';

/** @constant {Object} The object containing the relevant selectors. */
const Selectors = {
    editTreeForm: '#gradetreeform',
    gradeTreeSection: '#destination-selector [role="tree"] [data-for="sectionnode"][role="treeitem"]',
    gradeTreeItem: '#destination-selector [role="tree"] [role="treeitem"]',
    gradeTreeSectionVisibilityToggle: '#destination-selector [role="tree"] .collapse-list-link',
    gradeTreeSectionContent: '#destination-selector [role="tree"] .collapse-list-item-content',
    bulkMoveInput: 'input[name="bulkmove"]',
    bulkMoveAfterInput: 'input[name="moveafter"]'
};

export default class GradebookEditTreeBulkMove extends BulkAction {

    /** @property {int|null} courseID The course ID. */
    courseID = null;

    /** @property {Object|null} modal The modal object. */
    modal = null;

    /** @property {Array|null} visibleGradeTreeItems The array containing the visible grade tree item elements. */
    visibleGradeTreeItems = null;

    /** @property {HTMLElement|null} selectedGradeTreeItem The selected grade tree item element. */
    selectedGradeTreeItem = null;

    /** @property {string|null} gradeTree The grade tree HTML. */
    gradeTree = null;

    /**
     * The class constructor.
     *
     * @param {int} courseID The course ID.
     * @returns {void}
     */
    constructor(courseID) {
        super();
        this.courseID = courseID;
    }

    /**
     * Defines the selector of the element that triggers the bulk move action.
     *
     * @returns {string}
     */
    getBulkActionTriggerSelector() {
        return 'button[data-action="move"]';
    }

    /**
     * Defines the behavior once the bulk move action is triggered.
     *
     * @method executeBulkAction
     * @returns {void}
     */
    async triggerBulkAction() {
        this.modal = await this.showModal();
        this.setVisibleGradeTreeItems();
    }

    /**
     * Renders the bulk move action trigger element.
     *
     * @method renderBulkActionTrigger
     * @returns {Promise}
     */
    async renderBulkActionTrigger() {
        return Templates.render('core_grades/bulkactions/edit/tree/bulk_move_trigger', {});
    }

    /**
     * Register custom event listeners.
     *
     * @method registerCustomClickListenerEvents
     * @returns {void}
     */
    registerCustomListenerEvents() {
        // Click event listeners.
        document.addEventListener('click', (e) => {
            // If the click event is targeting a grade tree item element.
            if (e.target.closest(Selectors.gradeTreeItem) &&
                    !e.target.closest(Selectors.gradeTreeSectionVisibilityToggle)) {
                // Select the grade tree item and enable the save button.
                this.selectGradeTreeItem(e.target.closest(Selectors.gradeTreeItem));
                this.modal.setButtonDisabled('save', false);
            }
        });

        // Reset the stored state of the current visible grade tree items once a grade category section is fully
        // shown or collapsed.
        $(Selectors.gradeTreeSectionContent).on('hidden.bs.collapse shown.bs.collapse', () => {
            this.setVisibleGradeTreeItems();
        });

        // Keyboard event listeners.
        document.addEventListener('keydown', (e) => {
            const currentGradeTreeItem = e.target.closest(Selectors.gradeTreeItem);
            // If the key event is targeting a grade tree item element.
            if (currentGradeTreeItem) {
                switch (e.key) {
                    case 'ArrowRight':
                        // Make sure that the element is a grade category section.
                        if (currentGradeTreeItem.matches(Selectors.gradeTreeSection)) {
                            // Expand the category section.
                            this.collapseGradeCategory(currentGradeTreeItem, false);
                        }
                        break;
                    case 'ArrowLeft':
                        // Make sure that the element is a grade category section.
                        if (currentGradeTreeItem.matches(Selectors.gradeTreeSection)) {
                            // Collapse the category section.
                            this.collapseGradeCategory(currentGradeTreeItem, true);
                        }
                        break;
                    case 'ArrowDown':
                        this.moveToNextGradeTreeItem(currentGradeTreeItem);
                        break;
                    case 'ArrowUp':
                        this.moveToPreviousGradeTreeItem(currentGradeTreeItem);
                        break;
                    case 'Home':
                        this.moveToFirstGradeTreeItem();
                        break;
                    case 'End':
                        this.moveToLastGradeTreeItem();
                        break;
                    case 'Enter':
                    case ' ':
                        this.selectGradeTreeItem(currentGradeTreeItem);
                        this.modal.setButtonDisabled('save', false);
                        break;
                }
            }
        });
    }

    /**
     * Fetch the grade tree structure for the current course.
     *
     * @method fetchGradeTree
     * @returns {Promise}
     */
    fetchGradeTree() {
        const request = {
            methodname: 'core_grades_get_grade_tree',
            args: {
                courseid: this.courseID,
            },
        };
        return Ajax.call([request])[0];
    }

    /**
     * Show the bulk move modal.
     *
     * @method showModal
     * @returns {Promise} The modal promise
     */
    async showModal() {
        // We need to fetch the grade tree structure only once.
        if (this.gradeTree === null) {
            this.gradeTree = await this.fetchGradeTree();
        }

        return ModalFactory.create({
            title: await getString('movesitems', 'grades'),
            body: await Templates.render('core_grades/bulkactions/edit/tree/bulk_move_grade_tree', JSON.parse(this.gradeTree)),
            buttons: {
                save: await getString('move')
            },
            large: true,
            type: ModalFactory.types.SAVE_CANCEL,
        }).then(modal => {
            modal.show();
            // Disable the 'Move' action button until something is selected.
            modal.setButtonDisabled('save', true);
            // Make the top grade tree section node focusable.
            modal.getBody()[0].querySelector(Selectors.gradeTreeSection).tabIndex = 0;
            // Define the behavior of the modal's 'Move' action button.
            modal.getRoot().on(ModalEvents.save, () => {
                // Set the relevant form values.
                document.querySelector(Selectors.bulkMoveInput).value = 1;
                document.querySelector(Selectors.bulkMoveAfterInput).value = this.selectedGradeTreeItem.dataset.id;
                // Submit the form.
                document.querySelector(Selectors.editTreeForm).submit();
            });
            // Destroy the modal once it is hidden.
            modal.getRoot().on(ModalEvents.hidden, function() {
                modal.destroy();
            });
            return modal;
        }).catch(Notification.exception);
    }

    /**
     * Collapse or expand a grade category section.
     *
     * @method collapseGradeCategory
     * @param {HTMLElement} gradeCategorySection The grade category section element.
     * @param {Boolean} setCollapsed Whether the grade category section should be collapsed or not.
     * @returns {void}
     */
    collapseGradeCategory(gradeCategorySection, setCollapsed) {
        const sectionContent = gradeCategorySection.querySelector(Selectors.gradeTreeSectionContent);
        if (setCollapsed) {
            $(sectionContent).collapse('hide');
        } else {
            $(sectionContent).collapse('show');
        }
    }

    /**
     * Move the focus to the next grade tree item element.
     *
     * @method moveToNextGradeTreeItem
     * @param {HTMLElement} gradeTreeItem The grade tree item element.
     * @returns {void}
     */
    moveToNextGradeTreeItem(gradeTreeItem) {
        const currentGradeTreeItemIndex = this.visibleGradeTreeItems.findIndex(item => item === gradeTreeItem);
        this.focusGradeTreeItem(this.visibleGradeTreeItems[currentGradeTreeItemIndex + 1]);
    }

    /**
     * Move the focus to the previous grade tree item element.
     *
     * @method moveToPreviousGradeTreeItem
     * @param {HTMLElement} gradeTreeItem The grade tree item element.
     * @returns {void}
     */
    moveToPreviousGradeTreeItem(gradeTreeItem) {
        const currentGradeTreeItemIndex = this.visibleGradeTreeItems.findIndex(item => item === gradeTreeItem);
        this.focusGradeTreeItem(this.visibleGradeTreeItems[currentGradeTreeItemIndex - 1]);
    }

    /**
     * Move the focus to the first grade tree item element.
     *
     * @method moveToFirstGradeTreeItem
     * @returns {void}
     */
    moveToFirstGradeTreeItem() {
        this.focusGradeTreeItem(this.visibleGradeTreeItems[0]);
    }

    /**
     * Move the focus to the last grade tree item element.
     *
     * @method moveToLastGradeTreeItem
     * @returns {void}
     */
    moveToLastGradeTreeItem() {
        this.focusGradeTreeItem(this.visibleGradeTreeItems[this.visibleGradeTreeItems.length - 1]);
    }

    /**
     * Mark particular grade tree item as selected.
     *
     * @method getEditButton
     * @param {HTMLElement} gradeTreeItem The grade tree item element.
     * @returns {void}
     */
    selectGradeTreeItem(gradeTreeItem) {
        document.querySelectorAll(Selectors.gradeTreeItem).forEach(item => {
            item.dataset.selected = "false";
        });

        gradeTreeItem.dataset.selected = "true";
        this.selectedGradeTreeItem = gradeTreeItem;
    }

    /**
     * Set the focus on a given grade tree item.
     *
     * @method focusGradeTreeItem
     * @param {HTMLElement|null} gradeTreeItem The grade tree item element.
     * @returns {void}
     */
    focusGradeTreeItem(gradeTreeItem) {
        if (gradeTreeItem) {
            gradeTreeItem.focus();
        }
    }

    /**
     * Store the current visible grade items.
     *
     * @method setVisibleGradeTreeItems
     * @returns {void}
     */
    setVisibleGradeTreeItems() {
        const allGradeTreeItems = Array.from(this.modal.getBody()[0].querySelectorAll(Selectors.gradeTreeItem));
        // If the visible grade tree items have not been stored yet, this means we are in the initial state where all
        // grade tree items are visible.
        if (!this.visibleGradeTreeItems) {
            this.visibleGradeTreeItems = allGradeTreeItems;
        } else { // Otherwise, identify the current visible grade tree items and store them.
            this.visibleGradeTreeItems = allGradeTreeItems.filter(gradeTreeItem => {
                return gradeTreeItem.offsetWidth > 0 && gradeTreeItem.offsetHeight > 0;
            });
        }
    }
}
