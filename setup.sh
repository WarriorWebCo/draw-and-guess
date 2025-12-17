#!/bin/bash

echo "🎨 Setting up Draw & Guess game..."
echo ""

# Check if git is installed
if ! command -v git &> /dev/null
then
    echo "❌ Git is not installed. Please install git first:"
    echo "   - Mac: brew install git"
    echo "   - Windows: Download from git-scm.com"
    echo "   - Linux: sudo apt-get install git"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - Draw & Guess game"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a GitHub repository at https://github.com/new"
echo "2. Name it 'draw-and-guess'"
echo "3. Run these commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR-USERNAME/draw-and-guess.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Go to vercel.com and import your GitHub repository"
echo "5. Deploy and share the URL with your wife!"
echo ""
echo "📖 Check README.md for detailed instructions"
