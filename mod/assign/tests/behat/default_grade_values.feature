@mod @mod_assign
Feature: When creating an assignment, the default value for the gradetype and gradescale elements should be set by the "mod_assign/gradetype" and "mod_assign/gradescale" settings respectively.
  In order to reduce repetitive work
  As a teacher
  I need to have the grade type and grade scale set correctly by default

  Background:
    Given the following "courses" exist:
      | fullname | shortname | category | groupmode |
      | Course 1 | C1        | 0        | 1         |
    And the following "users" exist:
      | username | firstname | lastname | email                |
      | teacher1 | Teacher   | 1        | teacher1@example.com |
    And the following "course enrolments" exist:
      | user      | course  | role           |
      | teacher1  | C1      | editingteacher |

  Scenario: Check that the default grade type comes through and the scale can also be set even if not shown
    Given the following config values are set as admin:
      | config     | value | plugin     |
      | gradescale | 2     | mod_assign |
    And the following "activity" exists:
      | activity    | assign                 |
      | course      | C1                     |
      | name        | Test assignment        |
      | description | Assignment description |
    When I am on the "Test assignment" "assign activity editing" page logged in as teacher1
    # Scale 2 is set in the DOM but hidden since this is points grading.
    Then the following fields match these values:
      | grade[modgrade_type]  | Point |
      | grade[modgrade_scale] | 2     |

  Scenario: Create a new assignment when mod_assign/gradetype is set to "Scale" and mod_assign/gradescale is set to scale with id: 2
    Given the following "activity" exists:
      | activity    | assign                 |
      | course      | C1                     |
      | name        | Test scale assignment  |
      | description | Assignment description |
      | gradetype   | 2                      |
      | gradescale  | 2                      |
    When I am on the "Test scale assignment" "assign activity editing" page logged in as teacher1
    Then the following fields match these values:
      | grade[modgrade_type]  | Scale |
      | grade[modgrade_scale] | 2     |

  Scenario: Create a new assignment when mod_assign/gradetype is set to "None" and mod_assign/gradescale is set to scale with id: 2
    Given the following "activity" exists:
      | activity    | assign                 |
      | course      | C1                     |
      | name        | Test none assignment   |
      | description | Assignment description |
      | gradetype   | 0                      |
    When I am on the "Test none assignment" "assign activity editing" page logged in as teacher1
    Then the following fields match these values:
      | grade[modgrade_type] | None |

  Scenario: Edit an assignment with gradetype "Scale" and gradescale with id: 2, when mod_assign/gradetype is set to "Point" and mod_assign/gradescale is set to scale with id: 1
    Given the following "activity" exists:
      | activity    | assign                 |
      | course      | C1                     |
      | name        | Test assignment        |
      | description | Assignment description |
      | gradetype   | 1                      |
      | gradescale  | 1                      |
    And I am on the "Test assignment" "assign activity editing" page logged in as teacher1
    And the following fields match these values:
      | grade[modgrade_type]  | Point                    |
      | grade[modgrade_scale] | Default competence scale |
    When I set the following fields to these values:
      | grade[modgrade_type]  | Scale           |
      | grade[modgrade_scale] | 2               |
    And I press "Save and return to course"
    And I am on the "Test assignment" "assign activity editing" page
    Then the following fields match these values:
      | grade[modgrade_type]  | Scale |
      | grade[modgrade_scale] | 2     |

    @javascript
    Scenario: Manually test that the admin settings are carried through into the form
      Given the following config values are set as admin:
        | config     | value | plugin     |
        | gradetype  | 2     | mod_assign |
        | gradescale | 2     | mod_assign |
      And I am on the "Course 1" course page logged in as teacher1
      And I wait until the page is ready
      And I switch editing mode on
      And I click on "Add an activity or resource" "button"
      When I follow "Assignment"
      Then the following fields match these values:
        | grade[modgrade_type]  | Scale |
        | grade[modgrade_scale] | 2     |
