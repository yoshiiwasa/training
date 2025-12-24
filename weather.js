'use strict';

{
  const prefSelect = document.getElementById('prefSelect');
  const citySelect = document.getElementById('citySelect');
  const msg = document.getElementById('weatherMessage');
  const out = document.getElementById('weatherOutput');

  function showMessage(text = '') {
    if (!msg) return;
    msg.textContent = String(text);
  }

  function showOutput(text = '') {
    if (!out) return;
    out.textContent = String(text);
  }

  function setOptions(selectEl, list, placeholder) {
    selectEl.innerHTML = `<option value="">${placeholder}</option>`;
    for (const item of list) {
      const opt = document.createElement('option');
      opt.value = item.value;
      opt.textContent = item.label;
      selectEl.appendChild(opt);
    }
  }

  // XML→「使いやすい形（JSONっぽい）」に変換
  // { "東京都": [ {id, name, source}, ... ], "神奈川県": [...] } みたいな形
  function xmlToPrefMap(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, 'application/xml');

    const prefNodes = doc.querySelectorAll('pref[title]');
    const prefMap = {};

    for (const prefNode of prefNodes) {
      const prefName = prefNode.getAttribute('title') || '';
      if (!prefName) continue;

      const cities = [];
      const cityNodes = prefNode.querySelectorAll('city[title][id]');

      for (const cityNode of cityNodes) {
        const name = cityNode.getAttribute('title') || '';
        const id = cityNode.getAttribute('id') || '';
        const source = cityNode.getAttribute('source') || '';
        if (!name || !id) continue;

        cities.push({ id, name, source });
      }

      if (cities.length > 0) {
        prefMap[prefName] = cities;
      }
    }

    return prefMap;
  }

  async function init() {
    if (!prefSelect || !citySelect || !msg || !out) return;

    showMessage('エリア定義(XML)を読み込み中...');
    showOutput('');

    try {
      // 同じ階層に city_code.xml を置く
      const res = await fetch('./city_code.xml');
      const xmlText = await res.text();

      const prefMap = xmlToPrefMap(xmlText);

      // 1段目（都道府県）を作る
      const prefList = Object.keys(prefMap).map(name => ({
        value: name,
        label: name,
      }));

      setOptions(prefSelect, prefList, '-- 都道府県を選択 --');

      // 2段目（地点）
      prefSelect.addEventListener('change', function () {
        const prefName = prefSelect.value;

        citySelect.style.display = 'none';
        setOptions(citySelect, [], '-- 地点を選択 --');
        showOutput('');

        if (!prefName) {
          showMessage('都道府県を選択してください。');
          return;
        }

        const cities = prefMap[prefName] || [];
        const cityOptions = cities.map(c => ({
          value: c.id,
          label: c.name,
        }));

        setOptions(citySelect, cityOptions, '-- 地点を選択 --');
        citySelect.style.display = 'inline-block';
        showMessage('地点を選択してください。');

        // 2段目が変わったらIDとURLを表示（まずはここまででOK）
        citySelect.onchange = function () {
          const cityId = citySelect.value;
          const city = cities.find(c => c.id === cityId);

          if (!city) {
            showOutput('');
            return;
          }

          showMessage('選択できました！');
          showOutput(
            `都道府県：${prefName}\n地点：${city.name}\nID：${city.id}\nRSS：${city.source}`
          );
        };
      });

      showMessage('都道府県を選択してください。');
    } catch (e) {
      console.log(e);
      showMessage('XMLの読み込みに失敗しました。city_code.xml の配置を確認してください。');
    }
  }

  init();
}
