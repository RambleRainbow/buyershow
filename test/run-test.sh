#!/bin/bash

# Buyer Show Generation API Test Runner
echo "🧪 Starting Buyer Show Generation API Test..."
echo "=================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check if the API server is running
echo "🔍 Checking if API server is running on localhost:3001..."
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ API server is not running on localhost:3001"
    echo "Please start the API server first with: cd apps/api && npm run dev"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing test dependencies..."
    npm install
fi

# Run the tests
echo "🚀 Running generation API tests..."
npm run test:generation

echo "=================="
echo "✅ Test completed!"