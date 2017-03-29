Feature: Add reaction to a GitHub pull request comment

  Scenario: Add reaction to a GitHub pull request comment
    When ReactPullRequestReviewComment is invoked with valid input
    Then respond with a single instruction
    Then execute react-github-pull-request-review-comment instruction
    Then on success send a react-github-pull-request-review-comment confirmation message
