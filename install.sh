#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if command already exists
if [ -f "/usr/local/bin/a" ]; then
    echo "Warning: Command 'a' already exists in /usr/local/bin, it will be overwritten"
fi

echo "Creating symbolic link for 'a' command..."
sudo ln -s "$SCRIPT_DIR/path/a" /usr/local/bin/a

echo "Installation complete! You can now use the 'a' command."
