#!/usr/bin/env bash
set -euo pipefail

ZIP_URL="https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.13.0/Rhubarb-Lip-Sync-1.13.0-Linux.zip"
ZIP_NAME="rhubarb.zip"
TARGET_DIR=".tools/rhubarb"
TMP_FOLDER="Rhubarb-Lip-Sync-1.13.0-Linux"

echo "Creating target directory: $TARGET_DIR"
mkdir -p "$TARGET_DIR"

echo "Downloading Rhubarb Lip Sync from $ZIP_URL"
curl -L "$ZIP_URL" -o "$ZIP_NAME"

echo "Unzipping to $TARGET_DIR"
unzip -o "$ZIP_NAME" -d "$TARGET_DIR"

echo "Removing zip file"
rm -f "$ZIP_NAME"

echo "Moving files out of $TMP_FOLDER into $TARGET_DIR"
# Move everything inside the unzipped top-level folder up one level
mv "$TARGET_DIR/$TMP_FOLDER"/* "$TARGET_DIR"

echo "Removing empty $TMP_FOLDER folder"
rmdir "$TARGET_DIR/$TMP_FOLDER"

# If there's a single binary that needs to be executable, you can chmod it here
# Example (depends on the exact binary name):
chmod +x "$TARGET_DIR/rhubarb"

echo "Done! Rhubarb Lip Sync installed into $TARGET_DIR"
