const HOOK = "https://gerotoone.n8n-wsk.com/webhook/e9af0c64-4ff2-462b-965d-ab16f5fd83fd";

// These are placeholders for new endpoints you will create
const FILE_UPLOAD_HOOK = "https://your-n8n-domain/webhook/upload-file";
const TICKET_HOOK = "https://your-n8n-domain/webhook/raise-hr-ticket";
const EMAIL_HOOK = "https://your-n8n-domain/webhook/email-hr";

const sid = "sid_" + Math.random().toString(36).slice(2, 11);

const input = document.getElementById("inp");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const chatLauncher = document.getElementById("chatLauncher");
const chatPopup = document.getElementById("chatPopup");
const closeChat = document.getElementById("closeChat");

// New controls
const fileUpload = document.getElementById("fileUpload");
const raiseTicketBtn = document.getElementById("raiseTicketBtn");
const emailHrBtn = document.getElementById("emailHrBtn");
const ticketPanel = document.getElementById("ticketPanel");
const emailPanel = document.getElementById("emailPanel");
const submitTicketBtn = document.getElementById("submitTicketBtn");
const sendEmailBtn = document.getElementById("sendEmailBtn");

function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = role === "user" ? "user-message" : "bot-message";
  msg.innerHTML = text.replace(/\n/g, "<br>");
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  const typing = document.createElement("div");
  typing.className = "typing-message";
  typing.id = "typing-indicator";
  typing.innerHTML = `
    <div><strong>Prashant AI Assistant:</strong></div>
    <div class="typing-dots">
      <span></span><span></span><span></span>
    </div>
  `;
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing-indicator");
  if (typing) typing.remove();
}

function openChat() {
  chatPopup.classList.remove("hidden");
  input.focus();
}

function closeChatPopup() {
  chatPopup.classList.add("hidden");
}

function hidePanels() {
  ticketPanel.classList.add("hidden");
  emailPanel.classList.add("hidden");
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", `<strong>You:</strong><br>${text}`);
  input.value = "";
  sendBtn.disabled = true;
  showTyping();

  try {
    const response = await fetch(HOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chatInput: text,
        sessionId: sid
      })
    });

    removeTyping();

    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    const data = await response.json();

    let reply = "";
    if (typeof data === "string") {
      reply = data;
    } else if (data.output) {
      reply = data.output;
    } else if (data.text) {
      reply = data.text;
    } else if (data.message) {
      reply = data.message;
    } else if (Array.isArray(data) && data[0]) {
      reply = data[0].output || data[0].text || JSON.stringify(data[0]);
    } else {
      reply = JSON.stringify(data);
    }

    addMessage("bot", `<strong>Prashant AI Assistant:</strong><br>${reply}`);
  } catch (error) {
    removeTyping();
    console.error(error);
    addMessage("bot", `<strong>Prashant AI Assistant:</strong><br>Sorry, I could not reach the chatbot service.`);
  }

  sendBtn.disabled = false;
  input.focus();
}

async function handleFileUpload(file) {
  if (!file) return;

  addMessage("user", `<strong>You:</strong><br>Uploaded file: ${file.name}`);
  showTyping();

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sid);

    const response = await fetch(FILE_UPLOAD_HOOK, {
      method: "POST",
      body: formData
    });

    removeTyping();

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    const reply = data.message || `File "${file.name}" uploaded successfully.`;
    addMessage("bot", `<strong>Prashant AI Assistant:</strong><br>${reply}`);
  } catch (error) {
    removeTyping();
    console.error(error);
    addMessage("bot", `<strong>Prashant AI Assistant:</strong><br>Sorry, file upload failed.`);
  }
}

async function submitTicket() {
  const name = document.getElementById("ticketName").value.trim();
  const email = document.getElementById("ticketEmail").value.trim();
  const subject = document.getElementById("ticketSubject").value.trim();
  const description = document.getElementById("ticketDescription").value.trim();

  if (!name || !email || !subject || !description) {
    addMessage("bot", `<strong>Prashant AI Assistant:</strong><br>Please fill all ticket fields.`);
    return;
  }

  showTyping();

  try {
    const response = await fetch(TICKET_HOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        subject,
        description,
        sessionId: sid
      })
    });

    removeTyping();

    if (!response.ok) {
      throw new Error("Ticket creation failed");
    }

    const data = await response.json();
    addMessage("bot", `<strong>Prashant AI Assistant:</strong><br>${data.message || "Your HR ticket has been created."}`);
    ticketPanel.classList.add("hidden");
  } catch (error) {
    removeTyping();
    console.error(error);
    addMessage("bot", `<strong>Prashant AI Assistant:</strong><br>Sorry, ticket creation failed.`);
  }
}

async function sendHrEmail() {
  const name = document.getElementById("emailName").value.trim();
  const from = document.getElementById("emailFrom").value.trim();
  const subject = document.getElementById("emailSubject").value.trim();
  const body = document.getElementById("emailBody").value.trim();

  if (!name || !from || !subject || !body) {
    addMessage("bot", `<strong>Prashant AI Assistant:</strong><br>Please fill all email fields.`);
    return;
  }

  showTyping();

  try {
    const response = await fetch(EMAIL_HOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        from,
        subject,
        body,
        sessionId: sid
      })
    });

    removeTyping();

    if (!response.ok) {
      throw new Error("Email send failed");
    }

    const data = await response.json();
    addMessage("bot", `<strong>Prashant AI Assistant:</strong><br>${data.message || "Your email has been sent to HR."}`);
    emailPanel.classList.add("hidden");
  } catch (error) {
    removeTyping();
    console.error(error);
    addMessage("bot", `<strong>Prashant AI Assistant:</strong><br>Sorry, sending email failed.`);
  }
}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", function () {
    navMenu.classList.toggle("show");
  });
}

chatLauncher.addEventListener("click", openChat);
closeChat.addEventListener("click", closeChatPopup);

raiseTicketBtn.addEventListener("click", function () {
  const isHidden = ticketPanel.classList.contains("hidden");
  hidePanels();
  if (isHidden) ticketPanel.classList.remove("hidden");
});

emailHrBtn.addEventListener("click", function () {
  const isHidden = emailPanel.classList.contains("hidden");
  hidePanels();
  if (isHidden) emailPanel.classList.remove("hidden");
});

submitTicketBtn.addEventListener("click", submitTicket);
sendEmailBtn.addEventListener("click", sendHrEmail);

fileUpload.addEventListener("change", function () {
  const file = this.files[0];
  handleFileUpload(file);
});