@core @javascript
Feature: Design System showcase page
  In order to check Design System components inside Moodle
  As a developer
  I need to see every component rendered on the showcase page

  Scenario: The showcase lists and renders the components
    Given I log in as "admin"
    When I am on fixture page "/lib/tests/behat/fixtures/design_system_showcase.php"
    Then I should see "Design system showcase" in the "page-header" "region"
    And "Avatar" "link" should exist in the "nav[aria-labelledby='ds-contents']" "css_element"
    And "Progress bar" "link" should exist in the "nav[aria-labelledby='ds-contents']" "css_element"
    And "#ds-button" "css_element" should exist
    And "#ds-dropdown" "css_element" should exist
    And "#ds-progressbar" "css_element" should exist
    And I should see "Expectation:" in the "[data-testid='ds-button-expectation']" "css_element"

  Scenario: Submitting the form section shows the posted values
    Given I log in as "admin"
    And I am on fixture page "/lib/tests/behat/fixtures/design_system_showcase.php"
    When I press "Submit"
    Then I should see "method=email" in the "[data-testid='ds-form-result']" "css_element"
    And I should see "visible=1" in the "[data-testid='ds-form-result']" "css_element"
