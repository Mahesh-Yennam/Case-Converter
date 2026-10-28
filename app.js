/**
 * ============================================================================
 * Case Converter, Text Cleaner & Slugifier — Gamility Tools
 * Standalone pure client-side string transformation & typography studio.
 * Copyright © 2026 Gamility (All Rights Reserved)
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Constants & Storage ---
  const STORAGE_KEY_CONTENT = 'gamility_case_draft';

  // --- DOM Elements ---
  const mainTextarea = document.getElementById('main-textarea');
  const editorLineCol = document.getElementById('editor-line-col');
  const caseButtons = document.querySelectorAll('.case-btn');
  const btnCleanMenu = document.getElementById('btn-clean-menu');
  const cleanDropdown = document.getElementById('clean-dropdown');
  const cleanMenuItems = document.querySelectorAll('.menu-item');
  const btnSampleText = document.getElementById('btn-sample-text');
  const btnClearText = document.getElementById('btn-clear-text');

  // Stats Elements
  const statChars = document.getElementById('stat-chars');
  const statCharsNoSpace = document.getElementById('stat-chars-nospace');
  const statWords = document.getElementById('stat-words');
  const statSentences = document.getElementById('stat-sentences');
  const statLines = document.getElementById('stat-lines');

  // Action Buttons
  const btnCopyMain = document.getElementById('btn-copy-main');
  const btnDownloadTxt = document.getElementById('btn-download-txt');

  // Preview Cards
  const cardPreviewTitle = document.getElementById('card-preview-title');
  const cardPreviewCamel = document.getElementById('card-preview-camel');
  const cardPreviewPascal = document.getElementById('card-preview-pascal');
  const cardPreviewSnake = document.getElementById('card-preview-snake');
  const cardPreviewKebab = document.getElementById('card-preview-kebab');
  const cardPreviewConstant = document.getElementById('card-preview-constant');
  const cardPreviewDot = document.getElementById('card-preview-dot');
  const cardPreviewAlternating = document.getElementById('card-preview-alternating');
  const previewCards = document.querySelectorAll('.case-card');

  // Toast Elements
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  let toastTimer = null;
  let autosaveTimer = null;

  // --- Sample Text ---
  const SAMPLE_TEXT = `the quick brown fox jumps over the lazy dog.
this is a great demonstration of GAMILITY's smart text engineering suite!
it supports camelCase, PascalCase, snake_case, and clean-url-slugs.
explore the power of client-side typography tools without sending any data to remote servers.`;

  // --- Minor Words for Title Case (APA / Chicago Style) ---
  const MINOR_WORDS = new Set([
    'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'as', 'at', 
    'by', 'for', 'from', 'in', 'into', 'near', 'of', 'on', 'onto', 
    'to', 'with', 'via', 'vs'
  ]);

  // --- Word Tokenizer Helper ---
  // Splits text into semantic word units, honoring camelCase/PascalCase boundaries, underscores, and hyphens
  function getWords(str) {
    if (!str) return [];
    // Insert space before capital letters in camelCase/PascalCase
    const separated = str
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2');
    
    // Replace non-alphanumeric with spaces, then split
    const tokens = separated
      .replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]+/g, ' ')
      .trim()
      .split(/\s+/);
    
    return tokens.filter(t => t.length > 0);
  }

  // --- Core Case Transformation Functions ---
  const Transformers = {
    upper: (text) => text.toUpperCase(),
    lower: (text) => text.toLowerCase(),
    
    title: (text) => {
      // Line by line title casing
      return text.split('\n').map(line => {
        if (!line.trim()) return line;
        const words = line.split(/\s+/);
        return words.map((word, idx) => {
          const lower = word.toLowerCase();
          const cleanPunct = lower.replace(/^[^\w]+|[^\w]+$/g, '');
          const isFirstOrLast = idx === 0 || idx === words.length - 1;
          
          if (!isFirstOrLast && MINOR_WORDS.has(cleanPunct)) {
            return lower;
          }
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
      }).join('\n');
    },

    sentence: (text) => {
      return text.replace(/(^\s*|[.?!]\s+)(\w)/g, (match, prefix, char) => {
        return prefix + char.toUpperCase();
      });
    },

    camel: (text) => {
      return text.split('\n').map(line => {
        const words = getWords(line);
        if (!words.length) return '';
        return words[0].toLowerCase() + words.slice(1).map(w => {
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        }).join('');
      }).join('\n');
    },

    pascal: (text) => {
      return text.split('\n').map(line => {
        const words = getWords(line);
        return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
      }).join('\n');
    },

    snake: (text) => {
      return text.split('\n').map(line => {
        const words = getWords(line);
        return words.map(w => w.toLowerCase()).join('_');
      }).join('\n');
    },

    kebab: (text) => {
      return text.split('\n').map(line => {
        const words = getWords(line);
        return words.map(w => w.toLowerCase()).join('-');
      }).join('\n');
    },

    constant: (text) => {
      return text.split('\n').map(line => {
        const words = getWords(line);
        return words.map(w => w.toUpperCase()).join('_');
      }).join('\n');
    },

    dot: (text) => {
      return text.split('\n').map(line => {
        const words = getWords(line);
        return words.map(w => w.toLowerCase()).join('.');
      }).join('\n');
    },

    alternating: (text) => {
      let isUpper = false;
      return text.split('').map(ch => {
        if (/[a-zA-Z]/.test(ch)) {
          isUpper = !isUpper;
          return isUpper ? ch.toUpperCase() : ch.toLowerCase();
        }
        return ch;
      }).join('');
    },

    inverse: (text) => {
      return text.split('').map(ch => {
        if (ch === ch.toUpperCase()) return ch.toLowerCase();
        return ch.toUpperCase();
      }).join('');
    }
  };

  // --- Text Cleaners Engine ---
  const Cleaners = {
    trim: (text) => {
      return text.split('\n').map(l => l.trim()).join('\n');
    },

    'normalize-spaces': (text) => {
      return text.split('\n').map(l => l.replace(/[ \t]+/g, ' ')).join('\n');
    },

    'remove-empty-lines': (text) => {
      return text.split('\n').filter(l => l.trim().length > 0).join('\n');
    },

    'remove-duplicate-lines': (text) => {
      const seen = new Set();
      const lines = text.split('\n');
      const unique = [];
      for (const l of lines) {
        if (!seen.has(l)) {
          seen.add(l);
          unique.push(l);
        }
      }
      return unique.join('\n');
    },

    'strip-html': (text) => {
      return text.replace(/<[^>]*>/g, '');
    },

    'sort-az': (text) => {
      return text.split('\n').sort((a, b) => a.localeCompare(b)).join('\n');
    },

    'sort-za': (text) => {
      return text.split('\n').sort((a, b) => b.localeCompare(a)).join('\n');
    },

    'reverse-text': (text) => {
      return text.split('').reverse().join('');
    },

    'reverse-words': (text) => {
      return text.split('\n').map(line => {
        return line.split(/\s+/).reverse().join(' ');
      }).join('\n');
    }
  };

  // --- Document Metrics Calculation ---
  function updateMetrics(text) {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const words = text.trim() ? (text.trim().match(/\S+/g) || []).length : 0;
    const sentences = text.trim() ? (text.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length || (text.trim() ? 1 : 0) : 0;
    const lines = text ? text.split('\n').length : 0;

    statChars.textContent = chars.toLocaleString();
    statCharsNoSpace.textContent = charsNoSpace.toLocaleString();
    statWords.textContent = words.toLocaleString();
    statSentences.textContent = sentences.toLocaleString();
    statLines.textContent = lines.toLocaleString();
  }

  // --- Cursor Line & Column Tracker ---
  function updateCursorPosition() {
    const pos = mainTextarea.selectionStart;
    const val = mainTextarea.value.substring(0, pos);
    const lines = val.split('\n');
    const lineNum = lines.length;
    const colNum = lines[lines.length - 1].length + 1;
    editorLineCol.textContent = `Line ${lineNum}, Col ${colNum}`;
  }

  // --- Update Multi-Case Previews Gallery ---
  function updateGalleryPreviews(text) {
    const snippet = text.trim() ? text.trim().substring(0, 300) : '';

    if (!snippet) {
      const prompt = '<span style="color:var(--text-dim);font-style:italic;">Enter text above to preview...</span>';
      cardPreviewTitle.innerHTML = prompt;
      cardPreviewCamel.innerHTML = prompt;
      cardPreviewPascal.innerHTML = prompt;
      cardPreviewSnake.innerHTML = prompt;
      cardPreviewKebab.innerHTML = prompt;
      cardPreviewConstant.innerHTML = prompt;
      cardPreviewDot.innerHTML = prompt;
      cardPreviewAlternating.innerHTML = prompt;
      return;
    }

    cardPreviewTitle.textContent = Transformers.title(snippet);
    cardPreviewCamel.textContent = Transformers.camel(snippet);
    cardPreviewPascal.textContent = Transformers.pascal(snippet);
    cardPreviewSnake.textContent = Transformers.snake(snippet);
    cardPreviewKebab.textContent = Transformers.kebab(snippet);
    cardPreviewConstant.textContent = Transformers.constant(snippet);
    cardPreviewDot.textContent = Transformers.dot(snippet);
    cardPreviewAlternating.textContent = Transformers.alternating(snippet);
  }

  // --- Main Update Trigger ---
  function handleTextChange() {
    const val = mainTextarea.value;
    updateMetrics(val);
    updateGalleryPreviews(val);
    updateCursorPosition();
    scheduleAutosave();
  }

  // --- Autosave ---
  function scheduleAutosave() {
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_CONTENT, mainTextarea.value);
      } catch (e) {}
    }, 400);
  }

  // --- Toast Notification ---
  function showToast(msg) {
    toastMessage.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.left = '-9999px';
    document.body.appendChild(temp);
    temp.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (err) {
      showToast('Copy failed. Please copy manually.');
    }
    document.body.removeChild(temp);
  }

  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}!`);
  }

  // --- Event Listeners Setup ---
  function initEvents() {
    // Textarea input & cursor
    mainTextarea.addEventListener('input', handleTextChange);
    mainTextarea.addEventListener('click', updateCursorPosition);
    mainTextarea.addEventListener('keyup', updateCursorPosition);

    // Case Transformation Buttons
    caseButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (Transformers[action]) {
          const original = mainTextarea.value;
          if (!original) {
            showToast('Editor is empty.');
            return;
          }
          mainTextarea.value = Transformers[action](original);
          handleTextChange();
          showToast(`Converted to ${btn.textContent}!`);
        }
      });
    });

    // Cleaning Dropdown Menu Toggle
    btnCleanMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      cleanDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      cleanDropdown.classList.add('hidden');
    });

    // Cleaner Menu Items
    cleanMenuItems.forEach(item => {
      item.addEventListener('click', () => {
        const cleanType = item.dataset.clean;
        if (Cleaners[cleanType]) {
          const original = mainTextarea.value;
          if (!original) {
            showToast('Editor is empty.');
            return;
          }
          mainTextarea.value = Cleaners[cleanType](original);
          handleTextChange();
          showToast(`Applied: ${item.textContent}`);
        }
      });
    });

    // Sample Text
    btnSampleText.addEventListener('click', () => {
      mainTextarea.value = SAMPLE_TEXT;
      handleTextChange();
      showToast('Loaded sample text!');
    });

    // Clear Text
    btnClearText.addEventListener('click', () => {
      if (!mainTextarea.value.trim() || confirm('Clear the text editor?')) {
        mainTextarea.value = '';
        handleTextChange();
        showToast('Text cleared.');
      }
    });

    // Copy Main
    btnCopyMain.addEventListener('click', () => {
      if (!mainTextarea.value) {
        showToast('Nothing to copy.');
        return;
      }
      copyToClipboard(mainTextarea.value, 'Text copied to clipboard!');
    });

    // Download .txt
    btnDownloadTxt.addEventListener('click', () => {
      if (!mainTextarea.value) {
        showToast('Nothing to download.');
        return;
      }
      downloadTextFile('converted-text.txt', mainTextarea.value);
    });

    // Preview Cards Copy Buttons
    previewCards.forEach(card => {
      const copyBtn = card.querySelector('.mini-copy-btn');
      const body = card.querySelector('.case-card-body');
      const caseType = card.dataset.cardCase;

      if (copyBtn && body) {
        copyBtn.addEventListener('click', () => {
          const fullText = mainTextarea.value;
          if (!fullText.trim()) {
            showToast('Editor is empty.');
            return;
          }
          // Transform full text for copying
          const converted = Transformers[caseType] ? Transformers[caseType](fullText) : body.textContent;
          copyToClipboard(converted, `Copied ${card.querySelector('.case-card-label').textContent}!`);
        });
      }
    });
  }

  // --- Bootstrap ---
  function initApp() {
    initEvents();

    // Restore saved draft or default to sample
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONTENT);
      if (saved !== null && saved.length > 0) {
        mainTextarea.value = saved;
      } else {
        mainTextarea.value = SAMPLE_TEXT;
      }
    } catch (e) {
      mainTextarea.value = SAMPLE_TEXT;
    }

    handleTextChange();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
