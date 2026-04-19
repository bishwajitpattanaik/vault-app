# Vault Chat

> Conversations shouldn't wait. I built a platform that doesn't make them.

A production-deployed, full-stack real-time chat application demonstrating WebSocket communication, cloud-native deployment, and clean system design — built with React, Spring Boot, MongoDB Atlas, and Docker.

🟢 **Live Demo:** [vault-app-bishwajit.vercel.app](https://vault-app-bishwajit.vercel.app)

---

## 🖥️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React.js | ^18.x | UI library |
| Vite | ^5.x | Build tool & dev server |
| Axios | latest | HTTP client |
| STOMP.js | latest | WebSocket messaging protocol |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 | Runtime environment |
| Spring Boot | latest | Application framework |
| Spring WebSocket | - | Real-time communication |
| Spring Data MongoDB | - | MongoDB ORM |
| Maven | - | Build & dependency management |

### Cloud Services

| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Cloud database |
| Render | Backend hosting (Dockerized) |
| Vercel | Frontend CDN hosting |

---

## ✨ Features

👤 **User (role: `user`)**

- Join or create chat rooms
- Send and receive real-time messages via WebSocket
- Browse all available rooms
- View message history per room

---

## 🚀 Deployment Architecture

```
            ┌──────────────────────────────────┐
            │         User Browser             │
            └────────────────┬─────────────────┘
                             │
                   HTTP / WebSocket (STOMP)
                             │
              ┌──────────────▼──────────────┐
              │   Vercel (Frontend)          │
              │   React app (Static CDN)     │
              │   vault-app-bishwajit        │
              │         .vercel.app          │
              └──────────────┬───────────────┘
                             │
                     HTTPS API calls
                  WebSocket Upgrade (ws://)
                             │
              ┌──────────────▼───────────────┐
              │   Render (Backend)           │
              │   Spring Boot + WebSocket    │
              │   /api/rooms  /api/messages  │
              └──────────────┬───────────────┘
                             │
                   Spring Data MongoDB
                             │
              ┌──────────────▼───────────────┐
              │      MongoDB Atlas            │
              │   Cloud Database (NoSQL)     │
              └──────────────────────────────┘
```

| Layer | Platform | URL |
|-------|----------|-----|
| Frontend | Vercel | [vault-app-bishwajit.vercel.app](https://vault-app-bishwajit.vercel.app) |
| Backend | Render | [vault-app-1-vhkf.onrender.com](https://vault-app-1-vhkf.onrender.com) |
| Database | MongoDB Atlas | Cloud hosted |

**Architecture Notes:**

- The React frontend is deployed on Vercel as a static site, served globally via CDN.
- The Spring Boot backend is deployed on Render as a Dockerized web service.
- On every API call, the frontend communicates with the backend over HTTPS.
- WebSocket connections are upgraded from HTTP and maintained for real-time messaging.
- All message and room data is persisted in MongoDB Atlas.

---

## 📂 Project Structure

```
vault-app/
│
├── vault-chat-app-backend/
│   ├── src/
│   │   └── main/java/com/vault/
│   │       ├── controller/
│   │       │   ├── RoomController.java        # Room CRUD APIs
│   │       │   └── ChatController.java        # WebSocket message handler
│   │       ├── model/
│   │       │   ├── Room.java                  # Room schema
│   │       │   └── Message.java               # Message schema
│   │       ├── repository/
│   │       │   ├── RoomRepository.java        # MongoDB Room queries
│   │       │   └── MessageRepository.java     # MongoDB Message queries
│   │       └── config/
│   │           └── WebSocketConfig.java       # STOMP + CORS config
│   ├── application.properties                 # Spring app config
│   ├── Dockerfile                             # Docker build definition
│   └── pom.xml                                # Maven dependencies
│
├── vault-chat-app-frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx                       # Room selection / join
│   │   │   └── ChatRoom.jsx                   # Real-time chat UI
│   │   ├── services/
│   │   │   └── api.js                         # All API & WS calls
│   │   └── App.jsx                            # Root with routing
│   ├── .env                                   # Environment variables
│   └── vite.config.js                         # Vite config
│
└── README.md
```

---

## ⚙️ Setup & Installation

### 🔧 Backend

#### 1. Clone the repository

```bash
git clone https://github.com/bishwajitpattanaik/vault-app.git
cd vault-app
```

#### 2. Install Backend dependencies

```bash
cd vault-chat-app-backend
mvn clean install
```

#### 3. Configure environment variables

Create an `application.properties` file inside the `vault-chat-app-backend/src/main/resources/` folder:

```properties
spring.data.mongodb.uri=your_mongodb_connection_string
server.port=8080
```

- Get your MongoDB URI from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

#### 4. Start the Backend server

```bash
mvn spring-boot:run
```

> Server runs on `http://localhost:8080`

---

### 🎨 Frontend

#### 5. Install Frontend dependencies

```bash
cd ../vault-chat-app-frontend
npm install
```

#### 6. Configure environment variables

Create a `.env` file inside the `vault-chat-app-frontend` folder:

```env
VITE_API_URL=http://localhost:8080
```

> For production, set `VITE_API_URL` to your Render backend URL in Vercel environment settings.

#### 7. Start the Frontend

```bash
npm run dev
```

> Frontend runs on `http://localhost:5173`

#### 8. Open in browser

Visit `http://localhost:5173` to start chatting!

> **Note:** Both Backend and Frontend servers must be running simultaneously for the app to work correctly.

---

### 🐳 Docker Deployment (Backend)

```bash
cd vault-chat-app-backend
docker build -t vault-chat-backend .
docker run -p 8080:8080 -e MONGO_URI=your_mongodb_uri vault-chat-backend
```

---

## 🔗 Backend API Endpoints

**Base URL:** `http://localhost:8080/api`

---

### 🏠 Room Routes — `/api/rooms`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/rooms` | Create a new room | No |
| GET | `/api/rooms` | Fetch all rooms | No |
| GET | `/api/rooms/{roomId}` | Get a specific room | No |

**Example Request — POST `/api/rooms`:**

```json
{
  "name": "general"
}
```

**Example Response — GET `/api/rooms`:**

```json
{
  "message": "Rooms fetched successfully",
  "rooms": [
    {
      "_id": "room123",
      "name": "general"
    }
  ]
}
```

---

### 💬 Message Routes — `/api/messages` & WebSocket

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/messages/{roomId}` | Fetch message history for a room | No |
| WS | `/ws` (STOMP) | WebSocket connection endpoint | No |
| STOMP | `/app/sendMessage/{roomId}` | Send a real-time message | No |
| STOMP | `/topic/{roomId}` | Subscribe to room messages | No |

**Example Response — GET `/api/messages/{roomId}`:**

```json
{
  "message": "Messages fetched successfully",
  "messages": [
    {
      "_id": "msg123",
      "content": "Hello, Vault!",
      "sender": "bishwajit",
      "roomId": "room123",
      "timestamp": "2025-06-01T10:30:00Z"
    }
  ]
}
```

**Example WebSocket Payload — STOMP `/app/sendMessage/{roomId}`:**

```json
{
  "content": "Hello, Vault!",
  "sender": "bishwajit",
  "roomId": "room123"
}
```

---

## 🗄️ Database Schema

### Room Collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto generated by MongoDB |
| `name` | String | Unique room name |

### Message Collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto generated by MongoDB |
| `content` | String | Message text content |
| `sender` | String | Username of sender |
| `roomId` | String | Reference to Room |
| `timestamp` | Date | Time message was sent |

---

## ⚠️ Challenges Solved

- ✅ Fixed MongoDB Atlas connection string and network access configuration
- ✅ Resolved CORS errors between React frontend and Spring Boot backend
- ✅ Handled Docker TLS and network issues during image build on Render
- ✅ Solved Spring Boot port conflicts in containerized deployment
- ✅ Configured STOMP WebSocket to work across cross-origin deployments
- ✅ Managed environment-based secrets securely across both services

---

## 📈 Future Improvements

- 🔐 JWT / OAuth2 authentication & user sessions
- 📱 Full mobile-responsive UI enhancements
- 🧵 Threaded / reply-to conversations
- 📎 File and image sharing support
- 📊 Message analytics and read receipts
- 🔔 Push notifications for offline users

---

## 👨‍💻 Author

Built with ❤️ by **Bishwajit Pattanaik**
B.Tech CSE Graduate (2025) | Aspiring Software Engineer

- 🔗 GitHub: [github.com/bishwajitpattanaik](https://github.com/bishwajitpattanaik)
- 💼 LinkedIn: *(Add your LinkedIn profile)*

---

## ⭐ Why This Project Stands Out

- Demonstrates real-time system design with WebSocket (STOMP protocol)
- Covers end-to-end full-stack deployment across two cloud platforms
- Uses industry-relevant technologies: Java 21, Spring Boot, React, Docker, MongoDB Atlas
- Shows hands-on problem-solving in production deployment scenarios
- Clean monorepo structure with separation of concerns

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
