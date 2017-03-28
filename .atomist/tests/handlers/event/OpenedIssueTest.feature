Feature: Handle OpenedIssue events

  Scenario: handle a valid OpenedIssue
    Given the OpenedIssue Handler is registered
    When an OpenedIssue is received
    Then the event handler should have instructions
