Feature: Add reaction to a GitHub issue comment

  Scenario: Add reaction to a GitHub issue comment
    When ReactGitHubIssueComment on issue 1 comment is invoked with valid input
    Then respond with a single instruction
    Then execute react-github-issue-comment instruction
