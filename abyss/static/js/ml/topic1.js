/*
 * Topic 1 — What is Machine Learning
 * Audio · SVG Creature · Email spam sorter · People clustering · RL maze game
 */

(function () {
  'use strict';

  // ── Audio — procedural sounds via Web Audio API ───────────────────────────────
  var Sound = (function () {
    var ctx = null;

    function ac() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }

    function tone(freq, type, dur, vol, delay) {
      var a = ac();
      var osc = a.createOscillator();
      var g   = a.createGain();
      osc.connect(g);
      g.connect(a.destination);
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      var t = a.currentTime + (delay || 0);
      g.gain.setValueAtTime(vol || 0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur);
    }

    return {
      pop:      function () { tone(700, 'sine', 0.08, 0.2); tone(900, 'sine', 0.05, 0.12, 0.05); },
      spam:     function () { tone(200, 'sawtooth', 0.12, 0.18); tone(160, 'sawtooth', 0.08, 0.12, 0.07); },
      ham:      function () { tone(523, 'sine', 0.10, 0.18); tone(659, 'sine', 0.08, 0.12, 0.07); },
      train:    function () { [220,300,420,600,840].forEach(function (f, i) { tone(f, 'sawtooth', 0.18, 0.12, i * 0.1); }); },
      classify: function () { tone(784, 'sine', 0.12, 0.18); tone(1047, 'sine', 0.10, 0.12, 0.12); },
      cluster:  function (n) { tone(440 + n * 80, 'sine', 0.14, 0.12); },
      step:     function () { tone(480, 'sine', 0.05, 0.07); },
      goal:     function () { [784,1047,1319,1568].forEach(function (f, i) { tone(f, 'sine', 0.3, 0.2, i * 0.1); }); },
      success:  function () { [523,659,784,1047].forEach(function (f, i) { tone(f, 'sine', 0.28, 0.2, i * 0.13); }); },
      wrong:    function () { tone(220, 'sawtooth', 0.15, 0.15); tone(180, 'sawtooth', 0.10, 0.12, 0.09); }
    };
  })();


  // ── Creature — SVG mascot, speech bubble, emotional states ───────────────────
  var Creature = (function () {
    var bubble, bubbleTimer;

    function init(wrapperId) {
      var wrap = document.getElementById(wrapperId);
      if (!wrap) return;

      var div = document.createElement('div');
      div.className = 'creature-wrap';
      div.id = 'ml-creature';

      bubble = document.createElement('div');
      bubble.className = 'creature-bubble';
      bubble.id = 'creature-bubble';

      var ns  = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('class', 'creature-svg');
      svg.setAttribute('id', 'creature-svg');
      svg.innerHTML =
        '<defs>' +
        '  <radialGradient id="cGrad" cx="38%" cy="32%" r="70%">' +
        '    <stop offset="0%" stop-color="#a5b4fc"/>' +
        '    <stop offset="100%" stop-color="#6366f1"/>' +
        '  </radialGradient>' +
        '</defs>' +
        /* body glow */
        '<ellipse cx="50" cy="60" rx="39" ry="34" fill="#818cf8" opacity="0.15"/>' +
        /* body */
        '<ellipse cx="50" cy="59" rx="37" ry="32" fill="url(#cGrad)"/>' +
        /* eyes whites */
        '<circle cx="34" cy="50" r="12" fill="white"/>' +
        '<circle cx="66" cy="50" r="12" fill="white"/>' +
        /* pupils */
        '<circle cx="36" cy="52" r="7" fill="#06060f" class="pupil-l"/>' +
        '<circle cx="68" cy="52" r="7" fill="#06060f" class="pupil-r"/>' +
        /* eye shines */
        '<circle cx="38.5" cy="49.5" r="2.8" fill="rgba(255,255,255,0.95)"/>' +
        '<circle cx="70.5" cy="49.5" r="2.8" fill="rgba(255,255,255,0.95)"/>' +
        /* smile */
        '<path d="M 34 68 Q 50 80 66 68" stroke="#1a1030" stroke-width="2.8" fill="none" stroke-linecap="round" class="creature-mouth"/>' +
        /* antenna */
        '<line x1="50" y1="27" x2="42" y2="8" stroke="#818cf8" stroke-width="2.5" stroke-linecap="round"/>' +
        '<circle cx="40" cy="6" r="6" fill="#22d3ee" class="antenna-dot"/>' +
        '<circle cx="40" cy="6" r="3" fill="white" opacity="0.6"/>' +
        /* legs */
        '<ellipse cx="31" cy="91" rx="12" ry="7" fill="#6366f1" opacity="0.85"/>' +
        '<ellipse cx="69" cy="91" rx="12" ry="7" fill="#6366f1" opacity="0.85"/>' +
        /* arms */
        '<path d="M 13 62 Q 5 45 20 38" stroke="#6366f1" stroke-width="10" stroke-linecap="round" fill="none"/>' +
        '<path d="M 87 62 Q 95 45 80 38" stroke="#6366f1" stroke-width="10" stroke-linecap="round" fill="none"/>';

      svg.addEventListener('click', function () {
        Sound.pop();
        setState('excited');
        say('Hi! I am Abyss — I learn from data, just like a real ML model!', 3500);
      });

      div.appendChild(bubble);
      div.appendChild(svg);
      wrap.appendChild(div);
    }

    function say(text, duration) {
      if (!bubble) return;
      clearTimeout(bubbleTimer);
      bubble.textContent = text;
      bubble.classList.add('visible');
      if (duration) {
        bubbleTimer = setTimeout(function () { bubble.classList.remove('visible'); }, duration);
      }
    }

    function setState(state) {
      var svg = document.getElementById('creature-svg');
      if (!svg) return;
      svg.className = 'creature-svg creature-' + state;
      setTimeout(function () { if (svg) svg.className = 'creature-svg'; }, 1200);
    }

    return { init: init, say: say, setState: setState };
  })();


  // ── Particles — burst of colored dots ────────────────────────────────────────
  var Particles = (function () {
    function burst(containerId, x, y, color, count) {
      var container = document.getElementById(containerId);
      if (!container) return;
      count = count || 8;
      for (var i = 0; i < count; i++) {
        var angle = (Math.PI * 2 * i) / count;
        var speed = 45 + Math.random() * 55;
        var dx = Math.cos(angle) * speed;
        var dy = Math.sin(angle) * speed;
        var size = 5 + Math.random() * 5;
        var p = document.createElement('div');
        p.style.cssText =
          'position:absolute;left:' + (x - size/2) + 'px;top:' + (y - size/2) + 'px;' +
          'width:' + size + 'px;height:' + size + 'px;border-radius:50%;' +
          'background:' + color + ';pointer-events:none;z-index:50;' +
          'transition:transform 0.65s ease-out,opacity 0.65s ease-out;';
        container.appendChild(p);
        /* jshint ignore:start */
        void p.offsetWidth; /* force reflow so transition fires */
        /* jshint ignore:end */
        p.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(0.1)';
        p.style.opacity   = '0';
        setTimeout((function (el) {
          return function () { if (el.parentNode) el.parentNode.removeChild(el); };
        }(p)), 720);
      }
    }
    return { burst: burst };
  })();


  // ── Supervised — email spam sorter ───────────────────────────────────────────
  var SupervisedMode = (function () {

    var EMAILS = [
      { from: 'PrizeClaim.net',            subject: '🎁 YOU WON $5,000 — Claim NOW!',      preview: 'Act immediately before the offer expires', spam: true  },
      { from: 'priya.sharma@work.com',      subject: 'Team lunch this Friday?',              preview: 'Thinking 1pm at the usual place 🍜',        spam: false },
      { from: 'security@acc0unt-alert.net', subject: '⚠️ URGENT: Password expires in 1hr', preview: 'Verify now or your account is suspended',     spam: true  },
      { from: 'github.com',                 subject: 'Your pull request was merged ✓',       preview: 'Great work — your reviewer approved it',     spam: false },
      { from: 'richdeals@promo.biz',        subject: '100% GUARANTEED daily returns!',       preview: 'Risk-free · Zero experience needed',          spam: true  },
      { from: 'mom',                        subject: 'Are you eating properly?',              preview: 'Call me when you can, beta ❤️',               spam: false },
      { from: 'pkg-track52.co',             subject: 'Package HELD — pay ₹150 fee now',     preview: 'Parcel #38472 needs immediate action',        spam: true  },
      { from: 'prof.rao@college.edu',       subject: 'Project submission due Friday',        preview: 'Please submit by 11:59 PM, no extensions',   spam: false },
    ];

    var TEST_EMAILS = [
      { from: 'btc-profit.cc',       subject: 'LIMITED: 200% crypto returns today',    preview: 'Guaranteed profits · 50k winners already', spam: true  },
      { from: 'rahul.v@college.edu', subject: 'Coffee catchup tomorrow?',              preview: 'Library at 3? I have the ML notes!',        spam: false },
      { from: 'royalprice@net.ng',   subject: 'Your $4.5 Million inheritance is ready', preview: 'Reply with your bank details to claim',    spam: true  },
    ];

    var container, cur, spamCount, hamCount, trained, testIdx;

    function init(containerId) {
      container = document.getElementById(containerId);
      if (!container) return;
      cur = 0; spamCount = 0; hamCount = 0; trained = false; testIdx = 0;
      container.style.position = 'relative';
      container.innerHTML = [
        '<div class="email-arena">',
        '  <div class="email-zone email-zone--spam">',
        '    <div class="zone-icon">🔴</div>',
        '    <div class="zone-label">Spam pile</div>',
        '    <div class="zone-count" id="spam-count">0</div>',
        '  </div>',
        '  <div class="email-center" id="sup-email-center"></div>',
        '  <div class="email-zone email-zone--ham">',
        '    <div class="zone-icon">🟢</div>',
        '    <div class="zone-label">Not Spam pile</div>',
        '    <div class="zone-count" id="ham-count">0</div>',
        '  </div>',
        '</div>',
        '<div class="email-progress" id="email-progress">Email 1 of ' + EMAILS.length + '</div>',
      ].join('');

      showEmail();
      Creature.say('Help me learn! Sort the emails — spam or not spam?', 4000);
    }

    function showEmail() {
      var center = document.getElementById('sup-email-center');
      if (!center) return;

      if (cur >= EMAILS.length) {
        center.innerHTML =
          '<div class="email-trained-msg">' +
          '  <div style="font-size:2.8rem;margin-bottom:0.5rem;">🧠</div>' +
          '  <div style="font-weight:700;color:var(--primary);margin-bottom:0.4rem;">All ' + EMAILS.length + ' sorted!</div>' +
          '  <div style="font-size:12px;color:var(--text-muted);">' +
          '    ' + spamCount + ' spam &nbsp;·&nbsp; ' + hamCount + ' not spam<br>' +
          '    The model has seen enough examples.<br>Click Train Model to learn the pattern.' +
          '  </div>' +
          '</div>';
        var btn = document.getElementById('sup-train-btn');
        if (btn) {
          btn.style.animation = 'pulse-primary 1.2s ease-in-out infinite';
          btn.textContent = 'Train Model →';
        }
        Creature.say('I have seen ' + EMAILS.length + ' emails now! Ready to learn the pattern?', 5000);
        return;
      }

      var email = EMAILS[cur];
      var card  = document.createElement('div');
      card.className = 'email-card';
      card.id        = 'current-email';
      card.innerHTML =
        '<div class="email-card__from">From: ' + email.from + '</div>' +
        '<div class="email-card__subject">' + email.subject + '</div>' +
        '<div class="email-card__preview">' + email.preview + '</div>';
      card.style.animation = 'email-slide-in 0.38s cubic-bezier(0.34,1.56,0.64,1) forwards';
      center.innerHTML = '';
      center.appendChild(card);

      var prog = document.getElementById('email-progress');
      if (prog) prog.textContent = 'Email ' + (cur + 1) + ' of ' + EMAILS.length;
    }

    function sort(isSpam) {
      if (cur >= EMAILS.length || trained) return;
      var card = document.getElementById('current-email');
      if (!card) return;

      isSpam ? Sound.spam() : Sound.ham();

      /* particle burst from card centre */
      var rect = card.getBoundingClientRect();
      var cr   = container.getBoundingClientRect();
      var cx   = rect.left - cr.left + rect.width  / 2;
      var cy   = rect.top  - cr.top  + rect.height / 2;
      Particles.burst(container.id, cx, cy, isSpam ? '#ef4444' : '#22c55e', 8);

      card.style.transition = 'transform 0.42s cubic-bezier(0.4,0,1,1), opacity 0.42s';
      if (isSpam) {
        card.style.transform = 'translate(-260px,-70px) rotate(-18deg) scale(0.65)';
        spamCount++;
        document.getElementById('spam-count').textContent = spamCount;
        Creature.say(EMAILS[cur].spam ? 'Correct! That IS spam! 🔴' : 'I would have said not spam... but you are the teacher!', 2200);
      } else {
        card.style.transform = 'translate(260px,-70px) rotate(18deg) scale(0.65)';
        hamCount++;
        document.getElementById('ham-count').textContent = hamCount;
        Creature.say(!EMAILS[cur].spam ? 'Right — legit email! ✓ Noted.' : 'Hmm, that one looked suspicious to me...', 2200);
      }
      card.style.opacity = '0';
      Creature.setState('excited');
      cur++;
      setTimeout(showEmail, 480);
    }

    function train() {
      if (trained || cur < EMAILS.length) return;
      trained = true;
      Sound.train();
      Creature.setState('excited');
      Creature.say('Learning the spam pattern now...', 2500);

      var center = document.getElementById('sup-email-center');
      center.innerHTML =
        '<div class="training-anim">' +
        '  <div class="training-brain">🧠</div>' +
        '  <div class="training-bar-wrap"><div class="training-bar" id="t-bar"></div></div>' +
        '  <div class="training-label" id="t-label">Analysing patterns...</div>' +
        '</div>';

      var phases = ['Analysing patterns...', 'Computing decision boundary...', 'Optimising weights...', 'Model ready! ✓'];
      var phase  = 0;
      var iv = setInterval(function () {
        phase++;
        var bar = document.getElementById('t-bar');
        var lbl = document.getElementById('t-label');
        if (bar) bar.style.width = (phase * 25) + '%';
        if (lbl && phases[phase]) lbl.textContent = phases[phase];
        if (phase >= 3) { clearInterval(iv); setTimeout(showBoundary, 600); }
      }, 440);
    }

    function showBoundary() {
      Sound.classify();
      Creature.setState('celebrate');
      Creature.say('I found the pattern! Watch me classify 3 emails I have NEVER seen.', 4500);

      var center = document.getElementById('sup-email-center');
      center.innerHTML =
        '<div class="boundary-visual">' +
        '  <div class="boundary-side boundary-side--spam">' +
        '    <div class="boundary-label-big">🔴 Spam</div>' +
        '    <div class="boundary-desc">Urgency · Unknown senders<br>Prize claims · Suspicious links</div>' +
        '  </div>' +
        '  <div class="boundary-line"><div class="boundary-line__label">Decision Boundary</div></div>' +
        '  <div class="boundary-side boundary-side--ham">' +
        '    <div class="boundary-label-big">🟢 Not Spam</div>' +
        '    <div class="boundary-desc">Known contacts · Work context<br>Natural language · Clear purpose</div>' +
        '  </div>' +
        '</div>' +
        '<div class="test-banner" id="test-area">Loading test emails...</div>';

      Particles.burst(container.id, container.offsetWidth / 2, 140, '#818cf8', 12);
      testIdx = 0;
      setTimeout(nextTest, 1400);
    }

    function nextTest() {
      var area = document.getElementById('test-area');
      if (!area) return;
      if (testIdx >= TEST_EMAILS.length) {
        area.innerHTML = '<div style="color:var(--success);font-weight:700;font-size:13px;text-align:center;padding:0.5rem;">✓ 3 / 3 classified correctly — model generalises to unseen emails!</div>';
        Creature.say('That is generalisation — the whole point of ML!', 5000);
        Creature.setState('celebrate');
        Sound.success();
        return;
      }

      var e    = TEST_EMAILS[testIdx];
      var card = document.createElement('div');
      card.className = 'email-card email-card--test';
      card.innerHTML =
        '<div class="email-card__from">From: ' + e.from + '</div>' +
        '<div class="email-card__subject">' + e.subject + '</div>' +
        '<div class="email-card__preview">' + e.preview + '</div>' +
        '<div class="email-card__processing" id="proc-' + testIdx + '">🤔 Analysing...</div>';
      card.style.animation = 'email-slide-in 0.32s ease-out forwards';
      area.innerHTML = '';
      area.appendChild(card);

      setTimeout(function () {
        var proc = document.getElementById('proc-' + testIdx);
        if (proc) {
          proc.textContent  = e.spam ? '🔴 SPAM — classified automatically' : '🟢 Not Spam — classified automatically';
          proc.style.color  = e.spam ? '#ef4444' : '#22c55e';
          proc.style.fontWeight = '700';
          Sound.classify();
          Particles.burst(container.id, container.offsetWidth / 2, 200, e.spam ? '#ef4444' : '#22c55e', 6);
        }
        testIdx++;
        setTimeout(nextTest, 1100);
      }, 950);
    }

    return { init: init, sort: sort, train: train };
  })();


  // ── Unsupervised — people clustering with K-Means animation ─────────────────
  var UnsupervisedMode = (function () {

    var svgEl = null, running = false;
    var W = 600, H = 300;

    /* Pre-set positions: 3 natural groups (proportional coords 0–1) */
    var POSITIONS = [
      [0.11,0.25],[0.19,0.38],[0.07,0.48],[0.23,0.18],[0.14,0.58],[0.27,0.45],[0.05,0.33],[0.21,0.62],
      [0.64,0.16],[0.73,0.28],[0.79,0.13],[0.86,0.36],[0.69,0.42],[0.81,0.52],[0.91,0.24],[0.76,0.57],
      [0.37,0.64],[0.48,0.76],[0.56,0.69],[0.43,0.84],[0.53,0.57],[0.61,0.80],[0.44,0.53],[0.34,0.79],
    ];

    var COLORS = ['#818cf8','#22d3ee','#f59e0b'];
    var NAMES  = ['Night Shoppers','Premium Buyers','Deal Hunters'];

    /* Simple person silhouette as SVG string */
    function personSVG() {
      return '<circle r="7" cy="-20" fill="currentColor" opacity="0.9"/>' +
        '<path d="M-10,-2 Q-10,-15 0,-15 Q10,-15 10,-2 L8,14 L-8,14 Z" fill="currentColor" opacity="0.88"/>' +
        '<line x1="-10" y1="0" x2="-17" y2="14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
        '<line x1="10" y1="0" x2="17" y2="14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
        '<line x1="-4" y1="14" x2="-5" y2="27" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>' +
        '<line x1="4" y1="14" x2="5" y2="27" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>';
    }

    function init(containerId) {
      var container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';
      running = false;

      var rect = container.getBoundingClientRect();
      W = Math.max(rect.width || 600, 300);
      H = 300;

      svgEl = d3.select('#' + containerId)
        .append('svg')
        .attr('viewBox', '0 0 ' + W + ' ' + H)
        .attr('width', '100%')
        .attr('height', H);

      /* Dot grid */
      var gs = 36, gd = [];
      for (var gx = 0; gx <= W; gx += gs) for (var gy = 0; gy <= H; gy += gs) gd.push({x:gx,y:gy});
      svgEl.append('g').selectAll('circle').data(gd).join('circle')
        .attr('cx', function(d){return d.x;}).attr('cy', function(d){return d.y;})
        .attr('r', 1).attr('fill', 'rgba(129,140,248,0.08)');

      /* People */
      var pts = POSITIONS.map(function(p){return{x:p[0]*W,y:p[1]*H};});
      svgEl.selectAll('.person')
        .data(pts).join('g')
        .attr('class', 'person')
        .attr('transform', function(d){return 'translate('+d.x+','+d.y+')';})
        .attr('color', '#374151')
        .html(personSVG())
        .attr('opacity', 0)
        .transition().delay(function(_,i){return i*35;}).duration(280)
        .attr('opacity', 1);

      svgEl.append('text')
        .attr('x', W/2).attr('y', H - 8)
        .attr('text-anchor', 'middle').attr('font-size', '11px').attr('fill', '#6b7280')
        .text('24 customers · no labels · no groups assigned yet');

      Creature.say('24 customers with zero labels. Can I find hidden groups on my own?', 4500);
    }

    function run() {
      if (running) return;
      running = true;

      var pts = POSITIONS.map(function(p){return{x:p[0]*W,y:p[1]*H};});

      /* Well-separated starting centers */
      var centers = [
        {x: W*0.15, y: H*0.38},
        {x: W*0.76, y: H*0.30},
        {x: W*0.47, y: H*0.70},
      ];

      function assign(ctrs) {
        return pts.map(function(p) {
          var best=0, bestD=Infinity;
          ctrs.forEach(function(c,i){
            var d=(p.x-c.x)*(p.x-c.x)+(p.y-c.y)*(p.y-c.y);
            if(d<bestD){bestD=d;best=i;}
          });
          return best;
        });
      }

      function moveCtrs(ctrs, asgn) {
        return ctrs.map(function(old, ci) {
          var cl = pts.filter(function(_,i){return asgn[i]===ci;});
          if(!cl.length) return old;
          return {x:cl.reduce(function(s,p){return s+p.x;},0)/cl.length,
                  y:cl.reduce(function(s,p){return s+p.y;},0)/cl.length};
        });
      }

      function drawState(asgn, ctrs) {
        svgEl.selectAll('.person')
          .transition().duration(480)
          .attr('color', function(_,i){return asgn.length?COLORS[asgn[i]]:'#374151';});

        svgEl.selectAll('.km-c').remove();
        ctrs.forEach(function(c,i){
          var g = svgEl.append('g').attr('class','km-c').attr('transform','translate('+c.x+','+c.y+')');
          g.append('circle').attr('r',0).attr('fill',COLORS[i]).attr('stroke','#fff').attr('stroke-width',2.5).attr('opacity',0.95)
            .transition().duration(400).attr('r',15);
          g.append('text').attr('text-anchor','middle').attr('dy','5').attr('font-size','11px').attr('fill','#06060f').attr('font-weight','800').text(i+1);
        });
      }

      var iter = 0, maxIter = 5;

      function step() {
        var asgn = assign(centers);
        centers  = moveCtrs(centers, asgn);
        drawState(asgn, centers);
        Sound.cluster(iter);
        iter++;
        if (iter >= maxIter) { setTimeout(finish, 700); return; }
        Creature.say('Iteration ' + iter + ' — centers moving to cluster averages...', 900);
        setTimeout(step, 950);
      }

      Creature.say('K-Means running with 3 centers!', 1500);
      drawState([], centers);
      setTimeout(step, 600);
    }

    function finish() {
      running = false;
      Sound.success();
      Creature.setState('celebrate');
      Creature.say('3 groups found with ZERO labels! That is unsupervised learning!', 5000);

      var gCenters = [
        {x:W*0.15,y:H*0.38},
        {x:W*0.76,y:H*0.30},
        {x:W*0.47,y:H*0.70},
      ];
      gCenters.forEach(function(gc,i){
        svgEl.append('rect')
          .attr('x',gc.x-58).attr('y',gc.y-46).attr('width',116).attr('height',24).attr('rx',12)
          .attr('fill',COLORS[i]).attr('opacity',0)
          .transition().delay(i*200).duration(380).attr('opacity',0.92);
        svgEl.append('text')
          .attr('x',gc.x).attr('y',gc.y-28).attr('text-anchor','middle')
          .attr('font-size','10px').attr('fill','#06060f').attr('font-weight','700')
          .text(NAMES[i]).attr('opacity',0)
          .transition().delay(i*200).duration(380).attr('opacity',1);
      });

      Particles.burst('ml-animation', W/2, H/2, '#818cf8', 12);
    }

    return { init: init, run: run };
  })();


  // ── RL Mode — emoji maze game ─────────────────────────────────────────────────
  var RLMode = (function () {

    var can, ctx, COLS=6, ROWS=5, cW, cH, ox, oy;
    var epIdx=0, running=false;

    var PATHS = [
      [[0,0],[1,0],[1,1],[0,1],[0,2],[1,2],[2,2],[2,1],[2,0],[3,0],[3,1],[3,2],[3,3],[4,3],[4,4],[5,4]],
      [[0,0],[0,1],[1,1],[2,1],[2,0],[3,0],[3,1],[4,1],[4,2],[4,3],[5,3],[5,4]],
      [[0,0],[1,0],[2,0],[2,1],[3,1],[3,2],[4,2],[4,3],[5,3],[5,4]],
      [[0,0],[1,0],[2,0],[3,0],[4,0],[4,1],[4,2],[4,3],[5,3],[5,4]],
      [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[5,1],[5,2],[5,3],[5,4]],
    ];
    var EMOTIONS = ['😵','😕','🤔','😊','🚀'];

    function rr(x,y,w,h,r) {
      ctx.beginPath();
      ctx.moveTo(x+r,y);
      ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
      ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
      ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
      ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
      ctx.closePath();
    }

    function emoji(e,x,y,s) {
      ctx.font = s+'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e,x,y);
    }

    function drawGrid(trail) {
      ctx.clearRect(0,0,can.width,can.height);
      ctx.fillStyle='#6b7280'; ctx.font='11px Inter,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
      ctx.fillText(
        epIdx < PATHS.length
          ? 'Episode '+(epIdx+1)+' of '+PATHS.length+'  ·  path gets shorter each run'
          : 'All episodes done — agent found the optimal path!',
        can.width/2, 22
      );

      for(var c=0;c<COLS;c++){for(var r=0;r<ROWS;r++){
        var x=ox+c*cW, y=oy+r*cH;
        var isS=c===0&&r===0, isG=c===COLS-1&&r===ROWS-1;
        rr(x+2,y+2,cW-4,cH-4,6);
        ctx.fillStyle = isG?'rgba(34,211,238,0.12)':isS?'rgba(129,140,248,0.12)':'rgba(255,255,255,0.025)';
        ctx.fill();
        rr(x+2,y+2,cW-4,cH-4,6);
        ctx.strokeStyle = isG?'#22d3ee':isS?'#818cf8':'rgba(255,255,255,0.07)';
        ctx.lineWidth = isG||isS?1.5:0.5;
        ctx.stroke();
        if(isS) emoji('🏠',x+cW/2,y+cH/2,Math.min(cW,cH)*0.42);
        if(isG) emoji('🏆',x+cW/2,y+cH/2,Math.min(cW,cH)*0.42);
      }}

      if(trail&&trail.length>1){
        ctx.beginPath();
        ctx.moveTo(ox+trail[0][0]*cW+cW/2,oy+trail[0][1]*cH+cH/2);
        for(var t=1;t<trail.length;t++) ctx.lineTo(ox+trail[t][0]*cW+cW/2,oy+trail[t][1]*cH+cH/2);
        ctx.strokeStyle='rgba(129,140,248,0.38)'; ctx.lineWidth=3; ctx.lineJoin='round'; ctx.stroke();
      }
    }

    function drawAgent(c,r,em) {
      var x=ox+c*cW+cW/2, y=oy+r*cH+cH/2, rad=Math.min(cW,cH)*0.32;
      ctx.beginPath(); ctx.arc(x,y,rad,0,Math.PI*2);
      ctx.fillStyle='#818cf8'; ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=2.5; ctx.stroke();
      emoji(em||'😐',x,y+2,rad*1.1);
    }

    function init(containerId) {
      var container = document.getElementById(containerId);
      if(!container) return;
      container.innerHTML='';
      running=false; epIdx=0;

      can = document.createElement('canvas');
      var cw = container.getBoundingClientRect().width || 600;
      can.width=cw; can.height=300;
      can.style.cssText='width:100%;height:300px;display:block;';
      container.appendChild(can);
      ctx=can.getContext('2d');

      cW=(can.width-60)/COLS; cH=(can.height-60)/ROWS; ox=30; oy=40;

      var btn=document.getElementById('rl-run-btn');
      if(btn) btn.textContent='Run Episode 1 →';

      drawGrid(null); drawAgent(0,0,'😐');
      Creature.say('I start with zero knowledge. Watch me figure out the maze by trial and error!', 4500);
    }

    function runEpisode() {
      if(running||epIdx>=PATHS.length){
        if(epIdx>=PATHS.length) Creature.say('The agent mastered the maze in 5 runs. Zero rules written — pure learning by reward!', 5500);
        return;
      }
      running=true;

      var ep=epIdx+1, path=PATHS[epIdx], em=EMOTIONS[epIdx]||'😐';
      var ms=Math.max(80,400-epIdx*65), si=0, trail=[path[0].slice()];

      Creature.say('Episode '+ep+': '+path.length+' steps. Going!', 1800);

      function step(){
        if(si>=path.length-1){
          Sound.goal(); Creature.setState('celebrate');
          var steps=path.length-1;
          Creature.say('Episode '+ep+': '+steps+' steps! '+(ep<PATHS.length?'Getting smarter...':'🚀 OPTIMAL PATH!'), 3200);
          drawGrid(trail); drawAgent(path[path.length-1][0],path[path.length-1][1],'🎉');
          Particles.burst('ml-animation', ox+path[path.length-1][0]*cW+cW/2, oy+path[path.length-1][1]*cH+cH/2, '#22d3ee', 10);
          epIdx++; running=false;
          var btn=document.getElementById('rl-run-btn');
          if(btn) btn.textContent=epIdx<PATHS.length?'Run Episode '+(epIdx+1)+' →':'✓ All 5 Episodes Complete';
          setTimeout(function(){drawGrid(null);drawAgent(0,0,'😐');},1600);
          return;
        }
        trail.push(path[si+1].slice());
        Sound.step();
        drawGrid(trail); drawAgent(path[si+1][0],path[si+1][1],em);
        si++; setTimeout(step,ms);
      }

      step();
    }

    return { init: init, runEpisode: runEpisode };
  })();


  // ── Animation controller ──────────────────────────────────────────────────────
  var Animation = (function () {
    var mode = 'supervised';

    var MODE_DESC = {
      supervised:    'Sort real emails into spam or not spam. You are labelling training data. Then train the model.',
      unsupervised:  'No labels exist. Click Find Groups — watch K-Means discover 3 hidden customer groups.',
      reinforcement: 'The agent has no map. It explores the maze, earns rewards, and improves every episode.'
    };

    function init() {
      Creature.init('anim-wrapper');
      document.querySelectorAll('.anim-tab').forEach(function(tab){
        tab.addEventListener('click', function(){
          if(mode===tab.dataset.mode) return;
          mode=tab.dataset.mode;
          document.querySelectorAll('.anim-tab').forEach(function(t){
            t.classList.toggle('anim-tab--active', t.dataset.mode===mode);
          });
          switchMode();
        });
      });
      switchMode();
    }

    function switchMode() {
      var desc=document.getElementById('anim-mode-desc');
      if(desc) desc.textContent=MODE_DESC[mode]||'';

      ['supervised','unsupervised','rl'].forEach(function(m){
        var el=document.getElementById('ctrl-'+m); if(el) el.style.display='none';
        var st=document.getElementById('status-'+m); if(st) st.style.display='none';
      });
      var ca=document.getElementById('ctrl-'+mode); if(ca) ca.style.display='flex';

      if(mode==='supervised')        SupervisedMode.init('ml-animation');
      else if(mode==='unsupervised') UnsupervisedMode.init('ml-animation');
      else                           RLMode.init('ml-animation');
    }

    return {
      init:       init,
      sort:       function(isSpam){ SupervisedMode.sort(isSpam); },
      train:      function(){ SupervisedMode.train(); },
      runKMeans:  function(){ UnsupervisedMode.run(); },
      runEpisode: function(){ RLMode.runEpisode(); },
      clearAll:   function(){ switchMode(); }
    };
  })();


  // ── Demo — live regression scatter plot ───────────────────────────────────────
  var Demo = (function () {
    var svgEl=null, xSc, ySc, pts=[], W=600;
    var H=260;

    function init() {
      var container=document.getElementById('demo-canvas');
      if(!container) return;
      var rect=container.getBoundingClientRect();
      W=Math.max(rect.width||600,320);
      xSc=d3.scaleLinear().domain([0,10]).range([58,W-18]);
      ySc=d3.scaleLinear().domain([0,100]).range([H-42,12]);
      svgEl=d3.select('#demo-canvas').append('svg')
        .attr('viewBox','0 0 '+W+' '+H).attr('width','100%').attr('height',H).style('cursor','crosshair');
      var ac='#2d2d4e', tc='#6b7280';
      svgEl.append('g').attr('transform','translate(0,'+(H-42)+')')
        .call(d3.axisBottom(xSc).ticks(10))
        .call(function(g){g.selectAll('path,line').attr('stroke',ac);g.selectAll('text').attr('fill',tc).attr('font-size','10px');});
      svgEl.append('g').attr('transform','translate(58,0)')
        .call(d3.axisLeft(ySc).ticks(5))
        .call(function(g){g.selectAll('path,line').attr('stroke',ac);g.selectAll('text').attr('fill',tc).attr('font-size','10px');});
      svgEl.append('text').attr('x',W/2).attr('y',H-6).attr('text-anchor','middle').attr('fill','#4b5563').attr('font-size','11px').text('Study hours →');
      svgEl.append('text').attr('transform','rotate(-90)').attr('x',-(H/2)).attr('y',14).attr('text-anchor','middle').attr('fill','#4b5563').attr('font-size','11px').text('Exam score →');
      svgEl.on('click',function(ev){
        var co=d3.pointer(ev);
        var dx=xSc.invert(co[0]),dy=ySc.invert(co[1]);
        if(dx<0||dx>10||dy<0||dy>100) return;
        pts.push({x:dx,y:dy}); Sound.pop(); redraw();
      });
      pts=[{x:1,y:32},{x:2,y:47},{x:3,y:51},{x:4,y:60},{x:5,y:66},{x:6,y:71},{x:7,y:78},{x:8,y:83},{x:9,y:88},{x:10,y:95}];
      redraw();
    }

    function reg(data){
      if(data.length<2) return null;
      var n=data.length;
      var mx=data.reduce(function(s,p){return s+p.x;},0)/n;
      var my=data.reduce(function(s,p){return s+p.y;},0)/n;
      var num=0,den=0;
      data.forEach(function(p){num+=(p.x-mx)*(p.y-my);den+=(p.x-mx)*(p.x-mx);});
      if(!den) return null;
      var slope=num/den;
      return{slope:slope,intercept:my-slope*mx};
    }

    function redraw(){
      svgEl.selectAll('.dp,.rl,.eq,.el').remove();
      var r=reg(pts);
      /* error lines drawn before dots so dots sit on top */
      if(r&&pts.length>=2){
        svgEl.selectAll('.el').data(pts).join('line').attr('class','el')
          .attr('x1',function(d){return xSc(d.x);}).attr('y1',function(d){return ySc(d.y);})
          .attr('x2',function(d){return xSc(d.x);}).attr('y2',function(d){return ySc(r.slope*d.x+r.intercept);})
          .attr('stroke','#ef4444').attr('stroke-width',1.5).attr('stroke-dasharray','3,2').attr('opacity',0.55);
        var mseVal=pts.reduce(function(s,p){var e=p.y-(r.slope*p.x+r.intercept);return s+e*e;},0)/pts.length;
        var mseEl=document.getElementById('demo-mse');
        if(mseEl) mseEl.innerHTML='n='+pts.length+'&nbsp;&nbsp;·&nbsp;&nbsp;MSE = <span>'+mseVal.toFixed(2)+'</span>&nbsp;&nbsp;·&nbsp;&nbsp;y = '+r.slope.toFixed(2)+'x + '+r.intercept.toFixed(1);
      }
      svgEl.selectAll('.dp').data(pts).join('circle').attr('class','dp')
        .attr('cx',function(d){return xSc(d.x);}).attr('cy',function(d){return ySc(d.y);})
        .attr('r',5).attr('fill','#818cf8').attr('stroke','#0d0d1a').attr('stroke-width',1)
        .attr('opacity',0).transition().duration(140).attr('opacity',0.9);
      if(!r) return;
      svgEl.append('line').attr('class','rl')
        .attr('x1',xSc(0)).attr('y1',ySc(r.slope*0+r.intercept))
        .attr('x2',xSc(10)).attr('y2',ySc(r.slope*10+r.intercept))
        .attr('stroke','#22d3ee').attr('stroke-width',2).attr('opacity',0)
        .transition().duration(200).attr('opacity',0.88);
      svgEl.append('text').attr('class','eq').attr('x',W-14).attr('y',24).attr('text-anchor','end')
        .attr('fill','#22d3ee').attr('font-size','11px').attr('font-family','JetBrains Mono,monospace')
        .text('y = '+r.slope.toFixed(2)+'x + '+r.intercept.toFixed(1));
    }

    function clear(){
      pts=[];
      if(svgEl) svgEl.selectAll('.dp,.rl,.eq,.el').remove();
      var mseEl=document.getElementById('demo-mse');
      if(mseEl) mseEl.innerHTML='Add points to see MSE';
    }
    return{init:init,clear:clear};
  })();


  // ── Gradient Descent — loss landscape animation ───────────────────────────────
  var GradientDescent = (function () {
    var svgEl=null, W=500, H=200, animating=false;
    var TRUE_SLOPE=6.78;

    var DATA=[{x:1,y:32},{x:2,y:47},{x:3,y:51},{x:4,y:60},{x:5,y:66},
              {x:6,y:71},{x:7,y:78},{x:8,y:83},{x:9,y:88},{x:10,y:95}];

    function lossAt(slope) {
      var n=DATA.length;
      var xm=DATA.reduce(function(s,p){return s+p.x;},0)/n;
      var ym=DATA.reduce(function(s,p){return s+p.y;},0)/n;
      var ic=ym-slope*xm, sum=0;
      DATA.forEach(function(p){var e=p.y-(slope*p.x+ic);sum+=e*e;});
      return sum/n;
    }

    function buildScales() {
      var sVals=[]; for(var s=0;s<=14;s+=0.12) sVals.push(s);
      var losses=sVals.map(lossAt);
      var xSc=d3.scaleLinear().domain([0,14]).range([62,W-18]);
      var ySc=d3.scaleLinear().domain([0,d3.max(losses)*1.06]).range([H-36,12]);
      return{xSc:xSc,ySc:ySc,sVals:sVals};
    }

    function init(containerId) {
      var container=document.getElementById(containerId);
      if(!container) return;
      container.innerHTML=''; animating=false;
      var rect=container.getBoundingClientRect();
      W=Math.max(rect.width||500,300); H=200;

      var sc=buildScales(), xSc=sc.xSc, ySc=sc.ySc, sVals=sc.sVals;
      var lossData=sVals.map(function(sv){return{s:sv,l:lossAt(sv)};});

      svgEl=d3.select('#'+containerId).append('svg')
        .attr('viewBox','0 0 '+W+' '+H).attr('width','100%').attr('height',H);

      var ac='#2d2d4e', tc='#6b7280';
      svgEl.append('g').attr('transform','translate(0,'+(H-36)+')')
        .call(d3.axisBottom(xSc).ticks(7))
        .call(function(g){g.selectAll('path,line').attr('stroke',ac);g.selectAll('text').attr('fill',tc).attr('font-size','9px');});
      svgEl.append('g').attr('transform','translate(62,0)')
        .call(d3.axisLeft(ySc).ticks(4))
        .call(function(g){g.selectAll('path,line').attr('stroke',ac);g.selectAll('text').attr('fill',tc).attr('font-size','9px');});
      svgEl.append('text').attr('x',W/2).attr('y',H-2).attr('text-anchor','middle').attr('fill',tc).attr('font-size','10px').text('slope value →');
      svgEl.append('text').attr('transform','rotate(-90)').attr('x',-(H/2)).attr('y',12).attr('text-anchor','middle').attr('fill',tc).attr('font-size','10px').text('MSE loss →');

      /* loss curve */
      var line=d3.line().x(function(d){return xSc(d.s);}).y(function(d){return ySc(d.l);}).curve(d3.curveCatmullRom);
      svgEl.append('path').datum(lossData).attr('fill','none').attr('stroke','#818cf8').attr('stroke-width',2.5).attr('opacity',0.75).attr('d',line);

      /* true minimum marker */
      var minLoss=lossAt(TRUE_SLOPE);
      svgEl.append('line')
        .attr('x1',xSc(TRUE_SLOPE)).attr('x2',xSc(TRUE_SLOPE))
        .attr('y1',ySc(0)).attr('y2',ySc(minLoss))
        .attr('stroke','#22d3ee').attr('stroke-width',1.2).attr('stroke-dasharray','4,3').attr('opacity',0.7);
      svgEl.append('text').attr('x',xSc(TRUE_SLOPE)+5).attr('y',ySc(minLoss)-4)
        .attr('fill','#22d3ee').attr('font-size','9px').attr('font-weight','700').text('true min');

      /* GD ball starting at slope=0.8 */
      var s0=0.8;
      svgEl.append('circle').attr('class','gd-ball')
        .attr('cx',xSc(s0)).attr('cy',ySc(lossAt(s0)))
        .attr('r',9).attr('fill','#f59e0b').attr('stroke','#fff').attr('stroke-width',2.2).attr('opacity',0.95);
      svgEl.append('text').attr('class','gd-label')
        .attr('x',xSc(s0)).attr('y',ySc(lossAt(s0))-14)
        .attr('text-anchor','middle').attr('fill','#f59e0b').attr('font-size','10px').attr('font-weight','700')
        .text('slope=0.80');
    }

    function run() {
      if(!svgEl||animating) return;
      animating=true;

      /* compute gradient descent path */
      var n=DATA.length;
      var xm=DATA.reduce(function(s,p){return s+p.x;},0)/n;
      var ym=DATA.reduce(function(s,p){return s+p.y;},0)/n;
      var slope=0.8, lr=0.05, steps=[0.8];
      for(var iter=0;iter<80;iter++){
        var ic=ym-slope*xm, grad=0;
        DATA.forEach(function(p){grad+=(-2/n)*(p.y-(slope*p.x+ic))*p.x;});
        slope-=lr*grad;
        slope=Math.max(0,Math.min(14,slope));
        steps.push(slope);
        if(Math.abs(grad)<0.0005) break;
      }

      var sc=buildScales(), xSc=sc.xSc, ySc=sc.ySc;
      Creature.say('Gradient descent starting at slope=0.8, stepping downhill...', 2500);
      Sound.step();

      var idx=0;
      function nextStep(){
        if(idx>=steps.length){
          Sound.success(); Creature.setState('celebrate');
          Creature.say('slope='+steps[steps.length-1].toFixed(2)+' — identical to the math formula! That IS gradient descent.', 4500);
          animating=false; return;
        }
        var sv=steps[idx];
        var dur=idx<6?230:idx<25?140:75;
        svgEl.select('.gd-ball').transition().duration(dur).attr('cx',xSc(sv)).attr('cy',ySc(lossAt(sv)));
        svgEl.select('.gd-label').transition().duration(dur).attr('x',xSc(sv)).attr('y',ySc(lossAt(sv))-14).text('slope='+sv.toFixed(2));
        if(idx===0||idx===4||idx===12||idx===steps.length-1) Sound.step();
        idx++;
        setTimeout(nextStep, dur+20);
      }
      nextStep();
    }

    function reset(){
      if(animating) return;
      init('gd-canvas');
    }

    return{init:init,run:run,reset:reset};
  })();


  // ── Quiz ──────────────────────────────────────────────────────────────────────
  var Quiz = (function () {
    var qs=[],cur=0,score=0,answered=false,timer=null,tStart=0,times=[];

    function init(data){
      qs=data||[];
      if(!qs.length) return;
      var btn=document.getElementById('quiz-start-btn');
      if(btn) btn.addEventListener('click',start);
    }

    function start(){
      cur=0;score=0;answered=false;times=[];
      document.getElementById('quiz-start-screen').style.display='none';
      document.getElementById('quiz-question-screen').classList.add('active');
      document.getElementById('quiz-result-screen').classList.remove('visible');
      showQ();
    }

    function showQ(){
      if(cur>=qs.length){showResult();return;}
      answered=false;
      var q=qs[cur];
      document.getElementById('quiz-num').textContent=(cur+1)+' / '+qs.length;
      document.getElementById('quiz-q-text').textContent=q.question;
      var optEl=document.getElementById('quiz-options');
      optEl.innerHTML='';
      q.options.forEach(function(opt,i){
        var btn=document.createElement('button');
        btn.className='quiz-opt';btn.textContent=opt;
        btn.addEventListener('click',function(){select(i);});
        optEl.appendChild(btn);
      });
      document.getElementById('quiz-explanation').classList.remove('visible');
      document.getElementById('quiz-next-btn').style.display='none';
      var bar=document.getElementById('quiz-timer-bar');
      if(bar){bar.style.transition='none';bar.style.width='100%';bar.style.background='#818cf8';void bar.offsetWidth;}
      document.getElementById('quiz-timer-text').textContent='30s';
      tStart=Date.now();
      if(timer) timer.stop();
      timer=Abyss.Timer.create(30,
        function(rem){
          var b=document.getElementById('quiz-timer-bar');
          var pct=(rem/30)*100;
          if(b){b.style.transition='width 1s linear,background 1s linear';b.style.width=pct+'%';b.style.background=pct>50?'#818cf8':pct>25?'#f59e0b':'#ef4444';}
          document.getElementById('quiz-timer-text').textContent=rem+'s';
        },
        function(){if(!answered) timeout();}
      );
      timer.start();
    }

    function select(idx){
      if(answered) return;
      answered=true;
      if(timer) timer.stop();
      var taken=Math.round((Date.now()-tStart)/1000);
      times.push(taken);
      var q=qs[cur],ok=idx===q.answer;
      if(ok){score++;Sound.success();Creature.setState('celebrate');Creature.say('Correct! Well done! 🎉',2500);}
      else{Sound.wrong();Creature.say('Not quite — read the explanation carefully.',3000);}
      Abyss.Api.post('/quiz/attempt',{topic_id:'ml-1',question_idx:cur,correct:ok,time_taken:taken}).catch(function(){});
      document.querySelectorAll('.quiz-opt').forEach(function(b,i){
        b.disabled=true;
        if(i===q.answer) b.classList.add('correct');
        else if(i===idx&&!ok) b.classList.add('wrong');
      });
      var ex=document.getElementById('quiz-explanation');
      ex.textContent=q.explanation;ex.style.borderLeftColor=ok?'var(--success)':'var(--error)';ex.classList.add('visible');
      var nb=document.getElementById('quiz-next-btn');
      nb.style.display='inline-flex';
      nb.textContent=cur<qs.length-1?'Next Question →':'See Results →';
    }

    function timeout(){
      if(answered) return;
      answered=true;times.push(30);Sound.wrong();
      var q=qs[cur];
      document.querySelectorAll('.quiz-opt').forEach(function(b,i){b.disabled=true;if(i===q.answer)b.classList.add('correct');});
      var ex=document.getElementById('quiz-explanation');
      ex.textContent='Time up. '+q.explanation;ex.style.borderLeftColor='var(--error)';ex.classList.add('visible');
      var nb=document.getElementById('quiz-next-btn');
      nb.style.display='inline-flex';nb.textContent=cur<qs.length-1?'Next Question →':'See Results →';
    }

    function next(){cur++;showQ();}

    function showResult(){
      document.getElementById('quiz-question-screen').classList.remove('active');
      document.getElementById('quiz-result-screen').classList.add('visible');
      var pct=Math.round((score/qs.length)*100);
      document.getElementById('result-score').textContent=score+' / '+qs.length;
      document.getElementById('result-pct').textContent=pct+'%';
      document.getElementById('result-msg').textContent=
        pct===100?'Perfect. You own this topic. Move on.':
        pct>=80?'Strong. Review what you missed.':
        pct>=60?'Decent. Re-read explanations, retry.':
        'Keep at it. Re-read every explanation, then retry.';
      if(pct>=80){Sound.success();Creature.setState('celebrate');Creature.say(pct===100?'PERFECT SCORE! Placement ready on this topic!':'Great score!',4000);}
      var tt=times.reduce(function(a,b){return a+b;},0);
      Abyss.Progress.save('ml-1',{completed:score>=3,quiz_score:score,quiz_total:qs.length,time_spent:tt});
    }

    return{init:init,next:next};
  })();


  // ── Boot ──────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    Animation.init();
    Demo.init();
    GradientDescent.init('gd-canvas');
    if (typeof QUIZ_DATA !== 'undefined') Quiz.init(QUIZ_DATA);

    var el;
    el=document.getElementById('sup-spam-btn');
    if(el) el.addEventListener('click',function(){Animation.sort(true);});
    el=document.getElementById('sup-ham-btn');
    if(el) el.addEventListener('click',function(){Animation.sort(false);});
    el=document.getElementById('sup-train-btn');
    if(el) el.addEventListener('click',function(){Animation.train();});
    el=document.getElementById('anim-clear-btn');
    if(el) el.addEventListener('click',function(){Animation.clearAll();});
    el=document.getElementById('anim-clear-btn-u');
    if(el) el.addEventListener('click',function(){Animation.clearAll();});
    el=document.getElementById('unsup-km-btn');
    if(el) el.addEventListener('click',function(){Animation.runKMeans();});
    el=document.getElementById('rl-run-btn');
    if(el) el.addEventListener('click',function(){Animation.runEpisode();});
    el=document.getElementById('demo-clear-btn');
    if(el) el.addEventListener('click',function(){Demo.clear();});
    el=document.getElementById('gd-run-btn');
    if(el) el.addEventListener('click',function(){GradientDescent.run();});
    el=document.getElementById('gd-reset-btn');
    if(el) el.addEventListener('click',function(){GradientDescent.reset();});
    el=document.getElementById('quiz-next-btn');
    if(el) el.addEventListener('click',function(){Quiz.next();});
    el=document.getElementById('quiz-retry-btn');
    if(el) el.addEventListener('click',function(){
      document.getElementById('quiz-result-screen').classList.remove('visible');
      document.getElementById('quiz-question-screen').classList.remove('active');
      document.getElementById('quiz-start-screen').style.display='block';
    });
  });

})();
