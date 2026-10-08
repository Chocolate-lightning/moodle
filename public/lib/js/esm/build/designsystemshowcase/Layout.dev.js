var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/**
 * Shared layout pieces for the Design System showcase page.
 *
 * @module     core/designsystemshowcase/Layout
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useShowcaseStrings } from "@moodle/lms/core/designsystemshowcase/strings";
const noop = /* @__PURE__ */ __name(() => void 0, "noop");
const icon = /* @__PURE__ */ __name((name) => /* @__PURE__ */ jsxDEV("i", { "aria-hidden": "true", className: `fa-solid fa-${name}` }, void 0, false, {
  fileName: "public/lib/js/esm/src/designsystemshowcase/Layout.tsx",
  lineNumber: 30,
  columnNumber: 39
}), "icon");
const allOf = /* @__PURE__ */ __name((members) => Object.keys(members), "allOf");
const sectionId = /* @__PURE__ */ __name((id) => `ds-${id}`, "sectionId");
const Section = /* @__PURE__ */ __name(({ id, title, expectation, children }) => {
  const t = useShowcaseStrings();
  const anchor = sectionId(id);
  return /* @__PURE__ */ jsxDEV("section", { className: "mb-5 pb-4 border-bottom", "aria-labelledby": anchor, children: [
    /* @__PURE__ */ jsxDEV("h2", { className: "h3 mb-3", id: anchor, children: title }, void 0, false, {
      fileName: "public/lib/js/esm/src/designsystemshowcase/Layout.tsx",
      lineNumber: 62,
      columnNumber: 13
    }),
    expectation && /* @__PURE__ */ jsxDEV("p", { className: "alert alert-info py-2", "data-testid": `${anchor}-expectation`, children: [
      /* @__PURE__ */ jsxDEV("strong", { children: t("expectation") }, void 0, false, {
        fileName: "public/lib/js/esm/src/designsystemshowcase/Layout.tsx",
        lineNumber: 65,
        columnNumber: 21
      }),
      " ",
      expectation
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/designsystemshowcase/Layout.tsx",
      lineNumber: 64,
      columnNumber: 17
    }),
    children
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/designsystemshowcase/Layout.tsx",
    lineNumber: 61,
    columnNumber: 9
  });
}, "Section");
const Example = /* @__PURE__ */ __name(({ label, children }) => /* @__PURE__ */ jsxDEV("div", { className: "mb-3", children: [
  /* @__PURE__ */ jsxDEV("div", { className: "small text-muted mb-2", children: label }, void 0, false, {
    fileName: "public/lib/js/esm/src/designsystemshowcase/Layout.tsx",
    lineNumber: 82,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "d-flex flex-wrap align-items-center gap-3", children }, void 0, false, {
    fileName: "public/lib/js/esm/src/designsystemshowcase/Layout.tsx",
    lineNumber: 83,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "public/lib/js/esm/src/designsystemshowcase/Layout.tsx",
  lineNumber: 81,
  columnNumber: 5
}), "Example");
export {
  Example,
  Section,
  allOf,
  icon,
  noop,
  sectionId
};
//# sourceMappingURL=Layout.dev.js.map
