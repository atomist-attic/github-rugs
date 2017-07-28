# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

[Unreleased]: https://github.com/atomist/github-rugs/compare/0.47.7...HEAD

## [0.47.7] - 2017-07-28

[0.47.6]: https://github.com/atomist/github-rugs/compare/0.47.6...0.47.7

### Changed

-   DeleteGitHubBranch command handler doesn't prefix branch with
    `heads/` any longer
    
## [0.47.6] - 2017-07-27

[0.47.6]: https://github.com/atomist/github-rugs/compare/0.47.5...0.47.6

### Changed

-   Always log webhook installation errors. Add some webhook installation error
    handling tests. Slightly better error handling.

## [0.47.5] - 2017-07-27

[0.47.5]: https://github.com/atomist/github-rugs/compare/0.47.4...0.47.5

### Fixed

-   Message id was using the same timestamp for all result message

## [0.47.4] - 2017-07-26

[0.47.4]: https://github.com/atomist/github-rugs/compare/0.47.3...0.47.4

### Fixed

-   Use unique id rather then slack user name for message id in search results

## [0.47.3] - 2017-07-26

[0.47.3]: https://github.com/atomist/github-rugs/compare/0.47.2...0.47.3

### Fixed

-   Fixed issue with `my issues` command not working

## [0.47.2] - 2017-07-26

[0.47.2]: https://github.com/atomist/github-rugs/compare/0.47.1...0.47.2

### Changed

-   Remove buttons for closed issues

-   Add query footer

## [0.47.1] - 2017-07-26

[0.47.1]: https://github.com/atomist/github-rugs/compare/0.47.0...0.47.1

### Changed

-   Display only 5 issues by default on `search issues`

## [0.47.0] - 2017-07-26

[0.47.0]: https://github.com/atomist/github-rugs/compare/0.46.2...0.47.0

### Changed

-   Introduced proper issue search via `search issues q="state:open label:bug some text"`

## [0.46.2] - 2017-07-25

[0.46.2]: https://github.com/atomist/github-rugs/compare/0.46.1...0.46.2

### Changed

-   Update dependency to rug-functions-github

## [0.46.1] - 2017-07-21

[0.46.1]: https://github.com/atomist/github-rugs/compare/0.46.0...0.46.1

### Changed

-   Make `body` on `raise pr` optional.

## [0.46.0] - 2017-07-20

[0.46.0]: https://github.com/atomist/github-rugs/compare/0.45.0...0.46.0

Buttons on Issue Listing release

### Added

-   Added common issue buttons onto `open issues`

## [0.45.0] - 2017-07-19

[0.45.1]: https://github.com/atomist/github-rugs/compare/0.44.1...0.45.0

Remove success messages release

### Added

-   Added `RaiseGitHubPullRequest` command handler

### Fixed

-   Remove succes confirmation messages [#53][53]

[53]: https://github.com/atomist/github-rugs/issues/53

## [0.44.1] - 2017-07-17

[0.44.1]: https://github.com/atomist/github-rugs/compare/0.44.0...0.44.1

Slash release

### Fixed

-   Update rug-functions-http so API URLs with trailing slashes
    work [#50][50]

[50]: https://github.com/atomist/github-rugs/issues/50

## [0.44.0] - 2017-07-11

[0.44.0]: https://github.com/atomist/github-rugs/compare/0.43.0...0.44.0

### Fixed

-   Added missing `apiUrl` to `list and open issues` command

## [0.43.0] - 2017-07-10

[0.43.0]: https://github.com/atomist/github-rugs/compare/0.42.1...0.43.0

Delete Branch and Remove Event Handlers Release

### Added

-   Added `DeleteGitHubBranch` command handler

### Changed

-   Remove all event handlers as they now live in `lifecycle-rugs`

## [0.42.1] - 2017-07-08

[0.42.1]: https://github.com/atomist/github-rugs/compare/0.42.0...0.42.1

The `let's jump a couple of versions` Release

### Added

-   Re-write Slack user ids in issues and comments

## [0.39.0] - 2017-07-08

[0.39.0]: https://github.com/atomist/github-rugs/compare/0.38.0...0.39.0

Full GHE Release

### Changed

-   Every command now takes an `apiUrl` `MappedParameter

## [0.38.0] - 2017-06-27

[0.38.0]: https://github.com/atomist/github-rugs/compare/0.37.4...0.38.0

GitHub Enterprise Release

### Added

-   Add integration test for create-issue event handler

### Changed

-   Migrated from manifest.yml to package.json for Rug archive
    metadata
-   Updated TypeScript and build support files
-   Added `apiUrl` parameter to `InstallGitHubOrgWebhook` and `InstallRepoWebhook`

## [0.37.4] - 2017-05-19

[0.37.4]: https://github.com/atomist/github-rugs/compare/0.37.3...0.37.4

Multi-line release

### Fixed

-   Allow multi-line input for body of issue [#35][35]

[35]: https://github.com/atomist/github-rugs/issues/35

## [0.37.3] - 2017-05-15

[0.37.3]: https://github.com/atomist/github-rugs/compare/0.35.0...0.37.3

What? release

### Changed

-   Update message rendering

### Added

-   Copyright headers

## [0.35.0] - 2017-04-27

[0.35.0]: https://github.com/atomist/github-rugs/compare/0.34.0...0.35.0

Rug 1.0.0-m.1 release

### Changed

-   Update to Rug 1.0.0-m.1

## [0.34.0] - 2017-04-25

[0.34.0]: https://github.com/atomist/github-rugs/compare/0.33.1...0.34.0

New name release

### Changed

-   Changed archive name from github-handlers to github-rugs

## [0.33.1] - 2017-04-19

[0.33.1]: https://github.com/atomist/github-rugs/compare/0.33.0...0.33.1

Fix issues release

### Fixed

-   Couple of issues with list and open issues

## [0.1.0] - 2017-03-23

[0.1.0]: https://github.com/atomist/github-rugs/tree/0.1.0

Initial release
