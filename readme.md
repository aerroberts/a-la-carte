# A La Carte

A CLI tool for AI-powered development workflows.

[Installation](#installation) • [Setup](#setup) • [Commands](#commands) • [Development](#development) • [Prompts System](#prompts-system) • [Features](#features)

## Installation

```bash
npm install -g a-la-carte
```

## Setup

Set API keys and default provider:
```bash
a config set-claude-key <key>
a config set-openai-key <key>
a config set-default-provider claude
```

## Commands

### AI Commands

**a ai claude [message]** - Claude AI assistant
- `-p` Load prompt
- `-d` Delegate to separate workspace

**a ai codex [message]** - OpenAI Codex assistant
- `-p` Load prompt
- `-d` Delegate

**a ai describe-pr <url>** - Generate PR description

**a ai invoke <input> <output>** - Custom script execution
- `-p` Load prompt

### Code Commands

**a code shove [message]** - Stage, commit, and push

**a code pop [message]** - Create branch, commit, push, and PR

**a code watch <command>** - Watch files and run command
- `-p` File pattern

### Config Commands

- `show` Display config
- `list-prompts` List available prompts
- `set-claude-key` Set Claude API key
- `set-openai-key` Set OpenAI API key
- `set-default-provider` Set AI provider
- `sync-rules` Sync rules

## Development

```bash
npm install
tnpm run dev
```

## Prompts System

Store reusable prompts in `prompts/` directory for consistent AI interactions.

## Features

- AI Integration (Claude & OpenAI)
- Git Workflow Automation
- File Watching
- Configuration Management
- Repository Cloning
- Reusable Prompts