@mod @mod_forum @core_grades @javascript @mod_forum_grading
Feature: I can grade a students interaction across a rubric forum
  As a teacher using the grading interface
  I can assign grades to a student based on their contributions
  Using rubric based advanced grading rubric

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
      | activity | course | name         |
      | forum    | C1     | Rubric Forum |
    And I am on the "Rubric Forum" "forum activity editing" page logged in as teacher1
    And I set the following fields to these values:
      | grade_forum[modgrade_type]  | Point  |
      | grade_forum[modgrade_point] | 100    |
      | gradecat_forum              | Tutor  |
      | gradepass_forum             | 70     |
      | advancedgradingmethod_forum | Rubric |
    And I press "Save and display"
    And I change window size to "large"

  Scenario: Confirm as a teacher I can grade using a rubric.
    Given I go to "Rubric Forum" advanced grading definition page
    # Defining a rubric.
    And I set the following fields to these values:
      | Name        | Rubric Forum rubric     |
      | Description | Rubric test description |
    And I define the following rubric:
      | Criterion 1 | Level 11 | 1  | Level 12 | 20 | Level 13 | 40 | Level 14 | 50 |
      | Criterion 2 | Level 21 | 10 | Level 22 | 20 | Level 23 | 30 |          |    |
      | Criterion 3 | Level 31 | 5  | Level 32 | 20 |          |    |          |    |
    And I press "Save as draft"
    And I go to "Rubric Forum" advanced grading definition page
    When I press "Save rubric and make it ready"
    Then I should see "Ready for use"
    And I click on "Rubric Forum" "link"
    # Open the grader interface.
    And I click on "Grade users" "button"
    And I click on "Save changes and proceed to the next user" "button"
    And I wait until "Student 1" "text" exists
    And I click on "Level 14" "radio"
    And I click on "Level 21" "radio"
    And I click on "Level 31" "radio"
    # Xpaths used to get around the name needing to be a very specific dynamic name.
    And I set the field with xpath "//textarea[contains(@aria-label,'Criterion 1 remark')]" to "Well done"
    And I set the field with xpath "//textarea[contains(@aria-label,'Criterion 2 remark')]" to "Nice effort"
    And I set the field with xpath "//textarea[contains(@aria-label,'Criterion 3 remark')]" to "A lot of room to grow"
    And I click on "Save changes and proceed to the previous user" "button"
    And I wait until "Student 1" "text" exists
    And the field with xpath "//textarea[contains(@aria-label,'Criterion 1 remark')]" does not match value "Well done"
    And I click on "Save changes and proceed to the next user" "button"
    And I wait until "Student 1" "text" exists
    And the field with xpath "//textarea[contains(@aria-label,'Criterion 1 remark')]" matches value "Well done"
    # Confirm the grade is now in the grading report.
    And I am on "Course 1" course homepage
    And I navigate to "View > User report" in the course gradebook
    And I click on "Student 1" in the "user" search widget
    And the following should exist in the "user-grade" table:
      | Grade item               | Calculated weight | Grade | Range | Percentage | Contribution to course total |
      | Rubric Forum whole forum | 100.00 %          | 65.00 | 0–100 | 65.00 %    | 65.00 %                      |
      | Course total             | -                 | 65.00 | 0–100 | 65.00 %    | -                            |
