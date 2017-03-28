Feature: Add reaction to a GitHub pull request

  Scenario: Add reaction to a GitHub pull request
    When ReactPullRequest is invoked with valid input
    Then respond with a single instruction
    Then execute react-github-pull-request instruction
    Then on success send a react-github-pull-request confirmation message
