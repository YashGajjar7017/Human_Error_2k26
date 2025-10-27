# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY Backend/package*.json ./

# Install dependencies
RUN npm install

# Copy backend source code
COPY Backend/ ./

# Copy frontend files
COPY Frontend/ ./Frontend/

# Create necessary directories
RUN mkdir -p /app/Compling/TemporaryCache

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["node", "server.js"]
