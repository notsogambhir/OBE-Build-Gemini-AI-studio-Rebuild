# Backend Development Guide: NBA OBE Portal (Django REST Framework)

This document provides a comprehensive, step-by-step guide for building the backend server for the NBA OBE Portal frontend. The recommended stack is **Django**, **Django REST Framework (DRF)**, and **PostgreSQL**.

The primary goal is to replace the `mockData.json` file and all client-side `setData` calls with live API requests to this backend.

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

### Step 2a: Defining Relational Models

A robust backend starts with a well-defined database schema. We will translate the frontend's `types.ts` into Django models, but instead of using simple string IDs for relationships, we will use Django's powerful relational fields (`ForeignKey`, `ManyToManyField`). This enforces data integrity at the database level and makes querying much more efficient.

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
    id = models.CharField(max_length=50, primary_key=True)
    employeeId = models.CharField(max_length=50, unique=True)
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128) # IMPORTANT: Store hashed passwords!
    role = models.CharField(max_length=50, choices=UserRole.choices)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, default='Active')

    # For Department Head: College they manage
    college = models.OneToOneField(College, on_delete=models.SET_NULL, null=True, blank=True, related_name='department_head')
    
    # For Program Co-ordinator: Department head they report to
    department = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='coordinators', limit_choices_to={'role': UserRole.DEPARTMENT})

    # For Teachers: Program Co-ordinators they report to
    reports_to = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='teachers', limit_choices_to={'role': UserRole.COORDINATOR})
    
    def __str__(self): return f"{self.name} ({self.role})"

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

class Student(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='students')
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    status = models.CharField(max_length=20, default='Active')

    def __str__(self): return self.name

class Course(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=20)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='courses')
    status = models.CharField(max_length=20, default='Future')
    target = models.IntegerField(default=50)
    
    # Default teacher for the course
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses_taught', limit_choices_to={'role': UserRole.TEACHER})
    
    # To store section-specific teacher overrides: {"section_id": "teacher_id"}
    sectionTeacherIds = JSONField(default=dict, blank=True)
    
    # ManyToMany relationship for enrollments
    enrolled_students = models.ManyToManyField(Student, through='Enrollment', related_name='courses')

    def __str__(self): return f"{self.code} - {self.name}"

class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, null=True, blank=True) # The section student is in for this course

    class Meta:
        unique_together = ('student', 'course')

# ... other models like CourseOutcome, ProgramOutcome, Assessment, Mark ...
```

### Step 2b: Running & Understanding Migrations

Django's migration system is how you manage your database schema over time without writing SQL manually.

1.  **Generate Migrations**: After defining or changing your models in `api/models.py`, run this command:
    ```bash
    python manage.py makemigrations
    ```
    Django inspects your models and generates new migration files in the `api/migrations/` directory. These files are Python code describing the changes needed (e.g., create a table, add a column).

2.  **Apply Migrations**: To apply the pending migrations to your database, run:
    ```bash
    python manage.py migrate
    ```
    Django connects to PostgreSQL and executes the necessary SQL to update your schema.

#### **Migration Best Practices**

*   **`null=True` vs. `blank=True`**: `null=True` allows the database column to store a `NULL` value. `blank=True` tells Django's admin and forms that the field is not required (form validation). For a `CharField`, you usually want `blank=True` but not `null=True`. For a `ForeignKey`, you often need both `null=True` and `blank=True` if the relationship is optional.
*   **NEVER Edit Migration Files Manually**: Unless you are an expert, do not edit the files in the `migrations` folder. If you make a mistake in your models, it's better to fix the model and generate a *new* migration.
*   **Team Workflow**: When working in a team, always `git pull` the latest changes before running `makemigrations` to avoid conflicts.
*   **Resetting (Early Development)**: If you've made a mess of migrations early in development (before any real data exists), you can reset an app's migrations:
    1.  Delete all files inside `api/migrations/` except for `__init__.py`.
    2.  Drop the database tables for the `api` app.
    3.  Run `python manage.py makemigrations api`.
    4.  Run `python manage.py migrate`.

## 4. Step 3: Seeding Initial Data

To populate your relational database, your seeding script must create objects in the correct order and handle relationships properly.

**`api/management/commands/seed_data.py` (Updated Logic):**

```python
import json
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from api.models import User, Program, College, Batch, Section, Course # Import all your models

class Command(BaseCommand):
    help = 'Seeds the database with initial data from mockData.json'

    def handle(self, *args, **options):
        with open('mockData.json', 'r') as f:
            data = json.load(f)

        self.stdout.write("Clearing old data...")
        # Clear data in reverse order of dependency
        Course.objects.all().delete()
        Section.objects.all().delete()
        Batch.objects.all().delete()
        Program.objects.all().delete()
        User.objects.all().delete()
        College.objects.all().delete()

        self.stdout.write("Seeding new data...")

        # Seed Colleges (no dependencies)
        for college_data in data['colleges']:
            College.objects.create(**college_data)

        # Seed Programs
        programs_map = {}
        for program_data in data['programs']:
            college = College.objects.get(id=program_data.pop('collegeId'))
            program = Program.objects.create(college=college, **program_data)
            programs_map[program.id] = program
        
        # Seed Batches
        batches_map = {}
        for batch_data in data['batches']:
            program = programs_map[batch_data.pop('programId')]
            batch = Batch.objects.create(program=program, **batch_data)
            batches_map[batch.id] = batch

        # Seed Sections
        for section_data in data['sections']:
            program = programs_map[section_data.pop('programId')]
            batch = batches_map[section_data.pop('batchId')]
            Section.objects.create(program=program, batch=batch, **section_data)

        # ... continue seeding Users, Courses, Students, etc. ...
        # Remember to look up related objects (like Program, Batch, Section) from the maps
        # before creating objects with ForeignKey relationships.

        self.stdout.write(self.style.SUCCESS('Successfully seeded database.'))
```

Run the command: `python manage.py seed_data`.

## 5. Step 4: Serializers

Create serializers in `api/serializers.py`. You can control how relationships (`ForeignKey`, `ManyToManyField`) are represented in your JSON output.

```python
# api/serializers.py
from rest_framework import serializers
from .models import User, Program, Course, College, Batch

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}} # Don't send password back

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'name', 'college', 'duration']

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = ['id', 'program', 'name']

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
            # Note the double underscore for filtering on a related model's field
            queryset = queryset.filter(college__id=college_id) 
        return queryset

# ... continue for all models
```

## 7. Step 6: URLs & Routing

Use DRF's `DefaultRouter` in `api/urls.py` to wire up the ViewSets.

```python
# api/urls.py
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProgramViewSet, #... import others

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'programs', ProgramViewSet)
router.register(r'batches', BatchViewSet)
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
    from rest_framework.permissions import OR
    
    class CourseViewSet(viewsets.ModelViewSet):
        # ...
        def get_permissions(self):
            if self.action in ['create', 'update', 'partial_update', 'destroy']:
                # Allow Admin OR PC to modify. Use DRF's built-in logic operators.
                self.permission_classes = [OR(IsAdmin, IsProgramCoordinator)] 
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
| `GET`  | `/api/batches/`             | Authenticated              | Get batches. Supports `?programId=` filter.        |
| `POST` | `/api/batches/`             | Admin                      | Create a new batch for a program.                  |
| `DELETE`|`/api/batches/{id}/`        | Admin                      | Delete a batch.                                    |
| `GET`  | `/api/courses/`             | Authenticated              | Get courses. Supports `?programId=` filter.        |
| `PUT`  | `/api/courses/{id}/`        | Admin, PC                  | Update a course (status, teacher, settings).       |
| `POST` | `/api/courses/`             | Admin, PC                  | Create a new course.                               |
| `GET`  | `/api/students/`            | Admin, PC, Teacher         | Get students. Supports `?programId=` filter.       |
| `PUT`  | `/api/students/{id}/`       | Admin, PC, Dept Head       | Update a student (status, section assignment).     |
| `GET`  | `/api/sections/`            | Admin, Dept Head           | Get sections. Supports `?programId=&batchId=` filter.|
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