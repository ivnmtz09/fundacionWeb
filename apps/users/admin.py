from django.contrib import admin
from .models import User, Role, Resource, ResourceRole, Profile
admin.site.register([User, Role, Resource, ResourceRole, Profile])
