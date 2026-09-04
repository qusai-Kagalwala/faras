// server/__tests__/contentFilter.test.js
const { filterQuotesForTeacherTrack } = require('../modules/ai-reports/contentFilter');

describe('filterQuotesForTeacherTrack', () => {
  test('keeps clean, constructive quotes unchanged', () => {
    const quotes = [
      'The teacher explains things very clearly.',
      'I would like more practice problems.',
    ];
    expect(filterQuotesForTeacherTrack(quotes)).toEqual(quotes);
  });

  test('drops a quote flagged as profane, without altering the others', () => {
    const quotes = ['This teacher is great.', 'This class is such damn bullshit honestly.'];
    const result = filterQuotesForTeacherTrack(quotes);
    expect(result).toEqual(['This teacher is great.']);
  });

  test('returns an empty array when given no quotes', () => {
    expect(filterQuotesForTeacherTrack([])).toEqual([]);
  });
});