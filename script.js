// Initialize Supabase Client
const SUPABASE_URL = 'https://ewusvjnpttqwjtdlrgtz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ETEFERlUS6cfvsmfWjSPsg_K-GeTt6y';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch existing requests on page load
window.addEventListener('DOMContentLoaded', fetchRequests);

function switchTab(tabId, btnId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  document.getElementById(tabId).classList.add('active');
  const activeBtn = document.getElementById(btnId);
  activeBtn.classList.add('active');
  activeBtn.setAttribute('aria-selected', 'true');
}

// Handle User Sign Up
async function handleSignUp(event) {
  event.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const role = document.getElementById('user-role').value;
  const alertBox = document.getElementById('auth-alert');

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        account_type: role
      }
    }
  });

  if (error) {
    alertBox.style.display = 'block';
    alertBox.style.backgroundColor =
