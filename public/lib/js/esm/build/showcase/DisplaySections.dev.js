var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/**
 * Showcase sections for display components: icons, avatars, badges, breadcrumbs and progress.
 *
 * @module     core/showcase/DisplaySections
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import {
  ActivityIcon,
  Avatar,
  Badge,
  Breadcrumb,
  ProgressBar
} from "@moodlehq/design-system";
import config from "@moodle/lms/core/config";
import { Example, Section, allOf, icon } from "@moodle/lms/core/showcase/Layout";
import { useShowcaseStrings } from "@moodle/lms/core/showcase/strings";
const activityIcons = [
  "assignment",
  "quiz",
  "workshop",
  "database",
  "forum",
  "glossary",
  "wiki",
  "bigbluebutton",
  "chat",
  "choice",
  "feedback",
  "survey",
  "h5p",
  "ims-package",
  "lesson",
  "scorm-package",
  "book",
  "external-tool",
  "file",
  "folder",
  "page",
  "text-and-media",
  "url",
  "subsection",
  "file-pdf",
  "file-image",
  "file-unknown"
];
const activityIconSizes = allOf({ sm: true, md: true, lg: true, xl: true });
const activityIconContainers = allOf({ none: true, "default": true, large: true });
const avatarSizes = allOf({ xs: true, sm: true, md: true, lg: true, xl: true, xxl: true });
const badgeVariants = allOf({
  primary: true,
  secondary: true,
  success: true,
  danger: true,
  warning: true,
  info: true
});
const progressStatuses = allOf({
  "in-progress": true,
  loading: true,
  error: true,
  warning: true
});
const progressLabelVariants = allOf({
  "title-and-count": true,
  title: true,
  inline: true,
  none: true
});
const ActivityIconSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("activityicon_expectation"), id: "activityicon", title: t("section_activityicon"), children: [
    /* @__PURE__ */ jsxDEV(Example, { label: t("activityicon_all"), children: activityIcons.map((name) => /* @__PURE__ */ jsxDEV(ActivityIcon, { alt: name, icon: name }, name, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 59,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 57,
      columnNumber: 13
    }),
    activityIconContainers.map((container) => /* @__PURE__ */ jsxDEV(Example, { label: t("activityicon_container", container), children: activityIconSizes.map((size) => /* @__PURE__ */ jsxDEV(ActivityIcon, { alt: "", container, icon: "assignment", size }, size, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 65,
      columnNumber: 25
    })) }, container, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 63,
      columnNumber: 17
    }))
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
    lineNumber: 56,
    columnNumber: 9
  });
}, "ActivityIconSection");
const AvatarSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("avatar_expectation"), id: "avatar", title: t("section_avatar"), children: [
    /* @__PURE__ */ jsxDEV(Example, { label: t("avatar_image"), children: avatarSizes.map((size) => /* @__PURE__ */ jsxDEV(Avatar, { alt: t("avatar_name"), imageSrc: `${config.wwwroot}/pix/u/f1.png`, size }, size, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 80,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 78,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("avatar_initials"), children: avatarSizes.map((size) => /* @__PURE__ */ jsxDEV(Avatar, { alt: t("avatar_name"), initials: t("avatar_initialsvalue"), size }, size, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 85,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 83,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("avatar_silhouette"), children: avatarSizes.map((size) => /* @__PURE__ */ jsxDEV(Avatar, { alt: t("avatar_name"), initials: "", size }, size, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 90,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 88,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("avatar_broken"), children: /* @__PURE__ */ jsxDEV(
      Avatar,
      {
        alt: t("avatar_name"),
        imageSrc: `${config.wwwroot}/pix/u/does-not-exist.png`,
        initials: t("avatar_initialsvalue")
      },
      void 0,
      false,
      {
        fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
        lineNumber: 94,
        columnNumber: 17
      }
    ) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 93,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
    lineNumber: 77,
    columnNumber: 9
  });
}, "AvatarSection");
const BadgeSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("badge_expectation"), id: "badge", title: t("section_badge"), children: [
    /* @__PURE__ */ jsxDEV(Example, { label: t("default"), children: badgeVariants.map((variant) => /* @__PURE__ */ jsxDEV(Badge, { label: variant, variant }, variant, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 111,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 109,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("badge_subtle"), children: badgeVariants.map((variant) => /* @__PURE__ */ jsxDEV(Badge, { label: variant, subtle: true, variant }, variant, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 116,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 114,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("badge_pill"), children: badgeVariants.map((variant) => /* @__PURE__ */ jsxDEV(Badge, { label: variant, pill: true, variant }, variant, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 121,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 119,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("badge_icons"), children: [
      /* @__PURE__ */ jsxDEV(Badge, { label: t("badge_complete"), startIcon: icon("circle-check"), variant: "success" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
        lineNumber: 125,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Badge, { endIcon: icon("arrow-up-right-from-square"), label: t("badge_external"), subtle: true, variant: "info" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
        lineNumber: 126,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Badge, { label: t("badge_overdue"), pill: true, startIcon: icon("triangle-exclamation"), variant: "danger" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
        lineNumber: 127,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 124,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
    lineNumber: 108,
    columnNumber: 9
  });
}, "BadgeSection");
const BreadcrumbSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  const trail = [
    { href: "#home", label: t("breadcrumb_home") },
    { href: "#faculty", label: t("breadcrumb_faculty") },
    { href: "#program", label: t("breadcrumb_program") },
    { href: "#another", label: t("breadcrumb_another") }
  ];
  const current = { label: t("breadcrumb_current") };
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("breadcrumb_expectation"), id: "breadcrumb", title: t("breadcrumb"), children: /* @__PURE__ */ jsxDEV("div", { className: "d-flex flex-column gap-3", children: [2, 3, 4, 5].map((count) => /* @__PURE__ */ jsxDEV(
    Example,
    {
      label: t(count > 4 ? "breadcrumb_itemsoverflow" : "breadcrumb_items", count),
      children: /* @__PURE__ */ jsxDEV(
        Breadcrumb,
        {
          ariaLabel: t("breadcrumb"),
          items: [...trail.slice(0, count - 1), current],
          overflowAriaLabel: t("breadcrumb_showmore")
        },
        void 0,
        false,
        {
          fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
          lineNumber: 151,
          columnNumber: 25
        }
      )
    },
    count,
    false,
    {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 147,
      columnNumber: 21
    }
  )) }, void 0, false, {
    fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
    lineNumber: 145,
    columnNumber: 13
  }) }, void 0, false, {
    fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
    lineNumber: 144,
    columnNumber: 9
  });
}, "BreadcrumbSection");
const ProgressBarSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  const bar = /* @__PURE__ */ __name((props) => /* @__PURE__ */ jsxDEV("div", { className: "w-100", style: { maxWidth: "30rem" }, children: /* @__PURE__ */ jsxDEV(ProgressBar, { count: t("progressbar_count"), title: t("progressbar_title"), ...props }, void 0, false, {
    fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
    lineNumber: 169,
    columnNumber: 13
  }) }, void 0, false, {
    fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
    lineNumber: 168,
    columnNumber: 9
  }), "bar");
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("progressbar_expectation"), id: "progressbar", title: t("section_progressbar"), children: [
    progressStatuses.map((status) => /* @__PURE__ */ jsxDEV(Example, { label: t("progressbar_status", status), children: bar({ status, value: 50 }) }, status, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 176,
      columnNumber: 17
    })),
    /* @__PURE__ */ jsxDEV(Example, { label: t("progressbar_animated"), children: bar({ animated: true, status: "loading", value: 50 }) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 180,
      columnNumber: 13
    }),
    progressLabelVariants.map((labelVariant) => /* @__PURE__ */ jsxDEV(Example, { label: t("progressbar_labelvariant", labelVariant), children: bar({ labelVariant, value: 75 }) }, labelVariant, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 185,
      columnNumber: 17
    })),
    /* @__PURE__ */ jsxDEV(Example, { label: t("progressbar_empty"), children: bar({ value: 0 }) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 189,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("progressbar_complete"), children: bar({ value: 100 }) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
      lineNumber: 192,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/DisplaySections.tsx",
    lineNumber: 174,
    columnNumber: 9
  });
}, "ProgressBarSection");
export {
  ActivityIconSection,
  AvatarSection,
  BadgeSection,
  BreadcrumbSection,
  ProgressBarSection
};
//# sourceMappingURL=DisplaySections.dev.js.map
