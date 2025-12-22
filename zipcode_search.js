'use strict';

{

const zipInput = document.getElementById('zip');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');

const resultBody = document.getElementById('resultBody');
const resultArea = document.querySelector('.result-area');

const errorText = document.getElementById('errorMessage');
const successText = document.getElementById('successMessage');

/**
 * 郵便番号を正規化する
 * 全角数字を半角に変換し、数字以外を除去する
 * @param {string} value
 * @returns {string}
 */
function normalizeZip(value = '') {
  const half = String(value).replace(/[０-９]/g, function (ch) {
    return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
  });

  return half.replace(/[^0-9]/g, '');
}

/**
 * HTMLエスケープ処理
 * XSS（HTMLインジェクション）対策
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 7桁の郵便番号文字列を「123-4567」形式に整形する */
function formatZip(zip7 = '') {
  const s = String(zip7);
  if (s.length !== 7) return s;
  return s.slice(0, 3) + '-' + s.slice(3);
}

/** 表（tbody）を空にする */
function clearTable() {
  resultBody.innerHTML = '';
}

/** 結果エリアを非表示にする */
function hideResultArea() {
  if (resultArea) resultArea.style.display = 'none';
}

/** 結果エリアを表示にする */
function showResultArea() {
  if (resultArea) resultArea.style.display = 'block';
}

/**
 * メッセージを指定要素に表示する
 * @param {string} text 表示する文字列
 * @param {HTMLElement} el 表示先の要素
 * @param {'success'|'error'} type メッセージ種別
 */
function showMessage(text = '', el = successText, type = 'success') {
  if (!el) return;

  el.textContent = String(text);
  el.classList.remove('error', 'success');
  el.classList.add(type);
}

/**
 * 検索結果を表に描画する
 * escapeHtmlでエスケープする
 * @param {Array<Object>} results
 */
function renderTable(results = []) {
  clearTable();

  let html = '';
  for (const r of results) {
    html += `
      <tr>
        <td>${formatZip(r.zipcode ?? '')}</td>
        <td>${escapeHtml(r.address1 ?? '')}</td>
        <td>${escapeHtml(r.address2 ?? '')}</td>
        <td>${escapeHtml(r.address3 ?? '')}</td>
        <td>${escapeHtml(r.kana1 ?? '')}</td>
        <td>${escapeHtml(r.kana2 ?? '')}</td>
        <td>${escapeHtml(r.kana3 ?? '')}</td>
        <td>${escapeHtml(r.prefcode ?? '')}</td>
      </tr>
    `;
  }

  resultBody.innerHTML = html;
}

/**
 * 郵便番号を検索して結果を表示する
 * - 入力チェック
 * - API通信
 * - エラー/成功メッセージの表示
 */
async function searchAddress() {
  const raw = zipInput.value.trim();
  const zip = normalizeZip(raw);

  clearTable();
  hideResultArea();

  // メッセージを最初に消す
  showMessage('', errorText);
  showMessage('', successText);

  // 未入力時のエラー文
  if (zip.length === 0) {
    showMessage('郵便番号を入力してください。', errorText, 'error');
    return;
  }

  // 不正な郵便番号を入力した時のエラー文
  if (zip.length !== 7) {
    showMessage('不正な郵便番号です。', errorText, 'error');
    return;
  }

  showMessage('検索中...', errorText, 'success');

  const url = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${encodeURIComponent(zip)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    const data = await res.json();
    showMessage('', errorText);

    if (data.status !== 200) {
      showMessage(data.message || '検索に失敗しました。', errorText, 'error');
      return;
    }

    if (data.results === null) {
      showMessage('入力された郵便番号に対応する住所が見つかりませんでした。', errorText, 'error');
      return;
    }

    showResultArea();
    renderTable(data.results);

    showMessage(
      `郵便番号：${formatZip(zip)}（${data.results.length}件）`,
      successText,
      'success'
    );
    } catch (e) {
      if (e.name === 'AbortError') {
        showMessage('通信がタイムアウトしました。', errorText, 'error');
      } else {
        console.log(e);
        showMessage('通信エラーが発生しました。', errorText, 'error');
      }
    }
  }

/** 入力・表示を初期状態に戻す */
function resetAll() {
  zipInput.value = '';
  clearTable();
  hideResultArea();
  showMessage('', errorText);
  showMessage('', successText);
}

// 入力後、検索ボタンを押したとき
searchBtn.addEventListener('click', function () {
  searchAddress();
});

// 入力後、Enterを押したときにも反応する処理
zipInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    searchAddress();
  }
});

// リセットボタンを押したとき
resetBtn.addEventListener('click', function () {
  resetAll();
});

hideResultArea();

}