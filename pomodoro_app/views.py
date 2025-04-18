# pomodoro_app/views.py

from django.shortcuts import render

def pomodoro_view(request):
    """
    Renders the page that includes the Pomodoro sidebar.
    Template path: 'pomodoro/pomodoro_page.html'
    """
    # *** Change the template name to the new page template ***
    return render(request, 'pomodoro/pomodoro_page.html', {})