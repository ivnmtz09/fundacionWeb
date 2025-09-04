from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from apps.users.permissions import HasResourcePermission
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer, UserRegisterSerializer, UserUpdateSerializer, RoleSerializer
)
from .models import Role

User = get_user_model()

class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]  # Cualquiera puede registrarse


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated, HasResourcePermission]

    def get_object(self):
        return self.request.user


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-id")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, HasResourcePermission]


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, HasResourcePermission]
