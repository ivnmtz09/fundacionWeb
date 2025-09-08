from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from apps.users.permissions import HasResourcePermission
from .models import Post, Notification, Document
from .serializers import (
    PostListSerializer, PostDetailSerializer, NotificationSerializer, DocumentSerializer
)
from .permissions import PostPermissions

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticatedOrReadOnly, HasResourcePermission]

    def get_serializer_class(self):
        if self.action == "list":
            return PostListSerializer
        return PostDetailSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, HasResourcePermission]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by("-created_at")
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, HasResourcePermission]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
