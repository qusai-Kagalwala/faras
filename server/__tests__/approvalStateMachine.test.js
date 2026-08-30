// server/__tests__/approvalStateMachine.test.js
const { validateTransition } = require('../modules/approval/approvalStateMachine');

describe('validateTransition', () => {
  test('allows the normal forward sequence, one step at a time', () => {
    expect(validateTransition('generated', 'under_review').valid).toBe(true);
    expect(validateTransition('under_review', 'approved').valid).toBe(true);
    expect(
      validateTransition('approved', 'dispatched', { signOffNote: 'Great work this cycle.' }).valid
    ).toBe(true);
  });

  test('FR-WF-01: rejects skipping straight from generated to dispatched', () => {
    const result = validateTransition('generated', 'dispatched', { signOffNote: 'note' });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/must advance one at a time/);
  });

  test('FR-WF-01: rejects skipping from generated to approved', () => {
    const result = validateTransition('generated', 'approved');
    expect(result.valid).toBe(false);
  });

  test('rejects moving backward from approved to under_review', () => {
    const result = validateTransition('approved', 'under_review');
    expect(result.valid).toBe(false);
  });

  test('rejects staying on the same stage', () => {
    const result = validateTransition('under_review', 'under_review');
    expect(result.valid).toBe(false);
  });

  test('FR-WF-02: rejects dispatching without a sign-off note', () => {
    const result = validateTransition('approved', 'dispatched');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/sign-off note is required/);
  });

  test('FR-WF-02: rejects dispatching with a blank/whitespace-only sign-off note', () => {
    const result = validateTransition('approved', 'dispatched', { signOffNote: '   ' });
    expect(result.valid).toBe(false);
  });

  test('does not require a sign-off note for any stage other than dispatched', () => {
    expect(validateTransition('generated', 'under_review').valid).toBe(true);
    expect(validateTransition('under_review', 'approved').valid).toBe(true);
  });

  test('rejects an unknown current stage', () => {
    const result = validateTransition('bogus_stage', 'under_review');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Unknown current stage/);
  });

  test('rejects an unknown requested stage', () => {
    const result = validateTransition('generated', 'bogus_stage');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Unknown requested stage/);
  });
});