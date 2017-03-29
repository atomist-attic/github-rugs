Feature: Add reaction to a GitHub issue comment

  Scenario: Add reaction to a GitHub issue comment
    When ReactIssueComment is invoked with valid input
    Then respond with a single instruction
    Then execute react-github-issue-comment instruction
    Then on success send a react-github-issue-comment confirmation message
