(function () {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');

  const promptInput = document.getElementById('prompt-input');
  const sendBtn = document.getElementById('send-btn');
  const linkResult = document.getElementById('link-result');
  const generatedLink = document.getElementById('generated-link');
  const copyBtn = document.getElementById('copy-btn');
  const previewBtn = document.getElementById('preview-btn');
  const fakeCursor = document.getElementById('fake-cursor');
  const chatMessages = document.getElementById('chat-messages');
  const messageArea = document.getElementById('message-area');
  const snarkyMessage = document.getElementById('snarky-message');
  const stepInstructions = document.getElementById('step-instructions');
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const inputWrapper = document.querySelector('.input-wrapper');
  const tagline = document.getElementById('tagline');

  // Auto-resize textarea
  promptInput.addEventListener('input', () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = promptInput.scrollHeight + 'px';
  });

  if (query) {
    startAnimationMode(query);
  } else {
    startGeneratorMode();
  }

  function startGeneratorMode() {
    promptInput.disabled = false;
    promptInput.focus();

    // Generate link on send button click
    sendBtn.addEventListener('click', generateLink);

    // Generate link on Enter (without Shift)
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateLink();
      }
    });

    copyBtn.addEventListener('click', copyLink);
    previewBtn.addEventListener('click', previewAnimation);
  }

  function generateLink() {
    const text = promptInput.value.trim();
    if (!text) return;

    const url = window.location.origin + window.location.pathname + '?q=' + encodeURIComponent(text);
    generatedLink.value = url;
    linkResult.classList.remove('hidden');
    generatedLink.select();
  }

  function copyLink() {
    navigator.clipboard.writeText(generatedLink.value).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    });
  }

  function previewAnimation() {
    window.location.href = generatedLink.value;
  }

  // --- Animation Mode ---

  function startAnimationMode(text) {
    // Disable input and hide generator UI
    promptInput.disabled = true;
    promptInput.value = '';
    tagline.style.display = 'none';
    document.body.classList.add('animating');

    // Show message area with step 1 highlighted
    messageArea.classList.remove('hidden');
    step1.classList.add('active');

    // Show fake cursor at center of screen
    fakeCursor.classList.remove('hidden');
    fakeCursor.style.top = '50%';
    fakeCursor.style.left = '50%';

    const timeline = [
      { delay: 1500, action: moveCursorToInput },
      { delay: 1500, action: clickInput },
      { delay: 600, action: () => typeText(text) },
      // typeText will call the rest when done
    ];

    runTimeline(timeline);
  }

  function runTimeline(steps, index) {
    index = index || 0;
    if (index >= steps.length) return;
    const step = steps[index];
    setTimeout(() => {
      step.action();
      runTimeline(steps, index + 1);
    }, step.delay);
  }

  function moveCursorToInput() {
    const rect = promptInput.getBoundingClientRect();
    fakeCursor.style.top = (rect.top + rect.height / 2) + 'px';
    fakeCursor.style.left = (rect.left + 40) + 'px';
  }

  function clickInput() {
    inputWrapper.classList.add('focused');
  }

  function typeText(text) {
    let i = 0;
    const speed = Math.max(50, Math.min(90, 3500 / text.length)); // Adaptive speed

    function typeChar() {
      if (i < text.length) {
        promptInput.value += text[i];
        // Auto-resize
        promptInput.style.height = 'auto';
        promptInput.style.height = promptInput.scrollHeight + 'px';
        i++;
        setTimeout(typeChar, speed);
      } else {
        // Typing done — move cursor to send button
        setTimeout(afterTyping, 1000);
      }
    }

    typeChar();
  }

  function afterTyping() {
    // Switch to step 2
    step1.classList.remove('active');
    step2.classList.add('active');

    // Move cursor to send button
    const btnRect = sendBtn.getBoundingClientRect();
    fakeCursor.style.top = (btnRect.top + btnRect.height / 2) + 'px';
    fakeCursor.style.left = (btnRect.left + btnRect.width / 2) + 'px';

    setTimeout(() => {
      // Click animation on button
      sendBtn.classList.add('clicked');
      setTimeout(() => sendBtn.classList.remove('clicked'), 200);

      // Show user message bubble
      setTimeout(showUserMessage, 500);
    }, 1200);
  }

  function showUserMessage() {
    const query = promptInput.value;

    // Clear input
    promptInput.value = '';
    promptInput.style.height = 'auto';
    inputWrapper.classList.remove('focused');

    // Add message bubble
    const msgEl = document.createElement('div');
    msgEl.className = 'user-message';
    msgEl.textContent = query;
    chatMessages.appendChild(msgEl);

    // Hide cursor, fade out steps, fade in snarky message
    fakeCursor.classList.add('hidden');
    document.body.classList.remove('animating');
    stepInstructions.classList.add('fade-out');

    // Show snarky message after steps fade out
    setTimeout(() => {
      snarkyMessage.classList.add('visible');
    }, 800);

    // Redirect to Claude
    setTimeout(() => {
      window.location.href = 'https://claude.ai/new?q=' + encodeURIComponent(query);
    }, 2800);
  }
})();
