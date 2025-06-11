<img src="./assets/logo.png" width="200" alt="A La Carte Logo">

# A La Carte

A hungry developer's toolbox.

Easily use AI (ollama) to generate and register custom bash command aliases in your terminal, making them easily accessible and avoiding conflicts with other tools.

## Installation

### For Development

```bash
# Clone the repository
git clone https://github.com/eric-aerrobert/a-la-carte.git
cd a-la-carte

# Install dependencies and build
npm install
npm run build

# Link the package globally for development
npm link
```

### From npm (when published)

```bash
npm install -g a-la-carte
```

After installation, you can use the `a` command from anywhere in your terminal.

## Commands

A la carte provides a set of base commands for your own utilities and then allows you to register your own commands as needed!

### Formating of commands

Commands are stored in the `scripts` folder. For setup, each command should have a top level comment that describes what the command does.

```bash
#!/bin/bash
# Prints hello world
echo "hello world"
```

The seccond line of the above script is read automatically and used as the command description for the top level help command.

### Base Commands

```bash
# Opens the scripts folder in your default file system for you to add your own scripts
a commands

# Uses Ollama to generate a new command based on the context of the project
a generate [command-name] [description here]

# A Help command to list all commands available
a
```
