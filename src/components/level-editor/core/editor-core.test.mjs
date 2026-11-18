import test from 'node:test';
import assert from 'node:assert/strict';
import { createEditCommands } from './edit-commands.mjs';
import { createEditHistory } from './edit-history.mjs';
import { createFeatureRegistry } from './feature-registry.mjs';

test('a compound edit records one undo step, reports its owner, and rolls back a failed operation', () => {
  let document = { waves: [{ count: 1 }], extension: { preserved: true } };
  const history = createEditHistory(document);
  const events = [];
  const commands = createEditCommands({ read: () => document, write: (value) => { document = value; }, onCommitted: () => history.record(document) });
  const unsubscribe = commands.subscribe((event) => events.push(event));
  commands.execute('waves.duplicate', () => {
    commands.execute('waves.add', () => document.waves.push({ count: 2 }));
    commands.execute('waves.count', () => { document.waves[0].count = 3; });
  });
  assert.equal(events.length, 1);
  assert.equal(events[0].command, 'waves.duplicate');
  assert.deepEqual(history.move(-1), { waves: [{ count: 1 }], extension: { preserved: true } });
  assert.equal(history.canUndo, false);
  assert.deepEqual(history.move(1), document);
  const before = structuredClone(document);
  assert.throws(() => commands.execute('failed', () => { document.extension.preserved = false; throw new Error('invalid'); }));
  assert.deepEqual(document, before);
  commands.execute('selectionOnly', () => {});
  assert.equal(events.length, 1);
  unsubscribe();
  commands.execute('count', () => { document.waves[0].count++; });
  assert.equal(events.length, 1);
  commands.dispose();
});

test('a new edit after undo drops only the redo branch and snapshots do not share mutable objects', () => {
  const history = createEditHistory({ value: 0 }, 3);
  history.record({ value: 1 }); history.record({ value: 2 }); history.record({ value: 3 });
  const restored = history.move(-1); restored.value = 99;
  assert.deepEqual(history.move(-1), { value: 1 });
  history.record({ value: 4 });
  assert.equal(history.canRedo, false);
  assert.deepEqual(history.move(-1), { value: 1 });
  history.reset({ value: 8 });
  assert.equal(history.canUndo, false);
});

test('feature registration rejects ambiguous ownership without modifying another editor registry', () => {
  const first = createFeatureRegistry(), second = createFeatureRegistry();
  first.register({ id: 'tide', objclass: 'TidalChangeWaveActionProps' });
  assert.throws(() => first.register({ id: 'other', objclass: 'TidalChangeWaveActionProps' }));
  assert.throws(() => first.register({ id: 'tide' }));
  assert.equal(first.getByClass('TidalChangeWaveActionProps').id, 'tide');
  assert.equal(second.get('tide'), undefined);
  assert.equal(first.list().length, 1);
});
