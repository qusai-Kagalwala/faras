// shared/validators/itsNumber.js
// ITS Number is FARAS's universal login identifier for every role (SRS 3.1).
// Confirmed format from Teachers.csv / student_subject_schedule.csv: exactly
// 8 digits, numeric only (e.g. 50409739). Confirmed for teacher records;
// assumed identical for students/staff since ITS is described as one shared
// numbering scheme — flag if a student ITS sample ever contradicts this.
//
// Do NOT confuse this with TRNO (student_tr_no in the schedule data) — TRNO
// is a separate 5-digit internal tracking number, never used for login
// (FR-AUTH-05).

const ITS_NUMBER_REGEX = /^\d{8}$/;

function isValidItsNumber(value) {
  if (typeof value !== 'string') return false;
  return ITS_NUMBER_REGEX.test(value);
}

module.exports = { ITS_NUMBER_REGEX, isValidItsNumber };