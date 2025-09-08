# Facility Management System - Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- Yarn package manager
- Docker and Docker Compose

## Installation Steps

### 1. Install Dependencies

```bash
# Install frontend dependencies
yarn install

# Install backend dependencies
cd server
yarn install
cd ..
```

### 2. Start Database

```bash
# Start MongoDB and Mongo Express UI
yarn db:up
```

This will start:
- MongoDB on `http://localhost:27017`
- Mongo Express UI on `http://localhost:8081`

### 3. Initialize Database

```bash
# Start the backend server
yarn server
```

In another terminal, initialize the database with room data:
```bash
curl -X POST http://localhost:3001/api/rooms/init
```

### 4. Start the Application

```bash
# Start both frontend and backend
yarn start
```

Or run them separately:
```bash
# Terminal 1 - Backend
yarn server

# Terminal 2 - Frontend
yarn dev
```

## Access Points

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`
- **Database UI**: `http://localhost:8081`

## Features

- **Room Selection**: Click on any room to view details
- **Equipment Management**: Add, edit, and delete equipment in rooms
- **Equipment Status**: Set status as Available, In Use, or Maintenance
- **Equipment Movement**: Drag equipment within room boundaries
- **Zoom Controls**: Use floating buttons to zoom in/out/reset view
- **Pan Navigation**: Click and drag to navigate the floor plan

## Database Management

Access Mongo Express at `http://localhost:8081` to:
- View room and equipment data
- Manually edit records
- Monitor database changes

## Stopping the Application

```bash
# Stop database
yarn db:down

# Stop other services with Ctrl+C
```