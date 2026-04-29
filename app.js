// ═══ CINEMATIC INTRO ═══
window.addEventListener('load', () => {
  setTimeout(() => {
    const intro = document.getElementById('intro-screen');
    const app   = document.getElementById('app');
    if (!intro || !app) return;
    intro.style.opacity = '0';
    setTimeout(() => {
      intro.style.display = 'none';
      app.style.display = 'block';
      initParticles();
      getWeather();
    }, 800);
  }, 2200);
});

// ═══ PARTICLES ═══
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  const particles = [];
  const count = 80;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      o: Math.random() * 0.5 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,229,255,${p.o})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    // Draw connections
    particles.forEach((a, i) => {
      particles.slice(i + 1).forEach(b => {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle =
            `rgba(33,150,243,${0.08 * (1 - dist/120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ═══ LIVE WEATHER ═══
async function getWeather() {
  const cityEl  = document.getElementById('cityName');
  const riskEl  = document.getElementById('riskLevel');
  const barEl   = document.getElementById('riskBar');
  const barLbl  = document.getElementById('riskBarLabel');
  const liveEl  = document.getElementById('liveText');
  const badgeEl = document.getElementById('liveBadge');

  try {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;

      const [weatherRes, geoRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast` +
          `?latitude=${lat}&longitude=${lon}` +
          `&current=rain,precipitation,weathercode`),
        fetch(`https://nominatim.openstreetmap.org/reverse` +
          `?lat=${lat}&lon=${lon}&format=json`)
      ]);

      const weather = await weatherRes.json();
      const geo     = await geoRes.json();

      const city = geo.address.city
                || geo.address.town
                || geo.address.village
                || geo.address.state
                || 'Your City';

      const rain  = weather.current.rain || 0;
      const precip= weather.current.precipitation || 0;
      const total = rain + precip;

      if (cityEl) cityEl.textContent = city;

      if (total > 5) {
        riskEl.textContent = '🔴 HIGH FLOOD RISK — Train NOW';
        riskEl.style.color = '#EF5350';
        barEl.style.background =
          'linear-gradient(90deg,#EF5350,#FF1744)';
        barEl.style.width = '85%';
        barLbl.textContent = 'HIGH';
        if (liveEl) liveEl.textContent =
          `⚠️ ${city} — High risk detected`;
      } else if (total > 1) {
        riskEl.textContent = '🟡 MODERATE RISK — Stay Prepared';
        riskEl.style.color = '#FFB74D';
        barEl.style.background =
          'linear-gradient(90deg,#FFB74D,#FF8F00)';
        barEl.style.width = '50%';
        barLbl.textContent = 'MOD';
        if (liveEl) liveEl.textContent =
          `📍 ${city} — Moderate risk`;
      } else {
        riskEl.textContent = '🟢 LOW RISK TODAY — Always Be Ready';
        riskEl.style.color = '#66BB6A';
        barEl.style.background =
          'linear-gradient(90deg,#66BB6A,#2E7D32)';
        barEl.style.width = '25%';
        barLbl.textContent = 'LOW';
        if (liveEl) liveEl.textContent =
          `📍 ${city} — Low risk today`;
      }
    }, () => {
      if (cityEl) cityEl.textContent = 'Bengaluru';
      if (riskEl) {
        riskEl.textContent = '🟡 MODERATE RISK — Stay Prepared';
        riskEl.style.color = '#FFB74D';
      }
      if (liveEl) liveEl.textContent = '📍 Bengaluru — Live risk active';
    });
  } catch(e) {
    if (cityEl) cityEl.textContent = 'Bengaluru';
    if (liveEl) liveEl.textContent = '📍 Live risk monitoring active';
  }
}

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .catch(() => {});
}