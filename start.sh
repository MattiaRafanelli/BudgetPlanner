#!/usr/bin/env bash

# Budget Planner Quick Start Guide

echo "🚀 Budget Planner - Quick Start"
echo "================================"
echo ""

# Check if node_modules exists in both directories
echo "📦 Checking dependencies..."

if [ ! -d "client/node_modules" ]; then
    echo "Installing client dependencies..."
    cd client && npm install && cd ..
fi

if [ ! -d "server/node_modules" ]; then
    echo "Installing server dependencies..."
    cd server && npm install && cd ..
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  No .env file found in server directory"
    echo "Please create server/.env with database configuration"
    echo ""
fi

echo "🎯 Starting Budget Planner..."
echo ""
echo "Starting server on port 3000..."
cd server && npm run dev &
SERVER_PID=$!

sleep 2

echo "Starting client on port 5173..."
cd ../client && npm run dev &
CLIENT_PID=$!

echo ""
echo "✅ Applications started!"
echo ""
echo "📱 Open browser and go to: http://localhost:5173"
echo ""
echo "🔐 Login with your admin credentials"
echo "   - Switch theme using the 🌙 button"
echo "   - Create users from the dashboard"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

wait $SERVER_PID $CLIENT_PID
