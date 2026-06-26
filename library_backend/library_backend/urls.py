from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from pathlib import Path

BASE_HTML = Path(__file__).resolve().parent.parent.parent / 'library_management.html'


def index(request):
    with open(BASE_HTML, 'r', encoding='utf-8') as f:
        response = HttpResponse(f.read(), content_type='text/html; charset=utf-8')
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    return response


urlpatterns = [
    path('', index, name='index'), 
    path('admin/', admin.site.urls),
    path('api/', include('library.urls')),
]
