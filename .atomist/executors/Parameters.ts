import { Parameter } from '@atomist/rug/operations/RugOperation'

export var Owner: Parameter = {
  name: "owner",
  description: "GitHub Owner",
  pattern: "^.*$",
  maxLength: 100,
  required: true,
  displayable: false,
  tags: ["atomist/owner"]
}

export var Repository: Parameter = {
  name: "repo",
  description: "GitHub Repository",
  pattern: "^.*$",
  maxLength: 100,
  required: true,
  displayable: false,
  tags: ["atomist/repository"]
}

export var RepoUserToken: Parameter = {
  name: "token",
  description: "GitHub Token",
  pattern: "^.*$",
  maxLength: 100,
  required: false,
  displayable: false,
  tags: ["atomist/user_token", "atomist/github/user_token=repo"]
}
