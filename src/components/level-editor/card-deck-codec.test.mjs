import assert from 'node:assert/strict';
import test from 'node:test';
import { addCardDeck, getCardDecks, getCardDeckIssues, removeCardDeckPlant } from './card-deck-codec.mjs';

test('editing one deck preserves multilingual names, challenge rules and unknown fields', () => {
  const extra = { CardDecks: { ChallengingLocked: true, Other: { keep: 1 }, Recommended: [], Challenging: [
    { Name: { zh: '原名', en: 'Original' }, Plants: ['sunflower', 'wallnut'], Leader: 1, HugeWaveGem: 2, Unknown: ['x'] }
  ] } };
  const deck = getCardDecks(extra, 'Challenging')[0];
  deck.Name.zh = '修改';
  removeCardDeckPlant(deck, 0);
  assert.equal(deck.Leader, 0);
  assert.deepEqual(deck.Plants, ['wallnut']);
  assert.equal(deck.Name.en, 'Original');
  assert.equal(deck.HugeWaveGem, 2);
  assert.deepEqual(deck.Unknown, ['x']);
  assert.deepEqual(extra.CardDecks.Other, { keep: 1 });
  assert.equal(extra.CardDecks.ChallengingLocked, true);
});

test('new decks need plants and a valid zero-based leader before export', () => {
  const extra = {};
  assert.equal(addCardDeck(extra, 'Recommended', 'zh', '新卡组'), 0);
  assert.equal(getCardDeckIssues(extra)[0].reason, 'empty');
  const deck = getCardDecks(extra, 'Recommended')[0];
  deck.Plants.push('peashooter', 'sunflower');
  assert.deepEqual(getCardDeckIssues(extra), []);
  deck.Leader = 2;
  assert.equal(getCardDeckIssues(extra)[0].reason, 'leader');
  deck.Leader = 1;
  removeCardDeckPlant(deck, 1);
  assert.equal(deck.Leader, 0);
  assert.deepEqual(getCardDeckIssues(extra), []);
});

test('an imported invalid leader remains a warning until its plant structure is edited', () => {
  const original = { CardDecks: { Recommended: [{ Name: { zh: '原版' }, Leader: 4, Plants: ['sunflower'] }] } };
  const edited = structuredClone(original);
  edited.CardDecks.Recommended[0].Name.zh = '改名';
  assert.equal(getCardDeckIssues(edited, original)[0].inherited, true);
  edited.CardDecks.Recommended[0].Plants.push('wallnut');
  assert.equal(getCardDeckIssues(edited, original)[0].inherited, false);
});

test('deleting a preceding deck does not turn an inherited invalid leader into a new error', () => {
  const original = { CardDecks: { Recommended: [
    { Leader: 0, Plants: ['peashooter'] }, { Leader: 4, Plants: ['sunflower'] }
  ] } };
  const edited = structuredClone(original);
  edited.CardDecks.Recommended.shift();
  assert.equal(getCardDeckIssues(edited, original)[0].inherited, true);
});
