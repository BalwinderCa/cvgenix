#!/bin/bash

# Convert SVG favicon to ICO format
# This script converts the SVG favicon to ICO format using ImageMagick

echo "Converting favicon.svg to favicon.ico..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Please install it first:"
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  CentOS/RHEL: sudo yum install ImageMagick"
    exit 1
fi

# Convert SVG to ICO with multiple sizes
convert public/favicon.svg -resize 16x16 public/favicon-16x16.png
convert public/favicon.svg -resize 32x32 public/favicon-32x32.png
convert public/favicon.svg -resize 48x48 public/favicon-48x48.png

# Create ICO file with multiple sizes
convert public/favicon-16x16.png public/favicon-32x32.png public/favicon-48x48.png public/favicon.ico

# Clean up temporary files
rm public/favicon-16x16.png public/favicon-32x32.png public/favicon-48x48.png

echo "Favicon conversion complete!"
echo "Generated files:"
echo "  - public/favicon.ico (multi-size ICO)"
echo "  - public/favicon.svg (vector format)"
echo "  - public/favicon.png (32x32 PNG)"
echo "  - public/logo192.png (192x192 PNG)"
