var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/**
 * Language strings for the Design System showcase page.
 *
 * The page's PHP resolves every string and passes them in as a prop, as the other React components do, so there is
 * nothing to fetch in the browser. Strings that take a parameter keep their placeholder, and are filled in here.
 *
 * @module     core/designsystemshowcase/strings
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { createContext, useContext } from "react";
const formatString = /* @__PURE__ */ __name((value, params) => {
  if (params === void 0) {
    return value;
  }
  if (typeof params === "object") {
    return Object.entries(params).reduce(
      (result, [name, replacement]) => result.replaceAll(`{$a->${name}}`, String(replacement)),
      value
    );
  }
  return value.replaceAll("{$a}", String(params));
}, "formatString");
const ShowcaseStringsContext = createContext(null);
const ShowcaseStringsProvider = /* @__PURE__ */ __name(({ strings, children }) => {
  const translate = /* @__PURE__ */ __name((key, params) => formatString(strings[key] ?? key, params), "translate");
  return /* @__PURE__ */ jsxDEV(ShowcaseStringsContext.Provider, { value: translate, children }, void 0, false, {
    fileName: "public/lib/js/esm/src/designsystemshowcase/strings.tsx",
    lineNumber: 65,
    columnNumber: 12
  });
}, "ShowcaseStringsProvider");
const useShowcaseStrings = /* @__PURE__ */ __name(() => {
  const translate = useContext(ShowcaseStringsContext);
  if (!translate) {
    throw new Error("useShowcaseStrings must be used inside ShowcaseStringsProvider");
  }
  return translate;
}, "useShowcaseStrings");
export {
  ShowcaseStringsProvider,
  formatString,
  useShowcaseStrings
};
//# sourceMappingURL=strings.dev.js.map
