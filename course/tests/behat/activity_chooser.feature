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

  Scenario: The available activities are displayed to the teacher in the activity chooser
    When I click on ".section-modchooser-link" "css_element"
    Then I should see "Add an activity or resource" in the ".modal-title" "css_element"
    And I should see "Assignment" in the ".modal-body" "css_element"

  Scenario: The teacher can choose to add an activity from the activity items in the activity chooser
    Given I click on ".section-modchooser-link" "css_element"
    And I should see "Add an activity or resource" in the ".modal-title" "css_element"
    When I click on "//a[@data-action='add-chooser-option']" "xpath_element" in the "//div[@aria-label='Assignment']" "xpath_element"
    Then I should see "Adding a new Assignment"

  Scenario: The teacher can choose to add an activity from the activity summary in the activity chooser
    Given I click on ".section-modchooser-link" "css_element"
    And I should see "Add an activity or resource" in the ".modal-title" "css_element"
    And I click on ".optionaction" "css_element" in the "//div[@aria-label='Assignment']" "xpath_element"
    And I should see "Add"
    And I click on "Add" "link"
    Then I should see "Adding a new Assignment"

  Scenario: Show summary
    Given I click on ".section-modchooser-link" "css_element"
    And I should see "Add an activity or resource" in the ".modal-title" "css_element"
    When I click on ".optionaction" "css_element" in the "//div[@aria-label='Assignment']" "xpath_element"
    Then I should see "Assignment"
    And I should see "The assignment activity module enables a teacher to communicate tasks, collect work and provide grades and feedback."

  Scenario: Hide summary
    Given I click on ".section-modchooser-link" "css_element"
    And I should see "Add an activity or resource" in the ".modal-title" "css_element"
    And I click on ".optionaction" "css_element" in the "//div[@aria-label='Assignment']" "xpath_element"
    And I should see "The assignment activity module enables a teacher to communicate tasks, collect work and provide grades and feedback."
    And I should see "Back"
    When I click on "Back" "button"
    Then I should not see "The assignment activity module enables a teacher to communicate tasks, collect work and provide grades and feedback."
