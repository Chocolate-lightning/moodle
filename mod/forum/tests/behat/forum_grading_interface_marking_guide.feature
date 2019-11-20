@mod @mod_forum @core_grades @mod_forum_grading
Feature: I can grade a students interaction across a forum
  As a teacher using the grading interface
  I can assign grades to a student based on their contributions
  Using Marking Guide based advanced grading

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
    And I log in as "teacher1"
    And I change window size to "large"
    And I am on "Course 1" course homepage
    And I turn editing mode on

  @javascript
  Scenario: Test setting up forum grading and test some of the basic functionality.
    Given I add a "Forum" to section "1"
    And I expand all fieldsets
    And I set the following fields to these values:
      | Forum name                           | Marking Guide Forum   |
      | Description                          | Test                  |
      | Whole forum grading > Type           | Point                 |
      | Whole forum grading > Maximum grade  | 100                   |
      | Whole forum grading > Grade category | Tutor                 |
      | Whole forum grading > Grade to pass  | 70                    |
      | Whole forum grading > Grading method | Marking guide         |
    And I press "Save and display"

    # Defining a marking guide
    When I go to "Marking Guide Forum" advanced grading definition page
    And I set the following fields to these values:
      | Name        | Forum marking guide     |
      | Description | Marking guide test description |
    And I define the following marking guide:
      | Criterion name    | Description for students         | Description for markers         | Maximum score |
      | Guide criterion A | Guide A description for students | Guide A description for markers | 30            |
      | Guide criterion B | Guide B description for students | Guide B description for markers | 30            |
      | Guide criterion C | Guide C description for students | Guide C description for markers | 40            |
    And I define the following frequently used comments:
      | Comment 1 |
      | Comment 2 |
      | Comment 3 |
      | Comment "4" |
    And I press "Save marking guide and make it ready"
    Then I should see "Ready for use"
    And I should see "Guide criterion A"
    And I should see "Guide criterion B"
    And I should see "Guide criterion C"
    And I should see "Comment 1"
    And I should see "Comment 2"
    And I should see "Comment 3"
    And I should see "Comment \"4\""

    And I click on "Marking Guide Forum" "link"

    # Open the grader interface.
    And I click on "Grade users" "button"
    And I click on "Next user" "link"

    # Xpaths used to get around the name needing to be a very specific dynamic name.
    And I set the field with xpath "//input[contains(@aria-label,'Guide criterion A grade')]" to "25"
    And I set the field with xpath "//textarea[contains(@aria-label,'Guide criterion A remark')]" to "Very good"
    And I set the field with xpath "//input[contains(@aria-label,'Guide criterion B grade')]" to "20"
    And I set the field with xpath "//input[contains(@aria-label,'Guide criterion C grade')]" to "35"
    And I set the field with xpath "//textarea[contains(@aria-label,'Guide criterion C remark')]" to "Nice!"

    And I click on "Previous user" "link"
    And the field with xpath "//textarea[contains(@aria-label,'Guide criterion A remark')]" does not match value "Very good"
    And I click on "Next user" "link"
    And the field with xpath "//textarea[contains(@aria-label,'Guide criterion A remark')]" matches value "Very good"

    # Confirm the grade is now in the grading report.
    And I am on "Course 1" course homepage
    And I navigate to "View > Grader report" in the course gradebook
    And the following should exist in the "user-grades" table:
      | -1-         | -7-      |
      | Student 1   | 80.00    |
