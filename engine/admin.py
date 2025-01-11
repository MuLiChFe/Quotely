from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

from .models import *

# Register your models here.
admin.site.register(Quote, ImportExportModelAdmin)
admin.site.register(Film, ImportExportModelAdmin)
admin.site.register(Tag, ImportExportModelAdmin)
admin.site.register(Color, ImportExportModelAdmin)
admin.site.register(UserTagOrder, ImportExportModelAdmin)
admin.site.register(TagQuoteManager, ImportExportModelAdmin)
