// ========================================================
// LIVE VISUAL WYSIWYG TEXT EDITOR WITH CODE SAVE & GIT SYNC
// (Restricted to localhost & ?edit only)
// ========================================================
(function () {
  const isAuth = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.search.includes('edit'));
  if (!isAuth) return;

  let isEditMode = false;
  let allFlipped = false;

  // Create & inject editor dock
  const dock = document.createElement('div');
  dock.id = 'editor-dock';
  dock.innerHTML = `
    <button id="toggle-edit-mode-btn" class="text-xs font-semibold px-3 py-1.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 hover:bg-pink-500/30 transition-all flex items-center gap-1.5 cursor-pointer">
      <span>✏️</span>
      <span id="edit-mode-label">Edit Text: OFF</span>
    </button>
    <button id="flip-cards-editor-btn" class="hidden text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer" title="Flip affirmation cards to edit both front and back">
      <span>🔄</span>
      <span id="flip-cards-label">Flip Cards</span>
    </button>
    <button id="toggle-modals-editor-btn" class="hidden text-xs font-semibold px-3 py-1.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-all flex items-center gap-1.5 cursor-pointer" title="Preview and edit popup modals">
      <span>💬</span>
      <span id="modals-editor-label">Edit Popups</span>
    </button>
    <button id="save-content-btn" class="hidden text-xs font-semibold px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500 via-pink-500 to-rose-500 hover:from-sky-400 hover:to-rose-400 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
      <span>💾</span>
      <span id="save-btn-label">Save to Code</span>
    </button>
    <span id="editor-status" class="text-[11px] text-pink-200 font-mono hidden sm:inline"></span>
  `;
  document.body.appendChild(dock);

  const toggleBtn = document.getElementById('toggle-edit-mode-btn');
  const flipBtn = document.getElementById('flip-cards-editor-btn');
  const modalsBtn = document.getElementById('toggle-modals-editor-btn');
  const saveBtn = document.getElementById('save-content-btn');
  const modeLabel = document.getElementById('edit-mode-label');
  const saveLabel = document.getElementById('save-btn-label');
  const statusText = document.getElementById('editor-status');

  function showStatus(msg, isSuccess = true) {
    if (!statusText) return;
    statusText.textContent = msg;
    statusText.className = `text-[11px] font-mono hidden sm:inline ${isSuccess ? 'text-pink-300' : 'text-rose-400'}`;
  }

  // Universal text collector: finds ALL elements bearing visible text
  function collectAllTextElements() {
    const all = document.body.querySelectorAll('*');
    const eligible = [];

    all.forEach(el => {
      if (el.closest('#editor-dock') || ['SCRIPT', 'STYLE', 'VIDEO', 'AUDIO', 'CANVAS', 'SOURCE', 'BR', 'HR', 'HEAD', 'META', 'LINK'].includes(el.tagName)) {
        return;
      }

      let hasText = false;
      for (let node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
          hasText = true;
          break;
        }
      }

      if (hasText || ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'EM', 'STRONG', 'B', 'I', 'BUTTON', 'A', 'BLOCKQUOTE', 'LI', 'LABEL', 'DIV'].includes(el.tagName)) {
        if (el.textContent.trim().length > 0) {
          eligible.push(el);
        }
      }
    });

    return Array.from(new Set(eligible));
  }

  function applyEditable() {
    const elements = collectAllTextElements();
    elements.forEach(el => {
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('data-editable', 'true');
      el.setAttribute('spellcheck', 'false');
    });
  }

  function removeEditable() {
    const elements = document.querySelectorAll('[data-editable="true"], [contenteditable="true"]');
    elements.forEach(el => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-editable');
      el.removeAttribute('spellcheck');
    });
  }

  function handleCaptureEvent(e) {
    if (!isEditMode) return;
    const target = e.target;
    if (target.closest('#editor-dock')) return;

    if (target.tagName === 'A' || target.closest('a')) {
      e.preventDefault();
    }

    if (target.closest('button:not(#editor-dock button)') || target.closest('#runaway-no-btn') || target.closest('.interactive-tag') || target.closest('.flip-card-container')) {
      e.stopPropagation();
    }
  }

  function handleCaptureMouseover(e) {
    if (!isEditMode) return;
    const target = e.target;
    if (target.closest('#runaway-no-btn')) {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }

  let activeModalIndex = -1;
  const modalIds = ['confirmation-modal', 'celebration-modal', 'polaroid-lightbox'];

  function toggleModalsPreview() {
    if (activeModalIndex >= 0 && activeModalIndex < modalIds.length) {
      const prevModal = document.getElementById(modalIds[activeModalIndex]);
      if (prevModal) prevModal.classList.add('hidden');
    }

    activeModalIndex = (activeModalIndex + 1);
    if (activeModalIndex >= modalIds.length) {
      activeModalIndex = -1;
      showStatus('Popups closed. Editing main page.');
      return;
    }

    const modal = document.getElementById(modalIds[activeModalIndex]);
    if (modal) {
      modal.classList.remove('hidden');
      applyEditable();
      showStatus(`Editing ${modalIds[activeModalIndex].replace('-modal', '')} popup 💬`);
    }
  }

  function toggleFlipAllCards() {
    allFlipped = !allFlipped;
    const inners = document.querySelectorAll('.flip-card-inner');
    inners.forEach(inner => {
      if (allFlipped) {
        inner.classList.add('flipped');
      } else {
        inner.classList.remove('flipped');
      }
    });
    applyEditable();
    showStatus(allFlipped ? 'Now editing Card BACKS 🔄' : 'Now editing Card FRONTS 🔄');
  }

  function toggleEditMode() {
    isEditMode = !isEditMode;

    if (isEditMode) {
      document.body.classList.add('edit-mode-active');
      toggleBtn.classList.replace('bg-pink-500/20', 'bg-amber-500/30');
      toggleBtn.classList.replace('text-pink-300', 'text-amber-300');
      toggleBtn.classList.replace('border-pink-500/40', 'border-amber-500/50');
      modeLabel.textContent = 'Edit Text: ON';
      flipBtn.classList.remove('hidden');
      modalsBtn.classList.remove('hidden');
      saveBtn.classList.remove('hidden');
      showStatus('Click ANY text on screen to edit ✍️');

      applyEditable();

      window.addEventListener('click', handleCaptureEvent, true);
      window.addEventListener('mouseover', handleCaptureMouseover, true);
      window.addEventListener('mouseenter', handleCaptureMouseover, true);

    } else {
      document.body.classList.remove('edit-mode-active');
      toggleBtn.classList.replace('bg-amber-500/30', 'bg-pink-500/20');
      toggleBtn.classList.replace('text-amber-300', 'text-pink-300');
      toggleBtn.classList.replace('border-amber-500/50', 'border-pink-500/40');
      modeLabel.textContent = 'Edit Text: OFF';
      flipBtn.classList.add('hidden');
      modalsBtn.classList.add('hidden');
      saveBtn.classList.add('hidden');
      showStatus('');

      modalIds.forEach(id => {
        const m = document.getElementById(id);
        if (m) m.classList.add('hidden');
      });

      removeEditable();

      window.removeEventListener('click', handleCaptureEvent, true);
      window.removeEventListener('mouseover', handleCaptureMouseover, true);
      window.removeEventListener('mouseenter', handleCaptureMouseover, true);
    }
  }

  async function saveToCode() {
    if (!saveBtn) return;
    saveBtn.disabled = true;
    saveLabel.textContent = 'Saving... ⏳';
    showStatus('Writing to index.html & pushing to GitHub...');

    // Close any modal overlay before cloning
    modalIds.forEach(id => {
      const m = document.getElementById(id);
      if (m) m.classList.add('hidden');
    });

    const inners = document.querySelectorAll('.flip-card-inner');
    inners.forEach(inner => inner.classList.remove('flipped'));

    removeEditable();
    document.body.classList.remove('edit-mode-active');

    // Clone clean document
    const clone = document.documentElement.cloneNode(true);
    const dockInClone = clone.querySelector('#editor-dock');
    if (dockInClone) dockInClone.remove();

    // Clean runtime states in clone before serializing
    const cloneLines = clone.querySelectorAll('.typewriter-line');
    cloneLines.forEach(line => line.classList.remove('visible'));

    const clonePostBloom = clone.querySelector('#post-bloom-reveal');
    if (clonePostBloom) {
      clonePostBloom.className = 'mt-8 transition-all duration-700 flex flex-col items-center justify-center text-center mx-auto opacity-0 translate-y-6 pointer-events-none';
    }

    const cloneEnvClosed = clone.querySelector('#envelope-closed');
    if (cloneEnvClosed) cloneEnvClosed.classList.remove('hidden');

    const cloneEnvOpen = clone.querySelector('#envelope-open');
    if (cloneEnvOpen) cloneEnvOpen.classList.add('hidden');

    const cloneTreeText = clone.querySelector('#tree-text-overlay');
    if (cloneTreeText) {
      cloneTreeText.classList.add('opacity-0', 'pointer-events-none');
      cloneTreeText.classList.remove('opacity-100');
    }

    const cleanHtml = '<!DOCTYPE html>\n' + clone.outerHTML;

    if (isEditMode) {
      document.body.classList.add('edit-mode-active');
      applyEditable();
    }

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: cleanHtml })
      });

      const result = await response.json();
      saveBtn.disabled = false;

      if (response.ok && result.status === 'success') {
        saveLabel.textContent = 'Saved! ✓';
        showStatus('Saved to index.html & synced with GitHub! 🎉', true);
        setTimeout(() => {
          if (saveLabel) saveLabel.textContent = 'Save to Code';
        }, 2500);

        if (window.confetti) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.9, x: 0.9 },
            colors: ['#38bdf8', '#fb7185', '#fbbf24']
          });
        }
      } else {
        saveLabel.textContent = 'Retry Save';
        showStatus(result.error || 'Failed to save', false);
      }
    } catch (err) {
      saveBtn.disabled = false;
      saveLabel.textContent = 'Retry Save';
      showStatus('Local server error: make sure server.py is running', false);
      console.error('Save error:', err);
    }
  }

  if (toggleBtn) toggleBtn.addEventListener('click', toggleEditMode);
  if (flipBtn) flipBtn.addEventListener('click', toggleFlipAllCards);
  if (modalsBtn) modalsBtn.addEventListener('click', toggleModalsPreview);
  if (saveBtn) saveBtn.addEventListener('click', saveToCode);
})();
