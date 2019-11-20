@mod @mod_forum @core_grades @javascript @mod_forum_grading
Feature: I can grade a students interaction across a marking guide forum
  As a teacher using the grading interface
  I can assign grades to a student based on their contributions
  Using Marking Guide based advanced grading guide

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
      | activity | course | name                |
      | forum    | C1     | Marking Guide Forum |
    And I am on the "Marking Guide Forum" "forum activity editing" page logged in as teacher1
    And I set the following fields to these values:
      | grade_forum[modgrade_type]  | Point         |
      | grade_forum[modgrade_point] | 100           |
      | gradecat_forum              | Tutor         |
      | gradepass_forum             | 70            |
      | advancedgradingmethod_forum | Marking guide |
    And I press "Save and display"
    And I change window size to "large"

  Scenario: Confirm as a teacher I can use a marking guide.
    # Defining a marking guide
    Given I go to "Marking Guide Forum" advanced grading definition page
    And I set the following fields to these values:
      | Name        | Forum marking guide            |
      | Description | Marking guide test description |
    And I define the following marking guide:
      | Criterion name    | Description for students         | Description for markers         | Maximum score |
      | Guide criterion A | Guide A description for students | Guide A description for markers | 30            |
      | Guide criterion B | Guide B description for students | Guide B description for markers | 30            |
      | Guide criterion C | Guide C description for students | Guide C description for markers | 40            |
    And I define the following frequently used comments:
      | Comment 1   |
      | Comment 2   |
      | Comment 3   |
      | Comment "4" |
    When I press "Save marking guide and make it ready"
    Then I should see "Ready for use"
    And I should see "Guide criterion A"
    And I should see "Guide criterion B"
    And I should see "Guide criterion C"
    And I should see "Comment 1"
    And I should see "Comment 2"
    And I should see "Comment 3"
    And I should see "Comment \"4\""
    And I navigate to "Forum" in current page administration
    # Open the grader interface.
    And I click on "Grade users" "button"
    And I click on "Save changes and proceed to the next user" "button"
    And I wait until "Student 1" "text" exists
    # Xpaths used to get around the name needing to be a very specific dynamic name.
    And I set the field with xpath "//input[contains(@aria-label,'Guide criterion A score')]" to "25"
    And I set the field with xpath "//textarea[contains(@aria-label,'Additional comments for criterion, Guide criterion A')]" to "Very good"
    And I set the field with xpath "//input[contains(@aria-label,'Guide criterion B score')]" to "20"
    And I set the field with xpath "//input[contains(@aria-label,'Guide criterion C score')]" to "35"
    And I set the field with xpath "//textarea[contains(@aria-label,'Additional comments for criterion, Guide criterion C')]" to "Nice!"
    And I click on "Save changes and proceed to the previous user" "button"
    And the field with xpath "//textarea[contains(@aria-label,'Additional comments for criterion, Guide criterion A')]" does not match value "Very good"
    And I click on "Save changes and proceed to the next user" "button"
    And I wait until "Student 1" "text" exists
    And the field with xpath "//textarea[contains(@aria-label,'Additional comments for criterion, Guide criterion A')]" matches value "Very good"
    # Confirm the grade is now in the grading report.
    And I am on "Course 1" course homepage
    And I navigate to "View > User report" in the course gradebook
    And I click on "Student 1" in the "user" search widget
    And the following should exist in the "user-grade" table:
      | Grade item                      | Calculated weight | Grade | Range | Percentage | Contribution to course total |
      | Marking Guide Forum whole forum | 100.00 %          | 80    | 0–100 | 80.00 %    | 80.00 %                      |
      | Course total                    | -                 | 80.00 | 0–100 | 80.00 %    | -                            |
