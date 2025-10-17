// Firebase config — replace with your actual values
const firebaseConfig = {
  apiKey: "AIzaSyCUmXhYb24e3oTpadU9aR8wuBw6pNvlA0E",
  authDomain: "self-healing-concrete-bb9ad.firebaseapp.com",
  databaseURL: "https://self-healing-concrete-bb9ad-default-rtdb.firebaseio.com",
  projectId: "self-healing-concrete-bb9ad",
  storageBucket: "self-healing-concrete-bb9ad.firebasestorage.app",
  messagingSenderId: "888868871930",
  appId: "1:888868871930:web:18441a7375df4871f33343",
  measurementId: "G-8RV60RGS8H"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const contactDB = firebase.database().ref("reviews");

// Generate a unique user ID for this session
const userId = localStorage.getItem("userId") || (() => {
  const id = "user_" + Math.random().toString(36).substr(2, 9);
  localStorage.setItem("userId", id);
  return id;
})();

// Handle form submission
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const nameInput = document.getElementById("name");
  const messageInput = document.getElementById("message");
  const messagesDiv = document.getElementById("messages");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !message) return;

    const newMessageRef = contactDB.push();
    newMessageRef.set({
      name,
      message,
      userId,
      timestamp: new Date().toISOString()
    });

    form.reset();
  });

  // Display messages
  contactDB.on("value", (snapshot) => {
    messagesDiv.innerHTML = "";
    const data = snapshot.val();
    if (!data) return;

    Object.entries(data).forEach(([key, entry]) => {
      const card = document.createElement("div");
      card.className = "card";

      // Name line with optional "You" tag
      const nameLine = document.createElement("h3");
      nameLine.textContent = entry.name;

      if (entry.userId === userId) {
        const ownerTag = document.createElement("small");
        ownerTag.textContent = " (You)";
        ownerTag.style.color = "green";
        ownerTag.style.fontWeight = "bold";
        nameLine.appendChild(ownerTag);
      }

      const messageText = document.createElement("p");
      messageText.className = "meta";
      messageText.textContent = entry.message;

      const timestamp = document.createElement("small");
      timestamp.style.color = "gray";
      timestamp.textContent = `Posted on ${new Date(entry.timestamp).toLocaleString()}`;

      card.appendChild(nameLine);
      card.appendChild(messageText);
      card.appendChild(timestamp);

      // Delete button only for user's own messages
      if (entry.userId === userId) {
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.className = "secondary";
        delBtn.style.marginTop = "10px";
        delBtn.onclick = () => contactDB.child(key).remove();
        card.appendChild(delBtn);
      }

      messagesDiv.appendChild(card);
    });
  });
});
