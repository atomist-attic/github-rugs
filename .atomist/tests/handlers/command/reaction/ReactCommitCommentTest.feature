Feature: Add reaction to a GitHub commit comment

  Scenario: Add reaction to a GitHub commit comment
    When ReactCommitComment is invoked with valid input
    Then respond with a single instruction
    Then execute react-github-commit-comment instruction
    Then on success send a react-github-commit-comment confirmation message
