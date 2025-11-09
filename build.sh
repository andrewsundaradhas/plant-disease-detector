#!/bin/bash
set -e

# Clean up any existing build artifacts
echo "--- Cleaning up previous builds ---"
rm -rf .next
rm -rf out

# Install dependencies with clean slate
echo "--- Installing dependencies ---"
npm ci --no-audit --prefer-offline

# Build the application
echo "--- Building application ---"
npm run build

# Export the static site
echo "--- Exporting static site ---"
npm run export

# Verify the output directory
echo "--- Verifying output directory ---"
if [ ! -d "out" ]; then
  echo "Error: 'out' directory not found after export"
  exit 1
fi

# Create a simple HTML file for the root path
echo "--- Creating index.html ---"
cat > out/index.html << 'EOL'
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=/home" />
  <title>Redirecting...</title>
</head>
<body>
  <p>If you are not redirected automatically, follow this <a href="/home">link</a>.</p>
</body>
</html>
EOL

# Set proper permissions
echo "--- Setting permissions ---"
chmod -R 755 out

# Verify the build
echo "--- Build completed successfully ---"
echo "--- Build artifacts ---"
find out -type f | sort

echo "--- Build info ---"
node -v
npm -v
npx next -v
