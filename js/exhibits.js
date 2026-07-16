/* ============================================================
   展示索引ページ専用スクリプト
   構成:
     1. タイル描画
     2. カテゴリーチップ描画・切り替え
     3. 検索(キーワード)フィルタリング
     4. 詳細モーダルの開閉
     5. URLクエリ(?spot=id)からの直接オープン(マップ連携用)
     6. 初期化処理
   ============================================================ */

(() => {
  const DATA = typeof EXHIBITS_DATA !== 'undefined' ? EXHIBITS_DATA : [];

  const gridEl = document.getElementById('exhibits-grid');
  const emptyEl = document.getElementById('exhibits-empty');
  const countEl = document.getElementById('exhibit-result-count');
  const searchInput = document.getElementById('exhibit-search-input');
  const chipsEl = document.getElementById('exhibit-filter-chips');

  const modal = document.getElementById('exhibit-modal');
  const modalImage = document.getElementById('exhibit-modal-image');
  const modalTag = document.getElementById('exhibit-modal-tag');
  const modalTitle = document.getElementById('exhibit-modal-title');
  const modalLocation = document.getElementById('exhibit-modal-location');
  const modalDesc = document.getElementById('exhibit-modal-desc');
  const modalMapLink = document.getElementById('exhibit-modal-map-link');

  if (!gridEl) return; // 展示索引ページ以外では何もしない

  let activeCategory = 'すべて';
  let keyword = '';

  /* ---------- 1. タイル描画 ---------- */

  function createTileElement(item) {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'exhibit-tile';
    tile.dataset.id = item.id;
    tile.setAttribute('aria-haspopup', 'dialog');

    tile.innerHTML = `
      <span class="exhibit-tile__thumb" aria-hidden="true">
        <i class="fa-regular fa-image"></i>
      </span>
      <span class="exhibit-tile__body">
        <span class="exhibit-tile__category">${item.category}</span>
        <span class="exhibit-tile__title">${item.title}</span>
      </span>
    `;

    tile.addEventListener('click', () => openModal(item.id, true));
    return tile;
  }

  function renderGrid(items) {
    gridEl.innerHTML = '';
    const fragment = document.createDocumentFragment();
    items.forEach((item) => fragment.appendChild(createTileElement(item)));
    gridEl.appendChild(fragment);

    emptyEl.hidden = items.length !== 0;
    countEl.textContent = `${items.length}件 / 全${DATA.length}件`;
  }

  /* ---------- 2. カテゴリーチップ ---------- */

  function renderChips() {
    const categories = ['すべて', ...new Set(DATA.map((item) => item.category))];

    chipsEl.innerHTML = '';
    categories.forEach((category) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'exhibits-filter__chip';
      chip.textContent = category;
      chip.dataset.category = category;
      if (category === activeCategory) chip.classList.add('is-active');

      chip.addEventListener('click', () => {
        activeCategory = category;
        chipsEl
          .querySelectorAll('.exhibits-filter__chip')
          .forEach((c) => c.classList.toggle('is-active', c.dataset.category === category));
        applyFilters();
      });

      chipsEl.appendChild(chip);
    });
  }

  /* ---------- 3. 検索フィルタリング ---------- */

  function applyFilters() {
    const kw = keyword.trim().toLowerCase();

    const filtered = DATA.filter((item) => {
      const matchesCategory = activeCategory === 'すべて' || item.category === activeCategory;
      if (!matchesCategory) return false;
      if (!kw) return true;

      const haystack = [item.title, item.category, item.location, ...(item.tags || [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(kw);
    });

    renderGrid(filtered);
  }

  /* ---------- 4. 詳細モーダル ---------- */

  function openModal(id, updateUrl) {
    const item = DATA.find((d) => d.id === id);
    if (!item) return;

    modalTag.textContent = item.category;
    modalTitle.textContent = item.title;
    modalLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${item.location}`;
    modalDesc.textContent = item.description;
    modalMapLink.href = `map.html?spot=${encodeURIComponent(item.id)}`;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-splash-active'); // スクロールロックを流用

    if (updateUrl && window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('spot', id);
      window.history.replaceState({}, '', url);
    }
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-splash-active');

    if (window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('spot');
      window.history.replaceState({}, '', url);
    }
  }

  modal.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  /* ---------- 5. URLクエリ(?spot=id)からの直接オープン ---------- */
  /* マップページなど他画面から「この展示の詳細を開いた状態」でリンクできるようにするための入口。
     例: exhibits.html?spot=class-1-1 */
  function openFromQueryIfNeeded() {
    const params = new URLSearchParams(window.location.search);
    const spot = params.get('spot');
    if (spot && DATA.some((d) => d.id === spot)) {
      openModal(spot, false);
    }
  }

  /* ---------- 6. 初期化処理 ---------- */

  searchInput.addEventListener('input', (e) => {
    keyword = e.target.value;
    applyFilters();
  });

  renderChips();
  applyFilters();
  openFromQueryIfNeeded();
})();
