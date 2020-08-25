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
 * Admin search suggestions to the site admin settings page.
 *
 * @module     core/settings/suggestions
 * @package    core/settings
 * @copyright  2020 Simeon Naydenov <moniNaydenov@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import $ from 'jquery';
import {debounce} from 'core/utils';
import {arrowUp, arrowDown, enter} from 'core/key_codes';
import * as Templates from 'core/templates';

let found = [];
let $results = null;
let $query = null;

/**
 * TODO: mention what does this does.
 *
 * @method init
 */
export const init = () => {
    $(document).ready(() => {
        $query = $('#id_query');
        $($query.parent()).append('<ul id="search_live" style="position: absolute; z-index: 999999; list-style: none;" ' +
            'class="bg-white border border-top-0 border-warning pl-0">' +
            '</ul>');
        $results = $('#search_live');
        $results.hide();
        $query.keyup(keyUp);
        $query.keydown(keyDown);
        $results.keydown(keyDown);

        $('body').click(hideResults);
    });
};

/**
 * TODO: mention what does this does.
 *
 * @method keyDown
 */
const keyDown = (e) => {
    if (found.length === 0) {
        return;
    }
    var keyCode = e.keyCode;
    var $current = $results.find('li.bg-secondary');
    var $next = null;
    if (keyCode === arrowDown) {
        e.preventDefault();
        if ($current.length === 0) {
            $next = $results.find('li:first-child');
        } else {
            $next = $current.next();
        }
    } else if (keyCode === arrowUp) {
        e.preventDefault();
        if ($current.length === 0) {
            $next = $results.find('li:last-child');
        } else {
            $next = $current.prev();
        }
    } else if (keyCode === enter) {
        if ($current.length > 0) {
            e.preventDefault();
            return;
        }
    }
    if ($next !== null) {
        $next.addClass('bg-secondary');
        $current.removeClass('bg-secondary');
    }
};

/**
 * TODO: mention what does this does.
 *
 * @method keyUp
 */
const keyUp = (e) => {
    var keyCode = e.keyCode;
    var query = e.currentTarget.value.toLowerCase();
    var $current = $results.find('li.bg-secondary');
    var links = document.querySelectorAll('.tab-pane ul li a');
    if (keyCode === arrowDown || keyCode === arrowUp) {
        e.preventDefault();
        return;
    } else if (keyCode === enter) {
        if ($current.length > 0) {
            e.preventDefault();
            window.location = $current.find('a').attr('href');
            return;
        }
    }
    $results.html('');
    found.length = 0;
    if (query.length >= 2) {
        window.console.log(query);
        links.forEach(link => {
            var content = link.textContent.toLowerCase();
            if (content.indexOf(query) !== -1) {
                if ($.inArray(content, found) === -1) {
                    found.push(content);
                    var $item = $('<li class="px-3 py-1"></li>');
                    $item.append(link.outerHTML);
                    $results.append($item);
                }
            }
        });
    }
    if (found.length === 0) {
        $results.hide();
    } else {
        $results.show();
    }
};

/**
 * TODO: mention what does this does.
 *
 * @method hideResults
 */
const hideResults = (e) => {
    var $target = $(e.target);
    var $parents = $target.parents('#search_live');
    if ($parents.length === 0 && !$target.is($query)) {
        $results.hide();
    }
};

export const testMatt = () => {
    // Find our text input area.
    const input = document.querySelector('#id_query');
    // This would preferably be fetched from a WS or the calling code.
    const links = document.querySelectorAll('.tab-pane ul li a');
    // Let's make the a useful array of objects for ourselves.
    const builtLinks = Array.prototype.map.call(links, link => ({name: link.innerHTML.toLowerCase(), action: link.href}));
    // Set up a small stub of HTML to place results into.
    const resultsArea = document.createElement('ul');
    resultsArea.dataset.search = 'result';
    resultsArea.classList.add('d-none', 'list-group');

    input.parentNode.insertBefore(resultsArea, input.nextSibling);
    const onPageResultsArea = document.querySelector('[data-search="result"]');
    // TODO: Setup a event listener covering the entire results area.

    // TODO: Split into event listener function.
    input.addEventListener('input', debounce(async() => {
        // Find the search results.
        const results = search(builtLinks, input.value.toLowerCase());

        if (results.length > 0 && results.length !== builtLinks.length) {
            onPageResultsArea.classList.remove('d-none');
        } else if (results.length === builtLinks.length && !onPageResultsArea.classList.contains('d-none')) {
            onPageResultsArea.classList.add('d-none');
        }

        // Pass the results to the template render.
        const {html, js} = await Templates.renderForPromise('core/settings/setting-results', results);
        Templates.replaceNodeContents(onPageResultsArea, html, js);
        onPageResultsArea.focus();
    }, 300));
};

const search = (links, searchTerm) => {
    const searchResults = [];
    links.forEach((link) => {
        if (link.name.includes(searchTerm)) {
            searchResults.push(link);
        }
    });
    return searchResults;
};
