/*
 * Topic 2 — Data & Preprocessing
 * Audio · SVG Creature · Data Hospital · Missing Values · Feature Scaling · Quiz
 */

(function () {
  'use strict';

  // ── Audio ────────────────────────────────────────────────────────────────────
  var Sound = (function () {
    var ctx = null;
    function ac() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function tone(freq, type, dur, vol, delay) {
      var a = ac(), osc = a.createOscillator(), g = a.createGain();
      osc.connect(g); g.connect(a.destination);
      osc.type = type || 'sine'; osc.frequency.value = freq;
      var t = a.currentTime + (delay || 0);
      g.gain.setValueAtTime(vol || 0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t); osc.stop(t + dur);
    }
    return {
      pop:     function () { tone(700,'sine',0.08,0.2); tone(900,'sine',0.05,0.12,0.05); },
      fix:     function () { tone(523,'sine',0.10,0.18); tone(659,'sine',0.08,0.12,0.07); },
      success: function () { [523,659,784,1047].forEach(function(f,i){ tone(f,'sine',0.28,0.2,i*0.13); }); },
      wrong:   function () { tone(220,'sawtooth',0.15,0.15); tone(180,'sawtooth',0.10,0.12,0.09); },
      step:    function () { tone(480,'sine',0.05,0.07); }
    };
  })();


  // ── Creature ─────────────────────────────────────────────────────────────────
  var Creature = (function () {
    var bubble, bubbleTimer;

    function init(wrapperId) {
      var wrap = document.getElementById(wrapperId);
      if (!wrap) return;
      var div = document.createElement('div');
      div.className = 'creature-wrap'; div.id = 'ml-creature';
      bubble = document.createElement('div');
      bubble.className = 'creature-bubble'; bubble.id = 'creature-bubble';
      var ns = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox','0 0 100 100');
      svg.setAttribute('class','creature-svg');
      svg.setAttribute('id','creature-svg');
      svg.innerHTML =
        '<defs><radialGradient id="cGrad2" cx="38%" cy="32%" r="70%">' +
        '<stop offset="0%" stop-color="#a5b4fc"/><stop offset="100%" stop-color="#6366f1"/>' +
        '</radialGradient></defs>' +
        '<ellipse cx="50" cy="60" rx="39" ry="34" fill="#818cf8" opacity="0.15"/>' +
        '<ellipse cx="50" cy="59" rx="37" ry="32" fill="url(#cGrad2)"/>' +
        '<circle cx="34" cy="50" r="12" fill="white"/><circle cx="66" cy="50" r="12" fill="white"/>' +
        '<circle cx="36" cy="52" r="7" fill="#06060f"/><circle cx="68" cy="52" r="7" fill="#06060f"/>' +
        '<circle cx="38.5" cy="49.5" r="2.8" fill="rgba(255,255,255,0.95)"/>' +
        '<circle cx="70.5" cy="49.5" r="2.8" fill="rgba(255,255,255,0.95)"/>' +
        '<path d="M 34 68 Q 50 80 66 68" stroke="#1a1030" stroke-width="2.8" fill="none" stroke-linecap="round"/>' +
        '<line x1="50" y1="27" x2="42" y2="8" stroke="#818cf8" stroke-width="2.5" stroke-linecap="round"/>' +
        '<circle cx="40" cy="6" r="6" fill="#22d3ee"/><circle cx="40" cy="6" r="3" fill="white" opacity="0.6"/>' +
        '<ellipse cx="31" cy="91" rx="12" ry="7" fill="#6366f1" opacity="0.85"/>' +
        '<ellipse cx="69" cy="91" rx="12" ry="7" fill="#6366f1" opacity="0.85"/>' +
        '<path d="M 13 62 Q 5 45 20 38" stroke="#6366f1" stroke-width="10" stroke-linecap="round" fill="none"/>' +
        '<path d="M 87 62 Q 95 45 80 38" stroke="#6366f1" stroke-width="10" stroke-linecap="round" fill="none"/>';
      svg.addEventListener('click', function () {
        Sound.pop(); setState('excited');
        say('Click the red cells — each one is a data problem I need fixed!', 3500);
      });
      div.appendChild(bubble); div.appendChild(svg); wrap.appendChild(div);
    }

    function say(text, duration) {
      if (!bubble) return;
      clearTimeout(bubbleTimer);
      bubble.textContent = text; bubble.classList.add('visible');
      if (duration) bubbleTimer = setTimeout(function () { bubble.classList.remove('visible'); }, duration);
    }

    function setState(state) {
      var svg = document.getElementById('creature-svg');
      if (!svg) return;
      svg.className = 'creature-svg creature-' + state;
      setTimeout(function () { if (svg) svg.className = 'creature-svg'; }, 1200);
    }

    return { init: init, say: say, setState: setState };
  })();


  // ── Particles ────────────────────────────────────────────────────────────────
  var Particles = (function () {
    function burst(containerId, x, y, color, count) {
      var container = document.getElementById(containerId);
      if (!container) return;
      count = count || 8;
      for (var i = 0; i < count; i++) {
        var angle = (Math.PI * 2 * i) / count;
        var speed = 45 + Math.random() * 55;
        var size  = 5 + Math.random() * 5;
        var p = document.createElement('div');
        p.style.cssText =
          'position:absolute;left:' + (x - size/2) + 'px;top:' + (y - size/2) + 'px;' +
          'width:' + size + 'px;height:' + size + 'px;border-radius:50%;' +
          'background:' + color + ';pointer-events:none;z-index:50;' +
          'transition:transform 0.65s ease-out,opacity 0.65s ease-out;';
        container.appendChild(p);
        void p.offsetWidth;
        p.style.transform = 'translate(' + (Math.cos(angle)*speed) + 'px,' + (Math.sin(angle)*speed) + 'px) scale(0.1)';
        p.style.opacity   = '0';
        setTimeout((function (el) { return function () { if (el.parentNode) el.parentNode.removeChild(el); }; }(p)), 720);
      }
    }
    return { burst: burst };
  })();


  // ── DataHospital — clickable bad-data table ───────────────────────────────────
  var DataHospital = (function () {

    var PROBLEMS = {
      'city-upper': {
        label: 'Inconsistent Encoding', icon: '🔤', color: '#818cf8',
        before: 'MUMBAI', after: 'mumbai',
        explain: '"MUMBAI", "mumbai", "Mumbai" — the model treats these as 3 different cities. Fix: lowercase + strip all city values before encoding.'
      },
      'missing-rating': {
        label: 'Missing Value', icon: '❓', color: '#ef4444',
        before: 'NaN', after: '4.2',
        explain: 'NaN crashes most sklearn algorithms by default. Fix: fill with median (ratings are right-skewed) using SimpleImputer(strategy="median").'
      },
      'outlier': {
        label: 'Outlier', icon: '⚡', color: '#f59e0b',
        before: '9999', after: '42',
        explain: 'Delivery time of 9999 min is a data entry error. It shifts the mean from 31 to 1,400. Fix: IQR cap — remove values above Q3 + 1.5×IQR.'
      },
      'missing-cat': {
        label: 'Missing Category', icon: '❓', color: '#ef4444',
        before: 'NaN', after: '"Indian"',
        explain: 'Missing categorical value — cannot take the mean. Fix: fill with mode (most frequent category) or SimpleImputer(strategy="most_frequent").'
      },
      'city-lower': {
        label: 'Inconsistent Encoding', icon: '🔤', color: '#818cf8',
        before: 'delhi', after: 'delhi ✓',
        explain: 'After lowercasing all city names, "delhi" is consistent. Result: 2 real cities instead of 5 phantom variants.'
      }
    };

    var BAD = [
      [0, 1, 'city-upper'],
      [1, 2, 'missing-rating'],
      [2, 3, 'outlier'],
      [3, 4, 'missing-cat'],
      [4, 1, 'city-lower']
    ];

    var TABLE_DATA = [
      ['Spice Garden', 'MUMBAI', '4.5', '28 min',  'Indian'],
      ['Pizza Palace', 'mumbai', 'NaN', '35 min',  'Italian'],
      ['Sushi Zen',    'Mumbai', '4.8', '9999',     'Japanese'],
      ['Chai Corner',  'Delhi',  '3.1', '24 min',  'NaN'],
      ['Burger Lab',   'delhi',  '4.2', '29 min',  'Fast Food']
    ];

    var HEADERS = ['Restaurant', 'City', 'Rating', 'Delivery', 'Category'];
    var fixed   = {};
    var container;

    function getBadKey(ri, ci) {
      for (var i = 0; i < BAD.length; i++) {
        if (BAD[i][0] === ri && BAD[i][1] === ci) return BAD[i][2];
      }
      return null;
    }

    function init(containerId) {
      container = document.getElementById(containerId);
      if (!container) return;
      fixed = {};
      render();
      Creature.say('5 bad cells hidden in this dataset. Click the red ones!', 4000);
    }

    function render() {
      var fixedCount = Object.keys(fixed).length;
      var allFixed   = fixedCount >= BAD.length;
      var html = '<div style="overflow-x:auto;"><table class="data-hospital-table"><thead><tr>';
      HEADERS.forEach(function (h) { html += '<th class="dh-th">' + h + '</th>'; });
      html += '</tr></thead><tbody>';
      TABLE_DATA.forEach(function (row, ri) {
        html += '<tr class="dh-tr">';
        row.forEach(function (cell, ci) {
          var pk      = getBadKey(ri, ci);
          var isFixed = pk && fixed[ri + '-' + ci];
          var isBad   = pk && !isFixed;
          var cls     = 'dh-td' + (isBad ? ' dh-td--bad' : '') + (isFixed ? ' dh-td--fixed' : '');
          var display = isFixed ? PROBLEMS[pk].after : cell;
          if (pk) {
            html += '<td class="' + cls + '" data-ri="' + ri + '" data-ci="' + ci + '" data-pk="' + pk + '">';
            html += display + (isBad ? ' <span class="dh-flag">' + PROBLEMS[pk].icon + '</span>' : '');
            html += '</td>';
          } else {
            html += '<td class="dh-td">' + display + '</td>';
          }
        });
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      html += '<div class="dh-info" id="dh-info" style="display:none;"></div>';
      if (allFixed) {
        html += '<div style="margin-top:1rem;padding:0.75rem 1rem;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:var(--radius-sm);font-size:var(--t-sm);color:#22c55e;font-weight:600;">✓ All 5 problems fixed — dataset is ready to model!</div>';
      } else {
        html += '<div style="margin-top:0.75rem;"><button class="btn btn--ghost btn--sm" id="dh-fix-all">⚡ Fix All ' + (BAD.length - fixedCount) + ' Remaining</button></div>';
      }
      container.innerHTML = html;
      container.querySelectorAll('[data-pk]').forEach(function (td) {
        td.addEventListener('click', function () {
          var ri = parseInt(td.dataset.ri), ci = parseInt(td.dataset.ci), pk = td.dataset.pk;
          if (!fixed[ri + '-' + ci]) showInfo(ri, ci, pk);
        });
      });
      var btn = document.getElementById('dh-fix-all');
      if (btn) btn.addEventListener('click', fixAll);
    }

    function showInfo(ri, ci, pk) {
      var prob = PROBLEMS[pk];
      var el   = document.getElementById('dh-info');
      if (!el) return;
      el.style.display = 'block';
      el.innerHTML =
        '<div class="dh-info__header" style="color:' + prob.color + ';">' + prob.icon + ' ' + prob.label + '</div>' +
        '<div class="dh-info__body">' + prob.explain + '</div>' +
        '<div style="margin-top:0.75rem;display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">' +
        '<code class="dh-before">' + prob.before + '</code>' +
        '<span style="color:var(--text-muted);">→</span>' +
        '<code class="dh-after">' + prob.after + '</code>' +
        '<button class="btn btn--sm btn--teaching" id="dh-fix-one" style="margin-left:auto;">Fix This ✓</button>' +
        '</div>';
      Sound.pop();
      Creature.say(prob.label + ': ' + prob.explain.substring(0, 72) + '...', 4500);
      document.getElementById('dh-fix-one').addEventListener('click', function () { fix(ri, ci); });
    }

    function fix(ri, ci) {
      fixed[ri + '-' + ci] = true;
      Sound.fix();
      Creature.setState('excited');
      var remaining = BAD.length - Object.keys(fixed).length;
      if (remaining === 0) {
        Creature.setState('celebrate');
        Creature.say('All 5 fixed! Clean data — now the model can learn correctly.', 5000);
        Sound.success();
        Particles.burst('dh-wrapper', container.offsetWidth / 2, 100, '#22c55e', 12);
      } else {
        Creature.say(remaining + ' problem' + (remaining > 1 ? 's' : '') + ' left. Keep going!', 2500);
      }
      render();
    }

    function fixAll() {
      var idx = 0;
      function next() {
        if (idx >= BAD.length) {
          Creature.setState('celebrate');
          Creature.say('All 5 fixed! This is data preprocessing — step zero of every ML project.', 5000);
          Sound.success();
          Particles.burst('dh-wrapper', container.offsetWidth / 2, 100, '#22c55e', 14);
          return;
        }
        var bc = BAD[idx];
        fixed[bc[0] + '-' + bc[1]] = true;
        idx++; Sound.pop(); render();
        setTimeout(next, 380);
      }
      next();
    }

    return { init: init };
  })();


  // ── MissingValues — imputation strategy demo ─────────────────────────────────
  var MissingValues = (function () {
    var DATA   = [28, null, 35, null, 22, 41, null, 31, 27, null];
    var LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon','Tue','Wed'];

    function getMean() {
      var v = DATA.filter(function (x) { return x !== null; });
      return Math.round((v.reduce(function (a, b) { return a + b; }, 0) / v.length) * 10) / 10;
    }
    function getMedian() {
      var v = DATA.filter(function (x) { return x !== null; }).slice().sort(function (a, b) { return a - b; });
      return v[Math.floor(v.length / 2)];
    }

    function init() { render('none'); }

    function render(strategy) {
      var el = document.getElementById('mv-canvas');
      if (!el) return;
      var mean = getMean(), median = getMedian();
      var fill = strategy === 'mean' ? mean : strategy === 'median' ? median : null;
      var html = '<div class="mv-grid">';
      DATA.forEach(function (v, i) {
        var isMissing = v === null;
        var isFilled  = isMissing && fill !== null && strategy !== 'drop';
        var isDrop    = isMissing && strategy === 'drop';
        var display   = isFilled ? fill : isMissing ? 'NaN' : v;
        var cls = 'mv-cell' + (isDrop ? ' mv-cell--dropped' : isFilled ? ' mv-cell--filled' : isMissing ? ' mv-cell--missing' : ' mv-cell--ok');
        html += '<div class="' + cls + '">' + (isDrop ? '×' : display) + '<span class="mv-day">' + LABELS[i] + '</span></div>';
      });
      html += '</div>';
      if (strategy === 'mean') {
        html += '<div class="mv-stat">Mean = ' + mean + ' min · all 4 NaN cells → ' + mean + '</div>';
      } else if (strategy === 'median') {
        html += '<div class="mv-stat">Median = ' + median + ' min · all 4 NaN cells → ' + median + ' · more robust to outliers than mean</div>';
      } else if (strategy === 'drop') {
        html += '<div class="mv-stat">4 rows dropped → 6 rows remaining · 40% data loss · only safe if &lt;5% missing and MCAR</div>';
      } else {
        html += '<div style="font-size:var(--t-xs);color:var(--text-muted);margin-top:0.25rem;">4 NaN cells highlighted in red. Pick a strategy above.</div>';
      }
      el.innerHTML = html;
    }

    return { init: init, render: render };
  })();


  // ── FeatureScaling — D3 bar chart: raw vs StandardScaler vs MinMaxScaler ──────
  var FeatureScaling = (function () {
    var svgEl = null, W = 500, H = 220;
    var FEATS  = ['Age (yrs)', 'Study Hrs', 'Salary (₹)'];
    var COLORS = ['#818cf8', '#22d3ee', '#f59e0b'];

    function init(containerId) {
      var container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';
      var rect = container.getBoundingClientRect();
      W = Math.max(rect.width || 500, 280);
      svgEl = d3.select('#' + containerId)
        .append('svg')
        .attr('viewBox', '0 0 ' + W + ' ' + H)
        .attr('width', '100%')
        .attr('height', H)
        .attr('overflow', 'visible');
      draw('raw');
    }

    function draw(mode) {
      if (!svgEl) return;
      svgEl.selectAll('*').remove();

      var data, labels, title;
      if (mode === 'raw') {
        data   = [25, 8, 600000];
        labels = ['25', '8', '6,00,000'];
        title  = 'Raw — salary (₹6L) dwarfs age & study hours';
      } else if (mode === 'standard') {
        data   = [0.33, 0.50, 0.50];
        labels = ['-0.33σ', '+0.50σ', '+0.50σ'];
        title  = 'StandardScaler — z-score (mean=0, std=1)';
      } else {
        data   = [0.32, 0.50, 0.22];
        labels = ['0.32', '0.50', '0.22'];
        title  = 'MinMaxScaler — scaled to [0, 1]';
      }

      var pad = { l: 58, r: 15, t: 30, b: 50 };
      var cW  = W - pad.l - pad.r;
      var cH  = H - pad.t - pad.b;
      var tc  = '#6b7280', ac = '#2d2d4e';

      var xSc = d3.scaleBand().domain(FEATS).range([0, cW]).padding(0.38);
      var yMax = d3.max(data) * 1.18 || 1;
      var ySc  = d3.scaleLinear().domain([0, yMax]).range([cH, 0]);

      var g = svgEl.append('g').attr('transform', 'translate(' + pad.l + ',' + pad.t + ')');

      /* title */
      svgEl.append('text')
        .attr('x', pad.l + cW / 2).attr('y', 16)
        .attr('text-anchor', 'middle').attr('fill', '#9ca3af').attr('font-size', '10px')
        .text(title);

      /* axes */
      g.append('g').attr('transform', 'translate(0,' + cH + ')')
        .call(d3.axisBottom(xSc).tickSize(0))
        .call(function (ax) {
          ax.select('.domain').attr('stroke', ac);
          ax.selectAll('text').attr('fill', tc).attr('font-size', '10px').attr('dy', '1.3em');
        });

      g.append('g')
        .call(d3.axisLeft(ySc).ticks(5).tickFormat(function (d) {
          if (mode === 'raw') return d >= 100000 ? (d / 100000).toFixed(0) + 'L' : d;
          return d.toFixed(2);
        }))
        .call(function (ax) {
          ax.selectAll('path,line').attr('stroke', ac);
          ax.selectAll('text').attr('fill', tc).attr('font-size', '9px');
        });

      g.append('text')
        .attr('transform', 'rotate(-90)').attr('x', -cH / 2).attr('y', -44)
        .attr('text-anchor', 'middle').attr('fill', tc).attr('font-size', '10px')
        .text(mode === 'raw' ? 'raw value' : mode === 'standard' ? 'z-score (σ)' : 'scaled 0–1');

      /* bars */
      FEATS.forEach(function (feat, i) {
        var val = data[i];
        var bH  = Math.max(2, cH - ySc(val));
        var bW  = xSc.bandwidth();
        var x   = xSc(feat);

        g.append('rect')
          .attr('x', x).attr('y', ySc(val))
          .attr('width', bW).attr('height', bH)
          .attr('fill', COLORS[i]).attr('rx', 3).attr('opacity', 0)
          .transition().duration(480).delay(i * 90)
          .attr('opacity', 0.82);

        g.append('text')
          .attr('x', x + bW / 2).attr('y', ySc(val) - 5)
          .attr('text-anchor', 'middle').attr('fill', COLORS[i])
          .attr('font-size', '10px').attr('font-weight', '700').attr('opacity', 0)
          .transition().duration(480).delay(i * 90)
          .attr('opacity', 1)
          .text(labels[i]);
      });
    }

    return { init: init, draw: draw };
  })();


  // ── Quiz ─────────────────────────────────────────────────────────────────────
  var Quiz = (function () {
    var qs = [], cur = 0, score = 0, answered = false, timer = null, tStart = 0, times = [];

    function init(data) {
      qs = data || [];
      if (!qs.length) return;
      var btn = document.getElementById('quiz-start-btn');
      if (btn) btn.addEventListener('click', start);
    }

    function start() {
      cur = 0; score = 0; answered = false; times = [];
      document.getElementById('quiz-start-screen').style.display = 'none';
      document.getElementById('quiz-question-screen').classList.add('active');
      document.getElementById('quiz-result-screen').classList.remove('visible');
      showQ();
    }

    function showQ() {
      if (cur >= qs.length) { showResult(); return; }
      answered = false;
      var q = qs[cur];
      document.getElementById('quiz-num').textContent      = (cur + 1) + ' / ' + qs.length;
      document.getElementById('quiz-q-text').textContent   = q.question;
      var optEl = document.getElementById('quiz-options');
      optEl.innerHTML = '';
      q.options.forEach(function (opt, i) {
        var btn = document.createElement('button');
        btn.className = 'quiz-opt'; btn.textContent = opt;
        btn.addEventListener('click', function () { select(i); });
        optEl.appendChild(btn);
      });
      document.getElementById('quiz-explanation').classList.remove('visible');
      document.getElementById('quiz-next-btn').style.display = 'none';
      var bar = document.getElementById('quiz-timer-bar');
      if (bar) { bar.style.transition = 'none'; bar.style.width = '100%'; bar.style.background = '#818cf8'; void bar.offsetWidth; }
      document.getElementById('quiz-timer-text').textContent = '30s';
      tStart = Date.now();
      if (timer) timer.stop();
      timer = Abyss.Timer.create(30,
        function (rem) {
          var b   = document.getElementById('quiz-timer-bar');
          var pct = (rem / 30) * 100;
          if (b) { b.style.transition = 'width 1s linear,background 1s linear'; b.style.width = pct + '%'; b.style.background = pct > 50 ? '#818cf8' : pct > 25 ? '#f59e0b' : '#ef4444'; }
          document.getElementById('quiz-timer-text').textContent = rem + 's';
        },
        function () { if (!answered) timeout(); }
      );
      timer.start();
    }

    function select(idx) {
      if (answered) return;
      answered = true;
      if (timer) timer.stop();
      var taken = Math.round((Date.now() - tStart) / 1000);
      times.push(taken);
      var q = qs[cur], ok = idx === q.answer;
      if (ok) { score++; Sound.success(); Creature.setState('celebrate'); Creature.say('Correct! Well done! 🎉', 2500); }
      else    { Sound.wrong(); Creature.say('Not quite — read the explanation carefully.', 3000); }
      Abyss.Api.post('/quiz/attempt', { topic_id: 'ml-2', question_idx: cur, correct: ok, time_taken: taken }).catch(function () {});
      document.querySelectorAll('.quiz-opt').forEach(function (b, i) {
        b.disabled = true;
        if (i === q.answer) b.classList.add('correct');
        else if (i === idx && !ok) b.classList.add('wrong');
      });
      var ex = document.getElementById('quiz-explanation');
      ex.textContent = q.explanation;
      ex.style.borderLeftColor = ok ? 'var(--success)' : 'var(--error)';
      ex.classList.add('visible');
      var nb = document.getElementById('quiz-next-btn');
      nb.style.display = 'inline-flex';
      nb.textContent = cur < qs.length - 1 ? 'Next Question →' : 'See Results →';
    }

    function timeout() {
      if (answered) return;
      answered = true; times.push(30); Sound.wrong();
      var q = qs[cur];
      document.querySelectorAll('.quiz-opt').forEach(function (b, i) { b.disabled = true; if (i === q.answer) b.classList.add('correct'); });
      var ex = document.getElementById('quiz-explanation');
      ex.textContent = 'Time up. ' + q.explanation;
      ex.style.borderLeftColor = 'var(--error)';
      ex.classList.add('visible');
      var nb = document.getElementById('quiz-next-btn');
      nb.style.display = 'inline-flex';
      nb.textContent = cur < qs.length - 1 ? 'Next Question →' : 'See Results →';
    }

    function next() { cur++; showQ(); }

    function showResult() {
      document.getElementById('quiz-question-screen').classList.remove('active');
      document.getElementById('quiz-result-screen').classList.add('visible');
      var pct = Math.round((score / qs.length) * 100);
      document.getElementById('result-score').textContent = score + ' / ' + qs.length;
      document.getElementById('result-pct').textContent   = pct + '%';
      document.getElementById('result-msg').textContent   =
        pct === 100 ? 'Perfect. You own this topic. Move on.' :
        pct >= 80   ? 'Strong. Review what you missed.' :
        pct >= 60   ? 'Decent. Re-read explanations, retry.' :
        'Keep at it. Re-read every explanation, then retry.';
      if (pct >= 80) { Sound.success(); Creature.setState('celebrate'); Creature.say(pct === 100 ? 'PERFECT! Placement ready on this topic!' : 'Great score!', 4000); }
      var tt = times.reduce(function (a, b) { return a + b; }, 0);
      Abyss.Progress.save('ml-2', { completed: score >= 3, quiz_score: score, quiz_total: qs.length, time_spent: tt });
    }

    return { init: init, next: next };
  })();


  // ── Boot ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    Creature.init('dh-wrapper');
    DataHospital.init('dh-canvas');
    MissingValues.init('mv-canvas');
    FeatureScaling.init('fs-canvas');
    if (typeof QUIZ_DATA !== 'undefined') Quiz.init(QUIZ_DATA);

    /* Missing value strategy buttons — set first active, wire clicks */
    var firstMv = document.querySelector('.mv-btn');
    if (firstMv) {
      firstMv.style.background  = 'var(--primary-glow)';
      firstMv.style.borderColor = 'var(--primary-border)';
      firstMv.style.color       = 'var(--primary)';
    }
    document.querySelectorAll('.mv-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.mv-btn').forEach(function (b) {
          b.style.background = ''; b.style.borderColor = ''; b.style.color = '';
        });
        btn.style.background  = 'var(--primary-glow)';
        btn.style.borderColor = 'var(--primary-border)';
        btn.style.color       = 'var(--primary)';
        MissingValues.render(btn.dataset.strategy);
      });
    });

    /* Feature scaling buttons */
    document.querySelectorAll('.fs-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.fs-btn').forEach(function (b) { b.classList.remove('fs-btn--active'); });
        btn.classList.add('fs-btn--active');
        FeatureScaling.draw(btn.dataset.mode);
      });
    });

    /* Quiz next / retry */
    var el;
    el = document.getElementById('quiz-next-btn');
    if (el) el.addEventListener('click', function () { Quiz.next(); });
    el = document.getElementById('quiz-retry-btn');
    if (el) el.addEventListener('click', function () {
      document.getElementById('quiz-result-screen').classList.remove('visible');
      document.getElementById('quiz-question-screen').classList.remove('active');
      document.getElementById('quiz-start-screen').style.display = 'block';
    });
  });

})();
