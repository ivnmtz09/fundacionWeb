from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Role, Profile

User = get_user_model()

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = "__all__"

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ("location","bio","interests","avatar", "phone_number", "address")

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    role = RoleSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id","username","email","first_name","last_name","role","profile")

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ("id","username","email","password","first_name","last_name")

    def create(self, validated_data):
        role = Role.objects.filter(default=True).first()  # Visitante por defecto
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
            first_name=validated_data.get("first_name",""),
            last_name=validated_data.get("last_name",""),
            role=role
        )
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()
    class Meta:
        model = User
        fields = ("first_name","last_name","email","profile")
    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})
        for k,v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        for k,v in profile_data.items():
            setattr(instance.profile, k, v)
        instance.profile.save()
        return instance
