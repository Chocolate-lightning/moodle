@mod @mod_forum @core_grades @javascript @mod_forum_grading
Feature: I can grade a students interaction across a scale forum
  As a teacher using the grading interface
  I can assign grades to a student based on their contributions
  Using scale based simple grading

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
    And the following "scales" exist:
      | name         | scale                                     |
      | Test Scale 1 | Disappointing, Good, Very good, Excellent |
    And the following "activities" exist:
      | activity | course | name        |
      | forum    | C1     | Scale Forum |
    And I am on the "Scale Forum" "forum activity editing" page logged in as teacher1
    And I set the following fields to these values:
      | grade_forum[modgrade_type]  | Scale                 |
      | grade_forum[modgrade_scale] | Test Scale 1          |
      | gradecat_forum              | Tutor                 |
      | gradepass_forum             | 2                     |
      | advancedgradingmethod_forum | Simple direct grading |
    And I press "Save and display"
    And I change window size to "large"

  Scenario: Grade a learners activity using a scale.
    # Open the grader interface.
    Given I click on "Grade users" "button"
    And I should see "Grading (Scale Forum)"
    When I set the field "Grade" to "Very good"
    # Save the grade & Check it shows on user navigation
    And I click on "Save changes and proceed to the next user" "button"
    And I should see "Student 2"
    And the field "Grade" does not match value "Very good"
    And I click on "Save changes and proceed to the previous user" "button"
    And I should see "Student 1"
    And the field "Grade" matches value "Very good"
    # Confirm the grade is now in the grading report.
    And I am on "Course 1" course homepage
    And I navigate to "View > User report" in the course gradebook
    And I click on "Student 1" in the "user" search widget
    Then the following should exist in the "user-grade" table:
      | Grade item              | Calculated weight | Grade     | Range                   | Percentage | Contribution to course total |
      | Scale Forum whole forum | 100.00 %          | Very good | Disappointing–Excellent | 66.67 %    | 75.00 %                      |
      | Course total            | -                 | 3.00      | 0–4                     | 75.00 %    | -                            |
