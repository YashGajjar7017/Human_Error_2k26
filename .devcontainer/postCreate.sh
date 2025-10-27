#!/bin/bash

# Initialize conda
conda init --all

# Create conda environment
conda env create -f ../environment.yml

# Activate environment in bashrc
echo 'conda activate synapseml' >> ~/.bashrc

# Setup SBT
/usr/local/sdkman/candidates/sbt/current/bin/sbt setup

# Install Node.js dependencies for Backend
cd ../Backend
npm install

# Install Node.js dependencies for Frontend
cd ../Frontend
npm install

# Go back to root
cd ..

# Set up Git (if needed)
git config --global init.defaultBranch main

echo "Dev container setup complete!"
