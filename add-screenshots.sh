#!/bin/bash

# Script to help add screenshots to repositories
# Usage: ./add-screenshots.sh <product-name>

set -e

PRODUCT_NAME=$1

if [ -z "$PRODUCT_NAME" ]; then
  echo "Usage: ./add-screenshots.sh <product-name>"
  echo ""
  echo "Available products:"
  echo "  - surfaceai"
  echo "  - logcopilot"
  echo "  - vpc-guardian"
  echo "  - pentestgpt"
  echo "  - smb-security-suite"
  exit 1
fi

PRODUCT_DIR="$PRODUCT_NAME"

if [ ! -d "$PRODUCT_DIR" ]; then
  echo "Error: Directory $PRODUCT_DIR does not exist"
  exit 1
fi

SCREENSHOTS_DIR="$PRODUCT_DIR/screenshots"

if [ ! -d "$SCREENSHOTS_DIR" ]; then
  echo "Creating screenshots directory..."
  mkdir -p "$SCREENSHOTS_DIR"
fi

echo "📸 Screenshot Helper for $PRODUCT_NAME"
echo ""
echo "Screenshots directory: $SCREENSHOTS_DIR"
echo ""
echo "Current screenshots:"
ls -lh "$SCREENSHOTS_DIR"/*.png 2>/dev/null || echo "  No PNG files found"
echo ""

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
  echo "✅ ImageMagick found - can optimize images"
  HAS_IMAGEMAGICK=true
else
  echo "⚠️  ImageMagick not found - install for image optimization"
  echo "   Mac: brew install imagemagick"
  echo "   Linux: apt-get install imagemagick"
  HAS_IMAGEMAGICK=false
fi

echo ""
echo "📋 Next steps:"
echo "1. Start the application:"
echo "   cd $PRODUCT_DIR"
echo "   docker-compose up -d"
echo ""
echo "2. Open browser at http://localhost:3000"
echo ""
echo "3. Set viewport to 1920x1080 (DevTools → Device Toolbar)"
echo ""
echo "4. Take screenshots and save to: $SCREENSHOTS_DIR"
echo ""
echo "5. Optimize screenshots (if ImageMagick installed):"
if [ "$HAS_IMAGEMAGICK" = true ]; then
  echo "   for file in $SCREENSHOTS_DIR/*.png; do"
  echo "     convert \"\$file\" -quality 85 -strip \"\$file\""
  echo "   done"
else
  echo "   Use online tool: https://tinypng.com/"
fi
echo ""
echo "6. Commit and push:"
echo "   cd $PRODUCT_DIR"
echo "   git add screenshots/*.png"
echo "   git commit -m 'Add UX/UI screenshots'"
echo "   git push origin master"
echo ""

# Offer to optimize existing screenshots
if [ "$HAS_IMAGEMAGICK" = true ]; then
  PNG_COUNT=$(find "$SCREENSHOTS_DIR" -name "*.png" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$PNG_COUNT" -gt 0 ]; then
    echo "Found $PNG_COUNT PNG file(s). Optimize them now? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
      echo "Optimizing screenshots..."
      for file in "$SCREENSHOTS_DIR"/*.png; do
        if [ -f "$file" ]; then
          echo "  Optimizing: $(basename "$file")"
          convert "$file" -quality 85 -strip "$file"
        fi
      done
      echo "✅ Optimization complete!"
    fi
  fi
fi

echo ""
echo "✅ Setup complete! Ready to add screenshots."

