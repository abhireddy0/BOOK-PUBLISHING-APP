#!/bin/bash

cd /home/ubuntu/BOOK-PUBLISHING-APP/backend

echo "▶ Pulling latest code from GitHub..."
git pull

echo "▶ Installing dependencies..."
npm install --production

echo "▶ Building frontend (if any)..."
# npm run build   # uncomment if you have frontend build

echo "▶ Restarting app with PM2..."
pm2 restart 0

echo "✅ Deployment complete."
