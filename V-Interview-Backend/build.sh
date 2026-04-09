#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
# Migrations should be run in Render's "Release Command" or "Start Command",
# not during the build phase to avoid database connection issues.
# python manage.py migrate