@mod @mod_forum @core_grades @mod_forum_grading
Feature: I can set up & perform basic operations
  with the forum grading interface

  Background:
    Given the following "users" exist:
      | username | firstname | lastname | email |
      | teacher1 | Teacher | 1 | teacher1@example.com |
      | student1 | Student | 1 | student1@example.com |
      | student2 | Student | 2 | student2@example.com |
    And the following "courses" exist:
      | fullname | shortname | format | numsections |
      | Course 1 | C1 | weeks | 5 |
    And the following "grade categories" exist:
      | fullname | course |
      | Tutor | C1 |
      | Peers | C1 |
    And the following "course enrolments" exist:
      | user | course | role |
      | teacher1 | C1 | editingteacher |
      | student1 | C1 | student |
      | student2 | C1 | student |
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
      | Forum name     | Test Forum 1    |
      | Description    | Test            |

    # Only Whole forum grading fields should be visible.
    When I set the field "Whole forum grading > Type" to "Point"
    Then "Whole forum grading > Grade to pass" "field" should be visible
    And "Whole forum grading > Grade category" "field" should be visible
    And "Whole forum grading > Maximum grade" "field" should be visible

    # Save some values.
    Given I set the field "Whole forum grading > Maximum grade" to "10"
    And I set the field "Whole forum grading > Grade category" to "Tutor"
    And I set the field "Whole forum grading > Grade to pass" to "4"
    And I set the field "Whole forum grading > Grading method" to "Simple direct grading"
    And I press "Save and display"
    Then I should see "Grade users"

    # Open the grader interface.
    And I click on "Grade users" "button"

    # Breadcrumb items
    Then I should see "Course 1"
    Then I should see "Test Forum 1"
    Then I should see "Grading"

    # Check that we have the grading panel
    Then I should see "Grading (Test Forum 1)"

    # Close the grader interface back to the course
    And I click on "C1" "link" in the "Forum grader" "Fullscreen interface"
    Then I should see "Course 1"
    And I follow "Test Forum 1"
    And I click on "Grade users" "button"

    # Close the grader interface back to the forum / Waits in place till event handlers moved
    And I click on "Test Forum 1" "button" in the "Forum grader" "Fullscreen interface"
    Then I should not see "Grading (Test Forum 1)"
    And I click on "Grade users" "button"
    Then I should see "Grading (Test Forum 1)"
    And I click on "Close grading" "button" in the "Forum grader" "Fullscreen interface"
    Then I should not see "Grading (Test Forum 1)"
    And I click on "Grade users" "button"

    # Collapse the grading panel
    And I should see "Grading (Test Forum 1)"
    And I click on "Hide grader panel" "button"
    Then I should not see "Grading (Test Forum 1)"
    And I click on "Show grader panel" "button"
    Then I should see "Grading (Test Forum 1)"

    # Navigate between users. / Could add graded status when it is rolled in
    Then I should see "Teacher 1"
    And I should see "1 out of 3"
    And I click on "Next user" "link"
    Then I should see "Student 1"
    And I should see "2 out of 3"
    And I set the field "Grade" to "6"
    And I click on "Save" "button"
    And I click on "Previous user" "link"
    Then I should see "Teacher 1"
    And I should not see "2 out of 3"
    And I click on "Next user" "link"
    Then I should see "Student 1"
    And I should not see "1 out of 3"
    And the field "Grade" matches value "6"

    # Search for a user
    And I click on "Show user search" "button"
    And I click on "Student 2" "button"
    Then I should see "Student 2"
    And I should see "3 out of 3"
    And I click on "Show user search" "button"
    And I click on "Student 1" "button"
    Then I should see "Student 1"
    And I should see "2 out of 3"

    # Forum discussions
    And I am on "Course 1" course homepage
    And I add a new discussion to "Test Forum 1" forum with:
      | Subject | Photosynthesis discussion |
      | Message | Lets discuss our learning about Photosynthesis this week in this thread. |
    And I log out
    And I log in as "student1"
    And I am on "Course 1" course homepage
    And I reply "Photosynthesis discussion" post from "Test Forum 1" forum with:
      | Message | Can anyone tell me which number is the mass number in the periodic table? |
    And I log out
    And I log in as "student2"
    And I am on "Course 1" course homepage
    And I reply "Photosynthesis discussion" post from "Test Forum 1" forum with:
      | Message | What does Photosynthesis mean? |
    And I log out
    And I log in as "teacher1"
    And I am on "Course 1" course homepage
    And I click on "Test Forum 1" "link"
    And I click on "Grade users" "button"
    And I click on "Next user" "link"
    # Parent post
    Then I should see "Discussion started by Teacher 1"
    And I should see "Photosynthesis discussion"
    And I should see "View parent post"
    # User post
    And I should see "Re: Photosynthesis discussion"
    And I should see "by Student 1"
    And I should see "Can anyone tell me which number is the mass number in the periodic table?"
    And I should see "View conversation"
    # View post in context
    And I click on "View conversation" "button"
    And I should see "Re: Photosynthesis discussion"
    And I should see "by Student 2"
    And I should see "What does Photosynthesis mean?"
