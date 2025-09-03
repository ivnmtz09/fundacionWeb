from rest_framework import permissions

class HasResourcePermission(permissions.BasePermission):
    """Valida permisos contra tabla ResourceRole usando endpoint y método."""
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated: return False
        role = getattr(user, 'role', None)
        if not role: return False
        path = request.path
        method = request.method.upper()
        from .models import ResourceRole, Resource
        qs = Resource.objects.filter(path_backend=path, http_method=method)
        if not qs.exists(): 
            return True  # si no está mapeado, por defecto permitir (ajústalo)
        res = qs.first()
        rr = ResourceRole.objects.filter(resource=res, role=role).first()
        if not rr: return False
        return (rr.view if method=='GET' else
                rr.create if method=='POST' else
                rr.update if method in ('PUT','PATCH') else
                rr.delete if method=='DELETE' else False)
