import logging
from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Resource, ResourceRole
import re


class HasResourcePermission(BasePermission):
    """
    Valida permisos según el rol del usuario y el recurso al que accede.
    Soporta resources con placeholders dinámicos como <id>, <slug>, etc.
    """

    def _normalize_path(self, path: str) -> str:
        """
        Normaliza un path dinámico:
        - Reemplaza segmentos numéricos por <id>
        - Reemplaza segmentos tipo slug (palabras con guiones) por <slug>
        """
        segments = path.strip("/").split("/")
        normalized = []
        for seg in segments:
            if re.match(r"^\d+$", seg):  # solo números
                normalized.append("<id>")
            elif re.match(r"^[a-zA-Z0-9_-]+$", seg) and seg != "api":  # slug básico
                normalized.append(seg)
            else:
                normalized.append(seg)
        return "/" + "/".join(normalized) + "/"

    def has_permission(self, request, view):
        user = request.user
        method = request.method
        normalized_path = self._normalize_path(request.path)

        # Permitir GET/HEAD/OPTIONS públicos
        if not user.is_authenticated and method in SAFE_METHODS:
            return True
        if not user.is_authenticated:
            return False

        # buscar coincidencia exacta
        resource = Resource.objects.filter(path_backend=normalized_path, http_method=method).first()
        if not resource:
            logging.warning(f"Resource no encontrado: {normalized_path} [{method}]")
            return False  # seguridad: si no hay resource definido, denegar

        # buscar permisos para el rol
        res_role = ResourceRole.objects.filter(role=user.role, resource=resource).first()
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

