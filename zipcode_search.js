'use strict';

{

const zipInput = document.getElementById('zip');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');

const resultText = document.getElementById('result');
const resultBody = document.getElementById('resultBody');
const resultArea = document.querySelector('.result-area');

function normalizeZip(value = '') {
  const half = String(value).replace(/[０-９]/g, function (ch) {
    return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
  });

  return half.replace(/[^0-9]/g, '');
}

function formatZip(zip7 = '') {
  const s = String(zip7);
  if (s.length !== 7) return s;
  return s.slice(0, 3) + '-' + s.slice(3);
}

function clearTable() {
  resultBody.innerHTML = '';
}

function hideResultArea() {
  if (resultArea) resultArea.style.display = 'none';
}

function showResultArea() {
  if (resultArea) resultArea.style.display = 'block';
}

function showMessage(text = '', el = resultText, type = 'success') {
  if (!el) return;

  el.textContent = String(text);
  el.classList.remove('error', 'success');
  el.classList.add(type);
}

function renderTable(results = []) {
  let html = '';

  for (let i = 0; i < results.length; i++) {
    const r = results[i];

    html += `
      <tr>
        <td>${formatZip(r.zipcode)}</td>
        <td>${r.address1}</td>
        <td>${r.address2}</td>
        <td>${r.address3}</td>
        <td>${r.kana1}</td>
        <td>${r.kana2}</td>
        <td>${r.kana3}</td>
        <td>${r.prefcode}</td>
      </tr>
    `;
  }

  resultBody.innerHTML = html;
}

async function searchAddress() {
  const raw = zipInput.value.trim();
  const zip = normalizeZip(raw);

  clearTable();
  hideResultArea();

  // 未入力時のエラー文
  if (zip.length === 0) {
    showMessage('郵便番号を入力してください。', resultText, 'error');
    return;
  }

  // 不正な郵便番号を入力したときのエラー文
  if (zip.length !== 7) {
    showMessage('不正な郵便番号です。', resultText, 'error');
    return;
  }

  showMessage('検索中...');

  const url = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${encodeURIComponent(zip)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 200) {
      showMessage(data.message || '検索に失敗しました。', resultText, 'error');
      return;
    }

    if (data.results === null) {
      showMessage('郵便番号が見つかりませんでした。', resultText, 'error');
      return;
    }

    showResultArea();
    renderTable(data.results);
    showMessage(`郵便番号：${formatZip(zip)}（${data.results.length}件）`);
  } catch (e) {
    console.log(e);
    showMessage('通信エラーが発生しました。', resultText, 'error');
  }
}

function resetAll() {
  zipInput.value = '';
  clearTable();
  hideResultArea();
  showMessage('');
}

// 入力後、検索ボタンを押したとき
searchBtn.addEventListener('click', function () {
  searchAddress();
});

// 入力後、Enterを押したときにも反応する処理
zipInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    searchAddress();
  }
});

// リセットボタンを押したとき
resetBtn.addEventListener('click', function () {
  resetAll();
});

hideResultArea();

}

// 課題1：郵便番号の表示が検索欄の真下に来てしまったので、表の下に戻したい