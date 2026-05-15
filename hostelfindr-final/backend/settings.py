from pathlib import Path
from datetime import timedelta
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent

# ── Security ──────────────────────────────────────────────
SECRET_KEY   = config("SECRET_KEY")
DEBUG        = config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost", cast=Csv())

# ── Installed apps ────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "cloudinary",
    "cloudinary_storage",

    # Local
    "accounts",
    "hostels",
    "reviews",
    "support",
]

# ── Middleware ────────────────────────────────────────────
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",   # serves static files in prod
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF      = "hostelfindr.urls"
WSGI_APPLICATION  = "hostelfindr.wsgi.application"

# ── Database — MongoDB via djongo ─────────────────────────
DATABASES = {
    "default": {
        "ENGINE": "djongo",
        "CLIENT": {
            "host": config("MONGO_URI", default="mongodb://localhost:27017/hostelfindr"),
        },
        "NAME": "hostelfindr",
    }
}

# ── Cloudinary ────────────────────────────────────────────
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": config("CLOUDINARY_CLOUD_NAME", default=""),
    "API_KEY":    config("CLOUDINARY_API_KEY",    default=""),
    "API_SECRET": config("CLOUDINARY_API_SECRET", default=""),
}
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"

# Upload limits
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024   # 10 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024

# ── Static files (WhiteNoise) ─────────────────────────────
STATIC_URL  = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ── REST Framework ────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

# ── JWT ───────────────────────────────────────────────────
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME":  timedelta(seconds=config("ACCESS_TOKEN_LIFETIME",  default=900,    cast=int)),
    "REFRESH_TOKEN_LIFETIME": timedelta(seconds=config("REFRESH_TOKEN_LIFETIME", default=604800, cast=int)),
    "ROTATE_REFRESH_TOKENS":  True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "TOKEN_OBTAIN_SERIALIZER": "accounts.serializers.CustomTokenObtainPairSerializer",
}

# ── CORS ──────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:3000",
    cast=Csv(),
)
CORS_ALLOW_ALL_ORIGINS = DEBUG   # open in dev, restricted in prod

# ── Auth user model ───────────────────────────────────────
AUTH_USER_MODEL = "accounts.User"

# ── Internationalisation ──────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE     = "Africa/Accra"
USE_I18N      = True
USE_TZ        = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
