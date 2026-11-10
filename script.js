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

function handleFormSubmit(event, type, alertId) {
  event.preventDefault();

  const alertBox = document.getElementById(alertId);
  alertBox.style.display = 'block';

  const reqId = 'REQ-' + Math.floor(1000 + Math.random() * 9000);
  const trackerList = document.getElementById('tracker-list');

  const newCard = document.createElement('div');
  newCard.className = 'status-card';
  newCard.innerHTML = `
    <div class="status-header">
      <span class="status-id">${reqId}</span>
      <span class="badge badge-pending">Pending Review</span>
    </div>
    <strong class="card-title">${type}</strong>
    <p class="card-sub">Status: Submitted just now</p>
    <p class="card-meta"><em>Status Update: Successfully logged into routing network.</em></p>
  `;

  trackerList.prepend(newCard);
  event.target.reset();

  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 4000);
}