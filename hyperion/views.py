from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login

def landing_page(request):
    return render(request, 'landing/index.html')

def signup_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)  # Log the user in automatically after signup
            return redirect('landing')  # Redirect to your landing page or another desired page
    else:
        form = UserCreationForm()
    return render(request, 'registration/signup.html', {'form': form})