// server/__tests__/partitionStudents.test.js
const { partitionStudentsForProposal } = require('../modules/review-groups/partitionStudents');

describe('partitionStudentsForProposal', () => {
  test('all students are fresh when none have been reviewed before', () => {
    const result = partitionStudentsForProposal(['A', 'B', 'C'], new Set());
    expect(result.fresh).toEqual(['A', 'B', 'C']);
    expect(result.repeat).toEqual([]);
  });

  test('correctly splits fresh vs repeat students', () => {
    const result = partitionStudentsForProposal(['A', 'B', 'C', 'D'], new Set(['B', 'D']));
    expect(result.fresh).toEqual(['A', 'C']);
    expect(result.repeat).toEqual(['B', 'D']);
  });

  test('all students are repeat when everyone has been reviewed before', () => {
    const result = partitionStudentsForProposal(['A', 'B'], new Set(['A', 'B']));
    expect(result.fresh).toEqual([]);
    expect(result.repeat).toEqual(['A', 'B']);
  });

  test('handles an empty student list', () => {
    const result = partitionStudentsForProposal([], new Set(['A']));
    expect(result.fresh).toEqual([]);
    expect(result.repeat).toEqual([]);
  });

  test('a student in alreadyReviewed but not in allStudentIts is simply ignored', () => {
    const result = partitionStudentsForProposal(['A'], new Set(['Z']));
    expect(result.fresh).toEqual(['A']);
    expect(result.repeat).toEqual([]);
  });
});