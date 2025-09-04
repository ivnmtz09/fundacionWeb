from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Resource, ResourceRole


class HasResourcePermission(BasePermission):
    """
    Valida permisos según el rol del usuario y el recurso al que accede.
    Soporta resources con placeholder '<id>' (ej: '/api/foundation/posts/<id>/')
    """

    def _match_resource(self, path, method):
        """
        Busca un Resource que coincida exactamente con la path y method,
        o que tenga '<id>' y cuyo prefijo coincida con el inicio de la path.
        Retorna el primer Resource encontrado o None.
        """
        # buscar coincidencia exacta
        res = Resource.objects.filter(path_backend=path, http_method=method).first()
        if res:
            return res

        # buscar resources con placeholder <id>
        candidates = Resource.objects.filter(http_method=method, path_backend__contains="<id>")
        for c in candidates:
            prefix = c.path_backend.replace("<id>", "")
            if path.startswith(prefix):
                return c

        # buscar resources con path_backend vacío o generic (opcional)
        return None

    def has_permission(self, request, view):
        user = request.user

        # permitir acceso a vistas públicas (no autenticadas) si método es seguro
        if not user.is_authenticated and request.method in SAFE_METHODS:
            return True

        if not user.is_authenticated:
            return False

        path = request.path
        method = request.method

        resource = self._match_resource(path, method)
        if not resource:
            # Si no existe resource definido, denegamos por seguridad.
            return False

        # buscar permiso asignado al rol del usuario
        try:
            res_role = ResourceRole.objects.filter(resource=resource, role=user.role).first()
        except ResourceRole.DoesNotExist:
            res_role = None

        if not res_role:
            return False

        if method in SAFE_METHODS and res_role.view:
            return True
        if method == "POST" and res_role.create:
            return True
        if method in ["PUT", "PATCH"] and res_role.update:
            return True
        if method == "DELETE" and res_role.delete:
            return True

        return False
