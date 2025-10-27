#!/bin/bash

# Start MongoDB in background
echo "Starting MongoDB..."
docker run -d --name mongodb-dev -p 27017:27017 -e MONGO_INITDB_DATABASE=human-error mongo:6.0

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
sleep 10

# Start Backend server
echo "Starting Backend server..."
cd Backend
npm start &
BACKEND_PID=$!

# Start Frontend server
echo "Starting Frontend server..."
cd ../Frontend
npm start &
FRONTEND_PID=$!

echo "Services started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "MongoDB running on port 27017"
echo "Backend running on port 8000"
echo "Frontend running on port 3000"

# Wait for services
wait $BACKEND_PID $FRONTEND_PID
