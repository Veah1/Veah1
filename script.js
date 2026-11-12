const SUPABASE_URL = 'https://ewusvjnpttqwjtdlrgtz.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_ETEFERlUS6cfvsmfWjSPsg_K-GeTt6y '; 

let supabase = null;

// Only initialize if window.supabase exists and user replaced the placeholder keys
if (window.supabase && SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE') {
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.warn('Supabase initialization error:', err);
  }
}

// Run initial checks when page loads
window.addEventListener('DOMContentLoaded', () => {
  if (supabase) {
    fetchRequests();
    checkUserSession();
  } else {
    console.log('Running in local demo mode (Supabase not configured yet).');
  }
});

// 2. Tab Switching Function
function switchTab(tabId, btnId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  const selectedTab = document.getElementById(tabId);
  const selectedBtn = document.getElementById(btnId);

  if (selectedTab) selectedTab.classList.add('active');
  if (selectedBtn) {
    selectedBtn.classList.add('active');
    selectedBtn.setAttribute('aria-selected', 'true');
  }
}

// 3. Form Submission Handler (Public Outreach & Shelter Portals)
async function handleFormSubmit(event, type, alertId) {
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

  if (supabase) {
    const { error } = await supabase.from('requests').insert([
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
      console.error('Error inserting data:', error);
      alert('There was an error saving to Supabase: ' + error.message);
      return;
    }
    fetchRequests();
  } else {
    // Fallback local UI update if Supabase isn't hooked up yet
    addLocalTrackerCard(reqId, type, locationOrFacility, 'Pending Review', details);
  }

  if (alertBox) alertBox.style.display = 'block';
  event.target.reset();

  setTimeout(() => {
    if (alertBox) alertBox.style.display = 'none';
  }, 4000);
}

// 4. Fetch Requests from Supabase
async function fetchRequests() {
  if (!supabase) return;

  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching requests:', error);
    return;
  }

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

// Fallback card appender if offline or unconfigured
function addLocalTrackerCard(reqId, type, locationOrFacility, status, details) {
  const trackerList = document.getElementById('tracker-list');
  if (!trackerList) return;

  const newCard = document.createElement('div');
  newCard.className = 'status-card';
  newCard.innerHTML = `
    <div class="status-header">
      <span class="status-id">${reqId}</span>
      <span class="badge badge-pending">${status}</span>
    </div>
    <strong class="card-title">${type}</strong>
    <p class="card-sub">Location/Facility: ${locationOrFacility}</p>
    <p class="card-meta"><em>Details: ${details}</em></p>
  `;
  trackerList.prepend(newCard);
}

// 5. Supabase Sign Up Authentication
async function handleSignUp(event) {
  event.preventDefault();
  if (!supabase) {
    alert('Please configure your Supabase URL and Anon Key in script.js first.');
    return;
  }

  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const alertBox = document.getElementById('signup-alert');

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert('Sign up error: ' + error.message);
    return;
  }

  if (alertBox) alertBox.style.display = 'block';
  event.target.reset();

  setTimeout(() => {
    if (alertBox) alertBox.style.display = 'none';
  }, 4000);
}

// 6. Supabase Log In Authentication
async function handleLogin(event) {
  event.preventDefault();
  if (!supabase) {
    alert('Please configure your Supabase URL and Anon Key in script.js first.');
    return;
  }

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const alertBox = document.getElementById('login-alert');

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert('Log in error: ' + error.message);
    return;
  }

  if (alertBox) alertBox.style.display = 'block';
  checkUserSession();

  setTimeout(() => {
    if (alertBox) alertBox.style.display = 'none';
  }, 3000);
}

// 7. Supabase Log Out
async function handleLogout() {
  if (!supabase) return;
  await supabase.auth.signOut();
  checkUserSession();
}

// 8. Check Active Session UI Toggle
async function checkUserSession() {
  if (!supabase) return;

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Session error:', error);
    return;
  }

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
