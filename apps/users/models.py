from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

class Role(models.Model):
    name = models.CharField(max_length=80, unique=True)
    level = models.FloatField(default=0)
    default = models.BooleanField(default=False)
    def __str__(self): return f"{self.name} ({self.level})"

class Resource(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=100, blank=True)
    path_frontend = models.CharField(max_length=200, blank=True)
    path_backend = models.CharField(max_length=200, blank=True)
    http_method = models.CharField(max_length=10, default="GET")
    order = models.PositiveIntegerField(default=0)
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="children")

    def __str__(self): 
        return self.name

    class Meta:
        unique_together = ("path_backend", "http_method")

class ResourceRole(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    view = models.BooleanField(default=True)
    create = models.BooleanField(default=False)
    update = models.BooleanField(default=False)
    delete = models.BooleanField(default=False)
    class Meta:
        unique_together = ('resource','role')

class User(AbstractUser):
    # username, password, email vienen de AbstractUser
    first_name = models.CharField(max_length=150, blank=True)
    last_name  = models.CharField(max_length=150, blank=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)

@receiver(post_save, sender=User)
def assign_default_role(sender, instance, created, **kwargs):
    """Asigna automáticamente el rol por defecto al crear un usuario nuevo"""
    if created and not instance.role:
        default_role = Role.objects.filter(default=True).first()
        if default_role:
            instance.role = default_role
            instance.save()

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    location = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    interests = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Perfil de {self.user.username}"

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    """Crea un perfil vacío automáticamente al registrar un usuario"""
    if created:
        Profile.objects.create(user=instance)