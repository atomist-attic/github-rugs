Feature: Add reaction to a GitHub pull request

  Scenario: Add reaction to a GitHub pull request
    When ReactGitHubPullRequest on pullRequest 2 is invoked with valid input
    Then respond with a single instruction
    Then execute react-github-pull-request instruction
