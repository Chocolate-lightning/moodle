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
 * Helper functions that allow you to set focus on a particular node within an array of nodes.
 *
 * @module    gradereport_grader/search/node_handling
 * @copyright 2023 Mathew May <mathew.solutions>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Set focus on a given node after parsed through the calling functions.
 *
 * @param {HTMLElement} node The node to set focus upon.
 * @returns {*} Focus set on the node.
 */
const selectNode = (node) => node.focus({preventScroll: true});

/**
 * Set the focus on the first node within the array.
 *
 * @param {Array} nodeArray The array of nodes that we want to specify a member to set focus upon.
 */
export const moveToFirstNode = (nodeArray) => {
    if (nodeArray.length > 0) {
        selectNode(nodeArray[0]);
    }
};

/**
 * Set the focus to the final node within the array.
 *
 * @param {Array} nodeArray The array of nodes that we want to specify a member to set focus upon.
 */
export const moveToLastNode = (nodeArray) => {
    if (nodeArray.length > 0) {
        selectNode(nodeArray[nodeArray.length - 1]);
    }
};

/**
 * Set focus on any given specified node within the node array.
 *
 * @param {Array} nodeArray The array of nodes that we want to specify a member to set focus upon.
 * @param {Number} index Which item within the array to set focus upon.
 */
export const moveToNode = (nodeArray, index) => {
    if (nodeArray.length > 0) {
        selectNode(nodeArray[index]);
    }
};
