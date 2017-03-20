import * as mustache from 'mustache'
import { Issue } from "@atomist/github/core/Core"

let list_issues = `{
  "attachments": [
    {{#issues}}
    {
      "fallback": "#{{number}}: {{title}}",
      {{#closed}}
      "footer_icon": "http://images.atomist.com/rug/issue-closed.png",
      "color": "#bd2c00",
      {{/closed}}
      {{^closed}}
      "footer_icon": "http://images.atomist.com/rug/issue-open.png",
      "color": "#6cc644",
      {{/closed}}
      {{#assignee}}
      "author_link": "{{{assignee.html_url}}}",
      "author_name": "@{{{assignee.login}}}",
      "author_icon": "{{{assignee.avatar_url}}}",
      {{/assignee}}
      "mrkdwn_in": ["text"],
      "text": "<{{{issueUrl}}}|#{{number}}: {{{title}}}>",
      "footer": "<{{{url}}}|{{{repo}}}>",
      "ts": "{{ts}}"
    }
    {{/issues}}
  ]
}`

//render github issues for slack
function renderIssues(issuesList: Issue[]): string {
  try{
    return mustache.render(list_issues, 
  {issues: issuesList, 
    closed: function() {
       return this.state === "closed"
     } , 
     assignee: function() {
       return this.assignee !== undefined
     }
  })
  }catch(ex) {
    return `Failed to render message using template: ${ex}`
  }
}

export {renderIssues}
