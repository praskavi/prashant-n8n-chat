const HOOK = "https://gerotoone.n8n-wsk.com/webhook/e9af0c64-4ff2-462b-965d-ab16f5fd83fd";

// Placeholders for new endpoints
const FILE_UPLOAD_HOOK = "https://your-n8n-domain/webhook/upload-file";
const TICKET_HOOK      = "https://your-n8n-domain/webhook/raise-hr-ticket";
const EMAIL_HOOK       = "https://your-n8n-domain/webhook/email-hr";

const sid = "sid_" + Math.random().toString(36).slice(2, 11);

// ── DOM refs ──
const input          = document.getElementById("inp");
const sendBtn        = document.getElementById("sendBtn");
const messages       = document.getElementById("messages");
const menuToggle     = document.getElementById("menuToggle");
const navMenu        = document.getElementById("navMenu");
const chatLauncher   = document.getElementById("chatLauncher");
const chatPopup      = document.getElementById("chatPopup");
const closeChat      = document.getElementById("closeChat");
const fileUpload     = document.getElementById("fileUpload");
const raiseTicketBtn = document.getElementById("raiseTicketBtn");
const emailHrBtn     = document.getElementById("emailHrBtn");
const ticketPanel    = document.getElementById("ticketPanel");
const emailPanel     = document.getElementById("emailPanel");
const submitTicketBtn= document.getElementById("submitTicketBtn");
const sendEmailBtn   = document.getElementById("sendEmailBtn");
const quickChips     = document.getElementById("quickChips");
const topicIcon      = document.getElementById("topicIcon");
const topicTitle     = document.getElementById("topicTitle");
const topicDesc      = document.getElementById("topicDesc");

// ── Topic Data ──
const topics = {
  leave: {
    icon:  "📋",
    title: "Leave & Attendance",
    desc:  "Leave balances, applications and attendance tracking",
    placeholder: "Ask about leave & attendance...",
    chips: [
      "How many days leave do I have?",
      "Apply for annual leave",
      "Sick leave policy",
      "WFH approval process"
    ]
  },
  payroll: {
    icon:  "💰",
    title: "Payroll & Salary",
    desc:  "Payslips, deductions and salary queries",
    placeholder: "Ask about payroll or salary...",
    chips: [
      "When is payday?",
      "How do I view my payslip?",
      "Explain my deductions",
      "Tax and NI queries"
    ]
  },
  benefits: {
    icon:  "🏥",
    title: "Benefits & Insurance",
    desc:  "Health cover, perks and employee entitlements",
    placeholder: "Ask about benefits or insurance...",
    chips: [
      "What health cover do I have?",
      "How do I claim expenses?",
      "Pension contributions",
      "Employee discount perks"
    ]
  },
  policies: {
    icon:  "📜",
    title: "HR Policies",
    desc:  "Code of conduct, company rules and procedures",
    placeholder: "Ask about HR policies...",
    chips: [
      "Code of conduct",
      "Remote working policy",
      "Disciplinary process",
      "Data & privacy policy"
    ]
  },
  onboarding: {
    icon:  "🚀",
    title: "Onboarding",
    desc:  "New joiner information, setup and access",
    placeholder: "Ask about onboarding...",
    chips: [
      "IT setup help",
      "First week checklist",
      "Who is my HR contact?",
      "System access requests"
    ]
  },
  training: {
    icon:  "🎓",
    title: "Training & Learning",
    desc:  "Courses, certifications and development",
    placeholder: "Ask about training or learning...",
    chips: [
      "Available courses",
      "Book a training session",
      "Certification support",
      "Learning budget info"
    ]
  },
  performance: {
    icon:  "📊",
    title: "Performance Review",
    desc:  "Goals, KPIs, appraisals and feedback",
    placeholder: "Ask about performance reviews...",
    chips: [
      "When is my review?",
      "How do I set goals?",
      "360 feedback process",
      "Promotion criteria"
    ]
  },
  relations: {
    icon:  "🤝",
    title: "Employee Relations",
    desc:  "Grievances, wellbeing and work arrangements",
    placeholder: "Ask about employee relations...",
    chips: [
      "Raise a concern",
      "Flexible working request",
      "Wellbeing resources",
      "Grievance process"
    ]
  }
};

// ── Topic Switcher ──
function switchTopic(topicKey) {
  const t = topics[topicKey];
  if (!t) return;

  // Update header
  topicIcon.textContent  = t.icon;
  topicTitle.textContent = t.title;
  topicDesc.textContent  = t.desc;

  // Update input placeholder
  input.placeholder = t.placeholder;

  // Rebuild chips
  quickChips.innerHTML = "";
  t.chips.forEach(function(label) {
    const btn = document.createElement("button");
    btn.className   = "chip";
    btn.textContent = label;
    btn.addEventListener("click", function() {
      input.value = label;
      input.focus();
    });
    quickChips.appendChild(btn);
  });

  // Update active sidebar item
  document.querySelectorAll(".sidebar-topic[data-topic]").forEach(function(el) {
    el.classList.toggle("active", el.dataset.topic === topicKey);
  });

  // Close any open panels
  hidePanels();
}

// ── Message Helpers ──
function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = role === "user" ? "user-message" : "bot-message";
  msg.innerHTML = text.replace(/\n/g, "<br>");
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  const typing   = document.createElement("div");
  typing.className = "typing-message";
  typing.id        = "typing-indicator";
  typing.innerHTML = `
    <div><strong>HR Assistant:</strong></div>
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

// ── Chat Open / Close ──
function openChat() {
  chatPopup.classList.remove("hidden");
  input.focus();
}

function closeChatPopup() {
  chatPopup.classList.add("hidden");
}

// ── Panel Helpers ──
function hidePanels() {
  ticketPanel.classList.add("hidden");
  emailPanel.classList.add("hidden");
}

// ── Send Message ──
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", `<strong>You:</strong><br>${text}`);
  input.value = "";
  sendBtn.disabled = true;
  showTyping();

  try {
    const response = await fetch(HOOK, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ chatInput: text, sessionId: sid })
    });

    removeTyping();

    if (!response.ok) throw new Error("HTTP error " + response.status);

    const data = await response.json();
    let reply  = "";

    if      (typeof data === "string")              reply = data;
    else if (data.output)                           reply = data.output;
    else if (data.text)                             reply = data.text;
    else if (data.message)                          reply = data.message;
    else if (Array.isArray(data) && data[0])        reply = data[0].output || data[0].text || JSON.stringify(data[0]);
    else                                            reply = JSON.stringify(data);

    addMessage("bot", `<strong>HR Assistant:</strong><br>${reply}`);

  } catch (error) {
    removeTyping();
    console.error(error);
    addMessage("bot", `<strong>HR Assistant:</strong><br>Sorry, I could not reach the HR chatbot service right now.`);
  }

  sendBtn.disabled = false;
  input.focus();
}

// ── File Upload ──
async function handleFileUpload(file) {
  if (!file) return;

  addMessage("user", `<strong>You:</strong><br>Uploaded file: ${file.name}`);
  showTyping();

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sid);

    const response = await fetch(FILE_UPLOAD_HOOK, { method: "POST", body: formData });

    removeTyping();
    if (!response.ok) throw new Error("Upload failed");

    const data  = await response.json();
    const reply = data.message || `File "${file.name}" uploaded successfully.`;
    addMessage("bot", `<strong>HR Assistant:</strong><br>${reply}`);

  } catch (error) {
    removeTyping();
    console.error(error);
    addMessage("bot", `<strong>HR Assistant:</strong><br>Sorry, file upload failed.`);
  }
}

// ── Submit Ticket ──
async function submitTicket() {
  const name        = document.getElementById("ticketName").value.trim();
  const email       = document.getElementById("ticketEmail").value.trim();
  const subject     = document.getElementById("ticketSubject").value.trim();
  const description = document.getElementById("ticketDescription").value.trim();

  if (!name || !email || !subject || !description) {
    addMessage("bot", `<strong>HR Assistant:</strong><br>Please fill in all ticket fields before submitting.`);
    return;
  }

  showTyping();

  try {
    const response = await fetch(TICKET_HOOK, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, subject, description, sessionId: sid })
    });

    removeTyping();
    if (!response.ok) throw new Error("Ticket creation failed");

    const data = await response.json();
    addMessage("bot", `<strong>HR Assistant:</strong><br>${data.message || "Your HR ticket has been created successfully."}`);
    ticketPanel.classList.add("hidden");

  } catch (error) {
    removeTyping();
    console.error(error);
    addMessage("bot", `<strong>HR Assistant:</strong><br>Sorry, ticket creation failed. Please try again.`);
  }
}

// ── Send HR Email ──
async function sendHrEmail() {
  const name    = document.getElementById("emailName").value.trim();
  const from    = document.getElementById("emailFrom").value.trim();
  const subject = document.getElementById("emailSubject").value.trim();
  const body    = document.getElementById("emailBody").value.trim();

  if (!name || !from || !subject || !body) {
    addMessage("bot", `<strong>HR Assistant:</strong><br>Please fill in all email fields before sending.`);
    return;
  }

  showTyping();

  try {
    const response = await fetch(EMAIL_HOOK, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, from, subject, body, sessionId: sid })
    });

    removeTyping();
    if (!response.ok) throw new Error("Email send failed");

    const data = await response.json();
    addMessage("bot", `<strong>HR Assistant:</strong><br>${data.message || "Your email has been sent to HR."}`);
    emailPanel.classList.add("hidden");

  } catch (error) {
    removeTyping();
    console.error(error);
    addMessage("bot", `<strong>HR Assistant:</strong><br>Sorry, sending the email failed. Please try again.`);
  }
}

// ── Event Listeners ──

// Send button & Enter key
sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Mobile nav toggle
if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", function() {
    navMenu.classList.toggle("show");
  });
}

// Chat open / close
chatLauncher.addEventListener("click", openChat);
closeChat.addEventListener("click", closeChatPopup);

// Sidebar HR topic buttons
document.querySelectorAll(".sidebar-topic[data-topic]").forEach(function(btn) {
  btn.addEventListener("click", function() {
    switchTopic(this.dataset.topic);
  });
});

// Sidebar action buttons
raiseTicketBtn.addEventListener("click", function() {
  const isHidden = ticketPanel.classList.contains("hidden");
  hidePanels();
  if (isHidden) ticketPanel.classList.remove("hidden");
});

emailHrBtn.addEventListener("click", function() {
  const isHidden = emailPanel.classList.contains("hidden");
  hidePanels();
  if (isHidden) emailPanel.classList.remove("hidden");
});

submitTicketBtn.addEventListener("click", submitTicket);
sendEmailBtn.addEventListener("click", sendHrEmail);

fileUpload.addEventListener("change", function() {
  const file = this.files[0];
  handleFileUpload(file);
});

// Initial chips render (leave topic is default active)
switchTopic("leave");
