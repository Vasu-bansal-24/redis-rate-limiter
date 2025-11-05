# Redis Rate Limiter Prototype

A full-stack rate limiting application using Redis Token Bucket Algorithm with MongoDB for event logging. Features a beautiful, modern React frontend with multiple API endpoints demonstrating different rate limit configurations.

## 🚀 Features

- **Token Bucket Rate Limiting** - Efficient rate limiting using Redis
- **Multiple Endpoints** - 4 different API endpoints with varying rate limits
- **Real-time Visualization** - See rate limits, remaining tokens, and reset times
- **Request History** - Track all API requests with status codes
- **Throttle Event Logging** - MongoDB storage for throttled requests
- **Modern UI** - Beautiful glassmorphism design with animations
- **Rate Limit Headers** - Standard headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After)

## 📋 API Endpoints

| Endpoint | Capacity | Refill Rate | Use Case |
|----------|----------|-------------|----------|
| `/api/resource` | 10 tokens | 5 tokens/min | Standard API calls |
| `/api/login` | 5 tokens | 3 tokens/min | Login attempts |
| `/api/data` | 20 tokens | 10 tokens/min | High-volume data access |
| `/api/expensive` | 3 tokens | 2 tokens/min | Resource-intensive operations |

## 🛠️ Tech Stack

### Frontend
- React 19.1.1
- Vite 7.1.7
- Modern CSS with animations

### Backend
- Node.js with ES Modules
- Express.js
- Redis (Token storage)
- MongoDB (Event logging)
- Mongoose ODM

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- Redis Server
- MongoDB

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd redis-rate-limiter-prototype
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Start Redis** (default port 6379)
```bash
redis-server
```

5. **Start MongoDB** (default port 27017)
```bash
mongod
```

6. **Start the backend server**
```bash
npm start
```

7. **Start the frontend (in a new terminal)**
```bash
cd client
npm run dev
```

8. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 🐳 Docker Setup (Alternative)

```bash
docker-compose up
```

## 📚 Usage

1. Open the application in your browser
2. Click any API endpoint button to make a request
3. Observe the rate limit headers and remaining tokens
4. Try exceeding the rate limit to see throttling in action
5. Check the request history for all attempts

## 🔧 Configuration

Rate limits can be configured in `src/server.js`:

```javascript
const createRateLimiter = (capacity, refillRate) => {
  // Customize capacity and refillRate
}
```

## 📊 Response Headers

All API responses include:
- `X-RateLimit-Limit` - Maximum tokens
- `X-RateLimit-Remaining` - Tokens remaining
- `X-RateLimit-Reset` - Unix timestamp for token refill
- `Retry-After` - Seconds until next token (when throttled)

## 🎨 UI Features

- Responsive design (mobile, tablet, desktop)
- Glassmorphism effects
- Smooth animations and hover effects
- Real-time countdown timer
- Color-coded API buttons
- Request history tracking

## 📝 License

MIT

## 👤 Author

Your Name

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## Quickstart (local)

1. Install node deps:
   ```bash
   npm install
