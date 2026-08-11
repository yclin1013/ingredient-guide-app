/**
 * 食材圖鑑・查證清單 — 接收/提供同步資料的 Google Apps Script
 *
 * 用途：部署成 Web App 後，供 /review 查證清單頁面呼叫。
 * 完整部署步驟見 docs/REVIEW_TOOL_SETUP.md。
 *
 * 這個試算表會維護兩個分頁：
 * - 「項目清單」：原始待查證項目（分類/食材/欄位/建議來源），所有裝置共用的資料源，
 *   頁面在貼上 VERIFICATION_TODO.md 內容並解析後，會自動把這份清單上傳到這裡
 * - 「查證紀錄」：每個項目目前的核對狀態（已核對/備註/最後更新時間），
 *   頁面按「同步到試算表」時，把本機異動推上來這裡；頁面載入時，也是從這裡＋「項目清單」讀出最新狀態
 *
 * 使用前必做：
 * 1. 這段程式碼貼到你的 Google 試算表「擴充功能 > Apps Script」的編輯器裡
 * 2. 到左側「專案設定」，在「指令碼屬性」新增一筆：
 *      屬性：SYNC_SECRET
 *      值：（跟 Claude 給你的通關密語完全一樣）
 * 3. 部署為「網頁應用程式」，執行身分選「我」，具有存取權的使用者選「所有人」
 *
 * 修改過程式碼後，要重新「管理部署作業」→ 編輯 → 版本選「新版本」→ 部署，網址通常不會變。
 */

const SHEET_ITEMS = '項目清單';
const SHEET_STATUS = '查證紀錄';
const HEADER_ITEMS = ['項目 ID', '分類', '食材', '待查證欄位', '建議查證來源'];
const HEADER_STATUS = ['項目 ID', '分類', '食材', '待查證欄位', '已核對', '備註', '最後更新時間'];

// 頁面載入時呼叫：回傳「項目清單」+「查證紀錄」合併後的最新狀態
function doGet(e) {
  try {
    const secret = e && e.parameter ? e.parameter.secret : '';
    const secretError = checkSecret(secret);
    if (secretError) return jsonResponse(secretError);

    const itemsSheet = getOrCreateSheet(SHEET_ITEMS, HEADER_ITEMS);
    const statusSheet = getOrCreateSheet(SHEET_STATUS, HEADER_STATUS);

    const itemRows = readRows(itemsSheet, HEADER_ITEMS);
    const statusRows = readRows(statusSheet, HEADER_STATUS);

    const statusById = {};
    statusRows.forEach(function (row) {
      statusById[row['項目 ID']] = row;
    });

    const items = itemRows.map(function (row) {
      const status = statusById[row['項目 ID']] || {};
      const updatedAtRaw = status['最後更新時間'];
      return {
        id: row['項目 ID'],
        category: row['分類'],
        name: row['食材'],
        field: row['待查證欄位'],
        source: row['建議查證來源'],
        checked: status['已核對'] === true || status['已核對'] === 'TRUE',
        note: status['備註'] || '',
        updatedAt: updatedAtRaw ? new Date(updatedAtRaw).getTime() : null,
      };
    });

    return jsonResponse({ ok: true, items: items });
  } catch (err) {
    return jsonResponse({ ok: false, error: '伺服器發生錯誤：' + err.message });
  }
}

// 「上傳原始清單」「同步到試算表」都打這個
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: '沒有收到請求內容' });
    }

    let body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ ok: false, error: '請求內容不是合法的 JSON' });
    }

    const secretError = checkSecret(body.secret);
    if (secretError) return jsonResponse(secretError);

    const items = body.items;
    if (!Array.isArray(items) || items.length === 0) {
      return jsonResponse({ ok: false, error: '沒有要處理的項目' });
    }

    if (body.action === 'importItems') {
      const itemsSheet = getOrCreateSheet(SHEET_ITEMS, HEADER_ITEMS);
      const result = upsertRows(itemsSheet, HEADER_ITEMS, items, function (item) {
        return [item.id, item.category, item.name, item.field, item.source || ''];
      });
      return jsonResponse({ ok: true, inserted: result.inserted, updated: result.updated });
    }

    const statusSheet = getOrCreateSheet(SHEET_STATUS, HEADER_STATUS);
    const now = new Date();
    const result = upsertRows(statusSheet, HEADER_STATUS, items, function (item) {
      return [item.id, item.category, item.name, item.field, !!item.checked, item.note || '', now];
    });
    return jsonResponse({
      ok: true,
      inserted: result.inserted,
      updated: result.updated,
      updatedAt: now.getTime(),
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: '伺服器發生錯誤：' + err.message });
  }
}

function checkSecret(secret) {
  const expected = PropertiesService.getScriptProperties().getProperty('SYNC_SECRET');
  if (!expected) {
    return { ok: false, error: '伺服器尚未設定通關密語（SYNC_SECRET），請先在指令碼屬性設定' };
  }
  if (!secret || secret !== expected) {
    return { ok: false, error: '通關密語錯誤或缺少' };
  }
  return null;
}

function getOrCreateSheet(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(header);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readRows(sheet, header) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, header.length).getValues();
  return values
    .filter(function (row) {
      return row[0]; // 有項目 ID 才算一列
    })
    .map(function (row) {
      const obj = {};
      header.forEach(function (key, idx) {
        obj[key] = row[idx];
      });
      return obj;
    });
}

// 依「項目 ID」（第一欄）找到既有列就覆寫，找不到就新增一列
function upsertRows(sheet, header, items, toRow) {
  const lastRow = sheet.getLastRow();
  const idToRowIndex = {};
  if (lastRow >= 2) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    ids.forEach(function (row, idx) {
      const id = String(row[0] || '');
      if (id) idToRowIndex[id] = idx + 2; // 試算表列號從 2 開始（第 1 列是表頭）
    });
  }

  let inserted = 0;
  let updated = 0;
  items.forEach(function (item) {
    const id = String(item.id || '');
    if (!id) return;
    const rowValues = toRow(item);
    const rowIndex = idToRowIndex[id];
    if (rowIndex) {
      sheet.getRange(rowIndex, 1, 1, header.length).setValues([rowValues]);
      updated++;
    } else {
      sheet.appendRow(rowValues);
      idToRowIndex[id] = sheet.getLastRow();
      inserted++;
    }
  });

  return { inserted: inserted, updated: updated };
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
