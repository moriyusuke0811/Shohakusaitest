/* ============================================================
   松柏祭 案内サイト メインスクリプト
   構成:
     1. カウントダウン処理
     2. スクロール時フェードイン処理
     3. 下部タブバーの選択状態制御
     4. 全体テーマ モーダル制御
     5. 初期化処理(DOMContentLoaded)
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

/* ---------- 4. 全体テーマ モーダル制御 ---------- */

/**
 * 「全体テーマ」ボタン押下でモーダルを開き、
 * 閉じるボタン・オーバーレイクリックで閉じる関数
 */
function initThemeModal() {
  const openBtn = document.getElementById('theme-open-btn');
  const closeBtn = document.getElementById('theme-close-btn');
  const modal = document.getElementById('theme-modal');

  if (!openBtn || !modal) return;

  const openModal = () => {
    modal.classList.add('is-visible');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // 背景スクロールを止める
  };

  const closeModal = () => {
    modal.classList.remove('is-visible');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  // オーバーレイ(背景)クリックでも閉じる
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // ESCキーでも閉じられるようにする
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-visible')) {
      closeModal();
    }
  });
}

/* ---------- 5. 初期化処理 ---------- */

document.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  initScrollFadeIn();
  initTabBar();
  initThemeModal();
});
