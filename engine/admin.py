from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

from .models import Quote, Film, Tag

# Register your models here.
admin.site.register(Quote, ImportExportModelAdmin)
admin.site.register(Film, ImportExportModelAdmin)
admin.site.register(Tag, ImportExportModelAdmin)