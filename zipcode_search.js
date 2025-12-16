'use strict';

const zipInput = document.getElementById('zip');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');

const resultText = document.getElementById('result');
const resultBody = document.getElementById('resultBody');
const resultArea = document.querySelector('.result-area');

function normalizeZip(value) {
  return value.replace(/[^0-9]/g, '');
}

function formatZip(zip7) {
  return zip7.slice(0, 3) + '-' + zip7.slice(3);
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

function showMessage(text) {
  resultText.textContent = text;
}

function renderTable(results) {
  let html = '';

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    html += '<tr>';
    html += '<td>' + formatZip(r.zipcode) + '</td>';
    html += '<td>' + r.address1 + '</td>';
    html += '<td>' + r.address2 + '</td>';
    html += '<td>' + r.address3 + '</td>';
    html += '<td>' + r.kana1 + '</td>';
    html += '<td>' + r.kana2 + '</td>';
    html += '<td>' + r.kana3 + '</td>';
    html += '<td>' + r.prefcode + '</td>';
    html += '</tr>';
  }

  resultBody.innerHTML = html;
}

function searchAddress() {
  const raw = zipInput.value.trim();
  const zip = normalizeZip(raw);

  clearTable();

  if (zip.length !== 7) {
    hideResultArea();
    showMessage('不正な郵便番号です（7桁で入力してください）。');
    return;
  }

  showMessage('検索中...');

  const url = 'https://zipcloud.ibsnet.co.jp/api/search?zipcode=' + zip;

  fetch(url)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data.status !== 200) {
        hideResultArea();
        showMessage(data.message || '検索に失敗しました。');
        return;
      }

      if (data.results === null) {
        hideResultArea();
        showMessage('郵便番号が見つかりませんでした。');
        return;
      }

      showResultArea();
      renderTable(data.results);
      showMessage('郵便番号：' + formatZip(zip) + '（' + data.results.length + '件）');
    })
    .catch(function () {
      hideResultArea();
      showMessage('通信エラーが発生しました。');
    });
}

function resetAll() {
  zipInput.value = '';
  clearTable();
  hideResultArea();
  showMessage('ここに住所が表示されます');
}

searchBtn.addEventListener('click', function () {
  searchAddress();
});

resetBtn.addEventListener('click', function () {
  resetAll();
});

//エラーが出たとき、反応がないので直したい
//検索前は表が出ない方が綺麗？な気がするので検索前は表示させないようにしたい