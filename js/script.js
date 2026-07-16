/* ============================================================
   松柏祭 案内サイト メインスクリプト
   構成:
     1. カウントダウン処理
     2. スクロール時フェードイン処理
     3. 下部タブバーの選択状態制御
     4. Hero下部バーの固定化(位置・デザインそのまま画面上部へ固定)
     5. 起動時スプラッシュ(白背景 → ページへゆっくり切り替え)
     6. 初期化処理(DOMContentLoaded)
   ============================================================ */

/* ---------- 1. カウントダウン処理 ---------- */

const OPENING_CEREMONY_DATE = '2026-09-05';

function updateCountdown() {
  const countdownEl = document.getElementById('countdown-days');
  if (!countdownEl) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(OPENING_CEREMONY_DATE);
  targetDate.setHours(0, 0, 0, 0);

  const diffMs = targetDate - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const displayDays = diffDays > 0 ? diffDays : 0;

  countdownEl.textContent = String(displayDays).padStart(2, '0');
}

/* ---------- 2. スクロール時フェードイン処理 ---------- */

function initScrollFadeIn() {
  const targets = document.querySelectorAll('.fade-in-section');
  if (targets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------- 3. 下部タブバーの選択状態制御 ---------- */

function initTabBar() {
  const tabItems = document.querySelectorAll('.tab-item');
  if (tabItems.length === 0) return;

  tabItems.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabItems.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
    });
  });
}

/* ---------- 4. Hero下部バーの固定化 ---------- */

function initHeroBarPin() {
  const bar = document.getElementById('hero-footer-bar');
  if (!bar) return;

  let originalTop = 0;

  const measureOriginalTop = () => {
    const wasPinned = bar.classList.contains('is-pinned');
    if (wasPinned) bar.classList.remove('is-pinned');

    originalTop = bar.getBoundingClientRect().top + window.scrollY;

    if (wasPinned) bar.classList.add('is-pinned');
  };

  const togglePin = () => {
    if (window.scrollY >= originalTop) {
      bar.classList.add('is-pinned');
    } else {
      bar.classList.remove('is-pinned');
    }
  };

  measureOriginalTop();
  togglePin();

  window.addEventListener('scroll', togglePin, { passive: true });
  window.addEventListener('resize', () => {
    measureOriginalTop();
    togglePin();
  });
}

/* ---------- 5. 起動時スプラッシュ(白背景 → ページへゆっくり切り替え) ---------- */

function initSplashIntro() {
  const splash = document.getElementById('splash');
  if (!splash) return;

  document.body.classList.add('is-splash-active');

  const hideSplash = () => {
    splash.classList.add('is-hidden');
    document.body.classList.remove('is-splash-active');

    window.setTimeout(() => {
      if (splash.parentNode) {
        splash.parentNode.removeChild(splash);
      }
    }, 1600);
  };

  window.setTimeout(hideSplash, 900);
}

/* ---------- 6. 初期化処理 ---------- */

document.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  initScrollFadeIn();
  initTabBar();
  initHeroBarPin();
  initSplashIntro();
});
