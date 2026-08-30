// ========================================================
// LIVE VISUAL WYSIWYG TEXT EDITOR WITH CODE SAVE & GIT SYNC
// ========================================================
(function () {
  let isEditMode = false;
  let editableElements = [];

  // Create & inject editor dock
  const dock = document.createElement('div');
  dock.id = 'editor-dock';
  dock.innerHTML = `
    <button id="toggle-edit-mode-btn" class="text-xs font-semibold px-3 py-1.5 rounded-full bg-lime-500/20 text-lime-300 border border-lime-500/40 hover:bg-lime-500/30 transition-all flex items-center gap-1.5 cursor-pointer">
      <span>✏️</span>
      <span id="edit-mode-label">Edit Text: OFF</span>
    </button>
    <button id="save-content-btn" class="hidden text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
      <span>💾</span>
      <span id="save-btn-label">Save to Code</span>
    </button>
    <span id="editor-status" class="text-[11px] text-stone-300 font-mono hidden sm:inline"></span>
  `;
  document.body.appendChild(dock);

  const toggleBtn = document.getElementById('toggle-edit-mode-btn');
  const saveBtn = document.getElementById('save-content-btn');
  const modeLabel = document.getElementById('edit-mode-label');
  const saveLabel = document.getElementById('save-btn-label');
  const statusText = document.getElementById('editor-status');

  function showStatus(msg, isSuccess = true) {
    if (!statusText) return;
    statusText.textContent = msg;
    statusText.className = `text-[11px] font-mono hidden sm:inline ${isSuccess ? 'text-lime-300' : 'text-rose-400'}`;
  }

  function getEligibleElements() {
    const candidates = document.querySelectorAll('h1, h2, h3, h4, h5, p, span, em, strong, .polaroid-caption, .badge-pill, .interactive-tag, button');
    const filtered = [];
    candidates.forEach(el => {
      // Exclude editor dock and audio elements
      if (el.closest('#editor-dock') || el.closest('script') || el.closest('style') || el.id === 'audio-toggle-btn') {
        return;
      }
      // Check if element has direct text content
      if (el.children.length === 0 && el.textContent.trim().length > 0) {
        filtered.push(el);
      } else if (el.tagName.match(/^H[1-6]|P$/) && el.textContent.trim().length > 0) {
        filtered.push(el);
      }
    });
    return filtered;
  }

  function toggleEditMode() {
    isEditMode = !isEditMode;

    if (isEditMode) {
      document.body.classList.add('edit-mode-active');
      toggleBtn.classList.replace('bg-lime-500/20', 'bg-amber-500/30');
      toggleBtn.classList.replace('text-lime-300', 'text-amber-300');
      toggleBtn.classList.replace('border-lime-500/40', 'border-amber-500/50');
      modeLabel.textContent = 'Edit Text: ON';
      saveBtn.classList.remove('hidden');
      showStatus('Click any text to edit directly ✍️');

      editableElements = getEligibleElements();
      editableElements.forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('data-editable', 'true');
        el.setAttribute('spellcheck', 'false');
      });

      // Prevent link jumps while editing
      document.addEventListener('click', handleInterceptClick, true);

    } else {
      document.body.classList.remove('edit-mode-active');
      toggleBtn.classList.replace('bg-amber-500/30', 'bg-lime-500/20');
      toggleBtn.classList.replace('text-amber-300', 'text-lime-300');
      toggleBtn.classList.replace('border-amber-500/50', 'border-lime-500/40');
      modeLabel.textContent = 'Edit Text: OFF';
      saveBtn.classList.add('hidden');
      showStatus('');

      editableElements.forEach(el => {
        el.removeAttribute('contenteditable');
        el.removeAttribute('data-editable');
      });

      document.removeEventListener('click', handleInterceptClick, true);
    }
  }

  function handleInterceptClick(e) {
    if (!isEditMode) return;
    const target = e.target;
    if (target.closest('#editor-dock')) return;

    if (target.tagName === 'A' || target.closest('a')) {
      e.preventDefault();
    }
  }

  async function saveToCode() {
    if (!saveBtn) return;
    saveBtn.disabled = true;
    saveLabel.textContent = 'Saving... ⏳';
    showStatus('Writing to index.html & pushing to GitHub...');

    // Clean up editable attributes before capturing HTML
    editableElements.forEach(el => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-editable');
      el.removeAttribute('spellcheck');
    });
    document.body.classList.remove('edit-mode-active');

    // Clone clean document
    const clone = document.documentElement.cloneNode(true);
    const dockInClone = clone.querySelector('#editor-dock');
    if (dockInClone) dockInClone.remove();

    const cleanHtml = '<!DOCTYPE html>\n' + clone.outerHTML;

    // Restore edit mode state for user
    if (isEditMode) {
      document.body.classList.add('edit-mode-active');
      editableElements.forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('data-editable', 'true');
      });
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
            colors: ['#84cc16', '#10b981', '#fbbf24']
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
  if (saveBtn) saveBtn.addEventListener('click', saveToCode);
})();
