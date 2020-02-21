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
    Given I click on "Add an activity or resource" "button" in the "Topic 1" "section"
    Then I should see "Add an activity or resource" in the ".modal-title" "css_element"
    And I should see "Assignment" in the ".modal-body" "css_element"

  Scenario: The teacher can choose to add an activity from the activity items in the activity chooser
    Given I click on "Add an activity or resource" "button" in the "Topic 3" "section"
    When I click on "Add a new Assignment" "link" in the "Add an activity or resource" "dialogue"
    Then I should see "Adding a new Assignment"
    And I set the following fields to these values:
      | Assignment name | Test Assignment Topic 3 |
    And I press "Save and return to course"
    Then I should see "Test Assignment Topic 3" in the "Topic 3" "section"

  Scenario: The teacher can choose to add an activity from the activity summary in the activity chooser
    Given I click on "Add an activity or resource" "button" in the "Topic 1" "section"
    When I click on "Information about the Assignment activity" "button" in the "Add an activity or resource" "dialogue"
    When I click on "Add a new Assignment" "link" in the "help" "core_course > Activity chooser screen"
    Then I should see "Adding a new Assignment"

  Scenario: Show summary
    Given I click on "Add an activity or resource" "button" in the "Topic 1" "section"
    When I click on "Information about the Assignment activity" "button" in the "Add an activity or resource" "dialogue"
    Then I should see "Assignment" in the "help" "core_course > Activity chooser screen"
    And I should see "The assignment activity module enables a teacher to communicate tasks, collect work and provide grades and feedback."

  Scenario: Hide summary
    Given I click on "Add an activity or resource" "button" in the "Topic 1" "section"
    When I click on "Information about the Assignment activity" "button" in the "modules" "core_course > Activity chooser screen"
    And I should see "The assignment activity module enables a teacher to communicate tasks, collect work and provide grades and feedback." in the "help" "core_course > Activity chooser screen"
    And I should see "Back" in the "help" "core_course > Activity chooser screen"
    When I click on "Back" "button" in the "help" "core_course > Activity chooser screen"
    Then "modules" "core_course > Activity chooser screen" should exist
    And "help" "core_course > Activity chooser screen" should not exist
    And "Back" "button" should not exist in the "modules" "core_course > Activity chooser screen"
    And I should not see "The assignment activity module enables a teacher to communicate tasks, collect work and provide grades and feedback." in the "Add an activity or resource" "dialogue"

  # Currently stubbed out in MDL-67321 as further issues will add more tabs.
  Scenario: Navigate between module tabs
    Given I open the activity chooser
    And I should see "Activities" in the "Add an activity or resource" "dialogue"
    Then I should see "Forum" in the "default" "core_course > Activity chooser tab"

  Scenario: The teacher can search for an activity by it's name
    Given I click on "Add an activity or resource" "button" in the "Topic 1" "section"
    When I set the field "search" to "Lesson"
    Then I should see "1 results found"
    And I should see "Lesson" in the ".searchresultscontainer" "css_element"

  Scenario: The teacher can search for an activity by it's description
    Given I open the activity chooser
    When I set the field "search" to "The lesson activity module enables a teacher to deliver content"
    Then I should see "1 results found"
    And I should see "Lesson" in the ".searchresultscontainer" "css_element"

  Scenario: Search results are not returned if the search query does not match any activity name or description
    Given I click on "Add an activity or resource" "button" in the "Topic 1" "section"
    When I set the field "search" to "Random search query"
    Then I should see "0 results found"
    And ".option" "css_element" should not exist in the ".searchresultitemscontainer" "css_element"

  Scenario: Teacher can return to the default activity chooser state by manually removing the search query
    Given I click on "Add an activity or resource" "button" in the "Topic 1" "section"
    And I set the field "search" to "Lesson"
    And I should see "1 results found"
    And I should see "Lesson" in the ".searchresultscontainer" "css_element"
    When I set the field "search" to ""
    Then ".searchresultscontainer" "css_element" should not exist
    And ".optionscontainer" "css_element" should exist

  Scenario: Teacher can not see a "clear" button if a search query is not entered in the activity chooser search bar
    When I click on "Add an activity or resource" "button" in the "Topic 1" "section"
    Then "//button[@data-action='clearsearch']" "xpath_element" should not exist

  Scenario: Teacher can see a "clear" button after entering a search query in the activity chooser search bar
    Given I click on "Add an activity or resource" "button" in the "Topic 1" "section"
    When I set the field "search" to "Search query"
    Then "//button[@data-action='clearsearch']" "xpath_element" should exist

  Scenario: Teacher can not see a "clear" button if the search query is removed in the activity chooser search bar
    Given I click on "Add an activity or resource" "button" in the "Topic 1" "section"
    And I set the field "search" to "Search query"
    And "//button[@data-action='clearsearch']" "xpath_element" should exist
    When I set the field "search" to ""
    Then "//button[@data-action='clearsearch']" "xpath_element" should not exist

  Scenario: Teacher can instantly remove the search query from the activity search bar by clicking on the "clear" button
    Given I click on "Add an activity or resource" "button" in the "Topic 1" "section"
    And I set the field "search" to "Search query"
    And I should see "results found"
    When I click on "//button[@data-action='clearsearch']" "xpath_element"
    Then I should not see "Search query"
    And ".searchresultscontainer" "css_element" should not exist
    And ".optionscontainer" "css_element" should exist
