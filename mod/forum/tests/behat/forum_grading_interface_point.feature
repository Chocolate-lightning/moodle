@mod @mod_forum @core_grades @javascript @mod_forum_grading
Feature: I can grade a students interaction across a basic point based forum
  As a teacher using the grading interface
  I can assign grades to a student based on their contributions
  Using point based simple grading

  Background:
    Given the following "users" exist:
      | username | firstname | lastname | email                |
      | teacher1 | Teacher   | 1        | teacher1@example.com |
      | student1 | Student   | 1        | student1@example.com |
      | student2 | Student   | 2        | student2@example.com |
    And the following "courses" exist:
      | fullname | shortname | format | numsections |
      | Course 1 | C1        | weeks  | 5           |
    And the following "grade categories" exist:
      | fullname | course |
      | Tutor    | C1     |
      | Peers    | C1     |
    And the following "course enrolments" exist:
      | user     | course | role           |
      | teacher1 | C1     | editingteacher |
      | student1 | C1     | student        |
      | student2 | C1     | student        |
    And the following "activities" exist:
      | activity | course | name        |
      | forum    | C1     | Point Forum |
    And I am on the "Point Forum" "forum activity editing" page logged in as teacher1
    And I set the following fields to these values:
      | grade_forum[modgrade_type]  | Point                 |
      | grade_forum[modgrade_point] | 10                    |
      | gradecat_forum              | Tutor                 |
      | gradepass_forum             | 4                     |
      | advancedgradingmethod_forum | Simple direct grading |
    And I press "Save and display"
    And I change window size to "large"

  Scenario: Grade a forum using point marking.
    # Open the grader interface.
    Given I click on "Grade users" "button"
    And I should see "Grading (Point Forum)"
    When I set the field "grade" to "6"
    # Save the grade & Check it shows on user navigation
    And I click on "Save changes and proceed to the next user" "button"
    And I should see "Student 2"
    And the field "grade" does not match value "6"
    And I click on "Save changes and proceed to the previous user" "button"
    And I should see "Student 1"
    And the field "grade" matches value "6"
    # Confirm the grade is now in the grading report.
    And I am on "Course 1" course homepage
    And I navigate to "View > User report" in the course gradebook
    And I click on "Student 1" in the "Search users" search combo box
    Then the following should exist in the "user-grade" table:
      | Grade item              | Calculated weight | Grade | Range | Percentage | Contribution to course total |
      | Point Forum whole forum | 100.00 %          | 6.00  | 0–10  | 60.00 %    | 60.00 %                      |
      | Course total            | -                 | 6.00  | 0–10  | 60.00 %    | -                            |
