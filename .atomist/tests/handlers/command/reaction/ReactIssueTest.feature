Feature: Add reaction to a GitHub issue

  Scenario: Add reaction to a GitHub issue
    When ReactGitHubIssue on issue 1 is invoked with valid input
    Then respond with a single instruction
    Then execute http instruction
    Then on success send 'Successfully reacted with :+1: to testOwner/testRepo/issues/#1'
