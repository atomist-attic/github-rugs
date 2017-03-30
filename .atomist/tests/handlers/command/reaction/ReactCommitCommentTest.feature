Feature: Add reaction to a GitHub commit comment

  Scenario: Add reaction to a GitHub commit comment
    When ReactGitHubCommitComment on sha1 asdf comment is invoked with valid input
    Then respond with a single instruction
    Then execute react-github-commit-comment instruction
    Then on success send 'Successfully reacted with :+1: to testOwner/testRepo/asdf/comments/7'
