# Backend Development Guide: NBA OBE Portal (Django REST Framework & Docker)

This document provides a comprehensive, step-by-step guide for building the backend server for the NBA OBE Portal frontend. The recommended stack is **Django**, **Django REST Framework (DRF)**, **PostgreSQL**, and **Docker**.

The primary goal is to replace the `mockData.json` file and all client-side `setData` calls with live API requests to this backend.

---

## **Table of Contents**

1.  [Technology Stack](#1-technology-stack)
2.  [Step 1: Project Setup](#2-step-1-project-setup)
3.  [Step 2: Dockerization](#3-step-2-dockerization)
4.  [Step 3: Running the Development Environment](#4-step-3-running-the-development-environment)
5.  [Step 4: Models & Migrations](#5-step-4-models--migrations)
6.  [Step 5: Seeding Initial Data](#6-step-5-seeding-initial-data)
7.  [Step 6: Serializers](#7-step-6-serializers)
8.  [Step 7: Views & ViewSets](#8-step-7-views--viewsets)
9.  [Step 8: URLs & Routing](#9-step-8-urls--routing)
10. [Step 9: Authentication & Permissions](#10-step-9-authentication--permissions)
11. [Step 10: API Endpoint Cheatsheet](#11-step-10-api-endpoint-cheatsheet)
12. [Step 11: Frontend Refactoring Strategy](#12-step-11-frontend-refactoring-strategy)
13. [Step 12: Deployment Considerations](#13-step-12-deployment-considerations)

---

## 1. Technology Stack

*   **Backend Framework**: Django
*   **API Toolkit**: Django REST Framework (DRF)
*   **Database**: PostgreSQL
*   **Containerization**: Docker, Docker Compose
*   **Dependencies**: `psycopg2-binary`, `djangorestframework`, `django-cors-headers`, `gunicorn`

## 2. Step 1: Project Setup

First, set up the basic Django project structure.

```bash
# 1. Create a project directory
mkdir obe-portal-backend && cd obe-portal-backend

# 2. Start the Django project and an 'api' app
# (Assuming you have Django installed locally to run this command)
django-admin startproject obe_portal .
python manage.py startapp api

# 3. Create a requirements.txt file for dependencies
touch requirements.txt
```

Populate `requirements.txt` with the following:
```
django
djangorestframework
psycopg2-binary
django-cors-headers
gunicorn
```

## 3. Step 2: Dockerization

Containerizing the application with Docker ensures a consistent development and production environment.

### Step 2a: Create the Dockerfile

Create a file named `Dockerfile` in the project root:

```dockerfile
# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project
COPY . /app/
```

### Step 2b: Create the Docker Compose File

Create a file named `docker-compose.yml` to define and run the multi-container application (backend + database).

```yaml
version: '3.8'

services:
  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_DB=obe_portal_db
      - POSTGRES_USER=obe_user
      - POSTGRES_PASSWORD=obe_password
    ports:
      - "5432:5432"

  web:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    environment:
      - SECRET_KEY=your_secret_key_for_development_only_change_in_production
      - DJANGO_SETTINGS_MODULE=obe_portal.settings
      - DB_NAME=obe_portal_db
      - DB_USER=obe_user
      - DB_PASSWORD=obe_password
      - DB_HOST=db
      - DB_PORT=5432
    depends_on:
      - db

volumes:
  postgres_data:
```

### Step 2c: Configure Django Settings

Modify `obe_portal/settings.py` to be Docker-aware and read from environment variables.

```python
# obe_portal/settings.py
import os # Add this import

INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

# Update DATABASES to read from environment variables
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT'),
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}

# CORS Settings (for development)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000", # Or your frontend's dev port
]
```

## 4. Step 3: Running the Development Environment

With Docker, starting your entire backend stack is a single command.

```bash
# Build and start the containers in detached mode
docker-compose up --build -d
```
Your Django API will now be running and accessible at `http://localhost:8000`.

## 5. Step 4: Models & Migrations

Define your relational models in `api/models.py`. These models are updated to be consistent with your frontend's latest `types.ts` (including `Program.duration`, `Batch`, and `Section.batch`).

**`api/models.py` (Full Example):**

```python
from django.db import models
from django.db.models import JSONField

# --- Choices for Enum-like fields ---
class UserRole(models.TextChoices):
    TEACHER = 'Teacher', 'Teacher'
    COORDINATOR = 'Program Co-ordinator', 'Program Co-ordinator'
    UNIVERSITY = 'University', 'University'
    ADMIN = 'Admin', 'Admin'
    DEPARTMENT = 'Department', 'Department'

class College(models.Model):
    id = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=100)
    def __str__(self): return self.name

class User(models.Model):
    # ... (User model as provided in original guide) ...
    # Make sure to handle relational fields correctly
    pass

class Program(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='programs')
    duration = models.IntegerField(default=4) # Duration in years

    def __str__(self): return self.name

class Batch(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='batches')
    name = models.CharField(max_length=20) # e.g., "2025-2029"

    def __str__(self): return f"{self.program.name} - {self.name}"

class Section(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=50)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='sections')
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='sections')

    def __str__(self): return f"{self.program.name} - {self.batch.name} - Section {self.name}"

# ... (Continue defining Student, Course, Enrollment, etc. using ForeignKeys) ...
```

**Running Migrations**: Use `docker-compose exec` to run commands inside your `web` container.

```bash
# Generate migration files
docker-compose exec web python manage.py makemigrations

# Apply migrations to the database
docker-compose exec web python manage.py migrate
```

## 6. Step 5: Seeding Initial Data

Create a management command to seed the database. Update the script to handle the new `Batch` model.

**`api/management/commands/seed_data.py` (Updated Logic):**

```python
# ... (imports)
class Command(BaseCommand):
    help = 'Seeds the database with initial data from mockData.json'

    def handle(self, *args, **options):
        # ... (Clear data as before) ...

        # Seed Colleges, Programs...
        
        # Seed Batches (New)
        batches_map = {}
        for batch_data in data['batches']:
            program = Program.objects.get(id=batch_data.pop('programId'))
            batch = Batch.objects.create(program=program, **batch_data)
            batches_map[batch.id] = batch

        # Seed Sections (Updated)
        for section_data in data['sections']:
            program = Program.objects.get(id=section_data.pop('programId'))
            batch = batches_map[section_data.pop('batchId')]
            Section.objects.create(program=program, batch=batch, **section_data)

        # ... (Continue seeding other data) ...
```
Run the seeder command:
```bash
docker-compose exec web python manage.py seed_data
```

## 7. Step 6: Serializers
*(No changes from original guide)*

## 8. Step 7: Views & ViewSets
*(No changes from original guide, but remember filtering logic)*

## 9. Step 8: URLs & Routing
*(No changes from original guide)*

## 10. Step 9: Authentication & Permissions
*(No changes from original guide)*

## 11. Step 10: API Endpoint Cheatsheet
*(No changes from original guide, but remember endpoints for new `Batch` model)*

## 12. Step 11: Frontend Refactoring Strategy
*(No changes from original guide, just ensure `baseURL` in your API client points to `http://localhost:8000/api`)*

## 13. Step 12: Deployment Considerations

Docker significantly simplifies deployment.

*   **Production `docker-compose.yml`**: Create a separate `docker-compose.prod.yml` that uses `gunicorn` instead of the Django development server and doesn't mount local volumes.
*   **Environment Variables**: Instead of a local `.env` file, use your hosting provider's secrets management (e.g., AWS Secrets Manager, GitHub Actions Secrets) to inject environment variables into your containers at runtime. **Never commit production secrets.**
*   **Web Server/Reverse Proxy**: Use `Nginx` in another Docker container to act as a reverse proxy. It will handle incoming traffic on ports 80/443, manage SSL termination, and forward requests to your Gunicorn container.
*   **Static Files**: Your `Dockerfile` for production should include a step to run `python manage.py collectstatic`. The Nginx container should mount the static files volume to serve them directly, which is much more efficient.

By following this updated guide, you'll have a robust, containerized backend ready for both development and production.
