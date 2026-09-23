# 🚀 TalentForge

## AI-Powered Talent Discovery & Career Development Platform

TalentForge is a full-stack web platform designed to connect people's skills and talents with relevant career and professional opportunities. It provides dedicated user and organization portals, secure authentication, profile and skill management, opportunity discovery, and a centralized backend and database.

The project demonstrates a complete working prototype combining a modern TypeScript/React frontend, Python backend APIs, and a relational database.

---

## 🌟 Key Features

### 👤 User Portal
- User registration and login
- Secure authentication
- Personal profile management
- Skills and talent management
- Personalized dashboard
- Browse and discover opportunities
- View relevant career opportunities

### 🏢 Organization / Recruiter Portal
- Organization registration and login
- Organization profile management
- Create and manage opportunities
- Discover relevant talent
- View candidate information
- Manage posted opportunities

### 📊 Dashboard
- Personalized user experience
- Profile and skill information
- Opportunity overview
- Easy navigation between platform modules
- Role-based portal experience

### 🔐 Authentication & Security
- Login and registration
- Protected application routes
- Role-based access
- Environment-based configuration
- Sensitive credentials excluded from version control

### 🗄️ Database
- Structured relational database
- User and organization data
- Profile and skill information
- Opportunity-related data
- SQL database schema included in the project

---

## 🛠️ Technology Stack

### Frontend
- React
- TypeScript
- Vite
- HTML5
- CSS3

### Backend
- Python
- FastAPI
- REST API

### Database
- SQL
- Relational Database

### Tools
- Visual Studio Code
- Git
- GitHub
- npm
- Python Virtual Environment

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │     TalentForge     │
                    │     Web Platform    │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
        ┌───────▼────────┐           ┌────────▼────────┐
        │    Frontend    │           │     Backend     │
        │ React + Vite   │◄─────────►│ Python / API    │
        │  TypeScript    │           │    FastAPI      │
        └───────┬────────┘           └────────┬────────┘
                │                             │
                │                       ┌─────▼─────┐
                │                       │  Database │
                │                       │    SQL    │
                │                       └───────────┘
                │
        ┌───────▼─────────┐
        │      Users      │
        │   Recruiters    │
        │ Organizations   │
        └─────────────────┘
