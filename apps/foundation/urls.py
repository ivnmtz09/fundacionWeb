from rest_framework.routers import DefaultRouter
from .views import PostViewSet, NotificationViewSet, DocumentViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='posts')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'documents', DocumentViewSet, basename='documents')

urlpatterns = router.urls
