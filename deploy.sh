#!/bin/bash
# LibraVault EC2 Deployment Script
# OS: Ubuntu 22.04
# Run as: sudo bash deploy.sh

set -e  # stop on any error

# ─── CONFIGURE THESE BEFORE RUNNING ───────────────────────────────────────────
DB_NAME="libravault_db"
DB_USER="libravault"
DB_PASS="Kemchemajama"
DJANGO_SECRET="f1e871eb6ba3fb37625a4a0483ea6f09a185096e"
EC2_PUBLIC_IP="98.83.219.64"   # e.g. 54.123.45.67
APP_DIR="/home/ubuntu/libravault"
# ──────────────────────────────────────────────────────────────────────────────

echo "========================================"
echo " LibraVault Deployment Starting..."
echo "========================================"

# ─── 1. SYSTEM PACKAGES ───────────────────────────────────────────────────────
echo "[1/9] Installing system packages..."
apt-get update -y
apt-get install -y python3 python3-pip python3-venv \
    mysql-server nginx nodejs npm git curl

# ─── 2. MYSQL SETUP ───────────────────────────────────────────────────────────
echo "[2/9] Setting up MySQL..."
systemctl start mysql
systemctl enable mysql

mysql -u root <<SQL
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

echo "MySQL database and user created."

# ─── 3. CLONE FROM GITHUB ─────────────────────────────────────────────────────
echo "[3/9] Cloning project from GitHub..."
if [ -d "${APP_DIR}/.git" ]; then
    echo "Repo already exists, pulling latest..."
    cd ${APP_DIR} && git pull
else
    git clone https://github.com/phet123502/libravault.git ${APP_DIR}
fi

# ─── 4. DJANGO BACKEND SETUP ──────────────────────────────────────────────────
echo "[4/9] Setting up Django backend..."
cd ${APP_DIR}/library_backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies + gunicorn
pip install -r requirements.txt
pip install gunicorn

# Write production settings
cat > library_backend/settings_prod.py <<PYEOF
from .settings import *

DEBUG = False
SECRET_KEY = '${DJANGO_SECRET}'
ALLOWED_HOSTS = ['${EC2_PUBLIC_IP}', 'localhost', '127.0.0.1']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': '${DB_NAME}',
        'USER': '${DB_USER}',
        'PASSWORD': '${DB_PASS}',
        'HOST': '127.0.0.1',
        'PORT': '3306',
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}

STATIC_URL = '/static/'
STATIC_ROOT = '${APP_DIR}/staticfiles'

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = ['http://${EC2_PUBLIC_IP}']
PYEOF

# Run migrations and seed data
DJANGO_SETTINGS_MODULE=library_backend.settings_prod python manage.py migrate
DJANGO_SETTINGS_MODULE=library_backend.settings_prod python manage.py seed_data || true
DJANGO_SETTINGS_MODULE=library_backend.settings_prod python manage.py collectstatic --noinput

deactivate

# ─── 5. REACT FRONTEND BUILD ──────────────────────────────────────────────────
echo "[5/9] Building React frontend..."
cd ${APP_DIR}/library_frontend
npm install
npm run build
# Build output goes to: library_frontend/dist/

# ─── 6. GUNICORN SYSTEMD SERVICE ──────────────────────────────────────────────
echo "[6/9] Creating Gunicorn service..."
cat > /etc/systemd/system/libravault.service <<EOF
[Unit]
Description=LibraVault Django (Gunicorn)
After=network.target mysql.service

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=${APP_DIR}/library_backend
Environment="DJANGO_SETTINGS_MODULE=library_backend.settings_prod"
ExecStart=${APP_DIR}/library_backend/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    library_backend.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable libravault
systemctl start libravault

# ─── 7. NGINX CONFIGURATION ───────────────────────────────────────────────────
echo "[7/9] Configuring Nginx..."
cat > /etc/nginx/sites-available/libravault <<EOF
server {
    listen 80;
    server_name ${EC2_PUBLIC_IP};

    # Serve React frontend (built files)
    root ${APP_DIR}/library_frontend/dist;
    index index.html;

    # React SPA — all unknown routes go to index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy /api/ requests to Django (Gunicorn)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Serve Django static files (admin panel etc.)
    location /static/ {
        alias ${APP_DIR}/staticfiles/;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/libravault /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t   # test config
systemctl restart nginx
systemctl enable nginx

# ─── 8. FIREWALL (UFW) ────────────────────────────────────────────────────────
echo "[8/9] Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ─── 9. DONE ──────────────────────────────────────────────────────────────────
echo ""
echo "========================================"
echo " Deployment Complete!"
echo "========================================"
echo " App URL   : http://${EC2_PUBLIC_IP}"
echo " Admin     : admin@libravault.com / admin123"
echo " User      : user@libravault.com / user123"
echo ""
echo " Useful commands:"
echo "   sudo systemctl status libravault   # check Django"
echo "   sudo systemctl status nginx        # check Nginx"
echo "   sudo journalctl -u libravault -f   # live Django logs"
echo "========================================"
