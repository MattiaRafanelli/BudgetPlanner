#!/bin/bash
# ============================================================================
# BudgetPlanner - Quick Setup & Start Guide
# ============================================================================

echo "🚀 BudgetPlanner Quick Setup"
echo "=============================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed!"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo "✅ npm $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

echo ""
echo "⚙️  Configuration Required:"
echo "   1. Copy server/.env.example to server/.env"
echo "   2. Update database credentials"
echo "   3. (Optional) Copy client/.env.example to client/.env"
echo ""

# Ask for start
read -p "Ready to start? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run dev
fi
