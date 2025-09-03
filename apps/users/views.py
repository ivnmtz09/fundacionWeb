from rest_framework import generics, permissions, viewsets
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer, UserRegisterSerializer, UserUpdateSerializer, RoleSerializer
)
from .models import Role

User = get_user_model()

# Registro de usuarios
class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

# Mi usuario (para update)
class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user

# CRUD de usuarios (solo Admin)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-id")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

# CRUD de roles
class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAdminUser]
