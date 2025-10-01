# NBA Outcome Based Education Portal (Full-Stack)

This project has been restructured into a full-stack application with a Django backend and a React frontend.

## Project Structure

- `/backend`: Contains the Django REST Framework project.
- `/frontend`: Contains the React single-page application.

---

## Backend Setup (Django)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a Python virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Apply database migrations:**
    This will create the database file (`db.sqlite3`) and set up the necessary tables.
    ```bash
    python manage.py migrate
    ```

5.  **Seed the database with initial data:**
    This command runs a script to populate the database with the initial set of users, courses, students, etc.
    ```bash
    python manage.py seed_data
    ```

6.  **Run the backend server:**
    ```bash
    python manage.py runserver
    ```
    The backend API will now be running at `http://127.0.0.1:8000`.

---

## Frontend Setup (React)

1.  **Navigate to the frontend directory in a new terminal:**
    ```bash
    cd frontend
    ```

2.  **Serve the frontend application:**
    You can use any simple static file server. If you have Node.js installed, `npx serve` is a great option.
    ```bash
    npx serve
    ```
    If you don't have `npx`, you can use Python's built-in server:
    ```bash
    python -m http.server 3000
    ```

3.  **Access the application:**
    Open your web browser and navigate to the URL provided by your server (e.g., `http://localhost:3000`). The React app will load and fetch its data from the Django backend running on port 8000.
