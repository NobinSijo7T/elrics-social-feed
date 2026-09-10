"""
DRF ModelViewSets providing full CRUD for all three Supabase tables.

Endpoints (registered via Router in urls.py):
  GET/POST     /api/users/
  GET/PUT/PATCH/DELETE  /api/users/<pk>/

  GET/POST     /api/products/
  GET/PUT/PATCH/DELETE  /api/products/<pk>/

  GET/POST     /api/todos/
  GET/PUT/PATCH/DELETE  /api/todos/<pk>/
"""

import uuid
from datetime import datetime, timezone

from rest_framework import status, viewsets
from rest_framework.response import Response

from .models import Product, Todo, User
from .serializers import ProductSerializer, TodoSerializer, UserSerializer


def _inject_defaults(data: dict) -> dict:
    """
    Inject server-side defaults that Supabase normally handles:
      - id  → new UUID
      - created_at → UTC now

    These are required when inserting via Django since managed=False
    means no database DEFAULT expressions are triggered by Django ORM
    (Supabase triggers them only on direct INSERT without explicit values).
    """
    out = dict(data)
    out.setdefault("id", str(uuid.uuid4()))
    out.setdefault("created_at", datetime.now(timezone.utc).isoformat())
    return out


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        data = _inject_defaults(request.data)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def create(self, request, *args, **kwargs):
        data = _inject_defaults(request.data)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TodoViewSet(viewsets.ModelViewSet):
    queryset = Todo.objects.all()
    serializer_class = TodoSerializer

    def create(self, request, *args, **kwargs):
        data = _inject_defaults(request.data)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
