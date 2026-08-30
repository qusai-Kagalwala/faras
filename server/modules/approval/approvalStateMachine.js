// server/modules/approval/approvalStateMachine.js
// Pure logic — no DB access. Enforces FR-WF-01/03: reports move through
// exactly these stages, in exactly this order, never skipping and never
// going backward:
//   generated -> under_review -> approved -> dispatched
//
// FR-WF-01: a report can only ever reach 'dispatched' by passing through
// every prior stage — there is no direct path from 'generated' to
// 'dispatched', which is the actual mechanism enforcing "AI reports are
// never dispatched to a teacher automatically."
// FR-WF-02: a sign-off note is required specifically at the 'dispatched'
// transition, not any earlier stage.

const STAGE_ORDER = Object.freeze(['generated', 'under_review', 'approved', 'dispatched']);

function stageIndex(stage) {
  return STAGE_ORDER.indexOf(stage);
}

function validateTransition(currentStage, requestedStage, options = {}) {
  const currentIdx = stageIndex(currentStage);
  const requestedIdx = stageIndex(requestedStage);

  if (currentIdx === -1) {
    return { valid: false, error: `Unknown current stage: ${currentStage}` };
  }
  if (requestedIdx === -1) {
    return { valid: false, error: `Unknown requested stage: ${requestedStage}` };
  }

  if (requestedIdx !== currentIdx + 1) {
    return {
      valid: false,
      error: `Cannot move from '${currentStage}' to '${requestedStage}' — stages must advance one at a time, in order (${STAGE_ORDER.join(' -> ')}).`,
    };
  }

  if (requestedStage === 'dispatched') {
    const note = options.signOffNote;
    if (typeof note !== 'string' || note.trim().length === 0) {
      return {
        valid: false,
        error: 'A sign-off note is required when dispatching a report (FR-WF-02).',
      };
    }
  }

  return { valid: true };
}

module.exports = { STAGE_ORDER, validateTransition };