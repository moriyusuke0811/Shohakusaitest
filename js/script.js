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

/**
 * 開会式の日付(あとから変更しやすいようここに1箇所だけ定義)
 * 例: '2026-09-05' のように 'YYYY-MM-DD' 形式で指定してください。
 */
const OPENING_CEREMONY_DATE = '2026-09-05';

/**
 * 指定日までの残り日数を計算して表示する関数
 * ・今日の日付と開会式日の差分から「あと何日か」を算出
 * ・当日または過ぎている場合は 0 を表示
 */
function updateCountdown() {
  const countdownEl = document.getElementById('countdown-days');
  if (!countdownEl) return; // 要素が無いページでは何もしない

  const today = new Date();
  // 時刻情報をリセットして「日数」だけで比較できるようにする
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(OPENING_CEREMONY_DATE);
  targetDate.setHours(0, 0, 0, 0);

  const diffMs = targetDate - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // マイナス(開催済み)の場合は 0 を表示
  const displayDays = diffDays > 0 ? diffDays : 0;

  // 2桁ゼロ埋めで表示(例: 03日)
  countdownEl.textContent = String(displayDays).padStart(2, '0');
}

/* ---------- 2. スクロール時フェードイン処理 ---------- */

/**
 * IntersectionObserver を使って、画面内に入ったセクションに
 * is-visible クラスを付与し、CSS側のフェードインアニメーションを発火させる
 */
function initScrollFadeIn() {
  const targets = document.querySelectorAll('.fade-in-section');
  if (targets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // 一度表示したら監視を解除(再度アニメーションさせない)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15, // 要素の15%が見えたら発火
    }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------- 3. 下部タブバーの選択状態制御 ---------- */

/**
 * タブがクリックされたときに is-active クラスを切り替える関数
 * ・同一ページ内リンク(#hero など)は即座に見た目を切り替える
 * ・他ページへの遷移リンクは各ページ側で現在地に応じたクラス付与を想定
 */
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

/**
 * Hero内の「第78回 松柏祭」帯(#hero-footer-bar)を、
 * 元の位置・デザインのまま画面上部に固定するための関数。
 * フェードインやスライドといった演出は行わず、
 * 帯の本来の位置が画面上端(0)を通過した瞬間に瞬時に固定へ切り替える。
 */
function initHeroBarPin() {
  const bar = document.getElementById('hero-footer-bar');
  if (!bar) return;

  // 帯が固定されていない(通常配置の)状態でのドキュメント上のY座標
  let originalTop = 0;

  // is-pinned を外した状態で座標を測り直す(固定中に測ると常に0になってしまうため)
  const measureOriginalTop = () => {
    const wasPinned = bar.classList.contains('is-pinned');
    if (wasPinned) bar.classList.remove('is-pinned');

    originalTop = bar.getBoundingClientRect().top + window.scrollY;

    if (wasPinned) bar.classList.add('is-pinned');
  };

  // 現在のスクロール位置に応じて固定状態を切り替える
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
  // 画面回転やウィンドウ幅変更でHeroの高さが変わる場合に備えて再計測する
  window.addEventListener('resize', () => {
    measureOriginalTop();
    togglePin();
  });
}

/* ---------- 5. 起動時スプラッシュ(白背景 → ページへゆっくり切り替え) ---------- */

/**
 * ページを開いた瞬間は白背景の上に Hero ロゴだけが表示された状態にしておき、
 * 少し間を置いてから白背景をゆっくりフェードアウトさせることで
 * ページ全体(ストライプ・グラデーション等)へなめらかに切り替わる演出。
 *
 * スプラッシュ内のロゴは Hero 本体のロゴと同じ .hero__logo クラスを使っており、
 * 配置ルール(margin-top・width)が完全に共通のため、
 * 切り替わり前後でロゴの位置・大きさは一切変化しない。
 */
function initSplashIntro() {
  const splash = document.getElementById('splash');
  if (!splash) return;

  // スプラッシュ表示中はスクロールを止めておく
  document.body.classList.add('is-splash-active');

  const hideSplash = () => {
    splash.classList.add('is-hidden');
    document.body.classList.remove('is-splash-active');

    // トランジション終了後にDOMから取り除いて後片付け
    window.setTimeout(() => {
      if (splash.parentNode) {
        splash.parentNode.removeChild(splash);
      }
    }, 1600);
  };

  // ロゴをひと呼吸見せてから、ゆっくり白背景を透明にしてページへ切り替える
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