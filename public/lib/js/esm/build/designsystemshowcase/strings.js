import{createContext as i,useContext as a}from"react";import{jsx as S}from"react/jsx-runtime";/**
 * Language strings for the Design System showcase page.
 *
 * The page's PHP resolves every string and passes them in as a prop, as the other React components do, so there is
 * nothing to fetch in the browser. Strings that take a parameter keep their placeholder, and are filled in here.
 *
 * @module     core/designsystemshowcase/strings
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const g=(r,t)=>t===void 0?r:typeof t=="object"?Object.entries(t).reduce((n,[e,s])=>n.replaceAll(`{$a->${e}}`,String(s)),r):r.replaceAll("{$a}",String(t)),o=i(null),p=({strings:r,children:t})=>{const n=(e,s)=>g(r[e]??e,s);return S(o.Provider,{value:n,children:t})},u=()=>{const r=a(o);if(!r)throw new Error("useShowcaseStrings must be used inside ShowcaseStringsProvider");return r};export{p as ShowcaseStringsProvider,g as formatString,u as useShowcaseStrings};
