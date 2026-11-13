const SPREADSHEET_ID = "";
const SHEET_NAME = "Đơn hàng";

function doPost(event) {
  const fields = event.parameter;
  const name = String(fields.full_name || "").trim();
  const phone = String(fields.phone_number || "").trim();
  const address = String(fields.address || "").trim();
  const packageSize = String(fields.package || "");

  if (!name || !address ||
      !/^(?:[+]84|84|0)(?:3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-46-9])[0-9]{7}$/.test(phone) ||
      !["2", "5", "8", "15"].includes(packageSize)) {
    return orderResponse(false);
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Họ và tên", "Số điện thoại", "Địa chỉ nhận hàng", "Gói mua"]);
    }
    // Write customer input as text, preserving leading zeroes and preventing formulas.
    sheet.appendRow(["'" + name, "'" + phone, "'" + address, packageSize + " gói"]);
    SpreadsheetApp.flush();
    return orderResponse(true);
  } catch (error) {
    return orderResponse(false);
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function orderResponse(ok) {
  return ContentService.createTextOutput(JSON.stringify({ ok }))
    .setMimeType(ContentService.MimeType.JSON);
}
