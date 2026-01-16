# 🍽️ Restaurant POS - Mobile Frontend

React Native mobile app for restaurant point-of-sale system with table booking, menu ordering, and payment integration.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- Ngrok (for backend connection)
- Backend server running on port 9090

### Installation

```bash
# Clone repository
git clone <repository-url>
cd FontEnd_Web_Pos

# Install dependencies
npm install

# Start development server (with auto ngrok setup)
npm run start:dev
```

**That's it!** 🎉

---

## 📱 Running on Device

1. Install **Expo Go** from Play Store / App Store
2. Make sure phone and computer are on **same WiFi**
3. Scan QR code from terminal
4. Wait for app to load

---

## 🛠️ Development Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | 🚀 Auto-start with ngrok (Recommended) |
| `npm start` | Start Expo dev server |
| `npm run start:clear` | Start with cache cleared |
| `npm run test:connection` | 🔍 Test backend connection |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS device/simulator |

---

## 📚 Documentation

| File | Description |
|------|-------------|
| **[START_HERE.md](./START_HERE.md)** | ⚡ Quick 3-step guide |
| **[QUICK_FIX_NGROK.md](./QUICK_FIX_NGROK.md)** | 🔧 Troubleshooting |
| **[NGROK_SETUP_GUIDE.md](./NGROK_SETUP_GUIDE.md)** | 📖 Full setup guide |
| **[SUMMARY_CHANGES.md](./SUMMARY_CHANGES.md)** | 📋 Recent changes |

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Expo Go App   │ ← React Native + NativeWind
└────────┬────────┘
         │ WiFi
┌────────▼────────┐
│  Dev Server     │ ← Metro Bundler (port 8081)
└────────┬────────┘
         │ HTTPS
┌────────▼─────────────────┐
│  Ngrok Tunnel (Internet) │ ← Public URL
└────────┬─────────────────┘
         │ Tunnel
┌────────▼────────┐
│  Spring Backend │ ← Java API (port 9090)
└─────────────────┘
```

---

## ✨ Features

- 🏠 **Home Dashboard** - Quick actions & featured dishes
- 🍕 **Menu Browsing** - Browse dishes by category
- 🛒 **Shopping Cart** - Add/remove items
- 🪑 **Table Booking** - Reserve tables with time slots
- 📱 **QR Code Scanning** - Quick check-in
- 💳 **VNPay Payment** - Integrated payment gateway
- 📄 **Invoice Management** - View order history
- 🔔 **Notifications** - Real-time updates
- 👤 **User Profile** - Manage account info

---

## 🔧 Configuration

### Environment Variables (`.env`)

```env
# Backend (Ngrok URL - auto-updated by start:dev)
EXPO_PUBLIC_BACKEND_URL=https://xxx.ngrok-free.dev

# Frontend (Local network IP)
EXPO_PUBLIC_API_URL=http://192.168.x.x:8081

# Firebase (for auth & notifications)
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
```

**Note:** Use `npm run start:dev` to auto-update ngrok URL

---

## 🐛 Troubleshooting

### Error: 502 Bad Gateway
```bash
# Check backend is running
curl http://localhost:9090/api/v1/health

# Check ngrok
# Open: http://localhost:4040

# Test connection
npm run test:connection
```

### Error: Network Error
- ✅ Check phone and computer on **same WiFi**
- ✅ Check firewall allows port 8081
- ✅ Verify IP in `.env` is correct

### Ngrok URL Changed
```bash
# Auto-fix (recommended)
npm run start:dev

# Manual fix
# 1. Get new URL from: http://localhost:4040
# 2. Update EXPO_PUBLIC_BACKEND_URL in .env
# 3. Restart: npx expo start -c
```

---

## 📂 Project Structure

```
FontEnd_Web_Pos/
├── app/                    # Screens & routes
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── home.tsx       # Home dashboard
│   │   ├── menu.tsx       # Menu browsing
│   │   ├── dining.tsx     # Table booking
│   │   └── orders.tsx     # Order history
│   ├── auth/              # Authentication
│   ├── profile.tsx        # User profile
│   ├── invoices.tsx       # Invoice list
│   └── notifications.tsx  # Notification list
├── components/            # Reusable components
├── services/              # API & utilities
│   ├── api.ts            # API client
│   ├── config.ts         # Configuration
│   └── types.ts          # TypeScript types
├── hooks/                 # Custom hooks
├── providers/             # Context providers
├── constants/             # App constants
└── assets/                # Images & fonts
```

---

## 🔐 Authentication Flow

1. User opens app → Login/Register
2. Backend validates credentials
3. JWT token + Refresh token stored in AsyncStorage
4. Token auto-attached to all API requests
5. Token auto-refreshed when expired
6. Logout clears all tokens

---

## 📱 Key Technologies

- **React Native** - Mobile framework
- **Expo** - Development platform
- **NativeWind** - Tailwind CSS for React Native
- **Expo Router** - File-based navigation
- **AsyncStorage** - Local data persistence
- **Axios** - HTTP client
- **JWT** - Authentication
- **VNPay** - Payment integration
- **Expo Notifications** - Push notifications

---

## 🚨 Known Limitations

### Push Notifications on Expo Go
- ❌ **Remote push** not available on Expo Go (Android, SDK 53+)
- ✅ **Local notifications** work fine
- 🔧 **Solution:** Build development APK
  ```bash
  npx expo install expo-dev-client
  eas build --profile development --platform android
  ```

### Ngrok Free Plan
- ❌ URL changes every restart
- ✅ Use `npm run start:dev` to auto-update
- 💰 Or upgrade to paid plan for static URL

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support

**Need help?**
- Check documentation in `/docs` folder
- Run `npm run test:connection` to diagnose issues
- Open an issue on GitHub

---

## 📞 Contact

For questions or support, please contact the development team.

---

**Made with ❤️ using React Native & Expo**


