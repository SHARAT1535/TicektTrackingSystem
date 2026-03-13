// Global State
let currentUser = null;
const API_URL = 'http://localhost:8080';

// DOM Elements
const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const adminLoginSection = document.getElementById('admin-login-section');

// Navigation Elements
const toRegisterBtn = document.getElementById('to-register');
const toLoginBtn = document.getElementById('to-login');
const navItems = document.querySelectorAll('.nav-item[data-target]');
const logoutBtn = document.getElementById('logout-btn');

// Form Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const raiseTicketForm = document.getElementById('raise-ticket-form');
const adminLoginForm = document.getElementById('admin-login-form');

// Admin Elements
const showAdminLoginBtn = document.getElementById('show-admin-login-btn');
const toUserLoginFromAdminBtn = document.getElementById('to-user-login-from-admin');
const adminTicketsList = document.getElementById('admin-tickets-list');
const adminTotalTicketsEl = document.getElementById('admin-total-tickets');
const adminRefreshAllBtn = document.getElementById('admin-refresh-all-btn');
const adminLoginMsg = document.getElementById('admin-login-msg');

// Displays
const userDisplayName = document.getElementById('user-display-name');
const ticketsList = document.getElementById('tickets-list');
const totalTicketsEl = document.getElementById('total-tickets');
const refreshTicketsBtn = document.getElementById('refresh-tickets-btn');

// Messages
const loginMsg = document.getElementById('login-msg');
const regMsg = document.getElementById('reg-msg');
const ticketMsg = document.getElementById('ticket-msg');

// Modal Elements
const repliesModal = document.getElementById('replies-modal');
const closeModalBtn = document.querySelector('.close-modal');
const repliesList = document.getElementById('replies-list');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('ticketFlowUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }

    // Added listener for Admin User Search (moved inside DOMContentLoaded)
    const adminSearchUser = document.getElementById('admin-search-user');
    if (adminSearchUser) {
        let debounceTimer;
        adminSearchUser.addEventListener('input', () => {
            console.log("Admin search input changed:", adminSearchUser.value);
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadAllTicketsAdmin();
            }, 300); // reduced to 300ms for snappier feel
        });
    }
});


// Helper: Show Message
function showMessage(element, text, isError = false) {
    element.textContent = text;
    element.className = 'form-msg ' + (isError ? 'msg-error' : 'msg-success');
    element.style.display = 'block';

    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Helper: Switch active views
function switchAuthView(viewName) {
    loginSection.classList.remove('active-section');
    registerSection.classList.remove('active-section');
    adminLoginSection.classList.remove('active-section');

    if (viewName === 'register') {
        registerSection.classList.add('active-section');
    } else if (viewName === 'admin-login') {
        adminLoginSection.classList.add('active-section');
    } else {
        loginSection.classList.add('active-section');
    }
}

function switchDashboardView(targetId) {
    // Update nav items
    navItems.forEach(item => {
        if (item.getAttribute('data-target') === targetId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        if (section.id === targetId) {
            section.classList.add('active-content');
        } else {
            section.classList.remove('active-content');
        }
    });
}

function showDashboard() {
    authContainer.classList.remove('active-panel');
    dashboardContainer.classList.add('active-panel');
    userDisplayName.textContent = currentUser.username;

    // Toggle nav items based on user role
    if (currentUser.isAdmin) {
        document.querySelectorAll('.user-only-nav').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.admin-only-nav').forEach(el => el.style.display = 'flex');
        switchDashboardView('admin-view-all-section');
        loadAllTicketsAdmin();
    } else {
        document.querySelectorAll('.user-only-nav').forEach(el => el.style.display = 'flex');
        document.querySelectorAll('.admin-only-nav').forEach(el => el.style.display = 'none');
        switchDashboardView('view-tickets-section');
        loadTickets();
    }
}

function logout() {
    localStorage.removeItem('ticketFlowUser');
    currentUser = null;
    dashboardContainer.classList.remove('active-panel');
    loginForm.reset();
    authContainer.classList.add('active-panel');
    switchAuthView(false);
}

// Event Listeners: Navigation
toRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    switchAuthView('register');
});

toLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    switchAuthView('login');
});

showAdminLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    switchAuthView('admin-login');
});

toUserLoginFromAdminBtn.addEventListener('click', (e) => {
    e.preventDefault();
    switchAuthView('login');
});

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('data-target');
        switchDashboardView(target);
        if (target === 'view-tickets-section') {
            loadTickets();
        }
    });
});

logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});

refreshTicketsBtn.addEventListener('click', () => {
    loadTickets();
});

adminRefreshAllBtn.addEventListener('click', () => {
    loadAllTicketsAdmin();
});

closeModalBtn.addEventListener('click', () => {
    repliesModal.classList.remove('active');
});

window.addEventListener('click', (e) => {
    if (e.target === repliesModal) {
        repliesModal.classList.remove('active');
    }
});

// API Calls
// 1. User Registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const btn = document.getElementById('reg-btn');

    btn.disabled = true;
    btn.innerHTML = `<i class="ri-loader-4-line spin" style="animation: spin 1s linear infinite;"></i> Registering...`;

    try {
        const response = await fetch(`${API_URL}/createUserAccount`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, username, password })
        });

        if (!response.ok) throw new Error('Registration failed');

        const data = await response.json();
        // The API returns the new user object

        showMessage(regMsg, 'Registration successful! Please login.');
        registerForm.reset();
        setTimeout(() => switchAuthView('login'), 1500);

    } catch (error) {
        showMessage(regMsg, error.message || 'Error connecting to server', true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<span>Sign Up</span><i class="ri-user-add-line"></i>`;
    }
});

// 2. User Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');

    btn.disabled = true;
    btn.innerHTML = `<i class="ri-loader-4-line spin" style="animation: spin 1s linear infinite;"></i> Authenticating...`;

    try {
        const response = await fetch(`${API_URL}/userLogin?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);

        if (!response.ok) throw new Error('Login request failed');

        const loginData = await response.json();

        if (loginData.success) {
            currentUser = { username: username, id: loginData.id, isAdmin: false };
            localStorage.setItem('ticketFlowUser', JSON.stringify(currentUser));
            showDashboard();
        } else {
            throw new Error('Invalid username or password');
        }
    } catch (error) {
        showMessage(loginMsg, error.message, true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<span>Sign In</span><i class="ri-arrow-right-line"></i>`;
    }
});

// 2.5 Admin Login
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('admin-login-username').value;
    const password = document.getElementById('admin-login-password').value;
    const btn = document.getElementById('admin-login-btn');

    btn.disabled = true;
    btn.innerHTML = `<i class="ri-loader-4-line spin" style="animation: spin 1s linear infinite;"></i> Authenticating...`;

    try {
        const response = await fetch(`${API_URL}/adminLogin?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);

        if (!response.ok) throw new Error('Login request failed');

        const loginData = await response.json();

        if (loginData.success) {
            currentUser = {
                username: username,
                id: loginData.id,
                isAdmin: true,
                departmentId: loginData.department_id,
                isSuperAdmin: loginData.is_super_admin
            };
            localStorage.setItem('ticketFlowUser', JSON.stringify(currentUser));
            showDashboard();
        } else {
            throw new Error('Invalid Admin credentials');
        }
    } catch (error) {
        showMessage(adminLoginMsg, error.message, true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<span>Secure Login</span><i class="ri-arrow-right-circle-line"></i>`;
    }
});

// 3. Load Tickets
async function loadTickets() {
    if (!currentUser) return;

    ticketsList.innerHTML = `<div class="empty-state"><i class="ri-loader-4-line spin" style="animation: spin 1s linear infinite;"></i><p>Loading your tickets...</p></div>`;

    try {
        const response = await fetch(`${API_URL}/viewTickets?id=${currentUser.id}`);
        if (!response.ok) throw new Error('Failed to fetch tickets');

        const tickets = await response.json();

        if (!tickets || tickets.length === 0) {
            ticketsList.innerHTML = `
                <div class="empty-state">
                    <i class="ri-inbox-2-line"></i>
                    <p>No tickets found. Raise a new one!</p>
                </div>`;
            totalTicketsEl.textContent = '0';
            return;
        }

        totalTicketsEl.textContent = tickets.length.toString();
        ticketsList.innerHTML = '';

        tickets.forEach((ticket, index) => {
            const card = document.createElement('div');
            card.className = 'ticket-item glass-card';
            card.innerHTML = `
                <div class="ticket-header">
                    <span class="ticket-id">Dept: ${ticket.department_id}</span>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <span class="status-badge" style="background: rgba(255,165,0,0.1); color: #ffa500; border: 1px solid rgba(255,165,0,0.3); text-transform:uppercase;">${ticket.priority}</span>
                        <span class="status-badge ${ticket.status.toLowerCase().replace(' ', '_')}">${ticket.status}</span>
                    </div>
                </div>
                <div class="ticket-desc">${ticket.description}</div>
                <div class="ticket-footer">
                    <button class="view-replies-btn" onclick="viewReplies(${ticket.id || index})">
                        <i class="ri-chat-3-line"></i> View Replies
                    </button>
                </div>
            `;
            ticketsList.appendChild(card);
        });

    } catch (error) {
        ticketsList.innerHTML = `<div class="empty-state"><i class="ri-error-warning-line" style="color:#ef4444"></i><p>Error loading tickets</p></div>`;
        console.error(error);
    }
}

// 4. Raise Ticket
raiseTicketForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const deptId = parseInt(document.getElementById('ticket-dept').value);
    const desc = document.getElementById('ticket-desc').value;
    const priority = document.getElementById('ticket-priority').value;
    const btn = document.getElementById('submit-ticket-btn');

    btn.disabled = true;
    btn.innerHTML = `<i class="ri-loader-4-line spin" style="animation: spin 1s linear infinite;"></i> Submitting...`;

    try {
        const response = await fetch(`${API_URL}/raiseTicket?id=${currentUser.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ department_id: deptId, description: desc, priority: priority })
        });

        if (!response.ok) throw new Error('Failed to submit ticket');

        showMessage(ticketMsg, 'Ticket submitted successfully!');
        raiseTicketForm.reset();

        // Auto navigate back to view
        setTimeout(() => {
            switchDashboardView('view-tickets-section');
            loadTickets();
        }, 1500);

    } catch (error) {
        showMessage(ticketMsg, error.message, true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<span>Submit Request</span><i class="ri-send-plane-fill"></i>`;
    }
});

// 5. View Replies
window.viewReplies = async function (ticketId) {
    if (!currentUser) return;

    repliesModal.classList.add('active');
    repliesList.innerHTML = `<div style="text-align:center; padding: 20px;"><i class="ri-loader-4-line spin" style="animation: spin 1s linear infinite; font-size:24px;"></i></div>`;

    try {
        const response = await fetch(`${API_URL}/viewReplies?ticket_id=${ticketId}`);
        if (!response.ok) throw new Error('Failed to load replies');

        const replies = await response.json();

        if (!replies || replies.length === 0) {
            repliesList.innerHTML = `<p style="text-align:center; color: #94a3b8; padding: 20px;">No replies for this ticket yet.</p>`;
            return;
        }

        repliesList.innerHTML = '';
        replies.forEach(reply => {
            const div = document.createElement('div');
            div.className = 'reply-item';
            div.innerHTML = `<p>${reply.comment}</p>`;
            repliesList.appendChild(div);
        });

    } catch (error) {
        repliesList.innerHTML = `<p style="text-align:center; color: #ef4444; padding: 20px;">Error loading replies.</p>`;
        console.error(error);
    }
};

// 6. Admin: Load All Tickets
async function loadAllTicketsAdmin() {
    if (!currentUser || !currentUser.isAdmin) return;

    adminTicketsList.innerHTML = `<div class="empty-state"><i class="ri-loader-4-line spin" style="animation: spin 1s linear infinite;"></i><p>Loading global ticket feed...</p></div>`;

    try {
        const sortBy = document.getElementById('admin-sort-by') ? document.getElementById('admin-sort-by').value : '';
        const usernameSearch = document.getElementById('admin-search-user') ? document.getElementById('admin-search-user').value : '';
        
        console.log("Loading tickets with filters:", { sortBy, usernameSearch });

        const queryParams = new URLSearchParams({
            is_super_admin: currentUser.isSuperAdmin,
            department_id: currentUser.departmentId || '',
            sort_by: sortBy,
            username: usernameSearch
        });

        const response = await fetch(`${API_URL}/viewAllTickets?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch global tickets');

        const tickets = await response.json();

        if (!tickets || tickets.length === 0) {
            adminTicketsList.innerHTML = `
                <div class="empty-state">
                    <i class="ri-inbox-2-line"></i>
                    <p>No tickets found matching your criteria.</p>
                </div>`;
            adminTotalTicketsEl.textContent = '0';
            return;
        }

        adminTotalTicketsEl.textContent = tickets.length.toString();
        adminTicketsList.innerHTML = '';

        tickets.forEach((ticket, index) => {
            const card = document.createElement('div');
            card.className = 'ticket-item glass-card';
            card.style.borderLeft = '3px solid #ec4899';
            card.innerHTML = `
                <div class="ticket-header">
                    <div style="display:flex; gap:10px; align-items:center;">
                        <span class="status-badge" style="background: rgba(255,165,0,0.1); color: #ffa500; border: 1px solid rgba(255,165,0,0.3); text-transform:uppercase;">${ticket.priority}</span>
                        <span class="status-badge ${ticket.status.toLowerCase().replace(' ', '_')}">${ticket.status}</span>
                        <select onchange="window.updateStatus(${ticket.id}, this.value)" style="padding: 2px 5px; border-radius: 4px; border: 1px solid rgba(236, 72, 153, 0.5); background: transparent; color: inherit; font-size: 0.8rem; outline:none; text-transform:uppercase; font-weight:bold; cursor:pointer;">
                            <option style="color: black;" value="Open" ${ticket.status === 'Open' ? 'selected' : ''}>Open</option>
                            <option style="color: black;" value="In Progress" ${ticket.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option style="color: black;" value="Resolved" ${ticket.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        </select>
                    </div>
                </div>
                <div class="ticket-desc" style="margin-top: 10px;">${ticket.description}</div>
                <div class="ticket-footer" style="justify-content: space-between;">
                    <span class="ticket-id" style="font-size: 0.75rem;"><i class="ri-user-line"></i> User: ${ticket.username}</span>
                    <div style="display:flex; gap:10px;">
                        <button class="view-replies-btn" onclick="viewReplies(${ticket.id})">
                            <i class="ri-chat-3-line"></i> View Replies
                        </button>
                        <button class="view-replies-btn" onclick="replyToTicket(${ticket.id})" style="color: #ec4899; border-color: #ec4899;">
                            <i class="ri-reply-fill"></i> Add Reply
                        </button>
                    </div>
                </div>
            `;
            adminTicketsList.appendChild(card);
        });

    } catch (error) {
        adminTicketsList.innerHTML = `<div class="empty-state"><i class="ri-error-warning-line" style="color:#ef4444"></i><p>Error loading global tickets</p></div>`;
        console.error(error);
    }
}

// 7. Admin: Reply to Ticket UI
const adminReplyModal = document.getElementById('admin-reply-modal');
const closeAdminModalBtn = document.querySelector('.close-admin-modal');
const adminSubmitReplyForm = document.getElementById('admin-submit-reply-form');
const adminReplyMsg = document.getElementById('admin-reply-msg');

window.replyToTicket = function (ticketId) {
    document.getElementById('admin-reply-ticket-id').value = ticketId;
    document.getElementById('admin-reply-text').value = '';
    adminReplyMsg.style.display = 'none';
    adminReplyModal.classList.add('active');
};

if (closeAdminModalBtn) {
    closeAdminModalBtn.addEventListener('click', () => {
        adminReplyModal.classList.remove('active');
    });
}

window.addEventListener('click', (e) => {
    if (e.target === adminReplyModal) {
        adminReplyModal.classList.remove('active');
    }
});

// 8. Admin: Submit Reply API Call
adminSubmitReplyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.isAdmin) return;

    const ticketId = parseInt(document.getElementById('admin-reply-ticket-id').value);
    const comment = document.getElementById('admin-reply-text').value;
    const btn = document.getElementById('admin-submit-reply-btn');

    btn.disabled = true;
    btn.innerHTML = `<i class="ri-loader-4-line spin" style="animation: spin 1s linear infinite;"></i> Sending...`;

    try {
        const response = await fetch(`${API_URL}/createReply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_id: ticketId, comment: comment })
        });

        if (!response.ok) throw new Error('Failed to post reply');

        showMessage(adminReplyMsg, 'Reply posted successfully!');

        setTimeout(() => {
            adminReplyModal.classList.remove('active');
        }, 1500);

    } catch (error) {
        showMessage(adminReplyMsg, error.message, true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<span>Post Reply</span><i class="ri-send-plane-fill"></i>`;
    }
});

// 9. Admin: Update Ticket Status
window.updateStatus = async function (ticketId, newStatus) {
    if (!currentUser || !currentUser.isAdmin) return;

    try {
        const response = await fetch(`${API_URL}/updateTicketStatus`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_id: ticketId, status: newStatus })
        });

        if (!response.ok) throw new Error('Failed to update status');
        loadAllTicketsAdmin(); // Reload feed to show colors 
    } catch (error) {
        console.error("Error updating status:", error);
        alert("Failed to update status. Please try again.");
    }
};

// Add a simple spin animation style
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .spin {
        display: inline-block;
    }
`;
document.head.appendChild(style);

// Add listener to the Admin Sort By Select
const adminSortSelect = document.getElementById('admin-sort-by');
if (adminSortSelect) {
    adminSortSelect.addEventListener('change', () => {
        loadAllTicketsAdmin();
    });
}

