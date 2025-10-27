# Use Node.js 18 as base image
FROM mcr.microsoft.com/devcontainers/base:jammy

# Install Node.js 18
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Install additional tools
RUN apt-get install -y git

# Set working directory
WORKDIR /workspaces

# Switch to vscode user
USER vscode
