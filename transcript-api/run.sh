#!/bin/bash

# Exit on any error
set -e

# Change to script's directory
cd "$(dirname "$0")"

# Activate virtual environment
source env/Scripts/activate

# Run the Python script
python api/index.py
