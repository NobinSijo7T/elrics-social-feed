"""URL configuration for the elrics_api Django project."""

from django.urls import include, path

urlpatterns = [
    path("api/", include("api.urls")),
]
