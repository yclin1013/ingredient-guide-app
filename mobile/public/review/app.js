(function () {
  'use strict';

  var STORAGE_KEY = 'review-checklist-v2';
  var state = loadState();
  var currentFilter = 'all';

  var loadStatus = document.getElementById('load-status');
  var parseInput = document.getElementById('paste-input');
  var parseBtn = document.getElementById('parse-btn');
  var clearInputBtn = document.getElementById('clear-input-btn');
  var parseStatus = document.getElementById('parse-status');
  var listContainer = document.getElementById('list-container');
  var summaryEl = document.getElementById('summary');
  var syncBtn = document.getElementById('sync-btn');
  var syncStatus = document.getElementById('sync-status');
  var filterButtons = document.querySelectorAll('.filter-pill');

  // ---------- 本機儲存 ----------

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { items: {} };
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.items) return { items: {} };
      return parsed;
    } catch (err) {
      return { items: {} };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function allItems() {
    return Object.keys(state.items).map(function (id) {
      return state.items[id];
    });
  }

  // 有本機異動、還沒推上試算表（不論打勾或取消打勾都算）
  function isDirty(item) {
    return !!item.updatedAt && (!item.syncedAt || item.updatedAt > item.syncedAt);
  }

  // ---------- 解析 VERIFICATION_TODO.md ----------

  function makeId(category, name, field) {
    return [category, name, field].join('__');
  }

  // 「產季」在查證來源對照裡依分類拆成「產季（蔬菜／水果）」「產季（海鮮）」兩種標籤，
  // 待查證清單表格裡的欄位名稱則一律是通用的「產季」，這裡比照 scripts/check-verification.js 的邏輯還原對應。
  function resolveSource(legend, field, category) {
    if (field === '產季') {
      var key = category === '海鮮' ? '產季（海鮮）' : '產季（蔬菜／水果）';
      return legend[key] || legend[field] || '';
    }
    return legend[field] || '';
  }

  function parseMarkdown(text) {
    var lines = text.split('\n');
    var sourceLegend = {}; // label -> source text
    var legendPattern = /^-\s*\*\*(.+?)\*\*[：:]\s*(.+)$/;
    var tableRowPattern = /^\|(.+)\|\s*$/;

    lines.forEach(function (line) {
      var m = legendPattern.exec(line.trim());
      if (m) {
        sourceLegend[m[1].trim()] = m[2].trim();
      }
    });

    var items = [];
    lines.forEach(function (line) {
      var trimmed = line.trim();
      var m = tableRowPattern.exec(trimmed);
      if (!m) return;
      var cells = m[1].split('|').map(function (c) {
        return c.trim();
      });
      if (cells.length < 3) return;
      // 跳過表頭與分隔線
      if (cells[0] === '分類' || /^:?-+:?$/.test(cells[0])) return;

      var category = cells[0];
      var name = cells[1];
      var fieldsRaw = cells[2];
      if (!category || !name || !fieldsRaw) return;

      var fields = fieldsRaw
        .split('、')
        .map(function (f) {
          return f.trim();
        })
        .filter(Boolean);

      fields.forEach(function (field) {
        items.push({
          id: makeId(category, name, field),
          category: category,
          name: name,
          field: field,
          source: resolveSource(sourceLegend, field, category),
        });
      });
    });

    return items;
  }

  function mergeParsedItems(parsedItems) {
    var added = 0;
    var updated = 0;
    parsedItems.forEach(function (parsed) {
      var existing = state.items[parsed.id];
      if (!existing) {
        state.items[parsed.id] = {
          id: parsed.id,
          category: parsed.category,
          name: parsed.name,
          field: parsed.field,
          source: parsed.source,
          checked: false,
          note: '',
          updatedAt: null,
          syncedAt: null,
          remoteUpdatedAt: null,
        };
        added++;
      } else {
        existing.category = parsed.category;
        existing.name = parsed.name;
        existing.field = parsed.field;
        existing.source = parsed.source;
        updated++;
      }
    });
    saveState();
    return { added: added, updated: updated };
  }

  parseBtn.addEventListener('click', function () {
    var text = parseInput.value;
    if (!text || !text.trim()) {
      setStatus(parseStatus, '請先貼上內容再解析。', 'error');
      return;
    }
    var parsed = parseMarkdown(text);
    if (parsed.length === 0) {
      setStatus(parseStatus, '沒有解析到任何項目，確認貼上的內容包含「待查證清單」表格。', 'error');
      return;
    }
    var result = mergeParsedItems(parsed);
    setStatus(
      parseStatus,
      '解析完成：新增 ' + result.added + ' 筆、更新 ' + result.updated + ' 筆（既有的核對狀態不會被清掉）。上傳到試算表中…',
      'ok'
    );
    render();
    uploadItemsToServer(parsed);
  });

  clearInputBtn.addEventListener('click', function () {
    parseInput.value = '';
    setStatus(parseStatus, '', 'muted');
  });

  function uploadItemsToServer(items) {
    var config = window.REVIEW_CONFIG || {};
    if (!config.syncUrl) {
      setStatus(parseStatus, '本機已加入清單；尚未設定同步網址，無法上傳到試算表。', 'ok');
      return;
    }
    postToServer('importItems', items.map(function (i) {
      return { id: i.id, category: i.category, name: i.name, field: i.field, source: i.source };
    }))
      .then(function (data) {
        if (!data || !data.ok) throw new Error((data && data.error) || '上傳失敗');
        setStatus(
          parseStatus,
          '本機已加入清單，並已上傳到試算表「項目清單」（新增 ' + data.inserted + '、更新 ' + data.updated + '）。',
          'ok'
        );
      })
      .catch(function (err) {
        setStatus(parseStatus, '本機已加入清單；上傳原始清單到試算表失敗：' + err.message, 'error');
      });
  }

  // ---------- 頁面載入：從試算表讀取最新狀態 ----------

  function loadFromServer() {
    var config = window.REVIEW_CONFIG || {};
    if (!config.syncUrl) {
      setStatus(loadStatus, '尚未設定同步網址，目前只會顯示本機資料。', 'muted');
      return;
    }
    setStatus(loadStatus, '正在從試算表讀取最新狀態…', 'muted');
    var url = config.syncUrl + '?secret=' + encodeURIComponent(config.passphrase || '');
    fetch(url)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.ok) {
          throw new Error((data && data.error) || '讀取失敗');
        }
        var result = mergeServerItems(data.items || []);
        setStatus(
          loadStatus,
          '已從試算表載入最新狀態（共 ' + data.items.length + ' 筆，本機另有 ' + result.keptLocal + ' 筆尚未同步的異動維持不變）。',
          'ok'
        );
        render();
      })
      .catch(function (err) {
        setStatus(loadStatus, '離線或讀取失敗，先顯示本機上次的資料（' + err.message + '）。', 'error');
      });
  }

  function mergeServerItems(serverItems) {
    var keptLocal = 0;
    serverItems.forEach(function (server) {
      var local = state.items[server.id];
      if (!local) {
        state.items[server.id] = {
          id: server.id,
          category: server.category,
          name: server.name,
          field: server.field,
          source: server.source,
          checked: server.checked,
          note: server.note || '',
          updatedAt: server.updatedAt,
          syncedAt: server.updatedAt,
          remoteUpdatedAt: server.updatedAt,
        };
        return;
      }
      local.category = server.category;
      local.name = server.name;
      local.field = server.field;
      local.source = server.source;
      if (isDirty(local)) {
        // 本機有還沒推上去的異動，先不要被伺服器資料蓋掉
        local.remoteUpdatedAt = server.updatedAt;
        keptLocal++;
      } else {
        local.checked = server.checked;
        local.note = server.note || '';
        local.updatedAt = server.updatedAt;
        local.syncedAt = server.updatedAt;
        local.remoteUpdatedAt = server.updatedAt;
      }
    });
    saveState();
    return { keptLocal: keptLocal };
  }

  // ---------- 清單畫面 ----------

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentFilter = btn.dataset.filter;
      filterButtons.forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      render();
    });
  });

  function itemMatchesFilter(item) {
    if (currentFilter === 'unchecked') return !item.checked;
    if (currentFilter === 'checked-unsynced') return item.checked && isDirty(item);
    if (currentFilter === 'synced') return !isDirty(item) && !!item.syncedAt;
    return true;
  }

  function render() {
    var items = allItems();

    var total = items.length;
    var checked = items.filter(function (i) {
      return i.checked;
    }).length;
    var synced = items.filter(function (i) {
      return !isDirty(i) && !!i.syncedAt;
    }).length;
    summaryEl.textContent = '共 ' + total + ' 筆・已核對 ' + checked + ' 筆・已同步 ' + synced + ' 筆';

    var visible = items.filter(itemMatchesFilter);

    listContainer.innerHTML = '';

    if (visible.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'empty-hint';
      empty.textContent = total === 0 ? '目前沒有清單項目，先在上方貼上內容並解析。' : '這個篩選條件下沒有項目。';
      listContainer.appendChild(empty);
      updateSyncButton(items);
      return;
    }

    // 依分類 -> 食材分組
    var groups = {}; // category -> name -> items[]
    visible.forEach(function (item) {
      if (!groups[item.category]) groups[item.category] = {};
      if (!groups[item.category][item.name]) groups[item.category][item.name] = [];
      groups[item.category][item.name].push(item);
    });

    Object.keys(groups).forEach(function (category) {
      var catWrap = document.createElement('div');
      catWrap.className = 'category-group';

      var catTitle = document.createElement('div');
      catTitle.className = 'category-title';
      catTitle.textContent = category;
      catWrap.appendChild(catTitle);

      Object.keys(groups[category]).forEach(function (name) {
        var ingWrap = document.createElement('div');
        ingWrap.className = 'ingredient-group';

        var ingName = document.createElement('div');
        ingName.className = 'ingredient-name';
        ingName.textContent = name;
        ingWrap.appendChild(ingName);

        groups[category][name].forEach(function (item) {
          ingWrap.appendChild(renderItemRow(item));
        });

        catWrap.appendChild(ingWrap);
      });

      listContainer.appendChild(catWrap);
    });

    updateSyncButton(items);
  }

  function renderItemRow(item) {
    var row = document.createElement('div');
    row.className = 'item-row';

    var head = document.createElement('div');
    head.className = 'item-head';

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!item.checked;
    checkbox.addEventListener('change', function () {
      item.checked = checkbox.checked;
      item.updatedAt = Date.now();
      saveState();
      render();
    });

    var textWrap = document.createElement('div');
    textWrap.style.flex = '1';

    var fieldLine = document.createElement('div');
    fieldLine.className = 'item-field';
    fieldLine.textContent = item.field;
    if (!isDirty(item) && item.syncedAt) {
      var badge = document.createElement('span');
      badge.className = 'badge badge-synced';
      badge.textContent = '已同步';
      fieldLine.appendChild(badge);
    }
    textWrap.appendChild(fieldLine);

    if (item.source) {
      var sourceLine = document.createElement('div');
      sourceLine.className = 'item-source';
      sourceLine.textContent = '建議來源：' + item.source;
      textWrap.appendChild(sourceLine);
    }

    head.appendChild(checkbox);
    head.appendChild(textWrap);
    row.appendChild(head);

    if (item.checked) {
      var noteInput = document.createElement('textarea');
      noteInput.className = 'note-input';
      noteInput.placeholder = '查證備註（例如：官方資料連結、查到的數值...）';
      noteInput.value = item.note || '';
      noteInput.addEventListener('input', function () {
        item.note = noteInput.value;
        item.updatedAt = Date.now();
        saveState();
        updateSyncButton(allItems());
        var badgeExists = fieldLine.querySelector('.badge');
        if (badgeExists) badgeExists.remove();
      });
      row.appendChild(noteInput);
    }

    return row;
  }

  function updateSyncButton(items) {
    var pending = items.filter(isDirty);
    syncBtn.disabled = pending.length === 0;
    syncBtn.textContent = pending.length > 0 ? '同步到試算表（' + pending.length + ' 筆待同步）' : '同步到試算表';
  }

  // ---------- 同步到 Google 試算表 ----------

  syncBtn.addEventListener('click', function () {
    syncNow();
  });

  function postToServer(action, items) {
    var config = window.REVIEW_CONFIG || {};
    var payload = { secret: config.passphrase || '', action: action, items: items };
    return fetch(config.syncUrl, {
      method: 'POST',
      // 用 text/plain 避免瀏覽器送出 CORS 預檢請求（Apps Script 不支援 OPTIONS）
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    }).then(function (res) {
      return res.json();
    });
  }

  function syncNow() {
    var config = window.REVIEW_CONFIG || {};
    if (!config.syncUrl) {
      setStatus(syncStatus, '尚未設定同步網址，請確認部署流程已產生 config.js。', 'error');
      return;
    }

    var items = allItems();
    var pending = items.filter(isDirty);

    if (pending.length === 0) {
      setStatus(syncStatus, '目前沒有待同步的項目。', 'muted');
      return;
    }

    // 記錄送出當下的時間戳，回來後只把「送出後沒有再被改過」的項目標記為已同步
    var snapshot = pending.map(function (i) {
      return { id: i.id, updatedAt: i.updatedAt };
    });

    syncBtn.disabled = true;
    setStatus(syncStatus, '同步中…（' + pending.length + ' 筆）', 'muted');

    postToServer(
      'updateStatus',
      pending.map(function (i) {
        return {
          id: i.id,
          category: i.category,
          name: i.name,
          field: i.field,
          checked: i.checked,
          note: i.note,
        };
      })
    )
      .then(function (data) {
        if (!data || !data.ok) {
          throw new Error((data && data.error) || '同步失敗，伺服器沒有回傳成功訊息。');
        }
        snapshot.forEach(function (s) {
          var item = state.items[s.id];
          if (item && item.updatedAt === s.updatedAt) {
            item.syncedAt = data.updatedAt;
            item.remoteUpdatedAt = data.updatedAt;
          }
        });
        saveState();
        setStatus(
          syncStatus,
          '同步成功：新增 ' + data.inserted + ' 筆、更新 ' + data.updated + ' 筆。',
          'ok'
        );
        render();
      })
      .catch(function (err) {
        setStatus(syncStatus, '同步失敗：' + err.message + '（資料仍保留在本機，可以稍後再試）', 'error');
        updateSyncButton(allItems());
      });
  }

  // ---------- 工具函式 ----------

  function setStatus(el, text, kind) {
    el.textContent = text;
    el.className = 'status-line ' + (kind === 'ok' ? 'status-ok' : kind === 'error' ? 'status-error' : 'status-muted');
  }

  render();
  loadFromServer();
})();
