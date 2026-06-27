#!/bin/bash
# Runs AFTER CodeDeploy copies new files to EC2
# Purpose: install dependencies, run migrations, collect static files

set -e

APP_DIR="/home/ubuntu/libravault"
VENV="$APP_DIR/library_backend/venv"

echo "==> Setting file ownership..."
chown -R ubuntu:ubuntu $APP_DIR

echo "==> Setting up Python virtual environment..."
cd $APP_DIR/library_backend

if [ ! -d "$VENV" ]; then
    echo "Creating new virtual environment..."
    python3 -m venv venv
fi

echo "==> Installing Python dependencies..."
$VENV/bin/pip install --upgrade pip
$VENV/bin/pip install -r requirements.txt
$VENV/bin/pip install gunicorn

echo "==> Running Django migrations..."
DJANGO_SETTINGS_MODULE=library_backend.settings_prod $VENV/bin/python manage.py migrate --noinput

echo "==> Collecting static files..."
DJANGO_SETTINGS_MODULE=library_backend.settings_prod $VENV/bin/python manage.py collectstatic --noinput

echo "==> Fixing permissions on dist folder..."
chmod -R 755 $APP_DIR/library_frontend/dist
chmod o+x /home/ubuntu

echo "==> After install complete."
