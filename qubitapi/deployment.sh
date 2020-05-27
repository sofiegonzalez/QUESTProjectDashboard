#!/bin/bash
python3 -m venv .venv
.venv/bin/pip install wheel
.venv/bin/pip install gunicorn
.venv/bin/pip install -r requirements.txt

sudo systemctl restart qubitapi
sudo systemctl restart nginx