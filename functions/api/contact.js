function handleContactSubmit() {
  const btn = document.getElementById('cf-submit');
  const errMsg = document.getElementById('cf-error');
  const nameEl = document.getElementById('cf-name');
  const emailEl = document.getElementById('cf-email');
  const subjectEl = document.getElementById('cf-subject');
  const messageEl = document.getElementById('cf-message');
  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const subjectLabel = subjectEl.options[subjectEl.selectedIndex]?.text || '';
  const message = messageEl.value.trim();

  errMsg.style.display = 'none';
  if (!name) { showContactError('Please enter your name.'); nameEl.focus(); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showContactError('Please enter a valid email address.'); emailEl.focus(); return; }
  if (!subjectEl.value) { showContactError('Please select a topic.'); subjectEl.focus(); return; }
  if (!message) { showContactError('Please enter a message.'); messageEl.focus(); return; }

  btn.disabled = true;
  btn.textContent = 'Sending…';

  fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, subjectLabel, message }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        document.getElementById('cf-success').style.display = 'block';
        nameEl.value = '';
        emailEl.value = '';
        subjectEl.selectedIndex = 0;
        messageEl.value = '';
      } else {
        showContactError(data.error || 'Something went wrong. Please try again.');
      }
    })
    .catch(() => {
      showContactError('Something went wrong. Please try again.');
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = 'Send Message →';
    });
}Add Resend contact form function
