/**
 * 마에로 팀 보드 저장 어댑터 (Google Apps Script 웹앱)
 *
 * 설치
 * 1. 새 구글 시트를 만들고 확장 프로그램 > Apps Script 에 이 파일 내용을 붙여 넣는다.
 * 2. 프로젝트 설정 > 스크립트 속성에 TEAM_KEY 를 추가한다(값은 팀 공유 키, 파일에 적지 않는다).
 * 3. 배포 > 새 배포 > 웹앱, 실행 사용자 "나", 액세스 "모든 사용자".
 * 4. 웹앱 주소를 GitHub 저장소 비밀값 VITE_ENDPOINT 에 넣는다.
 *
 * 요청: POST 본문(text/plain)에 JSON {action:"list"|"upsert"|"remove", sheet, row, key}
 * 응답: {ok:true, rows} 또는 {ok:true, row} 또는 {ok:false, error}
 */

var HEADERS = {
  '일정': ['id', 'title', 'date', 'endDate', 'time', 'owner', 'memo', 'deadline', 'updatedAt'],
  '할일': ['id', 'title', 'owners', 'due', 'done', 'memo', 'updatedAt'],
  '지출': ['id', 'date', 'shop', 'amount', 'item', 'status', 'receipt', 'memo', 'updatedAt'],
  '미팅': ['id', 'date', 'time', 'who', 'decided', 'next', 'memo', 'updatedAt'],
  '상표': ['id', 'letter', 'name', 'status', 'updatedAt']
};

function doGet() {
  return out_({ ok: true, name: 'maero-team-board' });
}

function doPost(e) {
  var req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return out_({ ok: false, error: 'bad-json' });
  }
  var teamKey = PropertiesService.getScriptProperties().getProperty('TEAM_KEY');
  if (!teamKey || req.key !== teamKey) return out_({ ok: false, error: 'key' });
  if (!HEADERS[req.sheet]) return out_({ ok: false, error: 'sheet' });

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return out_({ ok: false, error: 'busy' });
  try {
    var sh = sheet_(req.sheet);
    if (req.action === 'list') return out_({ ok: true, rows: list_(sh) });
    if (req.action === 'upsert') return out_({ ok: true, row: upsert_(sh, req.row || {}) });
    if (req.action === 'remove') return out_({ ok: true, removed: remove_(sh, (req.row || {}).id) });
    return out_({ ok: false, error: 'action' });
  } catch (err) {
    return out_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

/** 시트 4탭이 없으면 만든다. 스크립트 속성 SHEET_ID 가 있으면 그 시트를, 없으면 이 스크립트가 붙은 시트를 쓴다. */
function book_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  ss = SpreadsheetApp.create('마에로 팀 보드');
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  return ss;
}

function sheet_(name) {
  var ss = book_();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    var h = HEADERS[name];
    sh.getRange(1, 1, 1, h.length).setValues([h]);
    sh.setFrozenRows(1);
  }
  // 날짜와 숫자가 자동 변환되지 않도록 모든 칸을 글자 형식으로 둔다.
  sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).setNumberFormat('@');
  return sh;
}

/** 처음 한 번 편집기에서 실행하면 탭 4개와 머리글을 만든다. */
function setup() {
  Object.keys(HEADERS).forEach(function (n) { sheet_(n); });
}

function header_(sh) {
  var last = sh.getLastColumn();
  return sh.getRange(1, 1, 1, last).getValues()[0].map(String);
}

function list_(sh) {
  var last = sh.getLastRow();
  if (last < 2) return [];
  var h = header_(sh);
  var values = sh.getRange(2, 1, last - 1, h.length).getValues();
  return values
    .filter(function (r) { return String(r[0]) !== ''; })
    .map(function (r) {
      var o = {};
      h.forEach(function (k, i) { o[k] = r[i] === null ? '' : String(r[i]); });
      return o;
    });
}

function findRow_(sh, id) {
  var last = sh.getLastRow();
  if (last < 2 || !id) return -1;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  return -1;
}

function upsert_(sh, row) {
  var h = header_(sh);
  if (!row.id) row.id = Utilities.getUuid();
  row.updatedAt = new Date().toISOString();
  var line = h.map(function (k) { return row[k] === undefined || row[k] === null ? '' : String(row[k]); });
  var at = findRow_(sh, row.id);
  if (at === -1) at = sh.getLastRow() + 1;
  var range = sh.getRange(at, 1, 1, h.length);
  range.setNumberFormat('@');
  range.setValues([line]);
  var o = {};
  h.forEach(function (k, i) { o[k] = line[i]; });
  return o;
}

function remove_(sh, id) {
  var at = findRow_(sh, id);
  if (at === -1) return false;
  sh.deleteRow(at);
  return true;
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
