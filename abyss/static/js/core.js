/*
 * ABYSS — Core
 * Session management, shared utilities, AI chat.
 * No global state. Every function is scoped.
 */

const Abyss = (function () {

  // ── Session ─────────────────────────────────────────────────
  const Session = (function () {
    const KEY = 'abyss_session_id';

    function getId() {
      let id = localStorage.getItem(KEY);
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(KEY, id);
      }
      return id;
    }

    return { getId };
  })();

  // ── API ──────────────────────────────────────────────────────
  const Api = (function () {
    async function post(url, body) {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': Session.getId()
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Request failed');
      }
      return res.json();
    }

    async function get(url) {
      const res = await fetch(url, {
        headers: { 'X-Session-ID': Session.getId() }
      });
      if (!res.ok) throw new Error('Request failed');
      return res.json();
    }

    return { post, get };
  })();

  // ── Chat ─────────────────────────────────────────────────────
  const Chat = (function () {
    let open = false;
    let currentTopic = null;

    function init(topic) {
      currentTopic = topic;
      const trigger = document.getElementById('chat-trigger');
      const panel   = document.getElementById('chat-panel');
      const input   = document.getElementById('chat-input');
      const sendBtn = document.getElementById('chat-send');

      if (!trigger || !panel) return;

      trigger.addEventListener('click', function () {
        open = !open;
        panel.classList.toggle('open', open);
        if (open && input) input.focus();
      });

      if (sendBtn) sendBtn.addEventListener('click', sendMessage);
      if (input) {
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        });
      }

      appendMessage('ai', 'Ask me anything about this topic — concept, math, code, or interview prep.');
    }

    function appendMessage(role, text) {
      const container = document.getElementById('chat-messages');
      if (!container) return;

      const div = document.createElement('div');
      div.className = 'msg msg--' + role;
      div.textContent = text;
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
      return div;
    }

    async function sendMessage() {
      const input = document.getElementById('chat-input');
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      appendMessage('user', text);

      const placeholder = appendMessage('ai', '...');

      try {
        const data = await Api.post('/chat', { message: text, topic: currentTopic });
        if (placeholder) placeholder.textContent = data.reply;
      } catch (err) {
        if (placeholder) {
          placeholder.textContent = 'Something went wrong. Try again.';
        }
      }
    }

    return { init };
  })();

  // ── Progress ─────────────────────────────────────────────────
  const Progress = (function () {
    async function save(topicId, data) {
      try {
        await Api.post('/progress/save', { topic_id: topicId, ...data });
      } catch (_) {}
    }

    async function load(topicId) {
      try {
        return await Api.get('/progress/' + topicId);
      } catch (_) {
        return null;
      }
    }

    return { save, load };
  })();

  // ── Timer utility ─────────────────────────────────────────────
  const Timer = (function () {
    function create(seconds, onTick, onEnd) {
      let remaining = seconds;
      let interval = null;

      function start() {
        onTick(remaining);
        interval = setInterval(function () {
          remaining--;
          onTick(remaining);
          if (remaining <= 0) {
            clearInterval(interval);
            interval = null;
            onEnd();
          }
        }, 1000);
      }

      function stop() {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }

      function reset() {
        stop();
        remaining = seconds;
      }

      return { start, stop, reset };
    }

    return { create };
  })();

  // ── Readiness ring animation ──────────────────────────────────
  const ReadinessRing = (function () {
    function animate(elementId, targetPct) {
      const el = document.getElementById(elementId);
      if (!el) return;

      const circle = el.querySelector('.readiness-ring__fill');
      const label  = el.querySelector('.readiness-ring__pct');
      if (!circle || !label) return;

      const r = 52;
      const circumference = 2 * Math.PI * r;
      circle.style.strokeDasharray  = circumference;
      circle.style.strokeDashoffset = circumference;

      let current = 0;
      const step = targetPct / 60;

      const interval = setInterval(function () {
        current = Math.min(current + step, targetPct);
        const offset = circumference - (current / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        label.textContent = Math.round(current) + '%';
        if (current >= targetPct) clearInterval(interval);
      }, 16);
    }

    return { animate };
  })();

  // ── Number counter animation ──────────────────────────────────
  function animateCount(element, target, duration) {
    if (!element) return;
    const start = performance.now();
    const from  = parseInt(element.textContent) || 0;

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value    = Math.floor(from + (target - from) * easeOut(progress));
      element.textContent = value;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  // ── Intersection observer for count-up ───────────────────────
  function initCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.count);
          animateCount(el, target, 1200);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    nums.forEach(function (el) { observer.observe(el); });
  }

  // ── Public ───────────────────────────────────────────────────
  return {
    Session,
    Api,
    Chat,
    Progress,
    Timer,
    ReadinessRing,
    initCounters
  };

})();

document.addEventListener('DOMContentLoaded', function () {
  Abyss.initCounters();
});
