"""DRF serializers for Supabase-backed models."""

from rest_framework import serializers

from .models import Product, Todo, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "created_at"]
        extra_kwargs = {
            "id": {"required": False},
            "created_at": {"required": False},
        }


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "price", "stock", "created_at"]
        extra_kwargs = {
            "id": {"required": False},
            "created_at": {"required": False},
        }


class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ["id", "title", "completed", "created_at"]
        extra_kwargs = {
            "id": {"required": False},
            "created_at": {"required": False},
        }
