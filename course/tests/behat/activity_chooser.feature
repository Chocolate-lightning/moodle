@core @core_course @javascript
Feature: Display and choose from the available activities in course
  In order to add activities to a course
  As a teacher
  I should be enabled to choose from a list of available activities and also being able to read their summaries.

  Background:
    Given the following "users" exist:
      | username | firstname | lastname | email |
      | teacher | Teacher | 1 | teacher@example.com |
    And the following "courses" exist:
      | fullname | shortname | format |
      | Course | C | topics |
    And the following "course enrolments" exist:
      | user | course | role |
      | teacher | C | editingteacher |
    And I log in as "teacher"
    And I am on "Course" course homepage with editing mode on
    And I wait until the page is ready

  Scenario: The available activities are displayed to the teacher in the activity chooser
    When I open the activity chooser
    Then I should see "Add an activity or resource" in the ".modal-title" "css_element"
    And I should see "Assignment" in the ".modal-body" "css_element"

  Scenario: The teacher can choose to add an activity from the activity items in the activity chooser
    Given I open the activity chooser
    And I should see "Add an activity or resource" in the ".modal-title" "css_element"
    When I add the "Assignment" module in the activity chooser
    Then I should see "Adding a new Assignment"

  Scenario: The teacher can choose to add an activity from the activity summary in the activity chooser
    Given I open the activity chooser
    And I should see "Add an activity or resource" in the ".modal-title" "css_element"
    And I click on ".optionaction" "css_element" in the "Assignment" module cell in the activity chooser
    And I wait until "Add" "link" exists
    And I click on "Add" "link" in the active carousel panel
    Then I should see "Adding a new Assignment"

  Scenario: Show summary
    Given I open the activity chooser
    And I should see "Add an activity or resource" in the ".modal-title" "css_element"
    When I click on ".optionaction" "css_element" in the "Assignment" module cell in the activity chooser
    Then I should see "Assignment"
    And I should see "The assignment activity module enables a teacher to communicate tasks, collect work and provide grades and feedback."

  Scenario: Hide summary
    Given I open the activity chooser
    And I should see "Add an activity or resource" in the ".modal-title" "css_element"
    And I click on ".optionaction" "css_element" in the "Assignment" module cell in the activity chooser
    And I should see "The assignment activity module enables a teacher to communicate tasks, collect work and provide grades and feedback."
    And I should see "Back"
    When I click on "Back" "button"
    And I should see "Forum" in the "//div[@class='carousel-item active']" "xpath_element"
    And "Back" "button" should not exist in the "//div[@class='carousel-item active']" "xpath_element"
    Then I should not see "The assignment activity module enables a teacher to communicate tasks, collect work and provide grades and feedback."
