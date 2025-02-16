#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create symbolic link to the 'a' script in /usr/local/bin
if [ -f "/usr/local/bin/a" ]; then
    echo "Removing existing 'a' command..."
    sudo rm /usr/local/bin/a
fi

echo "Creating symbolic link for 'a' command..."
sudo ln -s "$SCRIPT_DIR/path/a" /usr/local/bin/a

echo "Installation complete! You can now use the 'a' command."
