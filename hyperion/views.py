# hyperion/hyperion/views.py
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm # Assuming UserCreationForm is here or imported correctly
from django.contrib.auth import login, authenticate # Import authenticate and login for auto-login
from django.contrib import messages # Import messages for user feedback
from django.urls import reverse # Import reverse to get URLs by name

# --- Landing Page View ---
# This is your existing landing page view.
def landing_page(request):
    """
    View for the landing page.
    Renders the landing/index.html template.
    """
    return render(request, 'landing/index.html')

# --- Signup View (with Auto-Login) ---
def signup_view(request):
    """
    Handles user registration.
    Displays a signup form on GET requests.
    Processes form submission on POST requests, creates a user,
    logs them in, and redirects to the dashboard upon success.
    """
    # If the request method is POST, it means the form was submitted
    if request.method == 'POST':
        # Create a form instance and populate it with data from the request
        form = UserCreationForm(request.POST)
        # Check if the form is valid (e.g., passwords match, username is unique)
        if form.is_valid():
            # Save the new user object (commit=False means don't save to database yet)
            user = form.save(commit=False)
            # You can perform additional actions on the user object before saving
            # For example, setting an inactive status or adding to a group
            # user.is_active = False # Example: require email confirmation later
            user.save() # Save the user object to the database

            # --- Auto-login the user after successful signup ---
            # Authenticate the user using the username and password from the form
            # We use form.cleaned_data to get validated data
            username = form.cleaned_data.get('username')
            # Use 'password2' from the form as it contains the raw confirmation password
            password = form.cleaned_data.get('password2')
            # Authenticate the user - this verifies the credentials
            user = authenticate(request, username=username, password=password)

            # If authentication is successful (user is not None)
            if user is not None:
                # Log the user in - this establishes the session
                login(request, user)
                # Add a success message for the user
                messages.success(request, 'Account created successfully and you are now logged in!')
                # Redirect to the URL defined in settings.LOGIN_REDIRECT_URL (which should be 'dashboard')
                # Using reverse() is good practice to get the URL by its name
                return redirect(reverse('dashboard')) # Redirect to the dashboard

            # If authentication failed after saving (this is unlikely with default UserCreationForm
            # but included for robustness)
            else:
                messages.error(request, 'Error logging in after signup. Please try logging in manually.')
                # Redirect to the login page using its URL name
                return redirect(reverse('login'))

        # If the form is not valid, re-render the signup page with errors
        else:
            # Form contains errors, they will be displayed in the template
            messages.error(request, 'Please correct the errors below.')
            # The form with errors will automatically be passed to the template below
            pass # Continue to render the template with the form

    # If the request method is GET, display a blank signup form
    else:
        form = UserCreationForm()

    # Render the signup template, passing the form to it
    # The template path should match your file structure (e.g., 'registration/signup.html')
    return render(request, 'registration/signup.html', {'form': form})

# Note: Your dashboard_view should be in dashboard/views.py and have the @login_required decorator.
# It is not needed in this file unless you've consolidated all views here.
# Example import if dashboard_view is in dashboard/views.py:
# from dashboard.views import dashboard_view
