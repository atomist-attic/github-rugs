# Atomist 'github-rugs'

[![Build Status](https://travis-ci.org/atomist/github-rugs.svg?branch=master)](https://travis-ci.org/atomist/github-rugs)
[![Slack Status](https://join.atomist.com/badge.svg)](https://join.atomist.com/)

A set of Rugs that that integrate with [GitHub][github].

[github]: https://github.com/

Read more about automating software development
at [Automating Our Development Flow With Atomist][blog].  Detailed
documentation is available in the [Atomist Documentation][docs].

[blog]: https://medium.com/the-composition/automating-our-development-flow-with-atomist-6b0ec73348b6#.hwa55uv8o
[docs]: http://docs.atomist.com/

## Support

General support questions should be discussed in the `#support`
channel on our community Slack team
at [atomist-community.slack.com][slack].

If you find a problem, please create an [issue][].

[issue]: https://github.com/atomist/github-rugs/issues

## Contributing

If you are interested in contributing to the Atomist open source
projects, please see our [contributing guidelines][contrib] and
our [code of conduct][code].

[contrib]: https://github.com/atomist/welcome/blob/master/CONTRIBUTING.md
[code]: https://github.com/atomist/welcome/blob/master/CODE_OF_CONDUCT.md

## Developing

You can build, test, and install the project locally with
the [Rug CLI][cli].  First, install the TypeScript dependencies
using [yarn][].

[cli]: https://github.com/atomist/rug-cli
[yarn]: https://yarnpkg.com/

```
$ ( cd .atomist && yarn )
$ rug test
$ rug install
```

To clean up cached files and update TypeScript dependencies, run this
command.

```
$ ( cd .atomist && find editors generators handlers tests -name '*.js' -print0 | xargs -0 rm; rm -rf node_modules; yarn && rug clean )
```

To create a new release of the project, simply push a tag of the form
`M.N.P` where `M`, `N`, and `P` are integers that form the next
appropriate [semantic version][semver] for release.  For example:

[semver]: http://semver.org

```
$ git tag -a 1.2.3
```

The Travis CI build (see badge at the top of this page) will upload
the needed artifacts.

---
Created by [Atomist][atomist].
Need Help?  [Join our Slack team][slack].

[atomist]: https://www.atomist.com/
[slack]: https://join.atomist.com/
