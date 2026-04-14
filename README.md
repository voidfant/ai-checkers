# AI Checkers - Telegram Mini App

A modern Checkers game powered by Google's Gemini AI, designed as a Telegram Mini App. Play against an AI opponent that adapts its strategy based on your moves and skill level.

## 🎮 Features

- Play Checkers against Gemini AI
- Multiple difficulty levels
- Real-time move validation
- Smooth animations and modern UI
- Integrated with Telegram Mini Apps platform
- WebSocket server for real-time communication

## 🛠️ Tech Stack

- **Frontend:**
  - React
  - TypeScript
  - Vite
  - @twa-dev/sdk (Telegram Web Apps SDK)

- **Backend:**
  - Python WebSocket Server
  - Google Gemini AI API
  - Telegram Bot API

- **Deployment:**
  - Docker (development & production)
  - Vercel (production hosting)
  - NGINX (production server)

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- Python 3.9 or higher
- Docker and Docker Compose
- Telegram Bot Token
- Google Gemini API Key

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key
BOT_TOKEN=your_telegram_bot_token
API_ID=your_telegram_api_id
API_HASH=your_telegram_api_hash
DOMAIN=your_domain.com
```

### Development

```bash
# Start all services in development mode
docker-compose up -d

# Frontend will be available at http://localhost:3000
# WebSocket server will be available at ws://localhost:2536
```

### Production

```bash
# Build and start production services
docker-compose -f docker-compose.yml up -d prod websocket

# Or deploy to Vercel
vercel --prod
```

## 🎯 Game Features

- Standard Checkers rules with mandatory captures
- Multiple AI difficulty levels
- Real-time move validation
- Move suggestions
- Game state persistence
- Responsive design for all screen sizes

## 🔧 Configuration

### Frontend Configuration
- Port: 3000 (dev) / 80 (prod)
- Environment variables in `.env`
- Vite configuration in `vite.config.ts`

### WebSocket Server Configuration
- Port: 2536
- Settings in `server/settings.json`
- Python dependencies in `requirements.txt`

## 📦 Docker Configuration

Three main services:
1. `dev` - Development frontend server
2. `prod` - Production frontend server with NGINX
3. `websocket` - Python WebSocket server

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Telegram Mini Apps Platform](https://core.telegram.org/bots/webapps)
- [Google Gemini AI](https://deepmind.google/technologies/gemini/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
