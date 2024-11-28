from .models import Verify, TeamMember, Workspace, User

from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

# Register your models here.

admin.site.register(Verify, ImportExportModelAdmin)
admin.site.register(TeamMember, ImportExportModelAdmin)
admin.site.register(Workspace, ImportExportModelAdmin)
admin.site.register(User, ImportExportModelAdmin)
