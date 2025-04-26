"""
URL configuration for hyperion project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

# Import views from your project's main views.py file
from hyperion.views import landing_page, signup_view # Import landing_page and signup_view

# Import Django's built-in authentication views
from django.contrib.auth import views as auth_views

# Import dashboard views (assuming it's in a separate app)
from dashboard import views as dashboard_views

urlpatterns = [
    path('admin/', admin.site.urls),

    # Landing page URL
    path('', landing_page, name='landing'),

    # Signup URL (points to your custom signup_view)
    path('accounts/signup/', signup_view, name='signup'),

    # --- Django Authentication URLs ---
    # Login view: uses your template at 'admin/login.html'
    path('accounts/login/', auth_views.LoginView.as_view(template_name='admin/login.html'), name='login'),

    # Logout view: redirects to the 'login' URL name after successful logout
    # CHANGED: next_page is now 'login' to redirect to the login page
    path('accounts/logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),

    # --- End Authentication URLs ---

    # Dashboard URL (points to the dashboard app's view)
    path('dashboard/', dashboard_views.dashboard_view, name='dashboard'),

    # Add includes for your other apps here later (Phase 5)
    # path('tasks/', include('tasks.urls')),
    # path('notes/', include('notes.urls')),
    # path('habits/', include('habits.urls')),
    # path('mood_journal/', include('mood_journal.urls')),

]

# Note: UserCreationForm should be imported in your views.py, not here.