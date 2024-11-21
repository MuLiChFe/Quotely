from .models import User, Verify

from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

# Register your models here.
admin.site.register(User, ImportExportModelAdmin)
admin.site.register(Verify, ImportExportModelAdmin)