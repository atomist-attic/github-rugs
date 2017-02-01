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
  tags: ["atomist/github/user_token=repo"]
}
