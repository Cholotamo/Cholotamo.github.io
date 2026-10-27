/**
 * RetroTerminal - Modular Web Component (<retro-terminal>)
 * Features:
 * - 100% Shadow DOM encapsulation (no host CSS leak, no terminal CSS pollution)
 * - Clean CSS borders matching the viewer grid style (1px solid #444444)
 * - Monospace typography matching the viewer ("Cascadia Code", "Consolas", etc.)
 * - Muted monochrome palette (#050505 bg, #b0b0b0 fg, #ffffff bright)
 * - Unhighlightable text (user-select: none)
 * - Positioned absolutely so it scrolls naturally with document flow (users can scroll past it)
 * - Dual scroll-aware drag engine: supports both viewport/window and parent .scroll-container
 * - Slot-based content area: render embedded iframes, canvases, or fallback retro prompt
 * - Drag-shield overlay during pointer drags to prevent iframes from capturing mouse events
 * - Draggable header with boundary clamping and edge auto-scrolling
 * - Bracketed retro buttons: [_] (minimize), [+] (restore), [X] (close)
 */

export class RetroTerminal extends HTMLElement {
  static get observedAttributes() {
    return ['window-title', 'prompt', 'width', 'height', 'top', 'left'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Drag & window state
    this.isDragging = false;
    this.isMinimized = false;
    this.dragStartClientX = 0;
    this.dragStartClientY = 0;
    this.lastClientX = 0;
    this.lastClientY = 0;
    this.initialScrollX = 0;
    this.initialScrollY = 0;
    this.initialLeft = 0;
    this.initialTop = 0;
    this.maxDragLeft = Infinity;
    this.maxDragTop = Infinity;
    this.autoScrollRAF = null;
    this._scrollTarget = null;
    this._onScroll = this.handleScroll.bind(this);

    this.render();
  }

  connectedCallback() {
    this.setupEventListeners();
    this.setupInitialPosition();
  }

  disconnectedCallback() {
    this.removeEventListeners();
    if (this.autoScrollRAF) {
      cancelAnimationFrame(this.autoScrollRAF);
      this.autoScrollRAF = null;
    }
    if (this._scrollTarget) {
      this._scrollTarget.removeEventListener('scroll', this._onScroll);
      this._scrollTarget = null;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'window-title' && this.titleEl) {
      this.titleEl.textContent = newValue;
    }
    if (name === 'prompt' && this.promptEl) {
      this.promptEl.textContent = newValue;
    }
    if (name === 'width' && this.windowEl) {
      this.windowEl.style.width = newValue;
    }
    if (name === 'height' && this.windowEl) {
      this.windowEl.style.height = newValue;
    }
    if (name === 'top') {
      this.style.top = newValue;
    }
    if (name === 'left') {
      this.style.left = newValue;
    }
  }

  get terminalTitle() {
    return this.getAttribute('window-title') || 'REGIONAL RENEWABLES MARKET ANALYSIS';
  }

  get promptSymbol() {
    return this.getAttribute('prompt') || 'pipeline_v2.6 >';
  }

  get terminalWidth() {
    return this.getAttribute('width') || '820px';
  }

  get terminalHeight() {
    return this.getAttribute('height') || '580px';
  }

  getScrollTarget() {
    return this.closest('.scroll-container') || document.querySelector('.scroll-container') || window;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: absolute;
          z-index: 1000;
          font-family: "Cascadia Code", "Consolas", "IBM Plex Mono", "Courier New", monospace;
          color: #b0b0b0;
          font-size: 13px;
          line-height: 1.2;
          user-select: none;
          -webkit-user-select: none;
        }

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          border-radius: 0 !important;
          box-shadow: none !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }

        /* Terminal Window Container */
        .terminal-window {
          position: relative;
          background: #050505;
          color: #b0b0b0;
          display: flex;
          flex-direction: column;
          border: 1px solid #444444;
          overflow: hidden;
          width: ${this.terminalWidth};
          height: ${this.terminalHeight};
          min-width: 280px;
          min-height: 180px;
          max-width: 96vw;
          max-height: 90vh;
          box-shadow: 0 0 16px rgba(0,0,0,0.9) !important;
        }

        /* Minimized state */
        .terminal-window.minimized {
          height: auto !important;
          min-height: 0 !important;
        }

        .terminal-window.minimized .content-area {
          display: none !important;
        }

        /* ── Header Row (Title bar & Window Controls) ── */
        .header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #0e0e0e;
          border-bottom: 1px solid #444444;
          padding: 5px 12px;
          cursor: move;
          user-select: none;
          flex-shrink: 0;
        }

        .box-title {
          color: #ffffff;
          font-weight: 700;
          letter-spacing: 1px;
          font-size: 0.78rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .box-btn-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        /* Bracketed retro buttons */
        .box-btn {
          background: transparent;
          border: none;
          color: #b0b0b0;
          font-family: inherit;
          font-size: 13px;
          line-height: 1;
          cursor: pointer;
          padding: 0 4px;
          margin: 0;
          user-select: none;
        }

        .box-btn:hover {
          background: #e0e0e0;
          color: #0a0a0a;
        }

        .box-btn:active {
          background: #ffffff;
          color: #000000;
        }

        /* ── Terminal Content Area ── */
        .content-area {
          flex: 1;
          padding: 8px 12px;
          min-width: 0;
          min-height: 0;
          display: flex;
          flex-direction: column;
          position: relative;
          background: #050505;
          overflow: hidden;
        }

        /* When custom content is slotted in, remove inner padding */
        .content-area.has-slotted {
          padding: 0 !important;
        }

        ::slotted(*) {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
          flex: 1;
        }

        /* Pointer shield overlay during drag */
        .drag-shield {
          display: none;
          position: absolute;
          inset: 0;
          z-index: 999;
          background: transparent;
          cursor: move;
        }

        .drag-shield.active {
          display: block;
        }

        .terminal-scroll-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          user-select: none !important;
          -webkit-user-select: none !important;
        }

        /* Retro scrollbars */
        .terminal-scroll-area::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .terminal-scroll-area::-webkit-scrollbar-track {
          background: #050505;
          border-left: 1px solid #222222;
        }
        .terminal-scroll-area::-webkit-scrollbar-thumb {
          background: #444444;
        }
        .terminal-scroll-area::-webkit-scrollbar-thumb:hover {
          background: #606060;
        }

        /* Active Prompt Row (Fallback display) */
        .input-row {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          margin-top: 2px;
          line-height: 1.3;
          user-select: none !important;
          -webkit-user-select: none !important;
        }

        .prompt-label {
          color: #ffffff;
          font-weight: 700;
          margin-right: 6px;
          flex-shrink: 0;
          user-select: none !important;
        }

        /* Blinking text cursor */
        .cursor {
          display: inline-block;
          color: #ffffff;
          font-weight: 700;
          margin-left: 1px;
          animation: retro-cursor-blink 1s steps(1) infinite;
          user-select: none !important;
        }

        @keyframes retro-cursor-blink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
          }
        }
      </style>

      <div class="terminal-window" id="window">
        <!-- 1. Top Header Row -->
        <div class="header-row" id="dragHandle">
          <div class="box-title" id="title">${this.terminalTitle}</div>
          <div class="box-btn-group">
            <button class="box-btn btn-min" id="btnMin" aria-label="Minimize">[_]</button>
            <button class="box-btn btn-close" id="btnClose" aria-label="Close">[X]</button>
          </div>
        </div>

        <!-- 2. Middle Content Row (Slotted content or fallback prompt) -->
        <div class="content-area" id="contentArea">
          <slot id="contentSlot">
            <div class="terminal-scroll-area">
              <div class="input-row">
                <span class="prompt-label" id="promptLabel">${this.promptSymbol}&nbsp;</span>
                <span class="cursor">|</span>
              </div>
            </div>
          </slot>
          <div class="drag-shield" id="dragShield"></div>
        </div>
      </div>
    `;

    // Cache elements
    this.windowEl = this.shadowRoot.getElementById('window');
    this.dragHandle = this.shadowRoot.getElementById('dragHandle');
    this.titleEl = this.shadowRoot.getElementById('title');
    this.promptEl = this.shadowRoot.getElementById('promptLabel');
    this.btnMin = this.shadowRoot.getElementById('btnMin');
    this.btnClose = this.shadowRoot.getElementById('btnClose');
    this.contentAreaEl = this.shadowRoot.getElementById('contentArea');
    this.dragShield = this.shadowRoot.getElementById('dragShield');
    this.contentSlot = this.shadowRoot.getElementById('contentSlot');

    // Slot listener to detect slotted elements
    if (this.contentSlot) {
      this.contentSlot.addEventListener('slotchange', () => {
        const nodes = this.contentSlot.assignedElements();
        if (nodes.length > 0) {
          this.contentAreaEl.classList.add('has-slotted');
        } else {
          this.contentAreaEl.classList.remove('has-slotted');
        }
      });
    }
  }

  setupInitialPosition() {
    const customTop = this.getAttribute('top') || '60px';
    const customLeft = this.getAttribute('left') || '60px';
    this.style.top = customTop;
    this.style.left = customLeft;
  }

  setupEventListeners() {
    // Window dragging with Pointer Events (document / scroll-container aware)
    this._onPointerDown = this.handlePointerDown.bind(this);
    this._onPointerMove = this.handlePointerMove.bind(this);
    this._onPointerUp = this.handlePointerUp.bind(this);

    this.dragHandle.addEventListener('pointerdown', this._onPointerDown);
    this.dragHandle.addEventListener('pointermove', this._onPointerMove);
    this.dragHandle.addEventListener('pointerup', this._onPointerUp);
    this.dragHandle.addEventListener('pointercancel', this._onPointerUp);

    // Minimize & Close button controls
    this.btnMin.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMinimize();
    });

    this.btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTerminal();
    });
  }

  removeEventListeners() {
    if (this.dragHandle) {
      this.dragHandle.removeEventListener('pointerdown', this._onPointerDown);
      this.dragHandle.removeEventListener('pointermove', this._onPointerMove);
      this.dragHandle.removeEventListener('pointerup', this._onPointerUp);
      this.dragHandle.removeEventListener('pointercancel', this._onPointerUp);
    }
  }

  /* ── Drag & Reposition Logic (Scroll-container Aware & Auto-scroll) ── */
  handlePointerDown(e) {
    if (e.target.closest('.box-btn')) return;

    this.isDragging = true;
    if (this.dragShield) this.dragShield.classList.add('active');

    try {
      this.dragHandle.setPointerCapture(e.pointerId);
    } catch (_) {}

    // Track viewport client coordinates
    this.dragStartClientX = e.clientX;
    this.dragStartClientY = e.clientY;
    this.lastClientX = e.clientX;
    this.lastClientY = e.clientY;

    const scrollTarget = this.getScrollTarget();
    this._scrollTarget = scrollTarget;
    this.initialScrollX = scrollTarget === window ? window.scrollX : scrollTarget.scrollLeft;
    this.initialScrollY = scrollTarget === window ? window.scrollY : scrollTarget.scrollTop;

    this.initialLeft = parseFloat(this.style.left) || this.offsetLeft;
    this.initialTop = parseFloat(this.style.top) || this.offsetTop;

    // Calculate document / container limits to prevent infinite expansion
    const termWidth = this.windowEl ? this.windowEl.offsetWidth : (this.offsetWidth || 820);
    const termHeight = this.windowEl ? this.windowEl.offsetHeight : (this.offsetHeight || 580);

    const docWidth = scrollTarget === window
      ? Math.max(document.body.scrollWidth, document.documentElement.scrollWidth)
      : scrollTarget.scrollWidth;
    const docHeight = scrollTarget === window
      ? Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
      : scrollTarget.scrollHeight;

    this.maxDragLeft = Math.max(0, docWidth - termWidth);
    this.maxDragTop = Math.max(0, docHeight - termHeight);

    this._scrollTarget.addEventListener('scroll', this._onScroll, { passive: true });
    this.startAutoScroll();

    e.preventDefault();
  }

  handlePointerMove(e) {
    if (!this.isDragging) return;

    this.lastClientX = e.clientX;
    this.lastClientY = e.clientY;

    this.updateDragPosition();
  }

  handleScroll() {
    if (!this.isDragging) return;
    this.updateDragPosition();
  }

  updateDragPosition() {
    const scrollTarget = this._scrollTarget || this.getScrollTarget();
    const currentScrollX = scrollTarget === window ? window.scrollX : scrollTarget.scrollLeft;
    const currentScrollY = scrollTarget === window ? window.scrollY : scrollTarget.scrollTop;

    const dx = this.lastClientX - this.dragStartClientX;
    const dy = this.lastClientY - this.dragStartClientY;
    const scrollDeltaX = currentScrollX - this.initialScrollX;
    const scrollDeltaY = currentScrollY - this.initialScrollY;

    let nextLeft = this.initialLeft + dx + scrollDeltaX;
    let nextTop = this.initialTop + dy + scrollDeltaY;

    // Boundary protection: clamp to container limits
    nextLeft = Math.max(0, Math.min(nextLeft, this.maxDragLeft));
    nextTop = Math.max(0, Math.min(nextTop, this.maxDragTop));

    this.style.left = `${nextLeft}px`;
    this.style.top = `${nextTop}px`;
  }

  startAutoScroll() {
    if (this.autoScrollRAF) {
      cancelAnimationFrame(this.autoScrollRAF);
    }

    const checkScroll = () => {
      if (!this.isDragging) return;

      const scrollTarget = this._scrollTarget || this.getScrollTarget();
      const edgeThreshold = 60;
      const scrollSpeed = 14;

      const currentScrollY = scrollTarget === window ? window.scrollY : scrollTarget.scrollTop;
      const currentScrollX = scrollTarget === window ? window.scrollX : scrollTarget.scrollLeft;
      const maxScrollY = scrollTarget === window
        ? Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
        : Math.max(0, scrollTarget.scrollHeight - scrollTarget.clientHeight);
      const maxScrollX = scrollTarget === window
        ? Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
        : Math.max(0, scrollTarget.scrollWidth - scrollTarget.clientWidth);

      if (this.lastClientY < edgeThreshold) {
        // Dragging near top edge: scroll screen up
        if (currentScrollY > 0) {
          if (scrollTarget === window) {
            window.scrollBy(0, -scrollSpeed);
          } else {
            scrollTarget.scrollTop = Math.max(0, scrollTarget.scrollTop - scrollSpeed);
          }
          this.updateDragPosition();
        }
      } else if (this.lastClientY > window.innerHeight - edgeThreshold) {
        // Dragging near bottom edge: scroll screen down
        if (currentScrollY < maxScrollY) {
          if (scrollTarget === window) {
            window.scrollBy(0, scrollSpeed);
          } else {
            scrollTarget.scrollTop = Math.min(maxScrollY, scrollTarget.scrollTop + scrollSpeed);
          }
          this.updateDragPosition();
        }
      }

      if (this.lastClientX < edgeThreshold) {
        // Dragging near left edge: scroll screen left
        if (currentScrollX > 0) {
          if (scrollTarget === window) {
            window.scrollBy(-scrollSpeed, 0);
          } else {
            scrollTarget.scrollLeft = Math.max(0, scrollTarget.scrollLeft - scrollSpeed);
          }
          this.updateDragPosition();
        }
      } else if (this.lastClientX > window.innerWidth - edgeThreshold) {
        // Dragging near right edge: scroll screen right
        if (currentScrollX < maxScrollX) {
          if (scrollTarget === window) {
            window.scrollBy(scrollSpeed, 0);
          } else {
            scrollTarget.scrollLeft = Math.min(maxScrollX, scrollTarget.scrollLeft + scrollSpeed);
          }
          this.updateDragPosition();
        }
      }

      this.autoScrollRAF = requestAnimationFrame(checkScroll);
    };

    this.autoScrollRAF = requestAnimationFrame(checkScroll);
  }

  handlePointerUp(e) {
    if (this.isDragging) {
      this.isDragging = false;
      if (this.dragShield) this.dragShield.classList.remove('active');
      if (this.autoScrollRAF) {
        cancelAnimationFrame(this.autoScrollRAF);
        this.autoScrollRAF = null;
      }
      if (this._scrollTarget) {
        this._scrollTarget.removeEventListener('scroll', this._onScroll);
      }
      try {
        this.dragHandle.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  }

  /* ── Window Controls ── */
  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    if (this.isMinimized) {
      this.windowEl.classList.add('minimized');
      this.btnMin.textContent = '[+]';
      this.btnMin.setAttribute('aria-label', 'Restore');
    } else {
      this.windowEl.classList.remove('minimized');
      this.btnMin.textContent = '[_]';
      this.btnMin.setAttribute('aria-label', 'Minimize');
    }
    this.dispatchEvent(new CustomEvent('terminal-minimize', {
      detail: { isMinimized: this.isMinimized },
      bubbles: true,
      composed: true,
    }));
  }

  closeTerminal() {
    this.dispatchEvent(new CustomEvent('terminal-close', {
      bubbles: true,
      composed: true,
    }));
    this.remove();
  }
}

// Register Custom Element
if (!customElements.get('retro-terminal')) {
  customElements.define('retro-terminal', RetroTerminal);
}

/**
 * Programmatic Spawner Helper Function (Singleton / Anti-Duplicate)
 */
export function spawnTerminal(config = {}) {
  // Enforce singleton: prevent duplicate terminal instances
  const existing = document.querySelector('retro-terminal');
  if (existing) {
    console.warn('[RetroTerminal] Instance already exists on page.');
    return existing;
  }

  const term = document.createElement('retro-terminal');

  term.setAttribute('window-title', config.title || 'REGIONAL RENEWABLES MARKET ANALYSIS');
  term.setAttribute('prompt', config.prompt || 'pipeline_v2.6 >');
  term.setAttribute('width', config.width || '820px');
  term.setAttribute('height', config.height || '580px');
  term.setAttribute('left', config.left || '40px');

  const scrollContainer = document.querySelector('.scroll-container');
  const defaultTop = scrollContainer ? (scrollContainer.scrollTop + 60) : (window.scrollY + 60);
  term.setAttribute('top', config.top || `${defaultTop}px`);

  if (config.content) {
    if (typeof config.content === 'string') {
      term.innerHTML = config.content;
    } else if (config.content instanceof Node) {
      term.appendChild(config.content);
    }
  }

  const mountParent = scrollContainer || document.body;
  mountParent.appendChild(term);
  return term;
}

export default RetroTerminal;
