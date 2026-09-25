var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/**
 * Showcase sections for form controls, plus a native form submission check.
 *
 * @module     core/showcase/FormSections
 * @copyright  2026 Mathew May <mathew.solutions>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { Button, Checkbox, Choicebox, Radio, Switch } from "@moodlehq/design-system";
import { useState } from "react";
import { Example, Section, allOf, icon, noop } from "@moodle/lms/core/showcase/Layout";
import { useShowcaseStrings } from "@moodle/lms/core/showcase/strings";
const switchVariants = allOf({ enable: true, visibility: true, lock: true });
const switchLabelSides = allOf({ start: true, end: true });
const CheckboxSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("checkbox_expectation"), id: "checkbox", title: t("section_checkbox"), children: [
    /* @__PURE__ */ jsxDEV(Example, { label: t("checkbox_states"), children: [
      /* @__PURE__ */ jsxDEV(Checkbox, { label: t("unchecked"), name: "checkbox-states", value: "unchecked" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 39,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Checkbox, { defaultChecked: true, label: t("checked"), name: "checkbox-states", onChange: noop, value: "checked" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 40,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Checkbox, { indeterminate: true, label: t("checkbox_indeterminate"), name: "checkbox-states", value: "indeterminate" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 41,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Checkbox, { disabled: true, label: t("disabled"), name: "checkbox-states", value: "disabled" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 42,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(
        Checkbox,
        {
          defaultChecked: true,
          disabled: true,
          label: t("disabledchecked"),
          name: "checkbox-states",
          value: "disabled-checked"
        },
        void 0,
        false,
        {
          fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
          lineNumber: 43,
          columnNumber: 17
        }
      )
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 38,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("invalid"), children: [
      /* @__PURE__ */ jsxDEV(Checkbox, { invalid: true, label: t("checkbox_invalidnofeedback"), name: "checkbox-invalid", value: "a" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 52,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(
        Checkbox,
        {
          invalid: true,
          invalidFeedback: t("checkbox_acceptfeedback"),
          label: t("checkbox_accept"),
          name: "checkbox-invalid",
          required: true,
          value: "b"
        },
        void 0,
        false,
        {
          fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
          lineNumber: 53,
          columnNumber: 17
        }
      )
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 51,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("checkbox_extras"), children: [
      /* @__PURE__ */ jsxDEV(
        Checkbox,
        {
          label: t("checkbox_notifications"),
          name: "checkbox-extra",
          supportingText: t("checkbox_notificationshelp"),
          value: "notify"
        },
        void 0,
        false,
        {
          fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
          lineNumber: 63,
          columnNumber: 17
        }
      ),
      /* @__PURE__ */ jsxDEV(Checkbox, { hideLabel: true, label: t("checkbox_hiddenlabel"), name: "checkbox-extra", value: "row" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 69,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { style: { maxWidth: "20rem" }, children: /* @__PURE__ */ jsxDEV(Checkbox, { label: t("checkbox_long"), name: "checkbox-extra", value: "long" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 71,
        columnNumber: 21
      }) }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 70,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 62,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
    lineNumber: 37,
    columnNumber: 9
  });
}, "CheckboxSection");
const ChoiceboxSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("choicebox_expectation"), id: "choicebox", title: t("section_choicebox"), children: [
    /* @__PURE__ */ jsxDEV(Example, { label: t("choicebox_icons"), children: [
      /* @__PURE__ */ jsxDEV(Choicebox, { icon: icon("star"), label: t("choicebox_star"), name: "choicebox", value: "star" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 84,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Choicebox, { icon: icon("check"), label: t("choicebox_check"), name: "choicebox", value: "check" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 85,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Choicebox, { icon: icon("font"), label: t("choicebox_font"), name: "choicebox", value: "font" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 86,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 83,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("choicebox_supporting"), children: [
      /* @__PURE__ */ jsxDEV(
        Choicebox,
        {
          label: t("choicebox_individual"),
          name: "choicebox-extra",
          supportingText: t("choicebox_individualhelp"),
          value: "individual"
        },
        void 0,
        false,
        {
          fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
          lineNumber: 89,
          columnNumber: 17
        }
      ),
      /* @__PURE__ */ jsxDEV(
        Choicebox,
        {
          label: t("choicebox_group"),
          name: "choicebox-extra",
          supportingText: t("choicebox_grouphelp"),
          value: "group"
        },
        void 0,
        false,
        {
          fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
          lineNumber: 95,
          columnNumber: 17
        }
      ),
      /* @__PURE__ */ jsxDEV(Choicebox, { disabled: true, label: t("disabled"), name: "choicebox-extra", value: "disabled" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 101,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(
        Choicebox,
        {
          defaultChecked: true,
          disabled: true,
          label: t("disabledchecked"),
          name: "choicebox-disabled",
          value: "disabled-checked"
        },
        void 0,
        false,
        {
          fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
          lineNumber: 102,
          columnNumber: 17
        }
      )
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 88,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
    lineNumber: 82,
    columnNumber: 9
  });
}, "ChoiceboxSection");
const RadioSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("radio_expectation"), id: "radio", title: t("section_radio"), children: [
    /* @__PURE__ */ jsxDEV(Example, { label: t("radio_group"), children: [
      /* @__PURE__ */ jsxDEV(Radio, { label: t("radio_phone"), name: "contact", value: "phone" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 120,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Radio, { label: t("radio_sms"), name: "contact", value: "sms" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 121,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Radio, { defaultChecked: true, label: t("radio_email"), name: "contact", value: "email" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 122,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 119,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("disabled"), children: [
      /* @__PURE__ */ jsxDEV(Radio, { disabled: true, label: t("disabled"), name: "radio-disabled", value: "a" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 125,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Radio, { defaultChecked: true, disabled: true, label: t("disabledchecked"), name: "radio-disabled", value: "b" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 126,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 124,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("invalid"), children: [
      /* @__PURE__ */ jsxDEV(Radio, { invalid: true, label: t("radio_yes"), name: "radio-invalid", value: "yes" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 129,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(
        Radio,
        {
          invalid: true,
          invalidFeedback: t("radio_invalidfeedback"),
          label: t("radio_no"),
          name: "radio-invalid",
          value: "no"
        },
        void 0,
        false,
        {
          fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
          lineNumber: 130,
          columnNumber: 17
        }
      )
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 128,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("radio_extras"), children: [
      /* @__PURE__ */ jsxDEV(Radio, { hideLabel: true, label: t("radio_hiddenlabel"), name: "radio-extra", value: "row" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 139,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { style: { maxWidth: "20rem" }, children: /* @__PURE__ */ jsxDEV(Radio, { label: t("radio_long"), name: "radio-extra", value: "long" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 141,
        columnNumber: 21
      }) }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 140,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 138,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
    lineNumber: 118,
    columnNumber: 9
  });
}, "RadioSection");
const SwitchSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  const [checked, setChecked] = useState(true);
  const handleChange = /* @__PURE__ */ __name((event) => {
    setChecked(event.currentTarget.checked);
  }, "handleChange");
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("switch_expectation"), id: "switch", title: t("section_switch"), children: [
    /* @__PURE__ */ jsxDEV(Example, { label: t("switch_variants"), children: [
      /* @__PURE__ */ jsxDEV(Switch, { checked, label: t("switch_controlled"), onChange: handleChange }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 159,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Switch, { defaultChecked: true, label: t("switch_visibility"), variant: "visibility" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 160,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Switch, { defaultChecked: true, label: t("switch_lock"), variant: "lock" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 161,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 158,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("switch_labelside"), children: [
      switchLabelSides.map((labelSide) => /* @__PURE__ */ jsxDEV(Switch, { label: labelSide, labelSide }, labelSide, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 165,
        columnNumber: 21
      })),
      /* @__PURE__ */ jsxDEV(Switch, { hideLabel: true, label: t("switch_hiddenlabel") }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 167,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 163,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("disabled"), children: [
      /* @__PURE__ */ jsxDEV(Switch, { disabled: true, label: t("disabled") }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 170,
        columnNumber: 17
      }),
      switchVariants.map((variant) => /* @__PURE__ */ jsxDEV(Switch, { defaultChecked: true, disabled: true, label: variant, variant }, variant, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 172,
        columnNumber: 21
      }))
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 169,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Example, { label: t("switch_longlabel"), children: /* @__PURE__ */ jsxDEV("div", { style: { maxWidth: "15rem" }, children: /* @__PURE__ */ jsxDEV(Switch, { label: t("switch_long") }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 177,
      columnNumber: 21
    }) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 176,
      columnNumber: 17
    }) }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 175,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
    lineNumber: 157,
    columnNumber: 9
  });
}, "SwitchSection");
const FormSubmissionSection = /* @__PURE__ */ __name(() => {
  const t = useShowcaseStrings();
  const [submitted, setSubmitted] = useState(null);
  const handleSubmit = /* @__PURE__ */ __name((event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted([...data.entries()].map(([name, value]) => [name, String(value)]));
  }, "handleSubmit");
  return /* @__PURE__ */ jsxDEV(Section, { expectation: t("formsubmission_expectation"), id: "formsubmission", title: t("section_formsubmission"), children: [
    /* @__PURE__ */ jsxDEV("form", { className: "d-flex flex-column gap-3", onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxDEV(Checkbox, { label: t("formsubmission_updates"), name: "updates", value: "yes" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 198,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "d-flex flex-column gap-2", children: [
        /* @__PURE__ */ jsxDEV(Radio, { label: t("radio_phone"), name: "method", value: "phone" }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
          lineNumber: 200,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(Radio, { defaultChecked: true, label: t("radio_email"), name: "method", value: "email" }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
          lineNumber: 201,
          columnNumber: 21
        })
      ] }, void 0, true, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 199,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(Switch, { defaultChecked: true, label: t("formsubmission_visible"), name: "visible", value: "1" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 203,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "d-flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxDEV(Choicebox, { label: t("formsubmission_beginner"), name: "level", value: "beginner" }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
          lineNumber: 205,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(Choicebox, { label: t("formsubmission_advanced"), name: "level", value: "advanced" }, void 0, false, {
          fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
          lineNumber: 206,
          columnNumber: 21
        })
      ] }, void 0, true, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 204,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { children: /* @__PURE__ */ jsxDEV(Button, { label: t("submit"), type: "submit" }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 209,
        columnNumber: 21
      }) }, void 0, false, {
        fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
        lineNumber: 208,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 197,
      columnNumber: 13
    }),
    submitted && /* @__PURE__ */ jsxDEV("pre", { className: "mt-3 p-3 bg-light border", "data-testid": "ds-form-result", children: submitted.length ? submitted.map(([name, value]) => `${name}=${value}`).join("\n") : t("formsubmission_nothing") }, void 0, false, {
      fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
      lineNumber: 213,
      columnNumber: 17
    })
  ] }, void 0, true, {
    fileName: "public/lib/js/esm/src/showcase/FormSections.tsx",
    lineNumber: 196,
    columnNumber: 9
  });
}, "FormSubmissionSection");
export {
  CheckboxSection,
  ChoiceboxSection,
  FormSubmissionSection,
  RadioSection,
  SwitchSection
};
//# sourceMappingURL=FormSections.dev.js.map
