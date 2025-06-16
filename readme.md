# A La Carte

A hungry developer's toolbox - CLI tool for AI-powered development workflows.

## Installation

```bash
npm install -g a-la-carte
```

Or install locally:

```bash
npm install
npm run build
npm link
```

## Setup

Before using the AI commands, you need to set up API keys:

```bash
# Set Claude API key
a config set-claude-key <your-claude-api-key>

# Set OpenAI API key  
a config set-openai-key <your-openai-api-key>

# Set default AI provider
a config set-default-provider claude  # or openai
```

## Commands

### AI Commands

#### `a ai claude [message]`
Ask Claude to help with a request. Works in current workspace by default.

**Options:**
- `-p, --prompt <name>` - Load prompts from config (can be used multiple times)
- `-d, --delegate` - Clone repository and have Claude work in separate workspace

**Examples:**
```bash
a ai claude "Help me refactor this function"
a ai claude -p code-review "Review my latest changes"
a ai claude -d "Fix the bug in main.js"
```

#### `a ai codex [message]`
Ask OpenAI Codex to help with a request. Works in current workspace by default.

**Options:**
- `-p, --prompt <name>` - Load prompts from config (can be used multiple times)
- `-d, --delegate` - Clone repository and have Codex work in separate workspace

**Examples:**
```bash
a ai codex "Generate unit tests for this component"
a ai codex -p best-practices "Optimize this code"
```

#### `a ai describe-pr <url>`
Generate AI-powered description for a GitHub PR.

**Examples:**
```bash
a ai describe-pr https://github.com/user/repo/pull/123
```

#### `a ai invoke <input> <output>`
Invoke AI assistant using custom script with file input/output.

**Options:**
- `-p, --prompt <name>` - Load prompts from config (can be used multiple times)

**Examples:**
```bash
a ai invoke request.txt response.txt
a ai invoke -p technical-review input.md output.md
```

### Code Commands

#### `a code shove [message]`
Stage all changes, commit, and force push to remote repository.

**Examples:**
```bash
a code shove
a code shove "Quick fix for deployment"
```

#### `a code pop [message]`
Create a new branch, commit changes, push to remote, and create a PR with AI-generated description.

**Examples:**
```bash
a code pop
a code pop "Feature implementation"
```

#### `a code watch <command>`
Watch files for changes and run command on change (1s debounce).

**Options:**
- `-p, --pattern <pattern>` - Glob pattern of files to watch (default: `**/*`)

**Examples:**
```bash
a code watch "npm run test"
a code watch -p "src/**/*.ts" "npm run build"
```

### Config Commands

#### `a config show`
Show current configuration.

#### `a config list-prompts`
List all available prompts from the prompts directory.

#### `a config set-claude-key <key>`
Set your Claude API key.

#### `a config set-openai-key <key>`
Set your OpenAI API key.

#### `a config set-default-provider <provider>`
Set default AI provider (`claude` or `openai`).

#### `a config sync-rules`
Sync rules from `prompts/rules/` to `.cursor/rules` in git workspace root.

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm run test

# Run linting
npm run lint

# Watch for changes during development
npm run watch

# Link for local development
npm run dev
```

## Prompts System

The tool supports a prompt system where you can create reusable prompts in markdown files. Prompts are loaded from the `prompts/` directory and can be combined with your requests using the `-p` flag.

## Features

- **AI Integration**: Supports both Claude and OpenAI APIs
- **Git Workflow**: Streamlined commands for committing, pushing, and PR creation
- **File Watching**: Development automation with file monitoring
- **Configuration Management**: Centralized config for API keys and settings
- **Repository Cloning**: Option to work in fresh repository clones for AI operations
- **Prompt System**: Reusable prompts for consistent AI interactions
