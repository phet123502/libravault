#!/bin/bash
# Runs AFTER after_install.sh
# Purpose: start/restart all services

set -e

echo "==> Creating Gunicorn systemd service..."
cat > /etc/systemd/system/libravault.service <<EOF
[Unit]
Description=LibraVault Django (Gunicorn)
After=network.target mysql.service

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/libravault/library_backend
Environment="DJANGO_SETTINGS_MODULE=library_backend.settings_prod"
ExecStart=/home/ubuntu/libravault/library_backend/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    library_backend.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
EOF

echo "==> Starting Gunicorn..."
systemctl daemon-reload
systemctl enable libravault
systemctl start libravault

echo "==> Reloading Nginx..."
systemctl reload nginx

echo "==> All services started. Deployment complete!"
