"""URL routing for the api app using DRF's DefaultRouter."""

from rest_framework.routers import DefaultRouter

from .views import ProductViewSet, TodoViewSet, UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"todos", TodoViewSet, basename="todo")

urlpatterns = router.urls
