#!/bin/bash
# Opens the scripts folder in your file system to show where the commands are stored

# Get the scripts directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Open the scripts directory in finder
open "$SCRIPT_DIR"