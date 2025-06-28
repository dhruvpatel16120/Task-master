# 📝 Task Master — Advanced To‑Do List App

> **A modern, professional, feature‑rich to‑do list app built with React, Tailwind CSS, and Firebase.**  
> Organize your tasks, boost productivity, and track progress – beautifully.

![Task Master Banner](https://your-screenshot-link/banner.png)

---

## ✨ **Features**

✅ User authentication (Google & Email/Password)  
✅ Add, edit, delete tasks with categories, priority & tags  
✅ Live preview while adding/editing  
✅ High priority toggle  
✅ Dashboard with:
- Total, completed & pending counts
- Completion rate
- Latest tasks list
- Motivational quotes widget (with author & new quote button)
✅ Export tasks to CSV  
✅ Delete confirm modal  
✅ Fully responsive design with Tailwind v3  
✅ Firebase Firestore integration  
✅ Professional UI, smooth fade animations

---

## 🛠 **Tech Stack**

| Frontend | Styling | Backend | Build | Features |
|--|--|--|--|--|
| React | Tailwind CSS v3 | Firebase Auth & Firestore | Vite | react-hot-toast, Chart.js, papaparse |

---

## 📸 **Screenshots**

> Replace these with your real screenshots:

| Login | Dashboard | Add Task |
|--|--|--|
| ![Login](https://your-screenshot-link/login.png) | ![Dashboard](https://your-screenshot-link/dashboard.png) | ![Add Task](https://your-screenshot-link/add-task.png) |

| Pending Tasks | Edit Task | Delete Confirm |
|--|--|--|
| ![Pending](https://your-screenshot-link/pending.png) | ![Edit](https://your-screenshot-link/edit.png) | ![Delete](https://your-screenshot-link/delete.png) |

---

## ⚙ **Installation & Setup**

> 🪄 *Beginner‑friendly, step by step:*

### 📥 1️⃣ Clone this repository
```bash
git clone https://github.com/yourusername/task-master.git
cd task-master

## 2️⃣ Install dependencies
bash
Copy
Edit
npm install
🔑 3️⃣ Setup your Firebase project
Go to Firebase Console

Create a new project → add Web App

Enable Authentication: Email/Password & Google

Create Firestore database

Copy your Firebase config:

js
Copy
Edit
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
Replace the placeholder config in:

js
Copy
Edit
src/services/firebase.js
✅ Tip: never commit real keys to GitHub → use .env files for production.

🏗 4️⃣ Build for production
bash
Copy
Edit
npm run build
This creates optimized files in /dist.

🌐 5️⃣ Deploy to Firebase Hosting
Initialize (first time only):

bash
Copy
Edit
firebase init
During init:

Public directory: dist

Configure as SPA: yes

Do not overwrite index.html

GitHub deploy: optional (type n to skip)

Then deploy:

bash
Copy
Edit
firebase deploy
✅ Copy your live URL!

🚀 Dev server (for local development)
bash
Copy
Edit
npm run dev
✅ Preview production build locally
bash
Copy
Edit
npm run serve
✨ Firebase config replacement (recommended for production)
Instead of hard‑coding config, use environment variables:

1️⃣ Create .env file:

env
Copy
Edit
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
...
2️⃣ In src/services/firebase.js:

js
Copy
Edit
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  ...
};
✅ This keeps keys private & easy to change.

📌 Folder structure (for reference)
bash
Copy
Edit
src/
  assets/          # logos, images
  components/      # Navbar, Footer, etc.
  context/         # AuthContext
  pages/           # Dashboard, AddTask, EditTask, PendingTasks, etc.
  services/        # firebase.js
  App.jsx
  main.jsx
