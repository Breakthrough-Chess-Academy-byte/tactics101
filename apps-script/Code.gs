/**
 * Tactics 101 — Google Sheets sync backend (Google Apps Script web app).
 *
 * Matches the protocol used by index.html:
 *   POST  body JSON {g, n, ex, t, secret?}      -> upsert one row (key = g|n|ex)
 *   GET   ?action=list&g=<group>&secret=<s>     -> {ok:true, rows:[{n, ex, t, ts}]}
 *
 * Setup: see README.md (section "المزامنة مع Google Sheets").
 */

const SHEET_NAME = 'data';
const SECRET = ''; // لو حطيت كلمة سر هنا، لازم تحط نفس القيمة في SHEET_SECRET جوه index.html
const HEADERS = ['key', 'g', 'n', 'ex', 't', 'ts'];
const CACHE_SEC = 2; // كاش قصير لطلبات القراءة عشان الشيت مايتقلش مع كتير من المتدربين

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (SECRET && p.secret !== SECRET) return json_({ ok: false, error: 'auth' });
  if (p.action !== 'list') return json_({ ok: true, info: 'tactics101 sync' });
  const g = String(p.g || '');
  const cache = CacheService.getScriptCache();
  const ck = 'L:' + Utilities.base64EncodeWebSafe(g).slice(0, 200);
  const hit = cache.get(ck);
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);

  const sh = sheet_();
  const last = sh.getLastRow();
  const rows = [];
  if (last > 1) {
    const v = sh.getRange(2, 2, last - 1, 5).getValues(); // g, n, ex, t, ts
    for (const r of v) {
      if (String(r[0]) !== g || r[3] === '' || r[3] === null) continue;
      rows.push({ n: String(r[1]), ex: r[2], t: String(r[3]), ts: Number(r[4]) || 0 });
    }
  }
  const out = JSON.stringify({ ok: true, rows: rows });
  try { cache.put(ck, out, CACHE_SEC); } catch (err) {}
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad json' }); }
  if (SECRET && d.secret !== SECRET) return json_({ ok: false, error: 'auth' });
  const g = String(d.g || ''), n = String(d.n || ''), ex = d.ex == null ? '' : String(d.ex), t = d.t == null ? '' : String(d.t);
  if (!g || !n) return json_({ ok: false, error: 'missing g/n' });
  const key = g + '|' + n + '|' + ex;
  const row = [key, g, n, ex, t, Date.now()];

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    const last = sh.getLastRow();
    let found = null;
    if (last > 1) {
      found = sh.getRange(2, 1, last - 1, 1).createTextFinder(key).matchEntireCell(true).findNext();
    }
    if (found) sh.getRange(found.getRow(), 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);
  } finally {
    lock.releaseLock();
  }
  try { CacheService.getScriptCache().remove('L:' + Utilities.base64EncodeWebSafe(g).slice(0, 200)); } catch (err) {}
  return json_({ ok: true });
}
