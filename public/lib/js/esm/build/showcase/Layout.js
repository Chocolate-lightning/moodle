import{useShowcaseStrings as c}from"@moodle/lms/core/showcase/strings";import{jsx as t,jsxs as i}from"react/jsx-runtime";/**
 * Shared layout pieces for the Design System showcase page.
 *
 * @module     core/showcase/Layout
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const p=()=>{},m=e=>t("i",{"aria-hidden":"true",className:`fa-solid fa-${e}`}),x=e=>Object.keys(e),d=e=>`ds-${e}`,g=({id:e,title:s,expectation:r,children:a})=>{const n=c(),o=d(e);return i("section",{className:"mb-5 pb-4 border-bottom","aria-labelledby":o,children:[t("h2",{className:"h3 mb-3",id:o,children:s}),r&&i("p",{className:"alert alert-info py-2","data-testid":`${o}-expectation`,children:[t("strong",{children:n("expectation")})," ",r]}),a]})},h=({label:e,children:s})=>i("div",{className:"mb-3",children:[t("div",{className:"small text-muted mb-2",children:e}),t("div",{className:"d-flex flex-wrap align-items-center gap-3",children:s})]});export{h as Example,g as Section,x as allOf,m as icon,p as noop,d as sectionId};
