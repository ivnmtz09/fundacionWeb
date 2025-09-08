from rest_framework.permissions import BasePermission, SAFE_METHODS

class PostPermissions(BasePermission):
    """
    Permisos basados en rol:
    - Admin: full CRUD
    - Editor: puede crear, ver y actualizar, pero NO borrar
    - Colaborador: puede crear y ver, NO actualizar ni borrar
    - Voluntario / Visitante: solo lectura
    """

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False

        role_level = getattr(user, "role", None).level if getattr(user, "role", None) else 0
        method = request.method

        if method in SAFE_METHODS:  # GET, HEAD, OPTIONS
            return True
        if method == "POST":
            return role_level >= 3  # Colaborador en adelante
        if method in ("PUT", "PATCH"):
            return role_level >= 4  # Editor o Admin
        if method == "DELETE":
            return role_level >= 5  # Solo Admin
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        role_level = getattr(user, "role", None).level if getattr(user, "role", None) else 0

        # Admin siempre puede
        if role_level == 5:
            return True
        # Editor puede editar sus propios posts
        if role_level == 4 and request.method in ("PUT", "PATCH"):
            return obj.author == user
        # Colaborador puede editar sus propios borradores (no publicados)
        if role_level == 3 and request.method in ("PUT", "PATCH"):
            return obj.author == user and not obj.is_published
        # Lectura siempre permitida
        if request.method in SAFE_METHODS:
            return True
        return False
