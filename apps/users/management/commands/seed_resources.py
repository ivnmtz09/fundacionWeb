from django.core.management.base import BaseCommand
from apps.users.models import Role, Resource, ResourceRole
from apps.foundation.models import Post
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Crea/actualiza Roles, Resources y ResourceRoles (idempotente)."

    def handle(self, *args, **options):
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

        resources_def = [
            {"name": "User profile (GET)", "path_backend": "/api/users/me/", "http_method": "GET"},
            {"name": "User profile (PUT)", "path_backend": "/api/users/me/", "http_method": "PUT"},
            {"name": "User register (POST)", "path_backend": "/api/users/auth/register/", "http_method": "POST"},
            {"name": "User login (POST)", "path_backend": "/api/users/auth/login/", "http_method": "POST"},
            {"name": "Posts list (GET)", "path_backend": "/api/foundation/posts/", "http_method": "GET"},
            {"name": "Posts create (POST)", "path_backend": "/api/foundation/posts/", "http_method": "POST"},
            {"name": "Post detail (GET)", "path_backend": "/api/foundation/posts/<id>/", "http_method": "GET"},
            {"name": "Post detail (PUT)", "path_backend": "/api/foundation/posts/<id>/", "http_method": "PUT"},
            {"name": "Post detail (DELETE)", "path_backend": "/api/foundation/posts/<id>/", "http_method": "DELETE"},
            {"name": "Documents list (GET)", "path_backend": "/api/foundation/documents/", "http_method": "GET"},
            {"name": "Documents create (POST)", "path_backend": "/api/foundation/documents/", "http_method": "POST"},
            {"name": "Document detail (DELETE)", "path_backend": "/api/foundation/documents/<id>/", "http_method": "DELETE"},
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

        perms_table = {
            "Admin": {"view": True, "create": True, "update": True, "delete": True},
            "Editor": {
                "view": True, "create": True, "update": True, "delete": False,
                "delete_posts": True
            },
            "Colaborador": {"view": True, "create": True, "update": False, "delete": False},
            "Voluntario": {"view": True, "create": False, "update": False, "delete": False},
            "Visitante": {"view": True, "create": False, "update": False, "delete": False},
        }

        for role_name, perms in perms_table.items():
            role = roles.get(role_name)
            if not role:
                self.stdout.write(self.style.WARNING(f"Rol {role_name} no encontrado, saltando..."))
                continue
            for res_name, res_obj in resources.items():
                # Permisos por recurso
                if res_obj.path_backend == "/api/users/me/" and res_obj.http_method == "PUT" and role_name in ["Visitante", "Voluntario"]:
                    view = perms["view"]
                    create = perms["create"]
                    update = True  # Visitante y Voluntario pueden hacer PUT en /api/users/me/
                    delete = perms["delete"]
                elif "Posts" in res_name or "Post" in res_name:
                    if role_name == "Editor":
                        delete = perms.get("delete_posts", False) if "DELETE" in res_obj.http_method else perms["delete"]
                    else:
                        delete = perms["delete"]
                    view = perms["view"]
                    create = perms["create"] if "create" in res_name or "POST" in res_obj.http_method else False
                    update = perms["update"] if "PUT" in res_obj.http_method else False
                elif "Documents" in res_name or "Document" in res_name:
                    view = perms["view"]
                    create = perms["create"] if "create" in res_name or "POST" in res_obj.http_method else False
                    update = perms["update"] if "PUT" in res_obj.http_method else False
                    delete = perms["delete"] if role_name in ["Admin"] else False
                elif "Notifications" in res_name:
                    view = perms["view"]
                    create = perms["create"] if role_name in ["Admin", "Editor"] else False
                    update = False
                    delete = False
                else:
                    view = perms["view"]
                    create = perms["create"]
                    update = perms["update"]
                    delete = perms["delete"]
                rr, created = ResourceRole.objects.get_or_create(resource=res_obj, role=role)
                changed = False
                if rr.view != view:
                    rr.view = view
                    changed = True
                if rr.create != create:
                    rr.create = create
                    changed = True
                if rr.update != update:
                    rr.update = update
                    changed = True
                if rr.delete != delete:
                    rr.delete = delete
                    changed = True
                if changed:
                    rr.save()
                    self.stdout.write(f"Actualizados permisos para Role={role_name} Resource={res_name}")
                else:
                    self.stdout.write(f"Permisos ya ok para Role={role_name} Resource={res_name}")

        tipos = ["news", "blog", "event"]
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
                    author=None,
                )
                self.stdout.write(f"Creado Post de ejemplo tipo={t}")
            else:
                self.stdout.write(f"Ya existe Post de tipo={t}, no se crea")

        self.stdout.write(self.style.SUCCESS("Seed resources completado satisfactoriamente."))
