"""
Django settings for elrics_api project.
Connects to Supabase PostgreSQL. Uses unmanaged models — no migrations run.
"""

import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Base directory & environment
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env from the project root (one level above backend/)
load_dotenv(BASE_DIR.parent / ".env")

# ---------------------------------------------------------------------------
# Security
# ---------------------------------------------------------------------------
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-elrics-dev-key-change-in-production-abc123xyz"
)
DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]

# ---------------------------------------------------------------------------
# Application definition
# ---------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "api",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "elrics_api.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
            ],
        },
    },
]

WSGI_APPLICATION = "elrics_api.wsgi.application"

# ---------------------------------------------------------------------------
# Database — Supabase PostgreSQL (direct connection, bypasses PostgREST)
# ---------------------------------------------------------------------------
# Prefer the direct Postgres connection (port 5432) — the pooler URL (port 6543)
# uses a different user format that confuses psycopg2 drivers.
_db_url = os.getenv("DATABASE_URL") or os.getenv("DATABASE_DIRECT_URL")

if not _db_url:
    raise RuntimeError(
        "Neither DATABASE_DIRECT_URL nor DATABASE_URL is set. "
        "Make sure the .env file at the project root is populated."
    )

DATABASES = {
    "default": dj_database_url.parse(
        _db_url,
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Force the schema search path to public (Supabase default)
DATABASES["default"].setdefault("OPTIONS", {})
DATABASES["default"]["OPTIONS"]["options"] = "-c search_path=public"

# ---------------------------------------------------------------------------
# Password validation — not used (no Django auth)
# ---------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = []

# ---------------------------------------------------------------------------
# Disable Django's migration framework — all models are unmanaged (managed=False)
# pointing at the Supabase-owned schema. No django_migrations table needed.
# ---------------------------------------------------------------------------
MIGRATION_MODULES: dict = {
    "api": None,
    "auth": None,
    "contenttypes": None,
}

# ---------------------------------------------------------------------------
# Internationalisation
# ---------------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------------------
# Static files
# ---------------------------------------------------------------------------
STATIC_URL = "static/"

# ---------------------------------------------------------------------------
# Default primary key — not relevant (unmanaged models use UUIDs)
# ---------------------------------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 50,
}

# ---------------------------------------------------------------------------
# CORS — allow Next.js dev server to call Django APIs
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Open in dev; restrict in production
