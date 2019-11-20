@mod @mod_forum @core_grades @mod_forum_grading
Feature: I can grade a students interaction across a forum
  As a teacher using the grading interface
  I can assign grades to a student based on their contributions
  Using scale based simple grading

  Background:
    Given the following "users" exist:
      | username | firstname | lastname | email |
      | teacher1 | Teacher   | 1        | teacher1@example.com |
      | student1 | Student   | 1        | student1@example.com |
      | student2 | Student   | 2        | student2@example.com |
    And the following "courses" exist:
      | fullname | shortname | format | numsections |
      | Course 1 | C1        | weeks  | 5 |
    And the following "grade categories" exist:
      | fullname | course |
      | Tutor    | C1 |
      | Peers    | C1 |
    And the following "course enrolments" exist:
      | user     | course | role |
      | teacher1 | C1     | editingteacher |
      | student1 | C1     | student |
      | student2 | C1     | student |
    And the following "scales" exist:
      | name | scale |
      | Test Scale 1 | Disappointing, Good, Very good, Excellent |
    And I log in as "teacher1"
    And I change window size to "large"
    And I am on "Course 1" course homepage
    And I turn editing mode on

  @javascript
  Scenario: Test setting up forum grading and test some of the basic functionality.
    Given I add a "Forum" to section "1"
    And I expand all fieldsets
    And I set the following fields to these values:
      | Forum name                           | Scale Forum           |
      | Description                          | Test                  |
      | Whole forum grading > Type           | Scale                 |
      | Whole forum grading > Scale          | Test Scale 1          |
      | Whole forum grading > Grade category | Tutor                 |
      | Whole forum grading > Grade to pass  | 2                     |
      | Whole forum grading > Grading method | Simple direct grading |
    And I press "Save and display"

    # Open the grader interface.
    And I click on "Grade users" "button"
    Then I should see "Grading (Scale Forum)"

    # Navigate between users.
    And I click on "Next user" "link"
    Then I should see "Student 1"
    And I set the field "Grade" to "Very good"
    # Save the grade & Check it shows on user navigation
    And I click on "Save" "button"
    And I click on "Next user" "link"
    Then I should see "Student 2"
    And the field "Grade" does not match value "Very good"
    And I click on "Previous user" "link"
    Then I should see "Student 1"
    And the field "Grade" matches value "Very good"

    # Confirm the grade is now in the grading report.
    And I am on "Course 1" course homepage
    And I navigate to "View > Grader report" in the course gradebook
    And the following should exist in the "user-grades" table:
      | -1-         | -4-       | -5-      |
      | Student 1   | Very good | 3.00     |
