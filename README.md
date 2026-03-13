# TicketFlow | Premium Support System

A modern, full-stack Ticket Tracking System built with Go (Golang) and Vanilla JavaScript.

## 🚀 Features

- **User Dashboard**: Raise tickets, track status (Open, In Progress, Resolved), and view priority levels.
- **Admin Panel**: Manage global ticket feed, filter by priority, update status, and reply to users.
- **Real-time Status**: Color-coded status badges and priority indicators.
- **Premium UI**: Glassmorphism design with a sleek dark theme.
- **MySQL Integration**: Structured database for users, tickets, and replies.

## 🛠️ Tech Stack

- **Backend**: Go (HTTP Server, CORS Middleware)
- **Database**: MySQL
- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+)
- **Icons**: Remix Icons

## ⚙️ Setup Instructions

### 1. Prerequisites
- Go 1.18+
- MySQL Server

### 2. Database Configuration
Update the database connection details in `Database/TicketRaisingDb.go`:
```go
// Example configuration
Db, err = sql.Open("mysql", "user:password@tcp(127.0.0.1:3306)/ticket_rising_db")
```

### 3. Run the Backend
```bash
go run main.go
```
The server will start on `http://localhost:8080`.

### 4. Open the Frontend
Open `Frontend/index.html` in your browser or serve it using a local server (e.g., Live Server on VS Code) at `http://localhost:3030`.

## 📂 Project Structure

- `Admin/`: Admin-specific logic and handlers.
- `User/`: User-specific logic and handlers.
- `Database/`: SQL table definitions and database connection.
- `Frontend/`: HTML, CSS, and JS files.
- `main.go`: Entry point and server initialization.
