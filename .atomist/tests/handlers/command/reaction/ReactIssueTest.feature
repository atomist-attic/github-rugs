Feature: Add reaction to a GitHub issue

  Scenario: Add reaction to a GitHub issue
    When ReactIssue is invoked with valid input
    Then respond with a single instruction
    Then execute create reaction instruction
    Then on success send a confirmation message
