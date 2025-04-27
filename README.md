======
⚔️ Hyperion
======

*"Focus isn’t a gift. It’s a weapon. Welcome to the training grounds, hunter!"* --- Dante (with a smirk)

Hyperion is your ultimate productivity sidekick, forged for students, dreamers, and warriors ready to slay their daily grind. This full-stack Django-powered beast brings style, sass, and a touch of DMC-inspired flair—helping you focus, plan, and conquer without selling your soul to the chaos. No triggers here, just pure, stylish focus!

Features
---

- **⏱️ Custom Pomodoro Timer with Savage Quotes**
  Tick-tock like a pro, with Dante-level quips to keep you motivated.
  *"You call that focus? Even Vergil’s ghost is laughing!"*

- **🎧 Battle Hymns: YouTube Music Integration**
  Stream your focus tracks or power playlists directly from YouTube. Accepts both single video links and full playlist URLs to fuel your grind.
  *"Every hunter needs a good soundtrack."*

- **✍️ Real-time Note-taking like a Notion Clone**
  Scribble your genius mid-battle—smooth, fast, and way cooler than average diary.

- **📅 To-do List with Priorities, Streaks, and Stat Tracking**
  Prioritize like you’re dodging crazy hordes, track streaks like a style meter, and flex those stats like a true hunter.

- **👀 Background Focus Timer with Pause Recovery Logic**
  Lose focus? Hyperion’s got your back—pauses the clock and nudges you with a “Get it together, rookie!” recovery mode.

- **💀 Minimal UI, Brutal Functionality**
  Sleek design with no nonsense—because who has time for fluff when you’re fighting procrastination?

Built With
---

- **Backend:** Django + PostgreSQL
  The sturdy backbone to take on any productivity chaos.

- **Frontend:** Currently in progress (handled by a friend)
  Expect some stylish flair to match the vibe—stay tuned!

- **Deployment Ready:** Easily extensible and scalable
  Ready to roll out and conquer the hackathon battlefield or beyond.

Prerequisites
---

Before you unleash Hyperion, make sure you've got your arsenal ready:

- **🐍 Python 3.10+** --- `Get it here <https://www.python.org/downloads/>`_
- **🐘 PostgreSQL 14+** --- `Get it here <https://www.postgresql.org/download/>`_
- **🛠️ Django + REST Framework** --- handled via ``requirements.txt`` (no worries, rookie)
- **🧬 Git** --- to clone the repo and join the hunt

Database Setup Ritual
~~~~~~~~~~~~~~~~~~~~~

1. Summon your database (PostgreSQL):

   .. code-block:: sql

      CREATE DATABASE artimes_db;

2. Whisper your secrets into ``artimes/settings.py``:

   .. code-block:: python

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

3. Forge the initial tables:

   .. code-block:: bash

      python manage.py migrate

Philosophy
---

Built not to manage students... But to awaken the inner hunter within—focus with flair, not fear!

Setup Instructions
---

1. **Clone the repo:**

   .. code-block:: bash

      git clone https://github.com/itsjazzkun/artimes-hyperion.git

2. **Create virtual environment:**

   .. code-block:: bash

      python -m venv venv
      venv\Scripts\activate  # For Windows
      source venv/bin/activate  # For macOS/Linux

3. **Install dependencies:**

   .. code-block:: bash

      pip install -r requirements.txt

4. **Apply migrations:**

   .. code-block:: bash

      python manage.py migrate

5. **Run the server:**

   .. code-block:: bash

      python manage.py runserver

License
---

This project is licensed under the MIT License. Feel free to use, fork, or contribute to the madness—join the hunt!

*"Silence the world. Focus the yourself. Unleash your Hyperion—Dante would approve (with a stylish hair flip)!"*