#!/bin/bash
# Runs BEFORE CodeDeploy copies new files to EC2
# Purpose: stop running services so files can be safely replaced

set -e

echo "==> Stopping Gunicorn service..."
systemctl stop libravault || true   # || true means don't fail if service doesn't exist yet

echo "==> Creating app directory if not exists..."
mkdir -p /home/ubuntu/libravault/library_frontend/dist
mkdir -p /home/ubuntu/libravault/staticfiles

echo "==> Before install complete."
