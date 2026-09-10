"""
Unmanaged Django models mapping to the existing Supabase PostgreSQL tables.

managed = False  →  Django will NEVER create, alter, or drop these tables.
The Supabase schema (supabase/schema.sql) remains the single source of truth.
"""

import uuid

from django.db import models


class User(models.Model):
    """Maps to public.users — mirrors TypeScript User type in src/lib/database.ts."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField()
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=False)

    class Meta:
        managed = False          # Never touch the real table
        db_table = "users"       # Supabase table name (public schema)
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} <{self.email}>"


class Product(models.Model):
    """Maps to public.products — mirrors TypeScript Product type in src/lib/database.ts."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=False)

    class Meta:
        managed = False
        db_table = "products"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} (${self.price})"


class Todo(models.Model):
    """Maps to public.todos — mirrors TypeScript Todo type in src/lib/database.ts."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.TextField()
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=False)

    class Meta:
        managed = False
        db_table = "todos"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        status = "✓" if self.completed else "○"
        return f"[{status}] {self.title}"
