// server/modules/review-groups/partitionStudents.js
// Pure logic — no DB access. "Algorithm" candidates are students who have
// never been reviewed under this Group before (fresh, checked by default);
// "repeat" candidates are students who HAVE been reviewed before (offered
// as an optional opt-in, unchecked by default). This is deliberately NOT a
// rotation-queue algorithm — the whole point, per the real requirement, is
// simply "who hasn't given a genuine review yet" vs "who has, and we'd
// like their input again."

function partitionStudentsForProposal(allStudentIts, alreadyReviewedItsSet) {
  const fresh = [];
  const repeat = [];

  for (const its of allStudentIts) {
    if (alreadyReviewedItsSet.has(its)) {
      repeat.push(its);
    } else {
      fresh.push(its);
    }
  }

  return { fresh, repeat };
}

module.exports = { partitionStudentsForProposal };