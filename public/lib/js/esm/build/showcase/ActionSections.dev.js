var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/**
 * Showcase sections for action and navigation components: buttons, dropdowns, links and tooltips.
 *
 * @module     core/showcase/ActionSections
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import {
  Button,
  CloseButton,
  Dropdown,
  DropdownItemAction,
  DropdownItemCustom,
  DropdownItemDivider,
  DropdownItemExpandable,
  DropdownItemGroup,
  DropdownItemHeader,
  DropdownItemMultiselect,
  DropdownItemSelect,
  FavouriteButton,
  Link,
  NavPill,
  Pagination,
  Tooltip
} from "@moodlehq/design-system";
import { useState } from "react";
import { Example, Section, allOf, icon, noop } from "@moodle/lms/core/showcase/Layout";
import { useShowcaseStrings } from "@moodle/lms/core/showcase/strings";
const buttonVariants = allOf({
  primary: true,
  secondary: true,
  danger: true,
  ghost: true,
  "outline-primary": true,
  "outline-secondary": true,
  "outline-danger": true
});
const sizes = allOf({ sm: true, md: true, lg: true });
const dropdownAppearances = allOf({ emphasis: true, "default": true, subtle: true });
const dropdownSizes = allOf({ md: true, sm: true });
const tooltipPlacements = allOf({ top: true, bottom: true, left: true, right: true });
const ButtonSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("button_expectation"), id: "button", title: t("section_button"), children: [
    /* @__PURE__ */ jsxDEV(Example, { label: t("button_variants"), children: buttonVariants.map((variant) => /* @__PURE__ */ jsxDEV(Button, { label: variant, variant }, variant, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 50,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 48,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("disabled"), children: buttonVariants.map((variant) => /* @__PURE__ */ jsxDEV(Button, { disabled: true, label: variant, variant }, variant, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 55,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 53,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("button_sizes"), children: sizes.map((size) => /* @__PURE__ */ jsxDEV(Button, { label: size, size }, size, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 60,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 58,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("button_withicons"), children: [
      /* @__PURE__ */ jsxDEV(Button, { label: t("button_starticon"), startIcon: icon("plus") }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 64,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Button, { endIcon: icon("arrow-right"), label: t("button_endicon"), variant: "secondary" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 65,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(
        Button,
        {
          endIcon: icon("chevron-down"),
          label: t("button_both"),
          startIcon: icon("filter"),
          variant: "outline-primary"
        },
        void 0,
        false,
        {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 66,
          columnNumber: 17
        }
      )
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 63,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("button_icononly"), children: sizes.map((size) => /* @__PURE__ */ jsxDEV(Button, { "aria-label": t("settings"), size, startIcon: icon("gear"), variant: "ghost" }, size, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 75,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 73,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
    lineNumber: 47,
    columnNumber: 9
  });
}, "ButtonSection");
const CloseButtonSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("closebutton_expectation"), id: "closebutton", title: t("section_closebutton"), children: [
    /* @__PURE__ */ jsxDEV(Example, { label: t("closebutton_sizes"), children: sizes.map((size) => /* @__PURE__ */ jsxDEV(CloseButton, { "aria-label": t("closebutton_label", size), size }, size, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 89,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 87,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("disabled"), children: sizes.map((size) => /* @__PURE__ */ jsxDEV(CloseButton, { "aria-label": t("closebutton_label", size), disabled: true, size }, size, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 94,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 92,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
    lineNumber: 86,
    columnNumber: 9
  });
}, "CloseButtonSection");
const DropdownSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("dropdown_expectation"), id: "dropdown", title: t("section_dropdown"), children: [
    /* @__PURE__ */ jsxDEV(Example, { label: t("dropdown_itemtypes"), children: [
      /* @__PURE__ */ jsxDEV(Dropdown, { label: t("dropdown_label"), children: [
        /* @__PURE__ */ jsxDEV(DropdownItemHeader, { label: t("dropdown_header") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 108,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemDivider, {}, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 109,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemAction, { label: t("dropdown_action") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 110,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemAction, { description: t("dropdown_description"), label: t("dropdown_action") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 111,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemAction, { label: t("dropdown_withicon"), startIcon: icon("pen") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 112,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemAction, { disabled: true, label: t("dropdown_disabledaction") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 113,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemAction, { href: "#dropdown-link", label: t("dropdown_link") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 114,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(
          DropdownItemAction,
          {
            href: "https://moodle.org",
            label: t("dropdown_externallink"),
            rel: "noopener noreferrer",
            target: "_blank"
          },
          void 0,
          false,
          {
            fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
            lineNumber: 115,
            columnNumber: 21
          }
        )
      ] }, void 0, true, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 107,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Dropdown, { label: t("dropdown_sortby"), children: [
        /* @__PURE__ */ jsxDEV(DropdownItemSelect, { label: t("dropdown_coursename"), selected: true }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 123,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemSelect, { description: t("dropdown_mostrecent"), label: t("dropdown_lastmodified") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 124,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemSelect, { label: t("dropdown_progress"), startIcon: icon("chart-simple") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 125,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemSelect, { disabled: true, label: t("disabled") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 126,
          columnNumber: 21
        })
      ] }, void 0, true, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 122,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Dropdown, { label: t("dropdown_columns"), children: [
        /* @__PURE__ */ jsxDEV(DropdownItemMultiselect, { checked: true, label: t("dropdown_name") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 129,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemMultiselect, { checked: true, description: t("dropdown_primaryaddress"), label: t("dropdown_email") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 130,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemMultiselect, { label: t("dropdown_lastaccess") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 131,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemMultiselect, { disabled: true, label: t("disabled") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 132,
          columnNumber: 21
        })
      ] }, void 0, true, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 128,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Dropdown, { label: t("dropdown_actions"), children: [
        /* @__PURE__ */ jsxDEV(DropdownItemGroup, { label: t("dropdown_manage"), children: [
          /* @__PURE__ */ jsxDEV(DropdownItemAction, { label: t("dropdown_editsettings") }, void 0, false, {
            fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
            lineNumber: 136,
            columnNumber: 25
          }),
          /* @__PURE__ */ jsxDEV(DropdownItemAction, { label: t("dropdown_duplicate") }, void 0, false, {
            fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
            lineNumber: 137,
            columnNumber: 25
          })
        ] }, void 0, true, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 135,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemGroup, { label: t("dropdown_dangerzone"), children: [
          /* @__PURE__ */ jsxDEV(DropdownItemAction, { label: t("dropdown_delete"), variant: "danger" }, void 0, false, {
            fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
            lineNumber: 140,
            columnNumber: 25
          }),
          /* @__PURE__ */ jsxDEV(
            DropdownItemAction,
            {
              description: t("dropdown_cannotundo"),
              label: t("dropdown_deletepermanently"),
              startIcon: icon("trash"),
              variant: "danger"
            },
            void 0,
            false,
            {
              fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
              lineNumber: 141,
              columnNumber: 25
            }
          )
        ] }, void 0, true, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 139,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemExpandable, { label: t("dropdown_moreoptions"), children: [
          /* @__PURE__ */ jsxDEV(DropdownItemAction, { label: t("dropdown_export") }, void 0, false, {
            fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
            lineNumber: 149,
            columnNumber: 25
          }),
          /* @__PURE__ */ jsxDEV(DropdownItemAction, { label: t("dropdown_archive") }, void 0, false, {
            fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
            lineNumber: 150,
            columnNumber: 25
          })
        ] }, void 0, true, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 148,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemExpandable, { disabled: true, label: t("dropdown_disabledsubmenu"), children: /* @__PURE__ */ jsxDEV(DropdownItemAction, { label: t("dropdown_unreachable") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 153,
          columnNumber: 25
        }) }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 152,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(DropdownItemCustom, { children: /* @__PURE__ */ jsxDEV("div", { className: "px-3 py-2", children: t("dropdown_custom") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 156,
          columnNumber: 25
        }) }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 155,
          columnNumber: 21
        })
      ] }, void 0, true, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 134,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 106,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("dropdown_appearances"), children: dropdownAppearances.map((appearance) => dropdownSizes.map((size) => /* @__PURE__ */ jsxDEV(
      Dropdown,
      {
        appearance,
        label: `${appearance} ${size}`,
        size,
        children: /* @__PURE__ */ jsxDEV(DropdownItemAction, { label: t("dropdown_action") }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 169,
          columnNumber: 29
        })
      },
      `${appearance}-${size}`,
      false,
      {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 163,
        columnNumber: 25
      }
    ))) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 160,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("dropdown_triggers"), children: [
      /* @__PURE__ */ jsxDEV(Dropdown, { label: t("dropdown_navpill"), variant: "nav-pill", children: /* @__PURE__ */ jsxDEV(DropdownItemAction, { label: t("dropdown_action") }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 176,
        columnNumber: 21
      }) }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 175,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Dropdown, { label: t("dropdown_filter"), startIcon: icon("filter"), children: /* @__PURE__ */ jsxDEV(DropdownItemAction, { label: t("dropdown_action") }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 179,
        columnNumber: 21
      }) }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 178,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Dropdown, { iconOnly: true, label: t("dropdown_moreactions"), startIcon: icon("ellipsis-vertical"), children: /* @__PURE__ */ jsxDEV(DropdownItemAction, { label: t("dropdown_action") }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 182,
        columnNumber: 21
      }) }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 181,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 174,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("dropdown_placement"), children: [
      /* @__PURE__ */ jsxDEV(Dropdown, { label: t("dropdown_topstart"), placement: "top-start", children: /* @__PURE__ */ jsxDEV(DropdownItemAction, { label: t("dropdown_opensabove") }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 187,
        columnNumber: 21
      }) }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 186,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Dropdown, { label: t("dropdown_bottomend"), placement: "bottom-end", children: /* @__PURE__ */ jsxDEV(DropdownItemAction, { label: t("dropdown_alignedtoend") }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 190,
        columnNumber: 21
      }) }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 189,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Dropdown, { label: t("dropdown_matchwidth"), matchTriggerWidth: true, children: /* @__PURE__ */ jsxDEV(DropdownItemAction, { label: t("dropdown_samewidth") }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 193,
        columnNumber: 21
      }) }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 192,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 185,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
    lineNumber: 105,
    columnNumber: 9
  });
}, "DropdownSection");
const FavouriteButtonSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  const [favourite, setFavourite] = useState(true);
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("favouritebutton_expectation"), id: "favouritebutton", title: t("section_favouritebutton"), children: /* @__PURE__ */ jsxDEV(Example, { label: t("favouritebutton_toggle"), children: [
    /* @__PURE__ */ jsxDEV(
      FavouriteButton,
      {
        "aria-label": favourite ? t("favouritebutton_remove") : t("favouritebutton_add"),
        onClick: () => setFavourite(!favourite),
        selected: favourite
      },
      void 0,
      false,
      {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 207,
        columnNumber: 17
      }
    ),
    /* @__PURE__ */ jsxDEV(FavouriteButton, { "aria-label": t("favouritebutton_adddisabled"), disabled: true }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 212,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV(FavouriteButton, { "aria-label": t("favouritebutton_removedisabled"), disabled: true, selected: true }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 213,
      columnNumber: 17
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
    lineNumber: 206,
    columnNumber: 13
  }) }, void 0, false, {
    fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
    lineNumber: 205,
    columnNumber: 9
  });
}, "FavouriteButtonSection");
const LinkSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("link_expectation"), id: "link", title: t("section_link"), children: [
    /* @__PURE__ */ jsxDEV(Example, { label: t("link_variants"), children: [
      /* @__PURE__ */ jsxDEV(Link, { href: "#link-default", label: t("default"), onClick: noop }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 225,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Link, { href: "#link-secondary", label: t("link_secondary"), onClick: noop, variant: "secondary" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 226,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Link, { disabled: true, href: "#link-disabled", label: t("disabled"), onClick: noop }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 227,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 224,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("link_icons"), children: [
      /* @__PURE__ */ jsxDEV(Link, { href: "#link-start", label: t("link_back"), onClick: noop, startIcon: icon("arrow-left") }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 230,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(
        Link,
        {
          endIcon: icon("arrow-up-right-from-square"),
          href: "https://moodle.org",
          label: t("link_external"),
          target: "_blank"
        },
        void 0,
        false,
        {
          fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
          lineNumber: 231,
          columnNumber: 17
        }
      )
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 229,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("link_comparison"), children: [
      /* @__PURE__ */ jsxDEV(Link, { href: "#link-inline", label: t("link_designsystem"), onClick: noop }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 239,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("a", { href: "#link-theme", children: t("link_theme") }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 240,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 238,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
    lineNumber: 223,
    columnNumber: 9
  });
}, "LinkSection");
const NavPillSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("navpill_expectation"), id: "navpill", title: t("section_navpill"), children: /* @__PURE__ */ jsxDEV(Example, { label: t("navpill_states"), children: [
    /* @__PURE__ */ jsxDEV(NavPill, { href: "#navpill-selected", label: t("selected"), selected: true }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 252,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV(NavPill, { href: "#navpill-default", label: t("default") }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 253,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV(NavPill, { disabled: true, href: "#navpill-disabled", label: t("disabled") }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 254,
      columnNumber: 17
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
    lineNumber: 251,
    columnNumber: 13
  }) }, void 0, false, {
    fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
    lineNumber: 250,
    columnNumber: 9
  });
}, "NavPillSection");
const PaginationSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  const [currentPage, setCurrentPage] = useState(1);
  const [groupedPage, setGroupedPage] = useState(5);
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("pagination_expectation"), id: "pagination", title: t("section_pagination"), children: [
    /* @__PURE__ */ jsxDEV(Example, { label: t("pagination_full", `${currentPage} / 10`), children: /* @__PURE__ */ jsxDEV(Pagination, { currentPage, onPageChange: setCurrentPage, totalPages: 10 }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 268,
      columnNumber: 17
    }) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 267,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("pagination_grouped", `${groupedPage} / 50`), children: /* @__PURE__ */ jsxDEV(Pagination, { currentPage: groupedPage, onPageChange: setGroupedPage, totalPages: 50, variant: "grouped" }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 271,
      columnNumber: 17
    }) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 270,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("disabled"), children: /* @__PURE__ */ jsxDEV(Pagination, { currentPage: 3, disabled: true, onPageChange: noop, totalPages: 10 }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 274,
      columnNumber: 17
    }) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 273,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
    lineNumber: 266,
    columnNumber: 9
  });
}, "PaginationSection");
const TooltipSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("tooltip_expectation"), id: "tooltip", title: t("section_tooltip"), children: [
    /* @__PURE__ */ jsxDEV(Example, { label: t("tooltip_dark"), children: tooltipPlacements.map((placement) => /* @__PURE__ */ jsxDEV(Tooltip, { label: t("tooltip_text"), placement, children: /* @__PURE__ */ jsxDEV(Button, { label: placement, variant: "secondary" }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 288,
      columnNumber: 25
    }) }, placement, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 287,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 285,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("tooltip_light"), children: tooltipPlacements.map((placement) => /* @__PURE__ */ jsxDEV(Tooltip, { label: t("tooltip_text"), placement, variant: "light", children: /* @__PURE__ */ jsxDEV(Button, { label: placement, variant: "outline-secondary" }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 295,
      columnNumber: 25
    }) }, placement, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 294,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 292,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("tooltip_icononly"), children: [
      /* @__PURE__ */ jsxDEV(Tooltip, { label: t("settings"), children: /* @__PURE__ */ jsxDEV(Button, { "aria-label": t("settings"), startIcon: icon("gear"), variant: "ghost" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 301,
        columnNumber: 21
      }) }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 300,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Tooltip, { label: t("tooltip_long"), children: /* @__PURE__ */ jsxDEV(Button, { label: t("tooltip_longtrigger"), variant: "secondary" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 304,
        columnNumber: 21
      }) }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
        lineNumber: 303,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
      lineNumber: 299,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/ActionSections.tsx",
    lineNumber: 284,
    columnNumber: 9
  });
}, "TooltipSection");
export {
  ButtonSection,
  CloseButtonSection,
  DropdownSection,
  FavouriteButtonSection,
  LinkSection,
  NavPillSection,
  PaginationSection,
  TooltipSection
};
//# sourceMappingURL=ActionSections.dev.js.map
