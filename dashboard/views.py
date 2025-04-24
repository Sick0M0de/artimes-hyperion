# hyperion/dashboard/views.py
from django.shortcuts import render
from django.contrib.auth.decorators import login_required # Import this decorator

@login_required # Uncommented: This view now requires login
def dashboard_view(request):
    context = {
        'page_title': 'Dashboard Overview',
        # Add data fetching logic here later (Phase 7)
        # Example: Fetch some recent tasks for the dashboard overview
        # 'recent_tasks': Task.objects.filter(user=request.user).order_by('-created_at')[:5],
    }
    return render(request, 'dashboard/dashboard.html', context)