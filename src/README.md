# BlockFix - AI-Powered Grievance Redressal System

Complete grievance redressal application for colleges and hostels with AI-based complaint routing, voice input, multi-language support, and gamified vendor performance tracking.

---

## 🚀 Running BlockFix in VS Code

### Prerequisites

Before starting, install these on your computer:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **VS Code** - [Download here](https://code.visualstudio.com/)
3. **npm** (comes with Node.js)

Verify installation by opening terminal/command prompt:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

---

## 📦 Installation Steps

### Step 1: Set Up Project Structure

1. **Create project folder:**
   ```bash
   mkdir BlockFix
   cd BlockFix
   ```

2. **Copy all project files** into this folder maintaining the structure:
   ```
   BlockFix/
   ├── components/
   ├── contexts/
   ├── services/
   ├── styles/
   ├── contracts/
   ├── public/
   ├── App.tsx
   └── (other files)
   ```

### Step 2: Create Configuration Files

Create these files in the **root** of your BlockFix folder:

#### `package.json`
```json
{
  "name": "blockfix",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.451.0",
    "recharts": "^2.12.7",
    "motion": "^11.11.17",
    "sonner": "^2.0.3",
    "web3": "^4.13.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-label": "^2.1.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "tailwindcss": "^4.0.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47"
  }
}
```

#### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    port: 3000,
    open: true
  }
})
```

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### `tsconfig.node.json`
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

#### `index.html` (in root folder)
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BlockFix - Grievance Redressal System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

#### `main.tsx` (in root folder)
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Step 3: Open in VS Code

```bash
# Navigate to project folder
cd BlockFix

# Open VS Code
code .
```

### Step 4: Install Dependencies

In VS Code, open the integrated terminal:
- **Windows/Linux:** Press `` Ctrl + ` ``
- **Mac:** Press `` Cmd + ` ``
- Or: Menu → View → Terminal

Run this command:
```bash
npm install
```

This will take 2-5 minutes to download all required packages.

### Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.4.10  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 6: Open in Browser

The app should automatically open at `http://localhost:3000`

If it doesn't, manually navigate to: **http://localhost:3000**

---

## 🎯 Testing the Application

### Quick Access Accounts

**Student Account:**
- Email: `student@college.edu`
- Password: `student123`

**Vendor Account:**
- Email: `vendor@services.com`
- Password: `vendor123`

**Admin Account:**
- Email: `admin@college.edu`
- Password: `admin123`

**Counselor Account:**
- Email: `counselor@college.edu`
- Password: `counselor123`

### Test Flow

1. **Login as Student** → File complaints with voice/text → Upload photos
2. **Login as Vendor** → View assigned complaints → Upload resolution proof → Track performance
3. **Login as Admin** → Assign vendors → Manage fund allocation → View analytics
4. **Login as Counselor** → Handle harassment cases → Provide support

---

## 🛠️ Development Workflow

### Daily Usage

```bash
# Start the development server (do this every time)
npm run dev

# App will auto-refresh when you save changes to any file
```

### Making Changes

1. Edit files in VS Code
2. Save (Ctrl+S / Cmd+S)
3. Browser automatically refreshes
4. Check console (F12) for any errors

### Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

The build files will be in the `dist/` folder.

---

## 📁 Project Structure

```
BlockFix/
├── index.html                 # Entry HTML file
├── main.tsx                   # React entry point  
├── App.tsx                    # Main component
├── package.json              # Dependencies
├── vite.config.ts            # Build config
├── tsconfig.json             # TypeScript config
│
├── components/
│   ├── Auth.tsx              # Login/Signup
│   ├── StudentDashboard.tsx  # Student interface
│   ├── VendorDashboard.tsx   # Vendor interface
│   ├── AdminDashboard.tsx    # Admin interface
│   ├── VoiceInput.tsx        # Voice recording
│   ├── ImageUpload.tsx       # Photo capture/upload
│   └── ui/                   # Reusable UI components
│
├── contexts/
│   ├── AuthContext.tsx       # Authentication & data management
│   └── Web3Context.tsx       # Blockchain integration (optional)
│
├── services/
│   └── emailService.ts       # Email notifications
│
├── styles/
│   └── globals.css           # Global styles & Tailwind
│
├── contracts/
│   └── BlockFix.sol          # Smart contract (optional)
│
└── public/
    ├── manifest.json         # PWA manifest
    └── service-worker.js     # Offline support
```

---

## 🔧 Common Issues & Solutions

### Issue: Port 3000 already in use
**Solution:**
```bash
# Option 1: Kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
# Edit vite.config.ts and change port to 3001
```

### Issue: "Cannot find module" errors
**Solution:**
- Verify all files are in correct folders
- Check import paths match file locations
- Run `npm install` again

### Issue: TypeScript errors
**Solution:**
- Make sure all config files are created
- Run: `npm install typescript --save-dev`

### Issue: Styles not loading
**Solution:**
- Verify `styles/globals.css` exists
- Check `main.tsx` imports the CSS file
- Restart development server

### Issue: Camera not working
**Solution:**
- Must use HTTPS or localhost
- Check browser permissions
- Allow camera access when prompted

### Issue: Voice input not working
**Solution:**
- Check browser supports Web Speech API
- Allow microphone permission
- Works best in Chrome/Edge

---

## 💻 Recommended VS Code Extensions

Install these for better development experience:

1. **ES7+ React/Redux snippets** - by dsznajder
2. **Tailwind CSS IntelliSense** - by Tailwind Labs
3. **TypeScript Hero** - by rbbit
4. **Auto Import** - by steoates
5. **Prettier - Code formatter** - by Prettier
6. **ESLint** - by Microsoft

Install: Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) → Search → Install

---

## 🎨 Key Features

### For Students
- ✅ File complaints via voice or text
- ✅ Multi-language support (English, Hindi, Tamil, Telugu, etc.)
- ✅ Upload photos directly from camera/device
- ✅ Track complaint status in real-time
- ✅ Upvote other complaints (DAO-style voting)
- ✅ Rate vendor resolutions
- ✅ View personal analytics

### For Vendors
- ✅ View assigned complaints
- ✅ Upload resolution photos from camera
- ✅ Track performance metrics
- ✅ Gamified leaderboard system
- ✅ Earn points for quality work
- ✅ View earnings and transaction history

### For Admins
- ✅ Assign vendors to complaints
- ✅ Manage fund allocation
- ✅ View comprehensive analytics
- ✅ Monitor system health
- ✅ Add new vendors
- ✅ Export data

### For Counselors
- ✅ Handle harassment cases
- ✅ Provide support resources
- ✅ Track case progress
- ✅ Confidential case management

---

## 💾 Data Persistence

BlockFix uses **localStorage** for data storage:
- All data is stored in your browser
- Clearing browser data resets the app
- Data persists across page refreshes
- No backend server required for basic usage

**Important:** For production use, integrate with a real database (Supabase, Firebase, etc.)

---

## 🔐 Security Notes

⚠️ **Current Implementation:**
- Uses localStorage (frontend only)
- Demo accounts with hardcoded credentials
- No real authentication

⚠️ **For Production Deployment:**
1. Add proper backend authentication
2. Use secure database (not localStorage)
3. Implement HTTPS
4. Add input sanitization
5. Add rate limiting
6. Use environment variables for sensitive data

---

## 🌐 Browser Support

**Fully Supported:**
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

**Features Requiring Modern Browsers:**
- Voice Input: Chrome/Edge recommended
- Camera Access: All modern browsers with HTTPS
- Web Speech API: Chrome, Edge, Safari

---

## 🚀 Next Steps

After getting the app running:

1. ✅ Test all user roles
2. ✅ Try voice input and camera features
3. ✅ Explore analytics dashboards
4. 🔧 Customize colors/branding in `styles/globals.css`
5. 🔧 Add your college logo
6. 🔧 Integrate with real database
7. 🔧 Deploy to hosting service

---

## 📚 Additional Documentation

- **Smart Contract:** See `/contracts/BlockFix.sol` for blockchain integration
- **Email Service:** See `/services/emailService.ts` for notification setup
- **Styling:** See `/styles/globals.css` for theme customization

---

## 🐛 Troubleshooting

### Application won't start
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again
4. Run `npm run dev`

### Changes not reflecting
1. Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R`)
2. Clear browser cache
3. Restart development server

### Build fails
1. Check for TypeScript errors in terminal
2. Fix any red squiggly lines in VS Code
3. Ensure all imports are correct

---

## 📞 Development Tips

### Hot Module Replacement (HMR)
Changes auto-refresh without losing state:
- Edit components
- Save file
- See changes instantly

### Browser DevTools
Press `F12` to open:
- **Console:** See errors and logs
- **Network:** Debug API calls
- **Application:** View localStorage data
- **React DevTools:** Install for component debugging

### Terminal Commands
```bash
# Install new package
npm install package-name

# Remove package
npm uninstall package-name

# Update dependencies
npm update

# Check for issues
npm audit
```

---

## ✅ Quick Checklist

Before running:
- [ ] Node.js installed (v18+)
- [ ] VS Code installed
- [ ] All files copied to BlockFix folder
- [ ] Configuration files created
- [ ] Terminal opened in project folder

First-time setup:
- [ ] `npm install` completed
- [ ] No error messages in terminal
- [ ] `npm run dev` running
- [ ] Browser opened to localhost:3000
- [ ] Login page visible

---

## 🎉 You're Ready!

If you can see the BlockFix login page, you're all set! Start by logging in with any of the demo accounts above and exploring the features.

**Happy Coding! 🚀**

---

## Version
BlockFix v1.0.0 - Production Ready
