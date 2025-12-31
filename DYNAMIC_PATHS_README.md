# Dynamic Path Configuration

This project now supports dynamic path configuration, allowing users to customize the location of frontend and backend directories based on their installation setup.

## Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Modify the paths in `.env` according to your installation:

   ```env
   # Example: If you moved Frontend to a different location
   FRONTEND_PATH=/home/user/my-custom-frontend

   # Example: Relative path from project root
   FRONTEND_PATH=./custom-frontend

   # Example: If using a different backend location
   BACKEND_PATH=/opt/human-error/backend
   ```

## Path Resolution

- **Absolute paths**: If you provide an absolute path (starting with `/`), it will be used as-is
- **Relative paths**: Relative paths are resolved from the project root directory
- **Default paths**: If no environment variables are set, the system uses the standard directory structure

## Supported Environment Variables

- `FRONTEND_PATH`: Location of the frontend directory
- `BACKEND_PATH`: Location of the backend directory
- `REACT_FRONTEND_PATH`: Location of the React frontend (if applicable)

## Directory Structure Validation

The system automatically validates that required directories exist and warns if any are missing. Make sure your custom paths contain the expected subdirectories:

- Frontend: `views/`, `Public/`, `Routes/`, `controller/`
- Backend: `models/`, `Routes/`, `controller/`

## Usage in Code

The configuration is automatically loaded in:

- `config/paths.js`: Central path configuration
- `Frontend/util/path.js`: Frontend path utilities
- `Backend/server.js`: Server static file serving
- `Electron/main.js`: Electron app server spawning

## Migration Guide

If you're upgrading from a previous version:

1. Create the `.env` file as described above
2. Move your directories to the desired locations
3. Update the environment variables to point to the new locations
4. Restart all servers

The system will automatically detect and use the new paths.
