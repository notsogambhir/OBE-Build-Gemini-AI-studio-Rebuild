
# Backend Development Guide: NBA OBE Portal (Django REST Framework)

This document provides a comprehensive, step-by-step guide for building the backend server for the NBA OBE Portal frontend. The recommended stack is **Django**, **Django REST Framework (DRF)**, and **PostgreSQL**.

The primary goal is to replace the `mockData.ts` file and all client-side `setData` calls with live API requests to this backend.

---

## **Table of Contents**

1.  [Technology Stack](#1-technology-stack)
2.  [Step 1: Project Setup & Configuration](#2-step-1-project-setup--configuration)
3.  [Step 2: Models & Migrations](#3-step-2-models--migrations)
4.  [Step 3: Seeding Initial Data](#4-step-3-seeding-initial-data)
5.  [Step 4: Serializers](#5-step-4-serializers)
6.  [Step 5: Views & ViewSets](#6-step-5-views--viewsets)
7.  [Step 6: URLs & Routing](#7-step-6-urls--routing)
8.  [Step 7: Authentication & Permissions](#8-step-7-authentication--permissions)
9.  [Step 8: CORS Configuration](#9-step-8-cors-configuration)
10. [Step 9: API Endpoint Cheatsheet](#10-step-9-api-endpoint-cheatsheet)
11. [Step 10: Frontend Refactoring Strategy](#11-step-10-frontend-refactoring-strategy)
12. [Step 11: Deployment Considerations](#12-step-11-deployment-considerations)

---

## 1. Technology Stack

*   **Backend Framework**: Django
*   **API Toolkit**: Django REST Framework (DRF)
*   **Database**: PostgreSQL
*   **Python Environment**: `venv` or `pipenv`
*   **Dependencies**: `psycopg2-binary`, `djangorestframework`, `django-cors-headers`

## 2. Step 1: Project Setup & Configuration

```bash
# 1. Create a project directory and a virtual environment
mkdir obe-portal-backend && cd obe-portal-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install django djangorestframework psycopg2-binary django-cors-headers

# 3. Start the Django project and an 'api' app
django-admin startproject obe_portal .
python manage.py startapp api
```

**Configure `obe_portal/settings.py`**:

```python
# obe_portal/settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'rest_framework.authtoken', # For token authentication
    'corsheaders',

    # Your apps
    'api',
]

MIDDLEWARE = [
    # ... other middleware
    'corsheaders.middleware.CorsMiddleware', # Add this
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

# Configure PostgreSQL Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'obe_portal_db',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Configure DRF to use Token Authentication
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
    "http://localhost:3000", # Or whatever port your React app runs on
]
```

## 3. Step 2: Models & Migrations

Translate the interfaces in `types.ts` into Django models in `api/models.py`. Django's ORM is powerful for defining relationships.

**`api/models.py` (Example):**

```python
from django.db import models
from django.contrib.postgres.fields import ArrayField

# Using a proxy model for roles is cleaner than extending AbstractUser if you don't need separate tables
class User(models.Model):
    # Enums for choices
    class Role(models.TextChoices):
        TEACHER = 'Teacher', 'Teacher'
        PC = 'Program Co-ordinator', 'Program Co-ordinator'
        UNIVERSITY = 'University', 'University'
        ADMIN = 'Admin', 'Admin'
        DEPARTMENT = 'Department', 'Department'
        
    id = models.CharField(max_length=50, primary_key=True)
    employeeId = models.CharField(max_length=50, unique=True)
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128) # Store hashed passwords!
    role = models.CharField(max_length=50, choices=Role.choices)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, default='Active')

    # Relationships
    programId = models.CharField(max_length=50, null=True, blank=True)
    programCoordinatorIds = ArrayField(models.CharField(max_length=50), blank=True, null=True)
    collegeId = models.CharField(max_length=50, null=True, blank=True)
    departmentId = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.name

class Program(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    collegeId = models.CharField(max_length=50)

# ... continue defining models for Course, Student, Assessment, Mark, etc.
# Use ForeignKey for one-to-many relationships (e.g., Course to Program)
# Use ManyToManyField for many-to-many relationships if needed.
# Use JSONField for flexible data structures like `attainmentLevels` or `questions`.
```

After defining all your models, run the migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

## 4. Step 3: Seeding Initial Data

To populate your database for development, create a custom management command.

**`api/management/commands/seed_data.py`**:

```python
import json
from django.core.management.base import BaseCommand
from api.models import User, Program, Course # Import all your models

class Command(BaseCommand):
    help = 'Seeds the database with initial data from mockData.ts'

    def handle(self, *args, **options):
        # 1. Manually copy the JSON content from `mockData.ts` into a file like `seed.json`.
        # 2. Remove the JavaScript syntax to make it pure JSON.
        
        with open('seed.json', 'r') as f:
            data = json.load(f)

        self.stdout.write("Seeding data...")

        # Clear existing data
        User.objects.all().delete()
        Program.objects.all().delete()
        # ... delete other models

        for user_data in data['users']:
            # You must hash the password here before saving!
            # from django.contrib.auth.hashers import make_password
            # user_data['password'] = make_password(user_data['password'])
            User.objects.create(**user_data)

        for program_data in data['programs']:
            Program.objects.create(**program_data)
        
        # ... continue for all other data types
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded database.'))
```

Run the command: `python manage.py seed_data`.

## 5. Step 4: Serializers

Create serializers in `api/serializers.py` to convert your models to and from JSON.

```python
# api/serializers.py
from rest_framework import serializers
from .models import User, Program, Course

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__' # Or list specific fields
        extra_kwargs = {'password': {'write_only': True}} # Don't send password back

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'

# ... continue for all models
```

## 6. Step 5: Views & ViewSets

Use `ModelViewSet` in `api/views.py` to automatically create CRUD endpoints.

```python
# api/views.py
from rest_framework import viewsets
from .models import User, Program
from .serializers import UserSerializer, ProgramSerializer
# Import your custom permissions here (see Step 7)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # permission_classes = [IsAdminUser] # Example permission

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    # Add filtering logic
    def get_queryset(self):
        queryset = super().get_queryset()
        college_id = self.request.query_params.get('collegeId')
        if college_id:
            queryset = queryset.filter(collegeId=college_id)
        return queryset

# ... continue for all models
```

## 7. Step 6: URLs & Routing

Use DRF's `DefaultRouter` in `api/urls.py` to wire up the ViewSets.

```python
# api/urls.py
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProgramViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'programs', ProgramViewSet)
# ... register all ViewSets

urlpatterns = router.urls
```

Include these URLs in your main `obe_portal/urls.py`:

```python
# obe_portal/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/auth/login/', obtain_auth_token, name='api_token_auth'), # Login endpoint
]
```

## 8. Step 7: Authentication & Permissions

This is crucial for security.

1.  **Login**: The `/api/auth/login/` endpoint is now active. The frontend will `POST` `{ "username": "...", "password": "..." }` and will receive `{ "token": "..." }` in response.
2.  **Custom Permissions**: Create `api/permissions.py`.

    ```python
    # api/permissions.py
    from rest_framework.permissions import BasePermission

    class IsAdmin(BasePermission):
        def has_permission(self, request, view):
            return request.user.is_authenticated and request.user.role == 'Admin'

    class IsProgramCoordinator(BasePermission):
        def has_permission(self, request, view):
            return request.user.is_authenticated and request.user.role == 'Program Co-ordinator'
    
    # ... create one for each role
    ```

3.  **Apply Permissions**: Apply these to your views.

    ```python
    # api/views.py
    from .permissions import IsAdmin, IsProgramCoordinator
    
    class CourseViewSet(viewsets.ModelViewSet):
        # ...
        def get_permissions(self):
            if self.action in ['create', 'update', 'partial_update', 'destroy']:
                self.permission_classes = [IsAdmin | IsProgramCoordinator] # Allow Admin OR PC to modify
            return super().get_permissions()
    ```

## 9. Step 8: CORS Configuration

Ensure your `settings.py` includes `corsheaders` in `INSTALLED_APPS` and `MIDDLEWARE`, and that `CORS_ALLOWED_ORIGINS` is set correctly. This allows the frontend to make requests to the backend.

## 10. Step 9: API Endpoint Cheatsheet

Here is a list of the primary endpoints you'll need to build.

| Method | URL Path                    | Permissions                | Description                                        |
| :----- | :-------------------------- | :------------------------- | :------------------------------------------------- |
| `POST` | `/api/auth/login/`          | Public                     | Authenticates a user and returns an auth token.    |
| `GET`  | `/api/users/`               | Admin                      | Get a list of all users.                           |
| `POST` | `/api/users/`               | Admin                      | Create a new user.                                 |
| `PUT`  | `/api/users/{id}/`          | Admin                      | Update a user's details.                           |
| `GET`  | `/api/colleges/`            | Authenticated              | Get a list of all colleges.                        |
| `GET`  | `/api/programs/`            | Authenticated              | Get all programs. Supports `?collegeId=` filter.   |
| `GET`  | `/api/courses/`             | Authenticated              | Get courses. Supports `?programId=` filter.        |
| `PUT`  | `/api/courses/{id}/`        | Admin, PC                  | Update a course (status, teacher, settings).       |
| `POST` | `/api/courses/`             | Admin, PC                  | Create a new course.                               |
| `GET`  | `/api/students/`            | Admin, PC, Teacher         | Get students. Supports `?programId=` filter.       |
| `PUT`  | `/api/students/{id}/`       | Admin, PC, Dept Head       | Update a student (status, section assignment).     |
| `GET`  | `/api/sections/`            | Admin, Dept Head           | Get sections. Supports `?programId=&batch=` filter.|
| `POST` | `/api/sections/`            | Dept Head                  | Create a new section.                              |
| `DELETE`|`/api/sections/{id}/`       | Dept Head                  | Delete a section.                                  |
| `GET`  | `/api/course-outcomes/`     | Authenticated              | Get COs. Supports `?courseId=` filter.             |
| `PUT`  | `/api/course-outcomes/bulk-update/`| PC, Teacher         | Bulk update/create COs for a single course.        |
| `GET`  | `/api/program-outcomes/`    | Authenticated              | Get POs. Supports `?programId=` filter.            |
| `GET`  | `/api/assessments/`         | Authenticated              | Get assessments. Supports `?courseId=` filter.     |
| `POST` | `/api/assessments/`         | PC                         | Create a new assessment.                           |
| `PUT`  | `/api/assessments/{id}/`    | PC, Teacher                | Update an assessment (questions, CO mapping).      |
| `DELETE`|`/api/assessments/{id}/`    | PC                         | Delete an assessment.                              |
| `POST` | `/api/marks/bulk-upload/`   | Teacher                    | Bulk upload marks for an assessment.               |

## 11. Step 10: Frontend Refactoring Strategy

This is where the frontend is modified to talk to the new backend.

1.  **Create an API Client (`src/api.ts`)**:
    Create a helper for making API requests. This is where you will add the auth token to headers.

    ```typescript
    // Example using axios
    import axios from 'axios';

    const apiClient = axios.create({
      baseURL: 'http://localhost:8000/api', // Your Django server URL
    });

    apiClient.interceptors.request.use(config => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    });

    export default apiClient;
    ```

2.  **Refactor `AppContext.tsx`**:
    *   Remove `import { initialData } ...`.
    *   Modify the `login` function to call the API.
    *   Fetch all necessary data after login.

    ```typescript
    // In AppProvider

    const [data, setData] = useState<AppData>({ users: [], ... }); // Start with empty state
    const [isLoading, setIsLoading] = useState(true);

    const login = async (username, password) => {
        try {
            const response = await apiClient.post('/auth/login/', { username, password });
            const { token } = response.data;
            localStorage.setItem('authToken', token);
            
            // Now fetch the logged-in user's details
            // You'll need a `/api/users/me/` endpoint for this
            const userResponse = await apiClient.get('/users/me/');
            setCurrentUser(userResponse.data);
            
            // Fetch all other data
            fetchAllData(); 
            return true;
        } catch (error) {
            return false;
        }
    };
    
    const fetchAllData = async () => {
        setIsLoading(true);
        const [users, programs, courses, /* ... */] = await Promise.all([
            apiClient.get('/users/'),
            apiClient.get('/programs/'),
            apiClient.get('/courses/'),
            // ... all other GET requests
        ]);
        setData({ 
            users: users.data, 
            programs: programs.data, 
            courses: courses.data, 
            // ... 
        });
        setIsLoading(false);
    };
    ```

3.  **Refactor Component Logic**:
    Replace any call to `setData` that modifies data with an API call.

    **Before (in `ManageCourseOutcomes.tsx`):**
    ```typescript
    const handleSave = () => {
      setData(prev => ({ ... }));
    };
    ```

    **After:**
    ```typescript
    const handleSave = async () => {
      try {
        // Assume you have a bulk update endpoint
        await apiClient.put(`/courses/${courseId}/outcomes/`, draftOutcomes);
        // On success, you can either refetch all data or optimistically update the state
        setInitialOutcomes(draftOutcomes);
        alert("Saved successfully!");
      } catch (error) {
        alert("Failed to save.");
      }
    };
    ```

## 12. Step 11: Deployment Considerations

*   **Application Server**: Use `Gunicorn` or `uWSGI` to run your Django application in production.
*   **Web Server/Reverse Proxy**: Use `Nginx` to handle incoming HTTP requests, serve static files, and forward dynamic requests to Gunicorn.
*   **Database**: Host your PostgreSQL database on a managed service like AWS RDS or Heroku Postgres.
*   **Environment Variables**: Use a `.env` file or your hosting provider's secrets management to store your `SECRET_KEY`, `DATABASE_URL`, and other sensitive information. **Do not commit these to version control.**
*   **Static Files**: Run `python manage.py collectstatic` and configure Nginx to serve the contents of your `staticfiles` directory.

Following this guide will result in a fully functional, secure, and scalable backend that perfectly serves the needs of the React frontend.
