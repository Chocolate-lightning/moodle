var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
/**
 * Design System showcase page.
 *
 * Renders MDS components in situ so they can be verified against the LMS theme and Bootstrap.
 *
 * @module     core/DesignSystemShowcase
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { Button, Link } from "@moodlehq/design-system";
import { useEffect, useRef, useState } from "react";
import {
  ButtonSection,
  CloseButtonSection,
  DropdownSection,
  FavouriteButtonSection,
  LinkSection,
  NavPillSection,
  PaginationSection,
  TooltipSection
} from "@moodle/lms/core/showcase/ActionSections";
import {
  ActivityIconSection,
  AvatarSection,
  BadgeSection,
  BreadcrumbSection,
  ProgressBarSection
} from "@moodle/lms/core/showcase/DisplaySections";
import {
  CheckboxSection,
  ChoiceboxSection,
  FormSubmissionSection,
  RadioSection,
  SwitchSection
} from "@moodle/lms/core/showcase/FormSections";
import { ShowcaseStringsProvider, useShowcaseStrings } from "@moodle/lms/core/showcase/strings";
const Showcase = /* @__PURE__ */ __name(({ isRtl, rtlLang, rtlLangInstalled, rtlUrl, ltrUrl, langImportUrl }) => {
  const t = useShowcaseStrings();
  const [dir, setDir] = useState(isRtl ? "rtl" : "ltr");
  const [contents, setContents] = useState([]);
  const sectionsRef = useRef(null);
  useEffect(() => {
    const headings = sectionsRef.current?.querySelectorAll("section > h2[id]") ?? [];
    setContents([...headings].map((heading) => ({ id: heading.id, title: heading.textContent ?? "" })));
  }, []);
  return /* @__PURE__ */ jsxDEV("div", { className: "container py-5", dir, children: [
    !rtlLangInstalled && /* @__PURE__ */ jsxDEV("div", { className: "alert alert-warning", role: "alert", children: [
      t("rtl_missing", rtlLang),
      langImportUrl && /* @__PURE__ */ jsxDEV(Fragment, { children: [
        " ",
        /* @__PURE__ */ jsxDEV("a", { href: langImportUrl, children: t("rtl_install") }, void 0, false, {
          fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
          lineNumber: 77,
          columnNumber: 42
        })
      ] }, void 0, true, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 77,
        columnNumber: 39
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
      lineNumber: 75,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "d-flex flex-wrap justify-content-end gap-2 mb-4", children: [
      rtlLangInstalled && /* @__PURE__ */ jsxDEV(
        Link,
        {
          href: isRtl ? ltrUrl : rtlUrl,
          label: isRtl ? t("reload_ltr") : t("reload_rtl", rtlLang)
        },
        void 0,
        false,
        {
          fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
          lineNumber: 82,
          columnNumber: 21
        }
      ),
      /* @__PURE__ */ jsxDEV(
        Button,
        {
          label: dir === "ltr" ? t("render_rtl") : t("render_ltr"),
          onClick: () => setDir(dir === "ltr" ? "rtl" : "ltr"),
          title: t("render_help"),
          variant: "outline-secondary"
        },
        void 0,
        false,
        {
          fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
          lineNumber: 87,
          columnNumber: 17
        }
      )
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
      lineNumber: 80,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("nav", { "aria-labelledby": "ds-contents", className: "card card-body mb-5", children: [
      /* @__PURE__ */ jsxDEV("h2", { className: "h5 mb-3", id: "ds-contents", children: t("contents") }, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 95,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("ul", { className: "list-unstyled row row-cols-2 row-cols-md-3 row-cols-lg-4 gy-2 mb-0", children: contents.map(({ id, title }) => /* @__PURE__ */ jsxDEV("li", { className: "col", children: /* @__PURE__ */ jsxDEV("a", { href: `#${id}`, children: title }, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 99,
        columnNumber: 29
      }) }, id, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 98,
        columnNumber: 25
      })) }, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 96,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
      lineNumber: 94,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { ref: sectionsRef, children: [
      /* @__PURE__ */ jsxDEV(ActivityIconSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 105,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(AvatarSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 106,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(BadgeSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 107,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(BreadcrumbSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 108,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(ButtonSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 109,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(CheckboxSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 110,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(ChoiceboxSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 111,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(CloseButtonSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 112,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(DropdownSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 113,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(FavouriteButtonSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 114,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(LinkSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 115,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(NavPillSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 116,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(PaginationSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 117,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(ProgressBarSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 118,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(RadioSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 119,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(SwitchSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 120,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(TooltipSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 121,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(FormSubmissionSection, {}, void 0, false, {
        fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
        lineNumber: 122,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
      lineNumber: 104,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
    lineNumber: 73,
    columnNumber: 9
  });
}, "Showcase");
const DesignSystemShowcase = /* @__PURE__ */ __name((props) => /* @__PURE__ */ jsxDEV(ShowcaseStringsProvider, { children: /* @__PURE__ */ jsxDEV(Showcase, { ...props }, void 0, false, {
  fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
  lineNumber: 130,
  columnNumber: 9
}) }, void 0, false, {
  fileName: "public/lib/js/esm/src/DesignSystemShowcase.tsx",
  lineNumber: 129,
  columnNumber: 5
}), "DesignSystemShowcase");
var DesignSystemShowcase_default = DesignSystemShowcase;
export {
  DesignSystemShowcase_default as default
};
//# sourceMappingURL=DesignSystemShowcase.dev.js.map
