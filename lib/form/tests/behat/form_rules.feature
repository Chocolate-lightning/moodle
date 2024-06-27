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
    Given I should <ckbprevis> "<label>"
    When I click on "<checkbox>" "checkbox"
    Then I should <ckbresultvis> "<label>"
    And the "<label>" "button" should be <ckbresultstat>

    Examples:
      | checkbox            | ckbprevis | ckbresultstat | label                | ckbresultvis | ckbresultstat |
      | Checked hide        | see       | enabled       | Checked hidden       | not see      | disabled      |
      | Checked disable     | see       | enabled       | Checked disabled     | see          | disabled      |
      | Not checked hide    | not see   | disabled      | Not checked hidden   | see          | enabled       |
      | Not checked disable | see       | disabled      | Not checked disabled | see          | enabled       |

  @javascript
  Scenario Outline: Radio rules
    Given I should <previs> "<label>"
    And the "<label>" "button" should be <prestat>
    And I should <oppprevis> "<opplabel>"
    And the "<opplabel>" "button" should be <oppprestat>
    When I click on "<radio>" "radio"
    Then I should <postvis> "<label>"
    And the "<label>" "button" should be <poststat>
    And I should <opppostvis> "<opplabel>"
    And the "<opplabel>" "button" should be <opppoststat>

  Examples:
    | radio   | label     | previs  | prestat  | postvis | poststat | opplabel  | oppprevis | oppprestat | opppostvis | opppoststat |
    | Enable  | Radio EQ  | see     | enabled  | see     | enabled  | Radio NEQ | not see   | disabled   | not see    | disabled    |
    | Disable | Radio EQ  | see     | enabled  | see     | disabled | Radio NEQ | not see   | disabled   | not see    | disabled    |
    | Hide    | Radio NEQ | not see | disabled | see     | disabled | Radio EQ  | see       | enabled    | not see    | disabled    |

  @javascript
  Scenario Outline: AlphaNum text rules
    Given I should <previs> "<alphalabel>"
    And the "<alphalabel>" "button" should be <prestat>
    And I should <previs> "<intlabel>"
    And the "<intlabel>" "button" should be <prestat>
    When I set the field "Text input" to "<textinp>"
    And I set the field "Number input" to "<intinp>"
    Then I should <postvis> "<alphalabel>"
    And the "<alphalabel>" "button" should be <poststat>
    And I should <postvis> "<intlabel>"
    And the "<intlabel>" "button" should be <poststat>

  # NEQ / NE & NOTEQ are the same rule so don't need to run tests for aliased rules.
  Examples:
    | textinp                   | alphalabel  | intlabel  | intinp | previs  | postvis | prestat  | poststat |
    | Disable eq                | Alpha EQ    | Int EQ    | 1      | see     | see     | enabled  | disabled |
    | Hidden eq                 | Alpha EQ    | Int EQ    | 2      | see     | not see | enabled  | disabled |
    | Disable neq               | Alpha NEQ   | Int NEQ   | 3      | not see | not see | disabled | disabled |
    | Hidden neq                | Alpha NEQ   | Int NEQ   | 4      | not see | see     | disabled | disabled |
    | Tool                      | Alpha IN    | Int IN    | 9      | see     | see     | enabled  | disabled |
    | Rage Against The Machine  | Alpha IN    | Int IN    | 10     | see     | see     | enabled  | disabled |
    | $uicideboy$               | Alpha IN    | Int IN    | 11     | see     | not see | enabled  | disabled |
    | USAO / Camellia / No Mana | Alpha IN    | Int IN    | 12     | see     | not see | enabled  | disabled |
