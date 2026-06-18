#!/bin/bash
# Google Cloud App Engine Deployment Script
# Prerequisites: gcloud CLI installed and authenticated

set -e

echo "Building Inkwell Labs showcase..."
npm run build

echo "Deploying to Google Cloud App Engine..."
gcloud app deploy app.yaml --quiet

echo "Deployment complete!"
echo "Visit: https://YOUR-PROJECT-ID.appspot.com"
