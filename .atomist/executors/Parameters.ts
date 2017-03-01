import { Parameter } from '@atomist/rug/operations/RugOperation'

export let Owner: Parameter = {
  name: "owner",
  description: "GitHub Owner",
  pattern: "^.*$",
  maxLength: 100,
  required: true,
  displayable: false,
  tags: ["atomist/owner"]
}

export let Repository: Parameter = {
  name: "repo",
  description: "GitHub Repository",
  pattern: "^.*$",
  maxLength: 100,
  required: true,
  displayable: false,
  tags: ["atomist/repository"]
}

export let RepoUserToken: Parameter = {
  name: "token",
  description: "GitHub Token",
  pattern: "^.*$",
  maxLength: 100,
  required: false,
  displayable: false,
  tags: ["atomist/user_token", "atomist/github/user_token=repo"]
}

export let RepoHookUserToken: Parameter = {
  name: "token",
  description: "GitHub Token",
  pattern: "^.*$",
  maxLength: 100,
  required: false,
  displayable: false,
  tags: ["atomist/user_token", "atomist/github/user_token=admin:repo_hook"]
}

export let OrgHookUserToken: Parameter = {
  name: "token",
  description: "GitHub Token",
  pattern: "^.*$",
  maxLength: 100,
  required: false,
  displayable: false,
  tags: ["atomist/user_token", "atomist/github/user_token=admin:org_hook"]
}
