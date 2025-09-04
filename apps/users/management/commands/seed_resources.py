from django.core.management.base import BaseCommand
from apps.users.models import Role, Resource, ResourceRole
from apps.foundation.models import Post
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Crea/actualiza Roles, Resources y ResourceRoles (idempotente)."

    def handle(self, *args, **options):
        # 1) ROLES: si existen se respetan sus level/default; si no, se crean
        roles_map = {
            "Admin": {"level": 5, "default": False},
            "Editor": {"level": 4, "default": False},
            "Colaborador": {"level": 3, "default": False},
            "Voluntario": {"level": 2, "default": False},
            "Visitante": {"level": 1, "default": True},
        }

        roles = {}
        for name, attrs in roles_map.items():
            role, created = Role.objects.get_or_create(name=name)
            # Si el rol ya existe, no sobrescribimos level/default por seguridad
            if created:
                role.level = attrs["level"]
                role.default = attrs["default"]
                role.save()
                self.stdout.write(f"Creado rol: {name}")
            else:
                self.stdout.write(f"Existe rol: {name} (level={role.level}, default={role.default})")
            roles[name] = role

        # 2) RESOURCES: get_or_create por path_backend + http_method
        resources_def = [
            # Users
            {"name": "User profile (GET)", "path_backend": "/api/users/me/", "http_method": "GET"},
            {"name": "User profile (PUT)", "path_backend": "/api/users/me/", "http_method": "PUT"},
            {"name": "User register (POST)", "path_backend": "/api/users/auth/register/", "http_method": "POST"},
            {"name": "User login (POST)", "path_backend": "/api/users/auth/login/", "http_method": "POST"},

            # Posts
            {"name": "Posts list (GET)", "path_backend": "/api/foundation/posts/", "http_method": "GET"},
            {"name": "Posts create (POST)", "path_backend": "/api/foundation/posts/", "http_method": "POST"},
            {"name": "Post detail (GET)", "path_backend": "/api/foundation/posts/<id>/", "http_method": "GET"},
            {"name": "Post detail (PUT)", "path_backend": "/api/foundation/posts/<id>/", "http_method": "PUT"},
            {"name": "Post detail (DELETE)", "path_backend": "/api/foundation/posts/<id>/", "http_method": "DELETE"},

            # Documents
            {"name": "Documents list (GET)", "path_backend": "/api/foundation/documents/", "http_method": "GET"},
            {"name": "Documents create (POST)", "path_backend": "/api/foundation/documents/", "http_method": "POST"},
            {"name": "Document detail (DELETE)", "path_backend": "/api/foundation/documents/<id>/", "http_method": "DELETE"},

            # Notifications
            {"name": "Notifications list (GET)", "path_backend": "/api/foundation/notifications/", "http_method": "GET"},
            {"name": "Notifications create (POST)", "path_backend": "/api/foundation/notifications/", "http_method": "POST"},
        ]

        resources = {}
        for r in resources_def:
            res, created = Resource.objects.get_or_create(
                path_backend=r["path_backend"],
                http_method=r["http_method"],
                defaults={"name": r["name"], "icon": "", "order": 0}
            )
            if created:
                self.stdout.write(f"Creado Resource: {r['name']} [{r['http_method']}] {r['path_backend']}")
            else:
                # actualizar nombre si cambió (no overwritear path/http)
                if res.name != r["name"]:
                    res.name = r["name"]
                    res.save()
                    self.stdout.write(f"Actualizado nombre Resource: {r['name']}")
                else:
                    self.stdout.write(f"Existe Resource: {r['name']} [{r['http_method']}]")
            resources[r["name"]] = res

        # 3) RESOURCEROLES: asignar/actualizar permisos (idempotente)
        # Definición de permisos por rol (ajústalo si quieres otro comportamiento)
        perms_map = {
            "Admin": {"view": True, "create": True, "update": True, "delete": True},
            "Editor": {"view": True, "create": True, "update": True, "delete": True},
            "Colaborador": {"view": True, "create": True, "update": False, "delete": False},
            "Voluntario": {"view": True, "create": False, "update": False, "delete": False},
            "Visitante": {"view": True, "create": False, "update": False, "delete": False},
        }

        for role_name, perms in perms_map.items():
            role = roles.get(role_name)
            if not role:
                self.stdout.write(self.style.WARNING(f"Rol {role_name} no encontrado, saltando..."))
                continue
            for res_name, res_obj in resources.items():
                # decide reglas particulares (p. ej. Colaborador no crea documentos)
                apply_perm = True
                # Ejemplos de reglas especiales:
                if role_name == "Colaborador":
                    # Colaborador solo puede crear posts, no documentos ni eliminar
                    if "Documents" in res_name or "Document" in res_name:
                        apply_perm = False
                if role_name == "Voluntario":
                    # Voluntario puede ver posts y notificaciones, no crear posts por defecto
                    if "Posts create" in res_name:
                        apply_perm = False

                if not apply_perm:
                    # asegurar existencia con permisos por defecto (no dar privilegios)
                    rr, _ = ResourceRole.objects.get_or_create(resource=res_obj, role=role)
                    rr.view = perms.get("view", False) and ("list" in res_name or "detail" in res_name)
                    rr.create = False
                    rr.update = False
                    rr.delete = False
                    rr.save()
                    continue

                rr, created = ResourceRole.objects.get_or_create(resource=res_obj, role=role)
                # actualizar a lo deseado (idempotente)
                changed = False
                for k, v in perms.items():
                    if getattr(rr, k) != v:
                        setattr(rr, k, v)
                        changed = True
                if changed:
                    rr.save()
                    self.stdout.write(f"Actualizados permisos para Role={role_name} Resource={res_name}")
                else:
                    self.stdout.write(f"Permisos ya ok para Role={role_name} Resource={res_name}")

        # 4) TIPOS y POSTS EXAMPLE (no dependen para la lógica, son opcionales)
        # Crear posts de ejemplo por tipo sólo si no existen posts con ese type
        tipos = ["noticia", "blog", "evento"]
        for t in tipos:
            exists = Post.objects.filter(type=t).exists()
            if not exists:
                Post.objects.create(
                    title=f"Ejemplo {t}",
                    slug=f"ejemplo-{t}",
                    type=t,
                    summary=f"Resumen ejemplo {t}",
                    content=f"Contenido de ejemplo para {t}",
                    is_published=False,
                    author=None,  # no forzar author
                )
                self.stdout.write(f"Creado Post de ejemplo tipo={t}")
            else:
                self.stdout.write(f"Ya existe Post de tipo={t}, no se crea")

        self.stdout.write(self.style.SUCCESS("Seed resources completado satisfactoriamente."))
