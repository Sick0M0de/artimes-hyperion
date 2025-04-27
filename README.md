
⚔️ Hyperion
“Focus isn’t a gift. It’s a weapon. Welcome to the training grounds, hunter!” — Dante (with a smirk)
Hyperion is your ultimate productivity sidekick, forged for students, dreamers, and warriors ready to slay their daily grind. This full-stack Django-powered beast brings style, sass, and a touch of DMC-inspired flair—helping you focus, plan, and conquer without selling your soul to the chaos. No triggers here, just pure, stylish focus!
🔮 Features

⏱️ Custom Pomodoro Timer with Savage QuotesTick-tock like a pro, with Dante-level quips to keep you motivated.“You call that focus? Even Vergil’s ghost is laughing!”

🎧 Battle Hymns: YouTube Music IntegrationStream your focus tracks or power playlists directly from YouTube. Accepts both single video links and full playlist URLs to fuel your grind."Every hunter needs a good soundtrack."

✍️ Real-time Note-taking like a Notion CloneScribble your genius mid-battle—smooth, fast, and way cooler than average diary.

📅 To-do List with Priorities, Streaks, and Stat TrackingPrioritize like you’re dodging crazy hordes, track streaks like a style meter, and flex those stats like a true hunter.

👀 Background Focus Timer with Pause Recovery LogicLose focus? Hyperion’s got your back—pauses the clock and nudges you with a “Get it together, rookie!” recovery mode.

💀 Minimal UI, Brutal FunctionalitySleek design with no nonsense—because who has time for fluff when you’re fighting procrastination?


🛠️ Built With

Backend: Django + PostgreSQLThe sturdy backbone to take on any productivity chaos.

Frontend: Currently in progress (handled by a friend)Expect some stylish flair to match the vibe—stay tuned!

Deployment Ready: Easily extensible and scalableReady to roll out and conquer the hackathon battlefield or beyond.


📋 Prerequisites
Before you unleash Hyperion, make sure you've got your arsenal ready:

🐍 Python 3.10+ — Get it here
🐘 PostgreSQL 14+ — Get it here
🛠️ Django + REST Framework — handled via requirements.txt (no worries, rookie)
🧬 Git — to clone the repo and join the hunt

🏗️ Database Setup Ritual

Summon your database (PostgreSQL):
CREATE DATABASE artimes_db;


Whisper your secrets into artimes/settings.py:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'artimes_db',
        'USER': 'your_db_username',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}


Forge the initial tables:
python manage.py migrate



🧠 Philosophy
Built not to manage students... But to awaken the inner hunter within—focus with flair, not fear!
🧾 Setup Instructions

Clone the repo:
git clone https://github.com/itsjazzkun/artimes-hyperion.git


Create virtual environment:
python -m venv venv
venv\Scripts\activate  # For Windows
source venv/bin/activate  # For macOS/Linux


Install dependencies:
pip install -r requirements.txt


Apply migrations:
python manage.py migrate


Run the server:
python manage.py runserver



📜 License
This project is licensed under the MIT License. Feel free to use, fork, or contribute to the madness—join the hunt!“Silence the world. Focus the yourself. Unleash your Hyperion—Dante would approve (with a stylish hair flip)!”
