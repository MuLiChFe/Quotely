from rest_framework import serializers
from engine.models import Quote

class QuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = ['id', 'text', 'film_name','number','start_time','end_time']
