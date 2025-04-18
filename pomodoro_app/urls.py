# pomodoro_app/urls.py

from django.urls import path
from . import views

# Define the app_name for namespacing URLs (good practice)
app_name = 'pomodoro_app'

urlpatterns = [
    # Maps the root URL of this app (e.g., /pomodoro/) to the pomodoro_view
    path('', views.pomodoro_view, name='pomodoro'),
    # You can add other URLs specific to the pomodoro app here
]