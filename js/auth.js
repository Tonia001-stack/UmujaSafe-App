import { auth, db } from './config.js'; // Import db here for Firestore operations
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js"; // Firestore imports

// --- Role-Based Redirect Helper ---
async function redirectToRolePage(user) {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Get the user's role from Firestore
    const userDocRef = doc(db, "users", user.uid);

    try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const role = userDoc.data().role;
            console.log(`User ${user.email} successfully logged in as ${role}. Redirecting...`);
            // Redirect based on the saved role
            if (role === 'Victim') {
                window.location.href = 'victim.html';
            } else if (role === 'Ally') {
                window.location.href = 'ally.html';
            } else {
                 // Default to Victim page if role is missing or invalid
                 window.location.href = 'victim.html';
            }
        } else {
            // Fallback if user profile doesn't exist (e.g., first login, or Firestore write failed)
            console.warn("User profile not found in Firestore. Check if the 'users' collection exists. Redirecting to victim page by default.");
            window.location.href = 'victim.html'; 
        }
    } catch (error) {
        // CRITICAL ERROR HANDLING: Catches connectivity or security rule errors
        console.error("CRITICAL: Failed to fetch user role from Firestore. This is likely a security rule issue or config error.", error);
        
        // **Fallback Redirect:** If we can't fetch the role, redirect the user anyway to prevent them from getting stuck.
        window.location.href = 'ally.html';
    }
}


// --- Authentication Handlers ---

// Handles both Sign Up and Sign In based on button click
export async function handleAuth(isRegister) {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const authStatus = document.getElementById('authStatus');

    authStatus.textContent = "Processing...";
    authStatus.className = "text-center text-yellow-600 mt-4";

    try {
        if (isRegister) {
            // Get selected role for registration
            const role = document.querySelector('input[name="userRole"]:checked')?.value || 'Ally'; 

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 1. Save user profile (including role) to Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: role, // Save the selected role
                registeredAt: new Date().getTime()
            });

            authStatus.textContent = "Registration Success! Redirecting...";
            
            // 2. Redirect based on selected role
            setTimeout(() => {
                redirectToRolePage(user);
            }, 1000);

        } else {
            // Sign In Logic
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            authStatus.textContent = "Login Success! Redirecting...";

            // Redirect based on stored role
            setTimeout(() => {
                redirectToRolePage(user);
            }, 1000);
        }
        
    } catch (error) {
        let message = "An error occurred.";
        if (error.code === 'auth/weak-password') {
            message = "Password should be at least 6 characters.";
        } else if (error.code === 'auth/email-already-in-use') {
            message = "Email already registered. Try logging in.";
        } else if (error.code === 'auth/invalid-email') {
            message = "Invalid email format.";
        } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            message = "Invalid credentials.";
        } else if (error.code === 'auth/network-request-failed') {
            message = "Network error. Check your keys in js/config.js and network connection.";
        }
        authStatus.textContent = `Error: ${message}`;
        authStatus.className = "text-center text-red-600 mt-4";
        console.error("Auth Error:", error);
    }
}

// Logs the user out and redirects to the login page
export async function handleLogout() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Logout Error:", error);
        const authStatus = document.getElementById('authStatus') || document.createElement('div');
        authStatus.textContent = "Logout failed. Check console for details.";
        authStatus.className = "text-center text-red-600 mt-4";
    }
}


// --- Navigation UI Updater (New Feature 3 Helper) ---
function updateNavUI(isLoggedIn) {
    const navActionContainer = document.getElementById('navActionContainer');
    if (!navActionContainer) return;

    if (isLoggedIn) {
        // Show Logout button
        navActionContainer.innerHTML = `
            <button id="navLogoutButton" class="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-red-600 transition duration-150">
                Logout
            </button>
        `;
        // Attach the logout handler to the dynamically created button
        document.getElementById('navLogoutButton')?.addEventListener('click', handleLogout);
    } else {
        // Show Join Network link
        navActionContainer.innerHTML = `
            <a href="index.html#loginForm" class="bg-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-purple-700 transition duration-150">
                Join Network
            </a>
        `;
    }
}


// --- Auth Guard (Checks if user is logged in for protected pages) ---
export function checkAuth(redirectIfUnauthenticated = true) {
    onAuthStateChanged(auth, (user) => {
        // Update Nav UI state regardless of which page we are on (index, about, contact)
        updateNavUI(!!user); 
        
        if (user) {
            // User is signed in
            document.querySelectorAll('.user-email').forEach(el => el.textContent = user.email);
            // If on the login page (index.html) and logged in, redirect them based on their role
            if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
                // Must wait for user to exist before redirecting
                setTimeout(() => redirectToRolePage(user), 0); 
            }
        } else {
            // User is signed out
            if (redirectIfUnauthenticated && 
                !window.location.pathname.endsWith('index.html') && 
                !window.location.pathname.endsWith('/')) {
                // If on a protected page (victim or ally) and not logged in, redirect to index
                window.location.href = 'index.html?loggedout=true';
            }
        }
    });
}
