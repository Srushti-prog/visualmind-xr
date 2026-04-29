// ═══ GAME STATE ═══
var timeLeft    = 90;
var score       = 0;
var decisions   = 0;
var gameOver    = false;
var stressLevel = 0;

var timerEl    = document.getElementById('timer');
var scoreEl    = document.getElementById('score-display');
var msgEl      = document.getElementById('message');
var stressFill = document.getElementById('stress-fill');

// ═══ KILL ANY OLD TIMER ═══
if (window._countdown) {
  clearInterval(window._countdown);
  window._countdown = null;
}

// ═══ START FRESH TIMER ═══
function startTimer(seconds) {
  if (window._countdown) {
    clearInterval(window._countdown);
    window._countdown = null;
  }
  timeLeft = seconds;
  timerEl.textContent = timeLeft;

  window._countdown = setInterval(function() {
    if (gameOver) return;
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 60) timerEl.style.color = '#FFB74D';
    if (timeLeft <= 30) timerEl.style.color = '#FF5722';
    if (timeLeft <= 10) timerEl.style.color = '#FF1744';
    if (timeLeft <= 0) {
      clearInterval(window._countdown);
      window._countdown = null;
      endGame();
    }
  }, 1000);
}

// ═══ VOICE UNLOCK ═══
document.addEventListener('click', function() {
  var u = new SpeechSynthesisUtterance('');
  window.speechSynthesis.speak(u);
}, { once: true });

// ═══ LIGHTNING ═══
setInterval(function() {
  if (gameOver) return;
  var l = document.getElementById('lightning');
  if (!l) return;
  l.setAttribute('intensity', '3');
  setTimeout(function() {
    l.setAttribute('intensity', '0.4');
  }, 120);
}, 7000);

// ═══ ZONE CLICKS ═══
document.getElementById('safe-zone')
  .addEventListener('click', function() {
    handleDecision(100, true,
      '✅ High ground is rule #1 in floods!',
      'Safe zone. Good move.'
    );
  });

document.getElementById('danger-zone')
  .addEventListener('click', function() {
    handleDecision(-50, false,
      '⚠️ Bridges collapse. Never cross!',
      'Wrong move. Go back.'
    );
  });

document.getElementById('shelter-zone')
  .addEventListener('click', function() {
    handleDecision(150, true,
      '🏆 Shelter saves families! +5 seconds!',
      'Perfect. You are safe.'
    );
  });

document.getElementById('roof-zone')
  .addEventListener('click', function() {
    handleDecision(200, true,
      '★ Secret rooftop found! Amazing!',
      'Hidden zone. Well done.'
    );
  });

// ═══ DECISION ═══
function handleDecision(pts, good, msg, voice) {
  if (gameOver) return;
  decisions++;
  score += pts;
  if (score < 0) score = 0;
  updateScore();
  updateStress(good
    ? Math.max(0, stressLevel - 10)
    : stressLevel + 25
  );
  showMessage(msg, good ? '#66BB6A' : '#EF5350');
  speak(voice);
  if (pts >= 150) timeLeft = Math.min(90, timeLeft + 5);
}

function updateScore() {
  scoreEl.textContent = 'Score: ' + score;
  scoreEl.style.color = score >= 200 ? '#66BB6A' :
                        score >= 100 ? '#FFD54F' : '#EF5350';
}

function updateStress(level) {
  stressLevel = Math.min(100, Math.max(0, level));
  stressFill.style.width = stressLevel + '%';
  if (stressLevel > 70)
    showMessage('⚠️ PANIC — Breathe. Think. Decide.', '#FF5722');
}

function showMessage(text, color) {
  msgEl.textContent = text;
  msgEl.style.borderColor = color || '#2196F3';
  msgEl.style.display = 'block';
  clearTimeout(msgEl._t);
  msgEl._t = setTimeout(function() {
    msgEl.style.display = 'none';
  }, 4000);
}

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  setTimeout(function() {
    var m = new SpeechSynthesisUtterance(text);
    m.rate = 0.9; m.pitch = 1; m.volume = 1;
    window.speechSynthesis.speak(m);
  }, 200);
}

// ═══ END GAME ═══
function endGame() {
  gameOver = true;
  clearInterval(window._countdown);
  speak('Simulation complete.');

  var grade, title, feedback;
  if      (score >= 400) { grade='🏆'; title='ELITE SURVIVOR';  feedback='Perfect decisions under pressure.'; }
  else if (score >= 250) { grade='✅'; title='PREPARED';         feedback='Good instincts. Keep training.'; }
  else if (score >= 100) { grade='⚠️'; title='AT RISK';          feedback='Some mistakes. Study the guide.'; }
  else                   { grade='❌'; title='UNPREPARED';        feedback='Critical mistakes. Retry.'; }

  var h = JSON.parse(localStorage.getItem('scores') || '[]');
  h.push({
    score: score,
    grade: title,
    date: new Date().toLocaleDateString()
  });
  localStorage.setItem('scores', JSON.stringify(h));

  document.getElementById('result-grade').textContent    = grade;
  document.getElementById('result-title').textContent    = title;
  document.getElementById('result-score').textContent    =
    'Score: ' + score + ' · Decisions: ' + decisions;
  document.getElementById('result-feedback').textContent = feedback;
  document.getElementById('result').style.display = 'block';
  setTimeout(function() { speak(title); }, 1000);
}

// ═══════════════════════════════════
// SCENE LOADER
// ═══════════════════════════════════
document.querySelector('a-scene')
  .addEventListener('loaded', function() {

  var hud   = document.getElementById('hud-title');
  var sky   = document.getElementById('main-sky');
  var water = document.getElementById('flood-water');
  var ground= document.getElementById('main-ground');
  var light = document.getElementById('lightning');

  // ── FLOOD ──
  if (SCENE_TYPE === 'flood') {
    sky.setAttribute('color', '#0a1628');
    ground.setAttribute('color', '#1B5E20');
    water.setAttribute('color', '#0D47A1');
    hud.textContent = '🌊 FLASH FLOOD';
    hud.style.color = '#90CAF9';
    startTimer(90);
    setTimeout(function() {
      showMessage('🌊 Flood rising! Choose escape route!', '#2196F3');
      speak('Flood alert. Choose wisely.');
    }, 500);
  }

  // ── FIRE ──
  else if (SCENE_TYPE === 'fire') {
    sky.setAttribute('color', '#3d0000');
    ground.setAttribute('color', '#4a1500');
    water.setAttribute('color', '#FF6D00');
    water.setAttribute('opacity', '0.85');
    hud.textContent = '🔥 FOREST FIRE';
    hud.style.color = '#FF6D00';
    startTimer(90);

    document.querySelector('a-scene').setAttribute('fog',
      'type:exponential; color:#3d0000; density:0.04');

    setTimeout(function() { sky.setAttribute('color','#3d0000'); }, 300);
    setTimeout(function() { sky.setAttribute('color','#3d0000'); }, 800);
    setTimeout(function() { sky.setAttribute('color','#3d0000'); }, 1500);
    setTimeout(function() { sky.setAttribute('color','#3d0000'); }, 3000);

    var f = false;
    setInterval(function() {
      if (gameOver || !light) return;
      f = !f;
      light.setAttribute('color', f ? '#FF6D00' : '#FF3D00');
      light.setAttribute('intensity', f ? '2' : '0.8');
    }, 400);

    var ob = document.createElement('div');
    ob.style.position = 'fixed';
    ob.style.top = '0'; ob.style.left = '0';
    ob.style.width = '100%'; ob.style.height = '100%';
    ob.style.pointerEvents = 'none';
    ob.style.zIndex = '9998';
    ob.style.border = '10px solid rgba(255,80,0,0.6)';
    ob.style.boxSizing = 'border-box';
    document.body.appendChild(ob);

    var fp = false;
    setInterval(function() {
      if (gameOver) return;
      fp = !fp;
      ob.style.borderColor = fp
        ? 'rgba(255,80,0,0.8)'
        : 'rgba(255,80,0,0.3)';
    }, 600);

    setTimeout(function() {
      showMessage('🔥 Fire spreading! Find exit NOW!', '#FF6D00');
      speak('Fire alert. Find exit now.');
    }, 500);
  }

  // ── QUAKE ──
  else if (SCENE_TYPE === 'quake') {
    sky.setAttribute('color', '#1a1200');
    ground.setAttribute('color', '#3e2000');
    water.setAttribute('color', '#5D4037');
    water.setAttribute('opacity', '0.6');
    hud.textContent = '🏚️ EARTHQUAKE';
    hud.style.color = '#FF8F00';
    startTimer(90);
    document.querySelector('a-scene').setAttribute('fog',
      'type:exponential; color:#1a1200; density:0.025');

    setTimeout(function() { sky.setAttribute('color','#1a1200'); }, 300);
    setTimeout(function() { sky.setAttribute('color','#1a1200'); }, 800);
    setTimeout(function() { sky.setAttribute('color','#1a1200'); }, 1500);
    setTimeout(function() { sky.setAttribute('color','#1a1200'); }, 3000);

    var sc = 0;
    setInterval(function() {
      if (gameOver || sc > 20) return;
      sc++;
      var cam = document.getElementById('camera');
      if (!cam) return;
      var s = 0;
      var si = setInterval(function() {
        s++;
        var x = (Math.random() - 0.5) * 0.6;
        var z = (Math.random() - 0.5) * 0.6;
        cam.setAttribute('position', x + ' 1.6 ' + z);
        if (s > 10) {
          clearInterval(si);
          cam.setAttribute('position', '0 1.6 4');
        }
      }, 80);

      var fl = document.createElement('div');
      fl.style.cssText =
        'position:fixed;top:0;left:0;width:100%;height:100%;' +
        'background:rgba(150,80,0,0.5);pointer-events:none;z-index:9998;';
      document.body.appendChild(fl);
      setTimeout(function() { fl.remove(); }, 500);

      showMessage('🏚️ SHAKING! Get to open ground!', '#FF8F00');
      speak('Shaking. Move away.');
    }, 5000);

    setTimeout(function() {
      showMessage('🏚️ Earthquake! Avoid buildings!', '#FF8F00');
      speak('Earthquake. Move away from buildings.');
    }, 500);
  }

  // ── VICTIM ──
  else if (SCENE_TYPE === 'victim') {
    sky.setAttribute('color', '#0a1628');
    ground.setAttribute('color', '#1B5E20');
    water.setAttribute('color', '#0D47A1');
    hud.textContent = '♿ VICTIM POV — Elderly';
    hud.style.color = '#FFD54F';

    // Slow movement
    var cam = document.getElementById('camera');
    if (cam) cam.setAttribute('wasd-controls', 'acceleration:5');

    // Vision blur overlay
    var ov = document.createElement('div');
    ov.id = 'victimOverlay';
    ov.style.position = 'fixed';
    ov.style.top = '0'; ov.style.left = '0';
    ov.style.width = '100%'; ov.style.height = '100%';
    ov.style.pointerEvents = 'none';
    ov.style.zIndex = '9999';
    ov.style.border = '60px solid rgba(0,0,0,0.9)';
    ov.style.boxSizing = 'border-box';
    ov.style.backdropFilter = 'blur(4px)';
    ov.style.webkitBackdropFilter = 'blur(4px)';
    document.body.appendChild(ov);

    // Heartbeat
    var beat = false;
    setInterval(function() {
      if (gameOver) return;
      var o = document.getElementById('victimOverlay');
      if (!o) return;
      beat = !beat;
      if (beat) {
        o.style.border = '60px solid rgba(200,0,0,0.55)';
        o.style.backdropFilter = 'blur(5px)';
        o.style.webkitBackdropFilter = 'blur(5px)';
      } else {
        o.style.border = '60px solid rgba(0,0,0,0.9)';
        o.style.backdropFilter = 'blur(3px)';
        o.style.webkitBackdropFilter = 'blur(3px)';
      }
    }, 900);

    // ── VICTIM TIMER — 60 seconds ──
    clearInterval(window._countdown);
    timeLeft = 60;
    timerEl.textContent = '60';
    timerEl.style.color = '#FFD54F';

    window._countdown = setInterval(function() {
      if (gameOver) return;
      timeLeft--;
      timerEl.textContent = timeLeft;
      if (timeLeft <= 30) timerEl.style.color = '#FF5722';
      if (timeLeft <= 10) timerEl.style.color = '#FF1744';
      if (timeLeft <= 0) {
        clearInterval(window._countdown);
        endGame();
      }
    }, 1000);

    setTimeout(function() {
      showMessage(
        '👴 You are 70. Vision limited. 60 seconds only!',
        '#FFD54F'
      );
      speak('Elderly mode. Move carefully.');
    }, 500);

    setTimeout(function() {
      if (!gameOver) {
        showMessage('💓 Heart rate rising. Stay calm!', '#FF8A80');
        speak('Stay calm. Decide now.');
      }
    }, 30000);
  }

  // ── DEFAULT FLOOD ──
  else {
    sky.setAttribute('color', '#0a1628');
    ground.setAttribute('color', '#1B5E20');
    water.setAttribute('color', '#0D47A1');
    hud.textContent = '🌊 FLASH FLOOD';
    hud.style.color = '#90CAF9';
    setTimeout(function() {
      showMessage('🌊 Flood rising! Choose escape!', '#2196F3');
      speak('Flood alert. Choose wisely.');
    }, 500);
  }

});