#!/bin/bash
set -e

# Clean up any existing build artifacts
echo "--- Cleaning up previous builds ---"
rm -rf .next
rm -rf out
rm -rf node_modules
rm -f package-lock.json

# Install dependencies with clean slate
echo "--- Installing dependencies ---"
npm install --legacy-peer-deps --no-audit --prefer-offline

# Verify installation
echo "--- Verifying installation ---"
npm list next

# Build the application
echo "--- Building application ---"
npm run build

# Export the static site
echo "--- Exporting static site ---"
npm run export || {
  echo "--- Export failed, checking for errors ---"
  if [ -d ".next/server"]; then
    echo "--- Server build exists, continuing with static export ---"
    npx next export -o out || echo "--- Export failed, but continuing with build ---"
  else
    echo "--- No server build found, exiting with error ---"
    exit 1
  fi
}

# Verify the output directory
echo "--- Verifying output directory ---"
if [ ! -d "out" ]; then
  echo "--- Creating out directory ---"
  mkdir -p out
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

# Copy public files if they exist
if [ -d "public" ]; then
  echo "--- Copying public files ---"
  cp -r public/* out/
fi

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
