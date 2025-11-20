# 🛡️ UmojaSafe Digital Defense Network

**UmojaSafe** (Swahili for "Safe Unity") is a community-led, real-time crowdsourcing platform designed to combat targeted online violence, particularly against African women. It connects victims of online harassment with verified allies to coordinate rapid reporting and defense efforts.  DEPLOYED..LIVE AT...........https://umoja-app-git-main-tonias-projects-bcbc801a.vercel.app/

---

## ✨ Features

The application is a role-based system powered by Firebase Firestore for real-time data synchronization.

### Victim (Flare Sender)

- **SOS Flare Activation**: Victims can send an immediate, anonymous SOS flare containing the link to the harassment content.
- **Real-Time Status Feedback**: Victims receive live updates on their active flare, showing whether it is Active (awaiting claim) or In Progress (claimed by an Ally).
- **Safety Tips**: Immediate digital literacy tips are provided upon flare activation while waiting for Ally intervention.

### Ally (Defender)

- **Live Incident Feed**: Allies see a real-time, prioritized feed of all unresolved flares broadcast across the network.
- **Accountability**: Allies can Claim a flare, marking it as In Progress and attaching their user ID. This prevents redundancy and ensures clear responsibility.
- **Action Tracking**: Allies can mark claimed flares as Resolved once the harassment link has been successfully dealt with.

### Core Architecture

- **Role-Based Access Control**: Users are registered as either 'Ally' or 'Victim', ensuring they are immediately routed to the appropriate dashboard (ally.html or victim.html).
- **Dynamic Navigation**: The global navigation bar dynamically switches between the "Join Network" link and a "Logout" button based on the user's authentication status.

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | HTML5, Tailwind CSS (for modern, responsive styling) |
| **Backend & Database** | Google Firebase (Authentication and Firestore) |
| **Authentication** | Firebase Auth handles user registration, sign-in, and session management |
| **Real-time Data** | Firebase Firestore ensures instant, live updates for the Ally Feed and Victim Status panels |

---

## 🚀 Setup and Installation

### Prerequisites

- Node.js and npm (or yarn)
- A Google Firebase Project (Required to obtain your configuration keys)

### 1. Configure Firebase Credentials

The application uses global variables provided by the Canvas environment. If running locally, you must create a placeholder `js/config.js` file with your Firebase configuration:

```javascript
// js/config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
// ... (include all required Firebase imports like getFirestore, getAuth, etc.)

// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 2. Run Locally

As this is a pure HTML/JS/CSS application using CDN modules, you do not need a complex build step.

**Clone the repository:**

```bash
git clone [YOUR_REPO_URL]
cd UmojaSafe
```

**Serve the files using a simple HTTP server** (e.g., Python's http.server):

```bash
python -m http.server 8000
# or use the Live Server VS Code extension
```

**Open your browser** and navigate to `http://localhost:8000/index.html`.

### 3. Deployment

Since all dependencies are loaded via CDN, the application can be deployed to any static hosting service (e.g., Firebase Hosting, Vercel, Netlify).

---

## 🤝 Contribution

We welcome contributions to UmojaSafe! Please ensure you adhere to the following guidelines:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'feat: add new feature X'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Contact & Support

For questions, suggestions, or support, please open an issue in this repository or contact the maintainers.

---

**Built with ❤️ for a safer digital space for African women**
