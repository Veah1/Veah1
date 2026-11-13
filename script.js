const SUPABASE_URL = 'https://ewusvjnpttqwjtdlrgtz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ETEFERlUS6cfvsmfWjSPsg_K-GeTt6y'; 
let dbClient = null;

if (window.supabase && SUPABASE_URL && SUPABASE_URL !== 'YOUR_MAIN_SUPABASE_URL_HERE') {
  try {
    dbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.warn('Supabase initialization error:', err);
  }
}
window.addEventListener('DOMContentLoaded', () => {
  if (dbClient) {
    fetchRequests();
    checkUserSession();
  }
});

window.handleFormSubmit = async function(event, type, alertId) {
  event.preventDefault();

  const alertBox = document.getElementById(alertId);
  const reqId = 'REQ-' + Math.floor(1000 + Math.random() * 9000);
  
  let category, details, locationOrFacility;
  if (type === 'Public Outreach Request') {
    locationOrFacility = document.getElementById('location').value;
    category = document.getElementById('primary-need').value;
    details = document.getElementById('description').value;
  } else {
    locationOrFacility = document.getElementById('shelter-name').value + ' (' + document.getElementById('staff-role').value + ')';
    category = document.getElementById('request-type').value;
    details = document.getElementById('details').value;
  }

  if (dbClient) {
    const { error } = await dbClient.from('requests').insert([
      {
        request_id: reqId,
        request_type: type,
        category: category,
        details: details,
        location_or_facility: locationOrFacility,
        status: 'Pending Review'
      }
    ]);

    if (error) {
      alert('Error saving to Supabase: ' + error.message);
      return;
    }
  }

  if (alertBox) alertBox.style.display = 'block';
  event.target.reset();

  setTimeout(() => {
    if (alertBox) alertBox.style.display = 'none';
  }, 4000);
};

// Fetch Requests for Status Tracker
async function fetchRequests() {
  if (!dbClient) return;

  const { data, error } = await dbClient
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return;

  const trackerList = document.getElementById('tracker-list');
  if (!trackerList) return;
  
  trackerList.innerHTML = '';

  data.forEach(req => {
    let badgeClass = 'badge-pending';
    if (req.status === 'In Progress') badgeClass = 'badge-in-progress';
    if (req.status === 'Completed') badgeClass = 'badge-completed';

    const newCard = document.createElement('div');
    newCard.className = 'status-card';
    newCard.innerHTML = `
      <div class="status-header">
        <span class="status-id">${req.request_id}</span>
        <span class="badge ${badgeClass}">${req.status}</span>
      </div>
      <strong class="card-title">${req.request_type} (${req.category})</strong>
      <p class="card-sub">Location/Facility: ${req.location_or_facility}</p>
      <p class="card-meta"><em>Details: ${req.details}</em></p>
    `;
    trackerList.appendChild(newCard);
  });
}

// Authentication Handlers
window.handleSignUp = async function(event) {
  event.preventDefault();
  if (!dbClient) {
    alert('Supabase is not configured.');
    return;
  }

  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const alertBox = document.getElementById('signup-alert');

  const { error } = await dbClient.auth.signUp({ email, password });
  if (error) {
    alert('Sign up error: ' + error.message);
    return;
  }

  if (alertBox) alertBox.style.display = 'block';
  event.target.reset();
};

window.handleLogin = async function(event) {
  event.preventDefault();
  if (!dbClient) {
    alert('Supabase is not configured.');
    return;
  }

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const alertBox = document.getElementById('login-alert');

  const { error } = await dbClient.auth.signInWithPassword({ email, password });
  if (error) {
    alert('Log in error: ' + error.message);
    return;
  }

  if (alertBox) alertBox.style.display = 'block';
  checkUserSession();
};

window.handleLogout = async function() {
  if (!dbClient) return;
  await dbClient.auth.signOut();
  checkUserSession();
};

async function checkUserSession() {
  if (!dbClient) return;

  const { data: { session } } = await dbClient.auth.getSession();
  const formsContainer = document.getElementById('auth-forms-container');
  const userProfile = document.getElementById('user-profile');
  const emailDisplay = document.getElementById('user-email-display');

  if (session) {
    if (formsContainer) formsContainer.style.display = 'none';
    if (userProfile) userProfile.style.display = 'block';
    if (emailDisplay) emailDisplay.textContent = session.user.email;
  } else {
    if (formsContainer) formsContainer.style.display = 'block';
    if (userProfile) userProfile.style.display = 'none';
  }
}
