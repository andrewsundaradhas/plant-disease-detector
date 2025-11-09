#!/bin/bash
set -e

echo "--- Installing dependencies ---"
npm ci

echo "--- Building application ---"
npm run build

echo "--- Creating output directory ---"
mkdir -p out

# Copy static files to the output directory
echo "--- Copying static files ---"
cp -R .next/static out/.next/
cp -R public/* out/

# Create a simple HTML file for the root path
echo "--- Creating index.html ---"
echo "<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=/home" />
</head>
<body>
  <p>If you are not redirected automatically, follow this <a href="/home">link</a>.</p>
</body>
</html>" > out/index.html

echo "--- Build completed successfully ---"

# List the contents of the output directory for debugging
echo "--- Output directory contents ---"
ls -la out/
