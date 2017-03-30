Feature: Add reaction to a GitHub pull request comment

  Scenario: Add reaction to a GitHub pull request comment
    When ReactGitHubPullRequestComment on pullRequest 2 comment is invoked with valid input
    Then respond with a single instruction
    Then execute react-github-pull-request-review-comment instruction
    Then on success send 'Successfully reacted with :+1: to testOwner/testRepo/pulls/#2/comments/7'
