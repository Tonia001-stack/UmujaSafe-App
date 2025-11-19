import { db, auth } from './config.js';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    onSnapshot, 
    updateDoc, 
    doc,
    getDocs // <-- Imported for checking active flare existence
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const FLARES_COLLECTION = "flares";

// --- Flare Sending (VICTIM SIDE) ---
export async function sendFlare() {
    if (!auth.currentUser) {
        document.getElementById('statusMsg').textContent = "Error: Must be logged in to send a flare.";
        return;
    }

    const attackType = document.getElementById('attackType').value;
    const harassmentLink = document.getElementById('harassmentLink').value;
    const statusMsg = document.getElementById('statusMsg');

    if (!harassmentLink.trim()) {
        statusMsg.textContent = "Please provide a link to the harassment.";
        return;
    }

    try {
        statusMsg.textContent = "Sending SOS Flare...";
        statusMsg.className = "text-center text-yellow-600 mt-4";

        // Check if the victim already has an active or in-progress flare
        const qCheck = query(
            collection(db, FLARES_COLLECTION),
            where("victimId", "==", auth.currentUser.uid),
            where("status", "!=", "Resolved")
        );

        // Fetch documents to check for existing active flare
        const snapshot = await getDocs(qCheck); 

        if (snapshot.docs.length > 0) {
            statusMsg.textContent = "You already have an active or in-progress flare. Please wait for resolution.";
            statusMsg.className = "text-center text-blue-600 font-bold mt-4";
            return;
        }

        await addDoc(collection(db, FLARES_COLLECTION), {
            victimId: auth.currentUser.uid, // The ID of the user who sent the flare
            type: attackType,
            link: harassmentLink,
            status: 'Active', // Active, In Progress, or Resolved
            timestamp: new Date().getTime()
        });

        statusMsg.textContent = "SOS Flare Broadcasted Successfully! Help is on the way.";
        statusMsg.className = "text-center text-red-600 font-bold mt-4";

        // Show the safety modal 
        document.getElementById('literacyModal').classList.remove('hidden');
        document.getElementById('literacyModal').classList.add('flex'); // Use flex to center it
        
    } catch (error) {
        statusMsg.textContent = "Failed to send flare. Check console for details.";
        statusMsg.className = "text-center text-red-600 mt-4";
        console.error("Error sending flare: ", error);
    }
}

// --- Flare Claiming (ALLY SIDE) (New Feature 1) ---
export async function claimFlare(flareId) {
    if (!auth.currentUser) {
        console.error("Cannot claim: user not logged in.");
        return;
    }

    try {
        const flareRef = doc(db, FLARES_COLLECTION, flareId);
        await updateDoc(flareRef, {
            status: 'In Progress',
            claimedBy: auth.currentUser.uid,
            claimedAt: new Date().getTime()
        });
        console.log(`Flare ${flareId} claimed by Ally ${auth.currentUser.uid}.`);
    } catch (error) {
        console.error("Error claiming flare: ", error);
    }
}


// --- Flare Resolving (ALLY SIDE) (Updated) ---
export async function resolveFlare(flareId) {
    if (!auth.currentUser) {
        console.error("Cannot resolve: user not logged in.");
        return;
    }

    try {
        const flareRef = doc(db, FLARES_COLLECTION, flareId);
        await updateDoc(flareRef, {
            status: 'Resolved',
            resolvedBy: auth.currentUser.uid,
            resolvedAt: new Date().getTime()
        });
        console.log(`Flare ${flareId} marked as Resolved.`);
    } catch (error) {
        console.error("Error resolving flare: ", error);
    }
}

// --- Ally Feed Rendering ---
function renderFlare(flare) {
    const timeAgo = Math.round((new Date().getTime() - flare.timestamp) / 60000); // time in minutes

    let statusTagClass = '';
    let statusText = '';
    let actionButtonHTML = '';
    const currentUserId = auth.currentUser ? auth.currentUser.uid : 'anonymous';
    const shortClaimerId = flare.claimedBy ? `${flare.claimedBy.substring(0, 6)}...` : '';

    if (flare.status === 'Active') {
        statusText = '🚨 ACTIVE';
        statusTagClass = 'bg-red-100 text-red-700';
        actionButtonHTML = `
            <button 
                data-flare-id="${flare.id}" 
                class="claim-btn w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-blue-700 transition duration-150 mt-3">
                Claim Flare (Start Action)
            </button>
        `;
    } else if (flare.status === 'In Progress') {
        statusText = '🛠️ IN PROGRESS';
        statusTagClass = 'bg-yellow-100 text-yellow-700';
        
        const isClaimedByMe = flare.claimedBy === currentUserId;
        const claimerDisplay = isClaimedByMe ? 'You' : `Ally ${shortClaimerId}`;

        actionButtonHTML = `
            <div class="mt-3 text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p class="text-xs text-yellow-800 font-semibold mb-2">Claimed by ${claimerDisplay}</p>
                <button 
                    data-flare-id="${flare.id}" 
                    class="resolve-btn w-full bg-purple-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-purple-700 transition duration-150">
                    Mark as Resolved
                </button>
            </div>
        `;
    } else { // Resolved
        statusText = '✅ RESOLVED';
        statusTagClass = 'bg-green-100 text-green-700 opacity-80';
        actionButtonHTML = `<p class="text-xs text-green-600 font-medium mt-2">Resolved by ally: ${flare.resolvedBy ? flare.resolvedBy.substring(0, 6) + '...' : 'Unknown'}</p>`;
    }


    return `
        <div class="bg-white p-5 rounded-xl shadow-md border ${flare.status === 'Resolved' ? 'border-green-300 opacity-60' : 'border-red-300' } transition">
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${statusTagClass}">
                    ${statusText}
                </span>
                <span class="text-xs text-gray-500">${timeAgo}m ago</span>
            </div>

            <p class="text-lg font-bold text-gray-800 mb-2">${flare.type}</p>
            
            <a href="${flare.link}" target="_blank" class="text-sm text-blue-600 hover:text-blue-800 underline block mb-3 truncate max-w-full">
                ${flare.link}
            </a>

            ${actionButtonHTML}
        </div>
    `;
}


// --- Ally Feed Initialization (ALLY SIDE) ---
export function initAllyFeed() {
    const feedContainer = document.getElementById('feedContainer');
    
    // Only query flares that aren't dismissed
    const q = query(
        collection(db, FLARES_COLLECTION),
        where("status", "!=", "Dismissed") 
    );

    // Set up a real-time listener
    onSnapshot(q, (snapshot) => {
        let flares = [];
        snapshot.forEach((doc) => {
            flares.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by status (Active first, then In Progress, then Resolved) and then by timestamp
        flares.sort((a, b) => {
            const statusOrder = { 'Active': 1, 'In Progress': 2, 'Resolved': 3 };
            const statusA = statusOrder[a.status] || 4;
            const statusB = statusOrder[b.status] || 4;
            
            if (statusA !== statusB) {
                return statusA - statusB; // Sort by status group
            }
            return b.timestamp - a.timestamp; // Within the group, sort by newest first
        });

        if (flares.length === 0) {
            feedContainer.innerHTML = `
                <div class="text-center mt-10 p-6 bg-white rounded-xl shadow-md">
                    <span class="text-4xl">🕊️</span>
                    <p class="text-gray-500 font-semibold mt-2">All Clear!</p>
                    <p class="text-sm text-gray-400">No active SOS flares detected in the network right now.</p>
                </div>
            `;
            return;
        }

        feedContainer.innerHTML = flares.map(renderFlare).join('');

        // Attach event listeners to the new 'Claim' buttons
        document.querySelectorAll('.claim-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const flareId = e.target.getAttribute('data-flare-id');
                if (flareId) {
                    claimFlare(flareId);
                }
            });
        });
        
        // Attach event listeners to the new 'Resolve' buttons
        document.querySelectorAll('.resolve-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const flareId = e.target.getAttribute('data-flare-id');
                if (flareId) {
                    resolveFlare(flareId);
                }
            });
        });

    }, (error) => {
        feedContainer.innerHTML = `<div class="text-center text-red-500 mt-10">Error loading feed: ${error.message}</div>`;
        console.error("Firestore snapshot error:", error);
    });
}


// --- Victim Status Listener (VICTIM SIDE) (New Feature 2) ---
export function initVictimStatusListener() {
    if (!auth.currentUser) return;

    const flareStatusDiv = document.getElementById('victimFlareStatus');
    const statusDisplay = document.getElementById('flareStatusDisplay');
    const claimedByDisplay = document.getElementById('flareClaimedByDisplay');

    // Query for the user's *unresolved* flare
    const q = query(
        collection(db, FLARES_COLLECTION),
        where("victimId", "==", auth.currentUser.uid),
        where("status", "!=", "Resolved") // Only interested in active or in-progress
    );

    onSnapshot(q, (snapshot) => {
        // Find the most recent active/in-progress flare
        let activeFlares = [];
        snapshot.forEach((doc) => {
            activeFlares.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by timestamp (most recent first) and pick the latest
        activeFlares.sort((a, b) => b.timestamp - a.timestamp);
        const flare = activeFlares.length > 0 ? activeFlares[0] : null;

        if (flare) {
            flareStatusDiv.classList.remove('hidden');
            let statusText = '';
            let claimedText = '';
            let statusClass = '';
            const shortClaimerId = flare.claimedBy ? `${flare.claimedBy.substring(0, 6)}...` : '';

            if (flare.status === 'Active') {
                statusText = 'Flare Active, Awaiting Ally Claim...';
                statusClass = 'text-red-600';
                claimedText = 'The network is reviewing your SOS now. This is a crucial time.';
            } else if (flare.status === 'In Progress') {
                statusText = 'Ally Action In Progress! 🛡️';
                statusClass = 'text-green-600';
                const timeClaimed = Math.round((new Date().getTime() - flare.claimedAt) / 60000);
                claimedText = `An Ally (${shortClaimerId}) is actively working on your case. Claimed ${timeClaimed} minutes ago.`;
            } else {
                // Should not happen due to the query, but good fallback
                statusText = 'Status Unknown.';
            }

            statusDisplay.textContent = statusText;
            statusDisplay.className = `text-lg font-bold ${statusClass}`;
            claimedByDisplay.textContent = claimedText;
        } else {
            // No active flare found for this user
            flareStatusDiv.classList.add('hidden');
        }

    }, (error) => {
        console.error("Victim status listener error:", error);
    });
}