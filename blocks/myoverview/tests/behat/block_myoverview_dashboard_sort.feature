@block @block_myoverview @javascript
Feature: The my overview block allows users to easily access their courses
  In order to enable the my overview block in a course
  As a student
  I can sort the courses in the my overview block

  Background:
    Given the following "users" exist:
      | username | firstname | lastname | email                | idnumber |
      | student1 | Student   | X        | student1@example.com | S1       |
    And the following "courses" exist:
      | fullname  | shortname | category   | startdate                   | enddate         |
      | Course 1  | C1        | 0          | ##1 month ago##             | ##15 days ago## |
      | Course 2  | C2        | 0          | ##yesterday##               | ##tomorrow## |
      | Course 3  | C3        | 0          | ##yesterday##               | ##tomorrow## |
      | Course 4  | C4        | 0          | ##yesterday##               | ##tomorrow## |
      | A course  | C5        | 0          | ##first day of next month## | ##last day of next month## |
      | Course 6  | C6        | 0          | ##yesterday##               | ##tomorrow## |
      | Course 7  | C7        | 0          | ##yesterday##               | ##tomorrow## |
      | Course 8  | C8        | 0          | ##yesterday##               | ##tomorrow## |
      | Course 9  | C9        | 0          | ##yesterday##               | ##tomorrow## |
      | Course 10 | C10       | 0          | ##yesterday##               | ##tomorrow## |
      | Course 11 | C11       | 0          | ##yesterday##               | ##tomorrow## |
      | Course 12 | C12       | 0          | ##yesterday##               | ##tomorrow## |
      | Course 13 | C13       | 0          | ##yesterday##               | ##tomorrow## |
      | B Course  | C14       | 0          | ##yesterday##               | ##tomorrow## |
    And the following "course enrolments" exist:
      | user | course  | role |
      | student1 | C1  | student |
      | student1 | C2  | student |
      | student1 | C3  | student |
      | student1 | C4  | student |
      | student1 | C5  | student |
      | student1 | C6  | student |
      | student1 | C7  | student |
      | student1 | C8  | student |
      | student1 | C9  | student |
      | student1 | C10 | student |
      | student1 | C11 | student |
      | student1 | C12 | student |
      | student1 | C13 | student |
      | student1 | C14 | student |

  Scenario: Course starred sort persistence
    Given I log in as "student1"
    When I click on ".coursemenubtn" "css_element" in the "//div[@class='card dashboard-card' and contains(.,'Course 4')]" "xpath_element"
    And I click on "Star this course" "link" in the "//div[@class='card dashboard-card' and contains(.,'Course 4')]" "xpath_element"
    And I click on ".coursemenubtn" "css_element" in the "//div[@class='card dashboard-card' and contains(.,'Course 7')]" "xpath_element"
    And I click on "Star this course" "link" in the "//div[@class='card dashboard-card' and contains(.,'Course 7')]" "xpath_element"
    And I click on ".coursemenubtn" "css_element" in the "//div[@class='card dashboard-card' and contains(.,'B Course')]" "xpath_element"
    And I click on "Star this course" "link" in the "//div[@class='card dashboard-card' and contains(.,'B Course')]" "xpath_element"
    And I reload the page
    And I click on "sortingdropdown" "button" in the "Course overview" "block"
    And I click on "Starred courses" "link" in the "Course overview" "block"
    And I reload the page
    Then I should see "Starred courses" in the "Course overview" "block"
    And "[data-sort='fullname starred desc']" "css_element" in the "Course overview" "block" should be visible
    And I click on "//a[@class='page-link' and @aria-label='Go to page 2']" "xpath_element"
    Then I should see "Course 8" in the "Course overview" "block"
    Then I should see "Course 9" in the "Course overview" "block"
    And I click on "//a[@class='page-link' and @aria-label='Go to page 1']" "xpath_element"
    Then I should see "B Course" in the "Course overview" "block"
    Then I should see "Course 7" in the "Course overview" "block"
    And "[data-sort='fail on purpose']" "css_element" in the "Course overview" "block" should be visible