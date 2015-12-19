import { Api } from 'raml-generator'
import paramCase = require('param-case')

export default function (api: Api) {
  const projectName = paramCase(api.title)

  return `# Installation

Follow these instructions to publish and subsequently install the module in your project.

## Git

\`\`\`bash
# Initialize with git
git init
git add .
git commit -m "Initial commit"
git push [git-url]

# Install in project from git
npm install [git-url] --save
\`\`\`

## Source Directory

\`\`\`bash
# Link module globally
npm link

# Link in project to local module
npm link ${projectName}
\`\`\`

**Note:** You should publish it before you use it publicly.

## NPM

\`\`\`bash
# Publish to npm
npm publish

# Install from npm
npm install ${projectName} --save
\`\`\`
`
}
