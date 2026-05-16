/*
 * Topic 3 — Exploratory Data Analysis
 * Audio · SVG Creature · EDA Explorer · Distribution Viz · Quiz
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
      success: function () { [523,659,784,1047].forEach(function(f,i){ tone(f,'sine',0.28,0.2,i*0.13); }); },
      wrong:   function () { tone(220,'sawtooth',0.15,0.15); tone(180,'sawtooth',0.10,0.12,0.09); },
      step:    function () { tone(480,'sine',0.05,0.07); },
      tab:     function () { tone(600,'sine',0.06,0.1); }
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
        '<defs><radialGradient id="cGrad3" cx="38%" cy="32%" r="70%">' +
        '<stop offset="0%" stop-color="#a5b4fc"/><stop offset="100%" stop-color="#6366f1"/>' +
        '</radialGradient></defs>' +
        '<ellipse cx="50" cy="60" rx="39" ry="34" fill="#818cf8" opacity="0.15"/>' +
        '<ellipse cx="50" cy="59" rx="37" ry="32" fill="url(#cGrad3)"/>' +
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
        say('EDA is detective work — explore before you model!', 3500);
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


  // ── EDA Explorer — 4-tab interactive dataset viewer ──────────────────────────
  var EDAExplorer = (function () {

    var TABLE_ROWS = [
      ['Spice Garden', '28',  '4.5', '₹320'],
      ['Pizza Palace', '35',  '3.8', '₹580'],
      ['Sushi Zen',    '22',  '4.8', '₹240'],
      ['Chai Corner',  '41',  '3.1', '₹690'],
      ['Burger Lab',   '31',  '4.2', '₹430'],
      ['Dosa House',   '19',  '4.9', '₹180'],
      ['Kebab King',   '48',  '3.5', '₹750']
    ];
    var TABLE_HEADERS = ['Restaurant', 'Delivery (min)', 'Rating', 'Order Value'];

    var STATS_ROWS = [
      ['count', '100',   '98',   '100'],
      ['mean',  '34.2',  '4.10', '₹482'],
      ['std',   '11.3',  '0.62', '₹198'],
      ['min',   '14',    '1.8',  '₹80'],
      ['25%',   '26',    '3.70', '₹320'],
      ['50%',   '32',    '4.20', '₹450'],
      ['75%',   '41',    '4.60', '₹610'],
      ['max',   '9,999', '5.0',  '₹1,240']
    ];
    var STATS_HEADERS = ['Stat', 'Delivery (min)', 'Rating', 'Order'];

    var HIST_BINS   = [8, 24, 30, 20, 10, 4, 2, 1, 1];
    var HIST_LABELS = ['10-20','20-30','30-40','40-50','50-60','60-70','70-80','80-90','90-100'];
    /* IQR fence: Q1=26, Q3=41, IQR=15, upper fence = 41 + 1.5×15 = 63.5 min */
    var FENCE_LO = 3.5, FENCE_HI = 63.5;

    var CORR_FEATS  = ['Delivery', 'Rating', 'Order'];
    var CORR_MATRIX = [
      [1.00, -0.68,  0.35],
      [-0.68, 1.00,  0.42],
      [0.35,  0.42,  1.00]
    ];
    var CORR_INTERP = [
      ['Always 1.00 — perfect self-correlation. Every feature correlates with itself.',
       'r = −0.68  (moderate negative). Slower deliveries tend to get lower ratings. Meaningful signal — delivery_time is predictive of rating. Not enough to call causal.',
       'r = +0.35  (weak positive). Larger orders take slightly longer — possibly from farther restaurants. Weak, but keep the feature.'],
      ['r = −0.68  (moderate negative). Same relationship. Symmetric matrix — rows and columns are identical.',
       'Always 1.00 — perfect self-correlation.',
       'r = +0.42  (moderate positive). Higher-rated restaurants get larger orders. Probably premium restaurants. Not alarming — well below the ±0.8 multicollinearity threshold.'],
      ['r = +0.35  (weak positive). Same relationship. Symmetric matrix.',
       'r = +0.42  (moderate positive). Same relationship. Symmetric matrix.',
       'Always 1.00 — perfect self-correlation.']
    ];

    var canvasEl;

    var TAB_MSGS = {
      table:     '7 restaurants, 4 features. Looks tidy — but stats will reveal the truth.',
      stats:     'Spot it? max=9,999 min delivery. Type it in the checker below to see why it\'s an outlier!',
      histogram: 'Right-skewed peak at 30-40 min. Red fence at 63.5 min — anything past it gets investigated.',
      heatmap:   'Click any cell to understand what the correlation actually means in plain English.'
    };

    function init(canvasId) {
      canvasEl = document.getElementById(canvasId);
      if (!canvasEl) return;
      render('table');
      Creature.say('Same dataset, 4 views. Each tab reveals something new!', 4000);
    }

    function render(tab) {
      if (!canvasEl) return;
      Sound.tab();
      Creature.say(TAB_MSGS[tab] || '', 4500);
      if (tab === 'table') {
        canvasEl.innerHTML = buildTable();
      } else if (tab === 'stats') {
        canvasEl.innerHTML = buildStats();
        wireOutlierChecker();
      } else if (tab === 'histogram') {
        canvasEl.innerHTML = '<div id="hist-d3" style="width:100%;"></div>';
        drawHistogramD3('hist-d3');
      } else if (tab === 'heatmap') {
        canvasEl.innerHTML = buildHeatmap();
        wireHeatmapClicks();
      }
    }

    function buildTable() {
      var html = '<div style="overflow-x:auto;padding:0.5rem;">';
      html += '<p style="font-size:var(--t-xs);color:var(--text-muted);margin-bottom:0.5rem;">Swiggy dataset — 7 of 100 orders · <code>df.head(7)</code></p>';
      html += '<table class="data-hospital-table"><thead><tr>';
      TABLE_HEADERS.forEach(function (h) { html += '<th class="dh-th">' + h + '</th>'; });
      html += '</tr></thead><tbody>';
      TABLE_ROWS.forEach(function (row) {
        html += '<tr class="dh-tr">';
        row.forEach(function (cell) { html += '<td class="dh-td">' + cell + '</td>'; });
        html += '</tr>';
      });
      html += '</tbody></table>';
      html += '<p style="margin-top:0.75rem;font-size:var(--t-xs);color:var(--text-muted);">Looks clean. No obvious errors. <strong>Switch to Stats</strong> — <code>df.describe()</code> will surface what head() hides.</p>';
      html += '</div>';
      return html;
    }

    function buildStats() {
      var html = '<div style="padding:0.5rem;">';
      html += '<div style="overflow-x:auto;">';
      html += '<p style="font-size:var(--t-xs);color:var(--text-muted);margin-bottom:0.5rem;"><code>df.describe()</code> — full 100-order dataset</p>';
      html += '<table class="data-hospital-table"><thead><tr>';
      STATS_HEADERS.forEach(function (h) { html += '<th class="dh-th">' + h + '</th>'; });
      html += '</tr></thead><tbody>';
      STATS_ROWS.forEach(function (row, ri) {
        var isMax = ri === 7;
        html += '<tr class="dh-tr" style="' + (isMax ? 'background:rgba(239,68,68,0.1);' : '') + '">';
        row.forEach(function (cell, ci) {
          var flag = isMax && ci === 1;
          html += '<td class="dh-td" style="' + (flag ? 'color:#ef4444;font-weight:700;' : '') + '">' + cell + (flag ? ' ⚡' : '') + '</td>';
        });
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      /* Outlier Checker */
      html += '<div style="margin-top:1rem;padding:0.75rem 1rem;background:var(--bg-elevated);border:1px solid var(--border-strong);border-radius:var(--radius-sm);">';
      html += '<div style="font-size:var(--t-xs);font-weight:700;color:var(--text-muted);margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:0.8px;">⚡ Outlier Detector — test any delivery time</div>';
      html += '<div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">';
      html += '<input type="number" id="outlier-input" placeholder="e.g. 9999 or 52" min="0" max="10000" ' +
        'style="flex:1;min-width:110px;max-width:150px;padding:0.4rem 0.65rem;background:var(--bg-surface);' +
        'border:1px solid var(--border-strong);color:var(--text-primary);border-radius:var(--radius-sm);' +
        'font-family:var(--font-code);font-size:13px;">';
      html += '<button id="outlier-check-btn" class="btn btn--sm btn--teaching">Check →</button>';
      html += '</div>';
      html += '<div id="outlier-result" style="margin-top:0.6rem;font-size:var(--t-xs);line-height:1.6;min-height:1.2em;"></div>';
      html += '</div>';
      html += '</div>';
      return html;
    }

    function wireOutlierChecker() {
      var btn = document.getElementById('outlier-check-btn');
      var inp = document.getElementById('outlier-input');
      var res = document.getElementById('outlier-result');
      if (!btn || !inp || !res) return;

      function check() {
        var val = parseFloat(inp.value);
        if (isNaN(val) || inp.value.trim() === '') {
          res.innerHTML = '<span style="color:#6b7280;">Enter a number and press Check →</span>';
          return;
        }
        if (val > FENCE_HI) {
          var severity = val > 500 ? 'Almost certainly a data entry error (missing digit? placeholder value?).' : 'Extreme outlier. Investigate the source.';
          res.innerHTML =
            '<span style="color:#ef4444;font-weight:700;">⚡ OUTLIER</span> — ' + val +
            ' min &gt; IQR upper fence of <strong>' + FENCE_HI + ' min</strong>. ' + severity +
            ' <span style="color:var(--text-muted);">Recommended: cap at ' + FENCE_HI + ' or add binary <code>delivery_extreme</code> flag.</span>';
          Sound.wrong();
          Creature.say(val + ' min is way outside normal range — definitely investigate!', 3500);
        } else if (val < FENCE_LO || val < 0) {
          res.innerHTML =
            '<span style="color:#f59e0b;font-weight:700;">⚡ LOW OUTLIER</span> — ' + val +
            ' min &lt; lower fence of <strong>' + FENCE_LO + ' min</strong>. Check for data errors (can a delivery be this fast?).';
          Sound.wrong();
        } else {
          var pctile = val <= 26 ? '~25th' : val <= 32 ? '~50th' : val <= 41 ? '~75th' : '~85th';
          res.innerHTML =
            '<span style="color:#22c55e;font-weight:700;">✓ Normal range</span> — ' + val +
            ' min is within the IQR fence [' + FENCE_LO + ', ' + FENCE_HI + ' min]. Approximately ' + pctile + ' percentile. Keep it.';
          Sound.pop();
          Creature.say(val + ' min — within the normal range. No action needed.', 2500);
        }
      }

      btn.addEventListener('click', check);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
    }

    function drawHistogramD3(containerId) {
      var container = document.getElementById(containerId);
      if (!container || typeof d3 === 'undefined') return;
      var W   = Math.max(container.getBoundingClientRect().width || 400, 280);
      var H   = 195;
      var pad = { l: 28, r: 12, t: 28, b: 42 };
      var cW  = W - pad.l - pad.r;
      var cH  = H - pad.t - pad.b;

      var xSc = d3.scaleBand().domain(d3.range(HIST_BINS.length)).range([0, cW]).padding(0.12);
      var ySc = d3.scaleLinear().domain([0, d3.max(HIST_BINS) * 1.18]).range([cH, 0]);

      /* IQR fence position: 63.5 min. Bins start at 10, width 10.
         Bin 5 covers 60-70. Fence at 63.5 = 35% into bin 5. */
      var fenceX = xSc(5) + 0.35 * xSc.bandwidth();

      var svg = d3.select('#' + containerId).append('svg')
        .attr('viewBox', '0 0 ' + W + ' ' + H)
        .attr('width', '100%').attr('height', H)
        .attr('overflow', 'visible');

      svg.append('text')
        .attr('x', pad.l + cW / 2).attr('y', 16)
        .attr('text-anchor', 'middle').attr('fill', '#9ca3af').attr('font-size', '10px')
        .text('Delivery Time Distribution — 100 orders (9,999 outlier removed)');

      var g = svg.append('g').attr('transform', 'translate(' + pad.l + ',' + pad.t + ')');

      /* Outlier zone shade */
      g.append('rect')
        .attr('x', fenceX).attr('y', 0)
        .attr('width', Math.max(0, cW - fenceX)).attr('height', cH)
        .attr('fill', '#ef4444').attr('opacity', 0.06).attr('rx', 2);

      /* Bars */
      HIST_BINS.forEach(function (v, i) {
        var isPast = (i >= 6);
        var color  = isPast ? '#f59e0b' : '#818cf8';
        var bH     = Math.max(2, cH - ySc(v));
        g.append('rect')
          .attr('x', xSc(i)).attr('y', ySc(v))
          .attr('width', xSc.bandwidth()).attr('height', bH)
          .attr('fill', color).attr('rx', 3).attr('opacity', 0)
          .transition().duration(420).delay(i * 50)
          .attr('opacity', isPast ? 0.92 : 0.80);
        g.append('text')
          .attr('x', xSc(i) + xSc.bandwidth() / 2).attr('y', ySc(v) - 4)
          .attr('text-anchor', 'middle').attr('fill', color)
          .attr('font-size', '9px').attr('font-weight', '700').attr('opacity', 0)
          .transition().duration(420).delay(i * 50)
          .attr('opacity', 1).text(v);
      });

      /* IQR fence line */
      g.append('line')
        .attr('x1', fenceX).attr('x2', fenceX)
        .attr('y1', 0).attr('y2', cH)
        .attr('stroke', '#ef4444').attr('stroke-width', 1.8)
        .attr('stroke-dasharray', '4,3').attr('opacity', 0.85);
      g.append('text')
        .attr('x', fenceX + 4).attr('y', 11)
        .attr('fill', '#ef4444').attr('font-size', '8.5px').attr('font-weight', '700')
        .text('IQR fence');
      g.append('text')
        .attr('x', fenceX + 4).attr('y', 21)
        .attr('fill', '#ef4444').attr('font-size', '8px').text('63.5 min');

      /* X-axis labels */
      g.append('g').attr('transform', 'translate(0,' + cH + ')')
        .selectAll('text').data(HIST_LABELS).enter().append('text')
        .attr('x', function (d, i) { return xSc(i) + xSc.bandwidth() / 2; })
        .attr('y', 13).attr('text-anchor', 'middle')
        .attr('fill', '#6b7280').attr('font-size', '8px')
        .text(function (d) { return d; });

      svg.append('text')
        .attr('x', pad.l + cW / 2).attr('y', H - 4)
        .attr('text-anchor', 'middle').attr('fill', '#9ca3af').attr('font-size', '9px')
        .text('Orange bars + shaded zone = outlier tail. Investigate every value past the red fence.');
    }

    function buildHeatmap() {
      function cellColor(v) {
        if (v >= 0.8)  return '#166534';
        if (v >= 0.4)  return '#16a34a';
        if (v > -0.2)  return '#374151';
        if (v > -0.5)  return '#dc2626';
        return '#991b1b';
      }
      var html = '<div style="padding:0.5rem;">';
      html += '<p style="font-size:var(--t-xs);color:var(--text-muted);margin-bottom:0.75rem;">Pearson Correlation Matrix · <strong style="color:var(--primary);">click any cell</strong> for plain-English interpretation</p>';
      html += '<div style="overflow-x:auto;"><table style="border-collapse:separate;border-spacing:4px;">';
      html += '<tr><td></td>';
      CORR_FEATS.forEach(function (f) {
        html += '<th style="padding:0.4rem 0.7rem;color:var(--text-muted);font-size:var(--t-xs);text-align:center;">' + f + '</th>';
      });
      html += '</tr>';
      CORR_MATRIX.forEach(function (row, i) {
        html += '<tr>';
        html += '<th style="padding:0.4rem 0.7rem;color:var(--text-muted);font-size:var(--t-xs);text-align:right;white-space:nowrap;">' + CORR_FEATS[i] + '</th>';
        row.forEach(function (v, j) {
          var diag = (i === j);
          html += '<td class="corr-cell" data-i="' + i + '" data-j="' + j + '" ' +
            'style="padding:0.7rem 1rem;text-align:center;background:' + cellColor(v) +
            ';border-radius:6px;font-weight:700;font-size:var(--t-sm);color:white;min-width:64px;' +
            'cursor:' + (diag ? 'default' : 'pointer') + ';' +
            'border:2px solid transparent;transition:border-color 0.15s;">' +
            (v === 1.00 ? '1.00' : v.toFixed(2)) + '</td>';
        });
        html += '</tr>';
      });
      html += '</table></div>';
      html += '<div id="corr-interp" style="display:none;margin-top:0.75rem;padding:0.65rem 1rem;' +
        'background:var(--bg-elevated);border-left:3px solid var(--teaching);' +
        'border-radius:0 var(--radius-sm) var(--radius-sm) 0;font-size:var(--t-xs);' +
        'color:var(--text-secondary);line-height:1.7;"></div>';
      html += '</div>';
      return html;
    }

    function wireHeatmapClicks() {
      document.querySelectorAll('.corr-cell').forEach(function (cell) {
        var i = parseInt(cell.dataset.i);
        var j = parseInt(cell.dataset.j);
        if (i === j) return;
        cell.addEventListener('click', function () {
          document.querySelectorAll('.corr-cell').forEach(function (c) {
            c.style.borderColor = 'transparent';
          });
          cell.style.borderColor = 'var(--teaching)';
          var panel = document.getElementById('corr-interp');
          if (panel) {
            panel.textContent = CORR_INTERP[i][j];
            panel.style.display = 'block';
          }
          Sound.pop();
          Creature.say('r=' + CORR_MATRIX[i][j].toFixed(2) + ': ' + CORR_FEATS[i] + ' vs ' + CORR_FEATS[j], 3500);
        });
      });
    }

    return { init: init, render: render };
  })();


  // ── DistributionViz — D3 bar chart for distribution shapes ──────────────────
  var DistributionViz = (function () {
    var svgEl = null, W = 500, H = 200;

    var SHAPES = {
      normal: {
        bins:  [2, 6, 14, 20, 20, 14, 6, 2],
        labels:['15-20','20-25','25-30','30-35','35-40','40-45','45-50','50-55'],
        title: 'Normal — Symmetric (delivery time, large samples)',
        note:  'Mean ≈ Median ≈ Mode. Use mean and std. Arises when many small random factors add up (Central Limit Theorem).',
        color: '#818cf8',
        curve: true
      },
      right: {
        bins:  [20, 15, 10, 7, 4, 2, 1, 1],
        labels:['0-5L','5-10L','10-15L','15-20L','20-25L','25-30L','30-35L','35-40L'],
        title: 'Right-Skewed — Long right tail (salary, revenue)',
        note:  'Mode < Median < Mean. Most earn less; a few earn enormously. Use median. Apply log transform to normalise.',
        color: '#f59e0b',
        curve: false
      },
      left: {
        bins:  [1, 1, 2, 4, 7, 10, 15, 20],
        labels:['<30','30-40','40-50','50-60','60-70','70-80','80-90','90-100'],
        title: 'Left-Skewed — Long left tail (exam scores near ceiling)',
        note:  'Mean < Median < Mode. Most score high; a few fail badly. Use median. Check for floor or ceiling effects.',
        color: '#22d3ee',
        curve: false
      },
      bimodal: {
        bins:  [5, 12, 8, 2, 2, 8, 12, 5],
        labels:['11h','12h','13h','14h','17h','18h','19h','20h'],
        title: 'Bimodal — Two peaks (lunch + dinner order times)',
        note:  'Two distinct sub-populations mixed in one feature. Segment by time before modelling — do not treat as one group.',
        color: '#f472b6',
        curve: false
      }
    };

    function init(canvasId) {
      var container = document.getElementById(canvasId);
      if (!container) return;
      container.innerHTML = '';
      var rect = container.getBoundingClientRect();
      W = Math.max(rect.width || 500, 280);
      svgEl = d3.select('#' + canvasId)
        .append('svg')
        .attr('viewBox', '0 0 ' + W + ' ' + H)
        .attr('width', '100%')
        .attr('height', H)
        .attr('overflow', 'visible');
      draw('normal');
    }

    function draw(shape) {
      if (!svgEl) return;
      svgEl.selectAll('*').remove();
      var s    = SHAPES[shape];
      var data = s.bins;
      var pad  = { l: 8, r: 8, t: 30, b: 52 };
      var cW   = W - pad.l - pad.r;
      var cH   = H - pad.t - pad.b;

      var xSc = d3.scaleBand().domain(d3.range(data.length)).range([0, cW]).padding(0.15);
      var ySc = d3.scaleLinear().domain([0, d3.max(data) * 1.12]).range([cH, 0]);

      svgEl.append('text')
        .attr('x', pad.l + cW / 2).attr('y', 18)
        .attr('text-anchor', 'middle').attr('fill', s.color)
        .attr('font-size', '10px').attr('font-weight', '600')
        .text(s.title);

      var g = svgEl.append('g').attr('transform', 'translate(' + pad.l + ',' + pad.t + ')');

      data.forEach(function (v, i) {
        var bH = Math.max(2, cH - ySc(v));
        g.append('rect')
          .attr('x', xSc(i)).attr('y', ySc(v))
          .attr('width', xSc.bandwidth()).attr('height', bH)
          .attr('fill', s.color).attr('rx', 3).attr('opacity', 0)
          .transition().duration(400).delay(i * 55)
          .attr('opacity', 0.82);
      });

      g.append('g').attr('transform', 'translate(0,' + cH + ')')
        .selectAll('text').data(s.labels).enter().append('text')
        .attr('x', function (d, i) { return xSc(i) + xSc.bandwidth() / 2; })
        .attr('y', 14)
        .attr('text-anchor', 'middle').attr('fill', '#6b7280').attr('font-size', '8px')
        .text(function (d) { return d; });

      if (s.curve) {
        var line = d3.line()
          .x(function (d, i) { return xSc(i) + xSc.bandwidth() / 2; })
          .y(function (d) { return ySc(d); })
          .curve(d3.curveCatmullRom);
        g.append('path').datum(data)
          .attr('fill', 'none').attr('stroke', s.color)
          .attr('stroke-width', 2.5).attr('opacity', 0.55)
          .attr('d', line);
      }

      svgEl.append('text')
        .attr('x', pad.l + cW / 2).attr('y', H - 6)
        .attr('text-anchor', 'middle').attr('fill', '#9ca3af').attr('font-size', '9px')
        .text(s.note.length > 90 ? s.note.substring(0, 90) + '…' : s.note);
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
      document.getElementById('quiz-num').textContent    = (cur + 1) + ' / ' + qs.length;
      document.getElementById('quiz-q-text').textContent = q.question;
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
      if (ok) { score++; Sound.success(); Creature.setState('celebrate'); Creature.say('Correct! That\'s EDA thinking!', 2500); }
      else     { Sound.wrong(); Creature.say('Not quite — read the explanation carefully.', 3000); }
      Abyss.Api.post('/quiz/attempt', { topic_id: 'ml-3', question_idx: cur, correct: ok, time_taken: taken }).catch(function () {});
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
        pct === 100 ? 'Perfect. You own EDA. Move on.' :
        pct >= 80   ? 'Strong. Review what you missed.' :
        pct >= 60   ? 'Decent. Re-read explanations, then retry.' :
        'Keep at it. Re-read every explanation, then retry.';
      if (pct >= 80) { Sound.success(); Creature.setState('celebrate'); Creature.say(pct === 100 ? 'PERFECT! EDA mastered!' : 'Great score!', 4000); }
      var tt = times.reduce(function (a, b) { return a + b; }, 0);
      Abyss.Progress.save('ml-3', { completed: score >= 3, quiz_score: score, quiz_total: qs.length, time_spent: tt });
    }

    return { init: init, next: next };
  })();


  // ── Boot ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    Creature.init('eda-wrapper');
    EDAExplorer.init('eda-canvas');
    DistributionViz.init('dist-canvas');
    if (typeof QUIZ_DATA !== 'undefined') Quiz.init(QUIZ_DATA);

    /* EDA tab buttons */
    var firstTab = document.querySelector('.eda-tab');
    if (firstTab) firstTab.classList.add('eda-tab--active');
    document.querySelectorAll('.eda-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.eda-tab').forEach(function (b) { b.classList.remove('eda-tab--active'); });
        btn.classList.add('eda-tab--active');
        EDAExplorer.render(btn.dataset.tab);
      });
    });

    /* Distribution shape buttons */
    var firstDist = document.querySelector('.dist-btn');
    if (firstDist) firstDist.classList.add('dist-btn--active');
    document.querySelectorAll('.dist-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.dist-btn').forEach(function (b) { b.classList.remove('dist-btn--active'); });
        btn.classList.add('dist-btn--active');
        DistributionViz.draw(btn.dataset.shape);
        Sound.step();
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
