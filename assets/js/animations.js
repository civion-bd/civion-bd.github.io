/* ============================================================
   Civion BD — animations.js
   Motion system per docs/animation.md. Deliberately mechanical:
   no bounce, no elastic easing (design.md §Micro Interactions).
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Generic Scroll Reveal ---------- */
  function initScrollReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    targets.forEach((t) => io.observe(t));
  }

  /* ---------- Storyboard strips (partnerships / careers / services workflow) ---------- */
  function initStoryboards() {
    document.querySelectorAll('.storyboard').forEach((sb) => {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) { sb.classList.add('is-visible'); io.unobserve(sb); } }),
        { threshold: 0.35 }
      );
      io.observe(sb);
    });
  }

  /* ---------- Featured Projects background crossfade (design.md Update 04) ---------- */
  function initProjectShowcase() {
    const showcase = document.querySelector('[data-project-showcase]');
    if (!showcase) return;
    const bgLayer = showcase.querySelector('.projects-showcase__bg-layer');
    const cards = showcase.querySelectorAll('[data-project-bg]');
    if (!bgLayer || !cards.length) return;

    function activate(card) {
      const bg = card.getAttribute('data-project-bg');
      const existing = bgLayer.querySelector(`[data-bg-src="${bg}"]`);
      bgLayer.querySelectorAll('.projects-showcase__bg').forEach((el) => el.classList.remove('is-active'));
      if (existing) {
        existing.classList.add('is-active');
      } else {
        const layer = document.createElement('div');
        layer.className = 'projects-showcase__bg';
        layer.dataset.bgSrc = bg;
        layer.style.background = bg; // gradient placeholder per media-status.md (no READY photography yet)
        bgLayer.appendChild(layer);
        requestAnimationFrame(() => layer.classList.add('is-active'));
      }
    }
    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => activate(card));
      card.addEventListener('focus', () => activate(card));
    });
    activate(cards[0]);
  }

  /* ---------- Decorative ambient background videos (.bg-video-layer) ---------- */
  function initAmbientVideos() {
    const videos = document.querySelectorAll('.bg-video-layer video');
    if (!videos.length) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    videos.forEach((v) => {
      if (reduceMotion) {
        v.removeAttribute('autoplay');
        v.pause();
      } else {
        v.play().catch(() => {});
      }
    });
  }

  /* ---------- Hero Video (real footage) — falls back to the WebGL shader
     automatically if #hero-video isn't present on the page ---------- */
  function initHeroVideo() {
    const video = document.getElementById('hero-video');
    if (!video) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      // Respect the user's preference: show the poster frame, no autoplay.
      video.removeAttribute('autoplay');
      video.pause();
      return;
    }
    // Some browsers need a play() nudge even with the autoplay attribute set.
    const tryPlay = () => video.play().catch(() => {});
    if (video.readyState >= 2) tryPlay();
    else video.addEventListener('loadeddata', tryPlay, { once: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) video.pause();
      else tryPlay();
    });
  }

  /* ---------- Hero WebGL Shader Background ---------- */
  /* Adapted from stitch_corporate_website_design/shader/code.html —
     procedural "Industrial Elegance" flow field, tuned to the
     production palette (charcoal / gunmetal / engineering blue). */
  function initHeroShader() {
    const canvas = document.getElementById('hero-shader-canvas');
    if (!canvas) return;

    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      canvas.style.display = 'none';
      return; // graceful degrade — CSS gradient/grid background remains
    }
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(syncSize).observe(canvas);
    syncSize();

    const vs = `attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }`;
    const fs = `precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      void main() {
        vec2 uv = v_texCoord;
        vec2 p = uv * 4.0;

        float grid = 0.0;
        vec2 gridUv = fract(uv * 20.0);
        grid = smoothstep(0.02, 0.0, abs(gridUv.x - 0.5)) + smoothstep(0.02, 0.0, abs(gridUv.y - 0.5));
        grid *= 0.12;

        float n = noise(p + u_time * 0.06);
        float n2 = noise(p * 2.0 - u_time * 0.035);
        float intensity = smoothstep(0.35, 0.7, n * n2);

        vec3 colorCharcoal = vec3(0.106, 0.122, 0.141); /* #1B1F24 */
        vec3 colorAccent   = vec3(0.302, 0.557, 0.800);  /* #4D8ECC */
        vec3 colorGunmetal = vec3(0.165, 0.184, 0.212);  /* #2A2F36 */

        vec3 finalColor = mix(colorCharcoal, colorGunmetal, n);
        finalColor = mix(finalColor, colorAccent * 0.45, intensity * 0.6);
        finalColor += grid * colorAccent * 0.18;

        gl_FragColor = vec4(finalColor, 1.0);
      }`;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');

    let raf;
    function render(t) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      render(0);
    } else {
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && raf) cancelAnimationFrame(raf);
      else if (!document.hidden && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) render(0);
    });
  }

  document.addEventListener('civion:chrome-ready', () => {
    initScrollReveal();
    initStoryboards();
    initProjectShowcase();
    initHeroVideo();
    initAmbientVideos();
    initHeroShader();
  });

  // Fallback in case main.js dispatch races DOMContentLoaded on pages without chrome.
  document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('[data-include="navbar"]')) {
      initScrollReveal();
      initStoryboards();
      initProjectShowcase();
      initHeroVideo();
      initAmbientVideos();
      initHeroShader();
    }
  });
})();
