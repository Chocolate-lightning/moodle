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
      | username  | firstname  | lastname  | email                 |
      | teacher1  | Teacher    | 1         | teacher1@example.com  |
    And the following "course enrolments" exist:
      | user      | course  | role            |
      | teacher1  | C1      | editingteacher  |

  @javascript
  Scenario: Create a new assignment when mod_assign/gradetype and mod_assign/gradescale settings are not set
    When I log in as "teacher1"
    And I am on "Course 1" course homepage with editing mode on
    And I click on "Add an activity or resource" "button"
    And I follow "Assignment"
    Then the following fields match these values:
      | grade[modgrade_type] | Point |

  @javascript
  Scenario: Create a new assignment when mod_assign/gradetype is set to "Point" and mod_assign/gradescale is set to scale with id: 2
    Given the following config values are set as admin:
      | config     | value | plugin     |
      | gradetype  | 1     | mod_assign |
      | gradescale | 2     | mod_assign |
    When I log in as "teacher1"
    And I am on "Course 1" course homepage with editing mode on
    And I click on "Add an activity or resource" "button"
    And I follow "Assignment"
    Then the following fields match these values:
      | grade[modgrade_type]  | Point |
      | grade[modgrade_scale] | 2     |

  @javascript
  Scenario: Create a new assignment when mod_assign/gradetype is set to "Scale" and mod_assign/gradescale is set to scale with id: 2
    Given the following config values are set as admin:
      | config     | value | plugin     |
      | gradetype  | 2     | mod_assign |
      | gradescale | 2     | mod_assign |
    When I log in as "teacher1"
    And I am on "Course 1" course homepage with editing mode on
    And I click on "Add an activity or resource" "button"
    And I follow "Assignment"
    Then the following fields match these values:
      | grade[modgrade_type]  | Scale |
      | grade[modgrade_scale] | 2     |

  @javascript
  Scenario: Create a new assignment when mod_assign/gradetype is set to "None" and mod_assign/gradescale is set to scale with id: 2
    Given the following config values are set as admin:
      | config     | value | plugin     |
      | gradetype  | 0     | mod_assign |
      | gradescale | 2     | mod_assign |
    When I log in as "teacher1"
    And I am on "Course 1" course homepage with editing mode on
    And I click on "Add an activity or resource" "button"
    And I follow "Assignment"
    Then the following fields match these values:
      | grade[modgrade_type]  | None |
      | grade[modgrade_scale] | 2    |

  @javascript
  Scenario: Edit an assignment with gradetype "Scale" and gradescale with id: 2, when mod_assign/gradetype is set to "Point" and mod_assign/gradescale is set to scale with id: 1
    Given the following config values are set as admin:
      | config     | value | plugin     |
      | gradetype  | 1     | mod_assign |
      | gradescale | 1     | mod_assign |
    And I log in as "teacher1"
    And I am on "Course 1" course homepage with editing mode on
    And I click on "Add an activity or resource" "button"
    And I follow "Assignment"
    And I set the following fields to these values:
      | name                  | Test assignment |
      | cmidnumber            | Test assignment |
      | grade[modgrade_type]  | Scale           |
      | grade[modgrade_scale] | 2               |
    And I press "Save and return to course"
    When I am on the "Test assignment" Activity page logged in as teacher1
    And I follow "Settings"
    Then the following fields match these values:
      | grade[modgrade_type]  | Scale |
      | grade[modgrade_scale] | 2     |
