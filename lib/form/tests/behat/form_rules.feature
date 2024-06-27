@core @core_form @MDL-XXXXX
Feature: Test the form rules
  For forms that make use of different rules
  So that users can use form elements
  I need to test the ensure elements are controlled correctly

  Background:
    Given I log in as "admin"
    And I am on fixture page "/lib/form/tests/behat/fixtures/form_rules.php"

  @javascript
  Scenario Outline: Checkbox checked & notchecked rules
    And the "disabled" attribute of "button#id_some_unchecked_disabled_text" "css_element" should contain "true"
    And I should not see "Not checked hidden"
    And I should not see <checkbox>
    And I should not see <ckbstatus>
    And I should not see <ckbresultvis>
    And I should not see <ckbresultstat>

    Examples:
      | checkbox            | ckbstatus  | ckbresultvis | ckbresultstat |
      | Checked hide        | checked    | not see      | disabled      |
      | Checked hide        | notchecked | see          | enabled       |
      | Checked disable     | checked    | see          | disabled      |
      | Checked disable     | notchecked | see          | enabled       |
      | Not checked hide    | checked    | not see      | disabled      |
      | Not checked hide    | notchecked | see          | enabled       |
      | Not checked disable | checked    | see          | enabled       |
      | Not checked disable | notchecked | see          | disabled      |

#  Scenario: Radio rules
#  Scenario: AlphaNum text rules
