#!/bin/bash
# test and publish rug archive

set -o pipefail

declare Pkg=travis-build-rug
declare Version=2.0.0

function msg() {
    echo "$Pkg: $*"
}

function err() {
    msg "$*" 1>&2
}

# usage: main "$@"
function main () {
    local arg ignore_lint
    for arg in "$@"; do
        case "$arg" in
            --ignore-lint | --ignore-lin | --ignore-li | --ignore-l)
                ignore_lint=1
                ;;
            -*)
                err "unknown option: $arg"
                return 2
                ;;
        esac
    done

    local formula_url=https://raw.githubusercontent.com/atomist/homebrew-tap/master/Formula/rug-cli.rb
    local formula
    formula=$(curl -s -f "$formula_url")
    if [[ $? -ne 0 || ! $formula ]]; then
        err "failed to download homebrew formula $formula_url: $formula"
        return 1
    fi

    local cli_version
    cli_version=$(echo "$formula" | awk '$1 == "version" { print $2 }' | sed 's/"//g')
    if [[ $? -ne 0 || ! $cli_version ]]; then
        cli_version=$(echo "$formula" | sed -En '/^ *url /s/.*\/([0-9]+\.[0-9]+\.[0-9]+(-(m|rc)\.[0-9]+)?)\/.*/\1/p')
        if [[ $? -ne 0 || ! $cli_version ]]; then
            err "failed to parse brew formula for version: $cli_version"
            err "$formula"
            return 1
        fi
    fi
    msg "rug CLI version: $cli_version"

    local rug=$HOME/.atomist/rug-cli-$cli_version/bin/rug
    if [[ ! -x $rug ]]; then
        msg "downloading rug CLI"
        if ! mkdir -p "$HOME/.atomist"; then
            err "failed to make ~/.atomist directory"
            return 1
        fi

        local rug_cli_url=https://github.com/atomist/rug-cli/releases/download/$cli_version/rug-cli-$cli_version-bin.tar.gz
        local rug_cli_tgz=$HOME/.atomist/rug-cli-$cli_version.tar.gz
        if ! curl -s -f -L -o "$rug_cli_tgz" "$rug_cli_url"; then
            err "failed to download rug CLI from $rug_cli_url"
            return 1
        fi

        if ! tar -xzf "$rug_cli_tgz" -C "$HOME/.atomist"; then
            err "failed to extract rug CLI archive"
            return 1
        fi
    fi
    rug="$rug --settings=$PWD/.atomist/build/cli.yml"

    msg "running npm install"
    if ! ( cd .atomist && npm install ); then
        err "npm install failed"
        return 1
    fi

    msg "running lint"
    local lint_status
    ( cd .atomist && npm run lint )
    lint_status=$?
    if [[ $lint_status -eq 0 ]]; then
        :
    elif [[ $lint_status -eq 2 ]]; then
        err "TypeScript failed to pass linting"
        if [[ $ignore_lint ]]; then
            err "ignoring linting failure"
        else
            return 1
        fi
    else
        err "tslint errored"
        return 1
    fi

    msg "compiling TypeScript"
    if ! ( cd .atomist && npm run compile ); then
        err "tsc compilation failed"
        return 1
    fi

    if [[ -d .atomist/mocha ]]; then
        msg "running mocha tests"
        if ! ( cd .atomist && npm run mocha ); then
            err "mocha tests failed"
            return 1
        fi
    fi

    msg "running tests"
    if ! $rug test; then
        err "rug test failed"
        return 1
    fi

    msg "installing archive"
    if ! $rug install; then
        err "rug install failed"
        return 1
    fi

    [[ $TRAVIS_PULL_REQUEST == false ]] || return 0

    msg "branch: $TRAVIS_BRANCH"
    if [[ $TRAVIS_BRANCH == master || $TRAVIS_TAG =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        local archive_version
        local pkg_json=.atomist/package.json
        archive_version=$(jq -er .version "$pkg_json")
        if [[ $? -ne 0 || ! $archive_version ]]; then
            err "failed to extract archive version from $pkg_json: $archive_version"
            return 1
        fi
        local project_version
        if [[ $TRAVIS_TAG =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            if [[ $archive_version != $TRAVIS_TAG ]]; then
                err "archive version ($archive_version) does not match git tag ($TRAVIS_TAG)"
                return 1
            fi
            project_version=$TRAVIS_TAG

            msg "releasing version $project_version"
            if ! $rug publish -a "$project_version" -i release; then
                err "failed to publish archive $project_version"
                git diff
                return 1
            fi
        else
            local timestamp
            timestamp=$(date +%Y%m%d%H%M%S)
            if [[ $? -ne 0 || ! $timestamp ]]; then
                err "failed to generate timestamp: $timestamp"
                return 1
            fi
            project_version=$archive_version-$timestamp
            msg "archive version: $project_version"
        fi

        if ! git config --global user.email "travis-ci@atomist.com"; then
            err "failed to set git user email"
            return 1
        fi
        if ! git config --global user.name "Travis CI"; then
            err "failed to set git user name"
            return 1
        fi
        local git_tag=$project_version+travis$TRAVIS_BUILD_NUMBER
        if ! git tag "$git_tag" -m "Generated tag from TravisCI build $TRAVIS_BUILD_NUMBER"; then
            err "failed to create git tag: $git_tag"
            return 1
        fi
        local remote=origin
        if [[ $GITHUB_TOKEN ]]; then
            remote=https://$GITHUB_TOKEN@github.com/$TRAVIS_REPO_SLUG
        fi
        if ! git push --quiet --tags "$remote" > /dev/null 2>&1; then
            err "failed to push git tags"
            return 1
        fi
    fi
}

main "$@" || exit 1
exit 0
