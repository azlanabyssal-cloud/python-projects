(function () {
  'use strict';

  /* ── Sound ────────────────────────────────────────────────────────────────── */
  var Sound = {
    ctx: null,
    init: function () {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    },
    play: function (freq, type, dur) {
      if (!this.ctx) return;
      var o = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      o.connect(g); g.connect(this.ctx.destination);
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.18, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      o.start(); o.stop(this.ctx.currentTime + dur);
    },
    correct: function () { this.play(523, 'sine', 0.18); setTimeout(function () { Sound.play(659, 'sine', 0.22); }, 100); },
    wrong:   function () { this.play(220, 'sawtooth', 0.3); },
    click:   function () { this.play(440, 'sine', 0.08); }
  };

  /* ── Creature ─────────────────────────────────────────────────────────────── */
  var Creature = {
    el: null,
    init: function () {
      this.el = document.getElementById('creature4');
      if (!this.el) return;
      this._draw('#4ade80', '--');
    },
    _draw: function (c, eyes) {
      if (!this.el) return;
      this.el.innerHTML =
        '<svg viewBox="0 0 80 80" width="64" height="64">' +
          '<defs><radialGradient id="cGrad4" cx="40%" cy="35%" r="60%">' +
            '<stop offset="0%" stop-color="' + c + '" stop-opacity="0.9"/>' +
            '<stop offset="100%" stop-color="' + c + '" stop-opacity="0.35"/>' +
          '</radialGradient></defs>' +
          '<circle cx="40" cy="40" r="34" fill="url(#cGrad4)" stroke="' + c + '" stroke-width="1.5" stroke-opacity="0.6"/>' +
          '<text x="40" y="46" text-anchor="middle" font-size="18" fill="rgba(255,255,255,0.9)">' + eyes + '</text>' +
        '</svg>';
    },
    react: function (mood) {
      if (!this.el) return;
      var map = { happy: ['#34d399', '^^'], sad: ['#f87171', 'vv'], think: ['#60a5fa', '..'], idle: ['#4ade80', '--'] };
      var s = map[mood] || map.idle;
      this._draw(s[0], s[1]);
      setTimeout(function () { Creature._draw('#4ade80', '--'); }, 2000);
    }
  };

  /* ── RegressionDemo ───────────────────────────────────────────────────────── */
  var RegressionDemo = {
    _g: null, _xSc: null, _ySc: null, _iH: 0,

    init: function () {
      var host = document.getElementById('reg-chart');
      if (!host || typeof d3 === 'undefined') return;

      var W = 420, H = 240, M = { top: 16, right: 22, bottom: 42, left: 46 };
      var iW = W - M.left - M.right, iH = H - M.top - M.bottom;
      this._iH = iH;

      var svg = d3.select(host).append('svg')
        .attr('viewBox', '0 0 ' + W + ' ' + H)
        .style('width', '100%').style('height', 'auto').style('overflow', 'visible');

      var g = svg.append('g').attr('transform', 'translate(' + M.left + ',' + M.top + ')');
      this._g = g;

      this._xSc = d3.scaleLinear().domain([0, 15]).range([0, iW]);
      this._ySc = d3.scaleLinear().domain([0, 105]).range([iH, 0]);

      /* grid */
      g.append('g').attr('transform', 'translate(0,' + iH + ')')
        .call(d3.axisBottom(this._xSc).tickSize(-iH).tickFormat(''))
        .select('.domain').remove();
      g.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.06)');

      /* axes */
      g.append('g').attr('transform', 'translate(0,' + iH + ')')
        .call(d3.axisBottom(this._xSc).ticks(6))
        .selectAll('text').style('fill', 'var(--text-muted)').style('font-size', '11px');
      g.append('g').call(d3.axisLeft(this._ySc).ticks(5))
        .selectAll('text').style('fill', 'var(--text-muted)').style('font-size', '11px');

      /* axis labels */
      g.append('text').attr('x', iW / 2).attr('y', iH + 36)
        .attr('text-anchor', 'middle').style('fill', 'var(--text-muted)').style('font-size', '11px')
        .text('Study Hours (hrs/day)');
      g.append('text').attr('transform', 'rotate(-90)').attr('x', -iH / 2).attr('y', -38)
        .attr('text-anchor', 'middle').style('fill', 'var(--text-muted)').style('font-size', '11px')
        .text('Exam Score');

      /* placeholder message */
      g.append('text').attr('class', 'demo-hint').attr('x', iW / 2).attr('y', iH / 2)
        .attr('text-anchor', 'middle').style('fill', 'var(--text-muted)').style('font-size', '12px')
        .text('Set study hours and click Predict Score →');
    },

    predict: function (hours) {
      var btn = document.getElementById('reg-predict-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Predicting…'; }

      fetch('/demo/linear-regression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: hours })
      })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (btn) { btn.disabled = false; btn.textContent = 'Predict Score'; }
        if (d.error) return;
        RegressionDemo._render(d);
        Creature.react('happy');
        Sound.correct();
      })
      .catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Predict Score'; }
      });
    },

    _render: function (d) {
      var g = this._g, xSc = this._xSc, ySc = this._ySc, iH = this._iH;
      g.selectAll('.demo-hint, .train-pt, .reg-line, .pred-pt, .pred-cross, .pred-lbl').remove();

      /* regression line */
      g.append('line').attr('class', 'reg-line')
        .attr('x1', xSc(d.line_x[0])).attr('y1', ySc(d.line_y[0]))
        .attr('x2', xSc(d.line_x[0])).attr('y2', ySc(d.line_y[0]))
        .attr('stroke', 'var(--teaching)').attr('stroke-width', 2.5).attr('opacity', 0.9)
        .transition().duration(600)
        .attr('x2', xSc(d.line_x[1])).attr('y2', ySc(d.line_y[1]));

      /* training points */
      d.train_x.forEach(function (x, i) {
        g.append('circle').attr('class', 'train-pt')
          .attr('cx', xSc(x)).attr('cy', ySc(d.train_y[i]))
          .attr('r', 0).attr('fill', '#3b82f6').attr('fill-opacity', 0.85)
          .attr('stroke', '#1d4ed8').attr('stroke-width', 1)
          .transition().delay(i * 45).duration(250).attr('r', 5.5);
      });

      /* crosshairs */
      g.append('line').attr('class', 'pred-cross')
        .attr('x1', xSc(d.hours)).attr('y1', iH)
        .attr('x2', xSc(d.hours)).attr('y2', ySc(d.prediction))
        .attr('stroke', '#4ade80').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3').attr('opacity', 0.7);
      g.append('line').attr('class', 'pred-cross')
        .attr('x1', 0).attr('y1', ySc(d.prediction))
        .attr('x2', xSc(d.hours)).attr('y2', ySc(d.prediction))
        .attr('stroke', '#4ade80').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3').attr('opacity', 0.7);

      /* prediction dot */
      g.append('circle').attr('class', 'pred-pt')
        .attr('cx', xSc(d.hours)).attr('cy', ySc(d.prediction))
        .attr('r', 0).attr('fill', '#4ade80').attr('stroke', '#16a34a').attr('stroke-width', 2)
        .transition().delay(620).duration(300).attr('r', 9);

      /* prediction label */
      var lblX = xSc(d.hours) + (d.hours > 11 ? -60 : 14);
      g.append('text').attr('class', 'pred-lbl')
        .attr('x', lblX).attr('y', ySc(d.prediction) - 10)
        .style('fill', '#4ade80').style('font-size', '12px').style('font-weight', '700')
        .text(d.prediction + ' pts');

      /* compute metrics */
      var yBar = d.train_y.reduce(function (a, b) { return a + b; }, 0) / d.train_y.length;
      var ssTot = d.train_y.reduce(function (s, y) { return s + (y - yBar) * (y - yBar); }, 0);
      var ssRes = d.train_x.reduce(function (s, x, i) {
        var p = d.slope * x + d.intercept; return s + (d.train_y[i] - p) * (d.train_y[i] - p);
      }, 0);
      var r2   = (1 - ssRes / ssTot).toFixed(3);
      var rmse = Math.sqrt(ssRes / d.train_x.length).toFixed(2);

      /* update stat boxes */
      var els = { 'reg-score': d.prediction, 'reg-slope': d.slope, 'reg-intercept': d.intercept, 'reg-r2': r2, 'reg-rmse': rmse };
      Object.keys(els).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = els[id];
      });
      var res = document.getElementById('reg-result');
      if (res) res.style.display = 'grid';
    }
  };

  /* ── AssumptionViz ────────────────────────────────────────────────────────── */
  var AssumptionViz = {
    _seed: 0,
    _rand: function () {
      this._seed = (this._seed * 1664525 + 1013904223) & 0x7fffffff;
      return this._seed / 0x7fffffff;
    },
    _pts: function (key) {
      this._seed = 99;
      var n = 28;
      var pts = [];
      for (var i = 0; i < n; i++) {
        var fx = i / (n - 1);
        var r  = this._rand();
        if (key === 'good')    pts.push({ x: fx, y: (r - 0.5) * 0.7 });
        if (key === 'nonlin')  pts.push({ x: fx, y: (fx - 0.5) * (fx - 0.5) * 2.4 - 0.18 + (r - 0.5) * 0.14 });
        if (key === 'hetero')  pts.push({ x: fx, y: (r - 0.5) * fx * 2.2 });
        if (key === 'autocor') pts.push({ x: fx, y: fx * 0.7 - 0.25 + (r - 0.5) * 0.16 });
      }
      return pts;
    },

    init: function () { this.draw('good'); },

    draw: function (key) {
      var host = document.getElementById('assump-chart');
      if (!host || typeof d3 === 'undefined') return;
      host.innerHTML = '';

      var colors = { good: '#4ade80', nonlin: '#f87171', hetero: '#fb923c', autocor: '#c084fc' };
      var pts    = this._pts(key);
      var color  = colors[key];

      var W = 380, H = 165, M = { top: 12, right: 14, bottom: 36, left: 42 };
      var iW = W - M.left - M.right, iH = H - M.top - M.bottom;

      var svg = d3.select(host).append('svg')
        .attr('viewBox', '0 0 ' + W + ' ' + H)
        .style('width', '100%').style('height', 'auto');
      var g = svg.append('g').attr('transform', 'translate(' + M.left + ',' + M.top + ')');

      var xSc = d3.scaleLinear().domain([0, 1]).range([0, iW]);
      var ySc = d3.scaleLinear().domain([-1, 1]).range([iH, 0]);

      /* zero line */
      g.append('line')
        .attr('x1', 0).attr('y1', ySc(0)).attr('x2', iW).attr('y2', ySc(0))
        .attr('stroke', 'rgba(255,255,255,0.18)').attr('stroke-dasharray', '5,3');

      /* axes */
      g.append('g').attr('transform', 'translate(0,' + iH + ')')
        .call(d3.axisBottom(xSc).ticks(4).tickFormat(function (v) { return (v * 100).toFixed(0); }))
        .selectAll('text').style('fill', 'var(--text-muted)').style('font-size', '10px');
      g.append('g').call(d3.axisLeft(ySc).ticks(3))
        .selectAll('text').style('fill', 'var(--text-muted)').style('font-size', '10px');

      g.append('text').attr('x', iW / 2).attr('y', iH + 30)
        .attr('text-anchor', 'middle').style('fill', 'var(--text-muted)').style('font-size', '10px')
        .text('Fitted Values →');
      g.append('text').attr('transform', 'rotate(-90)').attr('x', -iH / 2).attr('y', -30)
        .attr('text-anchor', 'middle').style('fill', 'var(--text-muted)').style('font-size', '10px')
        .text('Residuals');

      /* points */
      g.selectAll('.apt').data(pts).enter().append('circle')
        .attr('class', 'apt')
        .attr('cx', function (d) { return xSc(d.x); })
        .attr('cy', ySc(0)).attr('r', 4.5)
        .attr('fill', color).attr('fill-opacity', 0.8)
        .transition().duration(350).delay(function (_, i) { return i * 12; })
        .attr('cy', function (d) { return ySc(d.y); });

      var descs = {
        good:    '✅ Random scatter around zero — all assumptions satisfied. Linear regression is the right tool.',
        nonlin:  '❌ U-shape — true relationship is non-linear. Fix: add polynomial features (PolynomialFeatures), log-transform the feature, or switch to a tree model.',
        hetero:  '❌ Funnel — heteroscedasticity. Error variance grows with fitted values. Fix: log/sqrt transform the target, or use Weighted Least Squares (WLS).',
        autocor: '❌ Systematic trend — residuals are autocorrelated (not independent). Common in time-series data. Fix: add lag features or use ARIMA/SARIMA.'
      };
      var el = document.getElementById('assump-desc');
      if (el) el.textContent = descs[key] || '';
    }
  };

  /* ── RegularizationViz ────────────────────────────────────────────────────── */
  var RegularizationViz = {
    features: ['exp_years', 'city_tier', 'cgpa', 'noise_1', 'noise_2'],
    models: {
      ols:   [0.68, 0.53, 0.45, 0.31, 0.27],
      ridge: [0.60, 0.47, 0.40, 0.18, 0.14],
      lasso: [0.63, 0.50, 0.43, 0.00, 0.00]
    },
    colors: { ols: '#60a5fa', ridge: '#4ade80', lasso: '#fb923c' },
    _host: null, _xSc: null, _ySc: null, _iH: 0,

    init: function () {
      var host = document.getElementById('reg-viz');
      if (!host || typeof d3 === 'undefined') return;
      this._host = host;

      var W = 420, H = 205, M = { top: 18, right: 18, bottom: 52, left: 52 };
      var iW = W - M.left - M.right, iH = H - M.top - M.bottom;
      this._iH = iH;

      var svg = d3.select(host).append('svg')
        .attr('viewBox', '0 0 ' + W + ' ' + H)
        .style('width', '100%').style('height', 'auto');
      var g = svg.append('g').attr('transform', 'translate(' + M.left + ',' + M.top + ')');

      this._xSc = d3.scaleBand().domain(this.features).range([0, iW]).padding(0.32);
      this._ySc = d3.scaleLinear().domain([0, 0.85]).range([iH, 0]);

      g.append('g').call(d3.axisLeft(this._ySc).ticks(4).tickFormat(function (v) { return v.toFixed(1); }))
        .selectAll('text').style('fill', 'var(--text-muted)').style('font-size', '10px');
      g.append('g').attr('transform', 'translate(0,' + iH + ')')
        .call(d3.axisBottom(this._xSc))
        .selectAll('text').style('fill', 'var(--text-muted)').style('font-size', '10px')
        .attr('transform', 'rotate(-22)').attr('text-anchor', 'end');

      g.append('text').attr('transform', 'rotate(-90)').attr('x', -iH / 2).attr('y', -42)
        .attr('text-anchor', 'middle').style('fill', 'var(--text-muted)').style('font-size', '10px')
        .text('|Coefficient value|');

      var self = this;
      var vals  = this.models.ols;
      var color = this.colors.ols;

      g.selectAll('.rbar').data(this.features).enter().append('rect')
        .attr('class', 'rbar')
        .attr('x', function (d) { return self._xSc(d); })
        .attr('width', this._xSc.bandwidth())
        .attr('y', iH).attr('height', 0).attr('rx', 3).attr('fill', color)
        .transition().duration(500).delay(function (_, i) { return i * 55; })
        .attr('y', function (d, i) { return self._ySc(vals[i]); })
        .attr('height', function (d, i) { return iH - self._ySc(vals[i]); });

      g.selectAll('.zero-lbl').data(this.features).enter().append('text')
        .attr('class', 'zero-lbl')
        .attr('x', function (d) { return self._xSc(d) + self._xSc.bandwidth() / 2; })
        .attr('y', self._ySc(0.03))
        .attr('text-anchor', 'middle').style('font-size', '10px').style('font-weight', '700')
        .style('fill', '#ef4444').style('opacity', 0).text('= 0');
    },

    show: function (modelKey) {
      if (!this._host) return;
      var vals  = this.models[modelKey];
      var color = this.colors[modelKey];
      var self  = this;
      var iH    = this._iH;

      d3.select(this._host).selectAll('.rbar').data(this.features)
        .transition().duration(450)
        .attr('fill', color)
        .attr('y', function (d, i) { return self._ySc(vals[i]); })
        .attr('height', function (d, i) { return iH - self._ySc(vals[i]); });

      d3.select(this._host).selectAll('.zero-lbl').data(this.features)
        .transition().duration(350)
        .style('opacity', function (d, i) { return (modelKey === 'lasso' && vals[i] === 0) ? 1 : 0; });
    }
  };

  /* ── Quiz ─────────────────────────────────────────────────────────────────── */
  var Quiz = {
    data: [], idx: 0, score: 0, answered: false, timer: null, timeLeft: 30,

    start: function () {
      this.idx = 0; this.score = 0; this.answered = false;
      var ss = document.getElementById('quiz-start-screen');
      var qs = document.getElementById('quiz-question-screen');
      if (ss) ss.classList.remove('active');
      if (qs) qs.classList.add('active');
      this._show();
    },

    _show: function () {
      if (this.idx >= this.data.length) { this._result(); return; }
      this.answered = false;
      var q = this.data[this.idx];
      var numEl = document.getElementById('quiz-num');
      var qEl   = document.getElementById('quiz-q-text');
      var expEl = document.getElementById('quiz-explanation');
      var nxtEl = document.getElementById('quiz-next-btn');
      if (numEl) numEl.textContent = (this.idx + 1) + ' / ' + this.data.length;
      if (qEl)   qEl.textContent   = q.question;
      if (expEl) { expEl.style.display = 'none'; expEl.textContent = ''; }
      if (nxtEl) nxtEl.style.display = 'none';

      var optEl = document.getElementById('quiz-options');
      optEl.innerHTML = '';
      q.options.forEach(function (opt, i) {
        var btn = document.createElement('button');
        btn.className = 'quiz-opt'; btn.textContent = opt;
        btn.addEventListener('click', function () { Quiz._pick(i); });
        optEl.appendChild(btn);
      });
      this._startTimer();
    },

    _pick: function (i) {
      if (this.answered) return;
      this.answered = true;
      clearInterval(this.timer);
      var q       = this.data[this.idx];
      var correct = i === q.answer;
      if (correct) { this.score++; Sound.correct(); Creature.react('happy'); }
      else          { Sound.wrong();   Creature.react('sad'); }

      document.querySelectorAll('.quiz-opt').forEach(function (btn, j) {
        btn.disabled = true;
        if (j === q.answer) btn.classList.add('correct');
        else if (j === i)   btn.classList.add('wrong');
      });

      var expEl = document.getElementById('quiz-explanation');
      if (expEl) { expEl.textContent = q.explanation; expEl.style.display = 'block'; }
      var nxtEl = document.getElementById('quiz-next-btn');
      if (nxtEl) nxtEl.style.display = 'inline-block';

      fetch('/quiz/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: 'ml-4', question_idx: this.idx, correct: correct, time_taken: 30 - this.timeLeft })
      }).catch(function () {});
    },

    _startTimer: function () {
      this.timeLeft = 30;
      var barEl  = document.getElementById('quiz-timer-bar');
      var txtEl  = document.getElementById('quiz-timer-text');
      clearInterval(this.timer);
      this.timer = setInterval(function () {
        Quiz.timeLeft--;
        if (txtEl) txtEl.textContent = Quiz.timeLeft + 's';
        if (barEl) barEl.style.width  = (Quiz.timeLeft / 30 * 100) + '%';
        if (Quiz.timeLeft <= 0) { clearInterval(Quiz.timer); if (!Quiz.answered) Quiz._pick(-1); }
      }, 1000);
    },

    next: function () { this.idx++; this._show(); },

    _result: function () {
      var qs = document.getElementById('quiz-question-screen');
      var rs = document.getElementById('quiz-result-screen');
      if (qs) qs.classList.remove('active');
      if (rs) rs.classList.add('visible');

      var pct = Math.round(this.score / this.data.length * 100);
      var el  = document.getElementById('result-score');
      if (el) el.textContent = this.score + ' / ' + this.data.length;
      el = document.getElementById('result-pct');
      if (el) el.textContent = pct + '%';

      var msg = this.score >= 4
        ? '✅ Placement Ready — you can defend linear regression in any interview.'
        : this.score >= 3
        ? '📚 Almost there — review the questions you missed and retry.'
        : '🔁 Revisit the topic and retry — 4/5 before moving on.';
      el = document.getElementById('result-msg');
      if (el) el.textContent = msg;

      fetch('/progress/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: 'ml-4', quiz_score: this.score, quiz_total: this.data.length, completed: this.score >= 4, time_spent: 0 })
      }).catch(function () {});
    },

    retry: function () {
      var rs = document.getElementById('quiz-result-screen');
      var qs = document.getElementById('quiz-question-screen');
      var ss = document.getElementById('quiz-start-screen');
      if (rs) rs.classList.remove('visible');
      if (qs) qs.classList.remove('active');
      if (ss) ss.classList.add('active');
    }
  };

  /* ── Boot ─────────────────────────────────────────────────────────────────── */
  var Boot = {
    init: function () {
      Sound.init();
      Creature.init();
      RegressionDemo.init();
      AssumptionViz.init();
      RegularizationViz.init();

      if (typeof QUIZ_DATA !== 'undefined') Quiz.data = QUIZ_DATA;

      /* hours slider */
      var slider = document.getElementById('hours-slider');
      var valEl  = document.getElementById('hours-val');
      if (slider && valEl) {
        slider.addEventListener('input', function () {
          valEl.textContent = parseFloat(this.value).toFixed(1);
        });
      }

      /* predict button */
      var predBtn = document.getElementById('reg-predict-btn');
      if (predBtn) {
        predBtn.addEventListener('click', function () {
          var h = parseFloat(document.getElementById('hours-slider').value || 5);
          RegressionDemo.predict(h);
        });
      }

      /* assumption tabs */
      document.querySelectorAll('.assump-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          document.querySelectorAll('.assump-tab').forEach(function (b) { b.classList.remove('assump-tab--active'); });
          btn.classList.add('assump-tab--active');
          AssumptionViz.draw(btn.dataset.key);
          Sound.click();
        });
      });

      /* regularization buttons */
      document.querySelectorAll('.reg-model-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          document.querySelectorAll('.reg-model-btn').forEach(function (b) { b.classList.remove('reg-btn--active'); });
          btn.classList.add('reg-btn--active');
          RegularizationViz.show(btn.dataset.model);
          Sound.click();
        });
      });

      /* quiz */
      var startBtn = document.getElementById('quiz-start-btn');
      var nextBtn  = document.getElementById('quiz-next-btn');
      var retryBtn = document.getElementById('quiz-retry-btn');
      if (startBtn) startBtn.addEventListener('click', function () { Quiz.start(); });
      if (nextBtn)  nextBtn.addEventListener('click',  function () { Quiz.next();  });
      if (retryBtn) retryBtn.addEventListener('click', function () { Quiz.retry(); });
    }
  };

  document.addEventListener('DOMContentLoaded', Boot.init.bind(Boot));
})();
