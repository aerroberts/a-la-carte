#!/bin/bash
# Register a new command with a description

# Colors
RED='\033[0;31m'
GREY='\033[0;90m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

if [ $# -lt 2 ]; then
  echo -e "${RED}Usage: a generate <command-name> <description>${NC}"
  echo -e "${YELLOW}Example: a generate hello 'Prints hello world'${NC}"
  exit 1
fi

SCRIPTS_DIR="$(dirname "$0")"
COMMAND_NAME=$1
shift
shift
DESCRIPTION=$@

# Gather existing scripts for context
EXISTING_SCRIPTS=$(find "$SCRIPTS_DIR" -type f -name "*.sh" ! -name "generate.sh" -exec cat {} \;)
README_CONTENT=$(cat "$(dirname "$SCRIPTS_DIR")/readme.md")

# Create the prompt for Ollama
PROMPT="Given the following context about a command-line tool project:

<readme>
$README_CONTENT
</readme>

<existing-commands>
$EXISTING_SCRIPTS
</existing-commands>

Please generate a bash script for a new command named '$COMMAND_NAME' with the description: '$DESCRIPTION'
The script should:
1. Follow the project's format with a shebang and description comment
2. Be practical and useful
3. Include proper error handling and usage instructions

Generate the script in an xml format below:

\`\`\`bash
#!/bin/bash
# YOUR DESCRIPTION, one line and nothing else. Dont provide any usage or preface. Use the other scripts as reference
YOUR BASH CODE, make sure its runnable as a bash command directly has valid syntax
\`\`\`

Make sure to end the script with \`\`\` for parsing

"

# Call Ollama to list models and get the first one
MODEL=$(ollama list | awk 'NR==2 {print $1}')

echo -e "${GREY}Using ollama model: $MODEL to generate script for command '$COMMAND_NAME' . . .${NC}"

# Sanitize the prompt as it may have quotes that break bash
SANITIZED_PROMPT=$(echo "$PROMPT" | sed 's/"/\\"/g')

# Use the first available model instead of hardcoding mistra
RESPONSE=$(ollama run "$MODEL" "$SANITIZED_PROMPT")

# Extract the code block from the markdown response
SCRIPT_CONTENT=$(echo "$RESPONSE" | awk '/^```/{if(!p){p=1;next}}p{if(/^```/){exit}print}')

# If no content was extracted, show error and exit
if [ -z "$SCRIPT_CONTENT" ]; then
    echo -e "${RED}Failed to parse script content from response.${NC}"
    echo -e "${RED}Raw response:${NC}"
    echo "$RESPONSE"
    exit 1
fi

echo -e "${GREY}Generated script:${NC}"
echo -e "${GREY}--------------------------------${NC}"
echo "$SCRIPT_CONTENT"
echo -e "${GREY}--------------------------------${NC}"

# Ask for confirmation
read -p "Does this script look okay? (Y/N): " confirm
if [[ $confirm != [yY] ]]; then
    echo -e "${RED}Script generation cancelled.${NC}"
    exit 1
fi

# Save the script
echo "$SCRIPT_CONTENT" > "$SCRIPTS_DIR/$COMMAND_NAME.sh"

echo -e "${GREEN}Script written to: $SCRIPTS_DIR/$COMMAND_NAME.sh${NC}"

# Make the script executable
chmod +x "$SCRIPTS_DIR/$COMMAND_NAME.sh"
