@core @javascript @gradereport @gradereport_grader @MDL-75274
Feature: Within the grader report, test that we can collapse columns
  In order to reduce usage of visual real estate
  As a teacher
  I need to be able to change how the report is displayed

  Background:
    Given the following "courses" exist:
      | fullname | shortname | category | groupmode |
      | Course 1 | C1        | 0        | 1         |
    And the following "grade categories" exist:
      | fullname                 | course |
      | Some cool grade category | C1     |
    And the following "users" exist:
      | username | firstname | lastname | email                | idnumber | phone1     | phone2     | department | institution | city    | country  |
      | teacher1 | Teacher   | 1        | teacher1@example.com | t1       | 1234567892 | 1234567893 | ABC1       | ABCD        | Perth   | AU       |
      | student1 | Student   | 1        | student1@example.com | s1       | 3213078612 | 8974325612 | ABC1       | ABCD        | Hanoi   | VN       |
      | student2 | Dummy     | User     | student2@example.com | s2       | 4365899871 | 7654789012 | ABC2       | ABCD        | Tokyo   | JP       |
      | student3 | User      | Example  | student3@example.com | s3       | 3243249087 | 0875421745 | ABC2       | ABCD        | Olney   | GB       |
      | student4 | User      | Test     | student4@example.com | s4       | 0987532523 | 2149871323 | ABC3       | ABCD        | Tokyo   | JP       |
      | student5 | Turtle    | Manatee  | student5@example.com | s5       | 1239087780 | 9873623589 | ABC3       | ABCD        | Perth   | AU       |
    And the following "course enrolments" exist:
      | user     | course | role           |
      | teacher1 | C1     | editingteacher |
      | student1 | C1     | student        |
      | student2 | C1     | student        |
      | student3 | C1     | student        |
      | student4 | C1     | student        |
      | student5 | C1     | student        |
    And the following "activities" exist:
      | activity | course | idnumber | name                  | gradecategory            |
      | assign   | C1     | a1       | Test assignment one   | Some cool grade category |
      | assign   | C1     | a2       | Test assignment two   |                          |
      | assign   | C1     | a3       | Test assignment three | Some cool grade category |
      | assign   | C1     | a4       | Test assignment four  |                          |
    And the following config values are set as admin:
      | showuseridentity | idnumber,email,city,country,phone1,phone2,department,institution |
    And I am on the "Course 1" "Course" page logged in as "teacher1"
    And I change window size to "large"
    And I navigate to "View > Grader report" in the course gradebook

  Scenario: An admin collapses a user info column and then reloads the page to find the column still collapsed
    Given I click on the dropdown for the "Email" column
    And I select "Collapse" from the column dropdown
    And The "Email" column should not be visible
    When I reload the page
    Then The "Email" column should not be visible
    # Ensure we still have the data to search and view potentially without a page reload.
    And the following should exist in the "user-grades" table:
      | -1-            | -4-                  | -5-   | -6- | -7-        | -8-        | -9-  | -10- | -11- | -12- |
      | Student 1      | student1@example.com | Hanoi | VN  | 3213078612 | 8974325612 | ABC1 | ABCD | -    | -    |
      | Dummy User     | student2@example.com | Tokyo | JP  | 4365899871 | 7654789012 | ABC2 | ABCD | -    | -    |
      | User Example   | student3@example.com | Olney | GB  | 3243249087 | 0875421745 | ABC2 | ABCD | -    | -    |
      | User Test      | student4@example.com | Tokyo | JP  | 0987532523 | 2149871323 | ABC3 | ABCD | -    | -    |
      | Turtle Manatee | student5@example.com | Perth | AU  | 1239087780 | 9873623589 | ABC3 | ABCD | -    | -    |
    # Check that the collapsed column is only for the user that set it.
    And I log out
    And I am on the "Course 1" "Course" page logged in as "teacher1"
    And I change window size to "large"
    And I navigate to "View > Grader report" in the course gradebook
    And The "Email" column should be visible

  Scenario: A teacher collapses a grade item column and then reloads the page to find the column still collapsed
    Given I click on the dropdown for the "Test assignment one" column
    And I select "Collapse" from the column dropdown
    And The "Test assignment one" column should not be visible
    When I reload the page
    Then The "Test assignment one" column should not be visible
    # Ensure we still have the data to search and view potentially without a page reload even though the assignment is hidden from the user.
    And the following should exist in the "user-grades" table:
      | -1-            | -4-                  | -5-   | -6- | -7-        | -8-        | -9-  | -10- | -11- | -12- |
      | Student 1      | student1@example.com | Hanoi | VN  | 3213078612 | 8974325612 | ABC1 | ABCD | -    | -    |
      | Dummy User     | student2@example.com | Tokyo | JP  | 4365899871 | 7654789012 | ABC2 | ABCD | -    | -    |
      | User Example   | student3@example.com | Olney | GB  | 3243249087 | 0875421745 | ABC2 | ABCD | -    | -    |
      | User Test      | student4@example.com | Tokyo | JP  | 0987532523 | 2149871323 | ABC3 | ABCD | -    | -    |
      | Turtle Manatee | student5@example.com | Perth | AU  | 1239087780 | 9873623589 | ABC3 | ABCD | -    | -    |

  Scenario: When a user collapses a column, inform them within the report and tertiary nav area
    Given I click on the dropdown for the "Test assignment one" column
    When I select "Collapse" from the column dropdown
    And The "Test assignment one" column should not be visible
    Then I should see "a plus icon"
    And I should see "Collapsed columns 1"

  Scenario: Collapsed columns can have their name searched and triggered to expand but the contents are not searched
    Given I click on the dropdown for the "Test assignment one" column
    And I select "Collapse" from the column dropdown
    And The "Test assignment one" column should not be visible
    # Opens the tertiary trigger button.
    And I click on the "Collapsed columns 1" "Button"
    # This is checking that the column name search dropdown exists.
    And I wait until "Search collapsed columns" "input" exists
    # Default state contains the collapsed column names.
    And I should see "ID Number"
    # Search for a column that was not hidden.
    When I set the field "Search collapsed columns" "input" to "Email"
    And I should see "No results for Email"
    # Search for a ID number value inside the column that was hidden.
    Then I set the field "Search collapsed columns" "input" to "s5"
    And I should see "No results for s5"
    # Search for a column that was hidden.
    And I set the field "Search collapsed columns" "input" to "ID"
    And I should see "ID Number"

  Scenario: Expand multiple columns at once
    Given I click on the dropdown for the "Assignment 1" column
    And I select "Collapse" from the column dropdown
    And I click on the dropdown for the "Assignment 2" column
    And I select "Collapse" from the column dropdown
    And I click on the dropdown for the "Assignment 3" column
    And I select "Collapse" from the column dropdown
    And I click on the dropdown for the "Assignment 4" column
    And I select "Collapse" from the column dropdown
    And I click on the dropdown for the "Email" column
    And I select "Collapse" from the column dropdown
    And I click on the dropdown for the "Phone" column
    And I select "Collapse" from the column dropdown
    And I click on the "Collapsed columns 6" "Button"
    # This is checking that the column name search dropdown exists.
    When I wait until "Search collapsed columns" "input" exists
    And I select the "Assignment 1" "checkbox"
    And I select the "Assignment 3" "checkbox"
    And I select the "Phone" "checkbox"
    Then The "Test assignment 1" column should be visible
    And The "Test assignment 1" column should be visible
    And The "Test assignment 3" column should be visible
    And The "Phone" column should be visible
    And The "Test assignment 2" column should not be visible
    And The "Test assignment 4" column should not be visible
    And The "Email" column should not be visible

  Scenario: If there is only one collapsed column it expands
    Given I click on the dropdown for the "Email" column
    And I select "Collapse" from the column dropdown
    And The "Email" column should not be visible
    And I hover "the plus" "icon"
    And I should see "Expand Email column" "tooltip"
    When I click the "plus icon"
    Then The "Email" column should be visible

  # V6 figma test with column grouping of collapsed items.
  Scenario: Clicking on a collapsed grade column indicator I should then see the column name searching widget and then be able to expand a column
    Given I click on the dropdown for the "Assignment 1" column
    And I select "Collapse" from the column dropdown
    And I click on the dropdown for the "Assignment 2" column
    And I select "Collapse" from the column dropdown
    And I click on the dropdown for the "Assignment 3" column
    And I select "Collapse" from the column dropdown
    And I click on the dropdown for the "Assignment 4" column
    And I select "Collapse" from the column dropdown
    And I wait until "Collapsed columns 4" "Button" exists
    When I press "4" in the grader table
    And I wait until "Search collapsed columns" "input" exists
    Then I should see "Assignment 1"
    And I select the "Assignment 3" "checkbox"
    And I press "Expand"
    And I should see the "Assignment 3" "Column"
    # Ensure we still have the data within the table.
    And the following should exist in the "user-grades" table:
      | -1-            | -4-                  | -5-   | -6- | -7-        | -8-        | -9-  | -10- | -11- | -12- |
      | Student 1      | student1@example.com | Hanoi | VN  | 3213078612 | 8974325612 | ABC1 | ABCD | -    | -    |
      | Dummy User     | student2@example.com | Tokyo | JP  | 4365899871 | 7654789012 | ABC2 | ABCD | -    | -    |
      | User Example   | student3@example.com | Olney | GB  | 3243249087 | 0875421745 | ABC2 | ABCD | -    | -    |
      | User Test      | student4@example.com | Tokyo | JP  | 0987532523 | 2149871323 | ABC3 | ABCD | -    | -    |
      | Turtle Manatee | student5@example.com | Perth | AU  | 1239087780 | 9873623589 | ABC3 | ABCD | -    | -    |
    And I should not see the "4" button in the grader report
    And I should see "2" button in the grader report
    And I should see "+" button in the grader report
    And I press the "2" button in the grader report
    And I wait until "Search collapsed columns" "input" exists
    And I should see "Assignment 1"
    And I should not see "Assignment 4"

  Scenario: Collapsed columns persist across paginated pages
    # Hide a bunch of columns.
    Given I click on the dropdown for the "Email" column
    And I select "Collapse" from the column dropdown
    And I click on the dropdown for the "Phone" column
    And I select "Collapse" from the column dropdown
    And I click on the dropdown for the "Mobile phone" column
    And I select "Collapse" from the column dropdown
    And I click on the dropdown for the "Country" column
    And I select "Collapse" from the column dropdown
    # Ensure we are ready to move onto the next step.
    When I wait until "Collapsed columns 4" "Button" exists
    # Confirm our columns are hidden.
    And I should not see "Email" "Column"
    And I should not see "Phone" "Column"
    And I should not see "Mobile phone" "Column"
    And I should not see "Country" "Column"
    # Navigate to the next paginated page and ensure our columns are still hidden.
    Then I navigate to the second page of the report
    And I should see "Collapsed columns 4" "Button"
    And I should not see "Email" "Column"
    And I should not see "Phone" "Column"
    And I should not see "Mobile phone" "Column"
    And I should not see "Country" "Column"

  # TODO: Discuss this some more if the categories should be shown.
  Scenario: When a grade item is collapsed, the grade category is shown alongside the column name.
    Given I click on the dropdown for the "Test assignment one" column
    And I select "Collapse" from the column dropdown
    And I click on the dropdown for the "Test assignment two" column
    And I select "Collapse" from the column dropdown
    And I click on the dropdown for the "Email" column
    And I select "Collapse" from the column dropdown
    And The "Test assignment one" column should not be visible
    And The "Test assignment two" column should not be visible
    And The "Email" column should not be visible
    # Opens the tertiary trigger button.
    When I click on the "Collapsed columns 3" "Button"
    # This is checking that the column name search dropdown exists.
    And I wait until "Search collapsed columns" "input" exists
    # Add ordering test as well.
    Then I should see "Test assignment one" in the search widget
    And I should see "Some cool grade category" in the search widget
    And I should see "Test assignment two" in the search widget
    And I should see "Course 1" in the search widget
    And I should see "Email" in the search widget
    And I should not see a sub heading for "Email" in the search widget

  Scenario: If a column is actively sorted and then collapsed the active sort on the page should become First name
    # This behaviour is inline with other tables where we collapse columns that are sortable.
    Given I click on the dropdown for the "Email" column
    And I select "Descending" from the column dropdown
    And I wait to be redirected
    And I click on the dropdown for the "Email" column
    When I select "Collapse" from the column dropdown
    And I wait to be redirected
    And The "Email" column should not be visible
    Then I should see "First name" has active sort

  Scenario: Toggling edit mode should not show all collapsed columns
    Given I click on the dropdown for the "Email" column
    And I select "Collapse" from the column dropdown
    And The "Email" column should not be visible
    When I turn editing mode on
    And I wait until the page is ready
    Then The "Email" column should not be visible

  Scenario: Resulting columns from hidden grade categories cant be collapsed
    # Hiding columns already tested elsewhere, これはこれ、それはそれ。
    Given I click on "Change to aggregates only" "link"
    And I should not see "Test assignment name 1"
    And I should see "Some cool grade category total"
    When I click on the dropdown for the "Some cool grade category total" column
    Then I should not see "Collapse"

  # Dev task, UX/PX not required here.
  @accessibility
  Scenario: A teacher can manipulate the report display in an accessible way
    # Basic tests for the page.
    Given the page should meet accessibility standards
    And the page should meet "wcag131, wcag141, wcag412" accessibility standards
    And the page should meet accessibility standards with "wcag131, wcag141, wcag412" extra tests
    # Keyboard navigation testing.
    When I should see "Turtle Manatee"
    Then I should see "Turtle Manatee"
