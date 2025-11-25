#!/bin/bash

# Script to generate app icons from app_icon_new.png

echo "Generating Android icons..."

# Android xxxhdpi (192x192)
sips -z 192 192 app_icon_new.png --out android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
sips -z 192 192 app_icon_new.png --out android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png

echo "Generating iOS icons..."

# iOS AppIcon sizes
sips -z 1024 1024 app_icon_new.png --out ios/NALNL2APICaller/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png

# Copy the new icon to replace the old one
cp app_icon_new.png app_icon.png

echo "All icons generated successfully!"
echo ""
echo "Android icons:"
echo "  - mipmap-hdpi: 72x72"
echo "  - mipmap-mdpi: 48x48"
echo "  - mipmap-xhdpi: 96x96"
echo "  - mipmap-xxhdpi: 144x144"
echo "  - mipmap-xxxhdpi: 192x192"
echo ""
echo "iOS icons:"
echo "  - App-Icon-1024x1024@1x.png: 1024x1024"
echo ""
echo "Root icon updated: app_icon.png"
