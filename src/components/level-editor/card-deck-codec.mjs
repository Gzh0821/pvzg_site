export function getCardDecks(extra, kind) {
  const decks = extra?.CardDecks?.[kind];
  return Array.isArray(decks) ? decks : [];
}

export function addCardDeck(extra, kind, language, name) {
  extra.CardDecks ??= {};
  extra.CardDecks[kind] ??= [];
  const deck = { Name: { [language]: name }, Plants: [], Leader: 0 };
  extra.CardDecks[kind].push(deck);
  return extra.CardDecks[kind].length - 1;
}

export function removeCardDeckPlant(deck, index) {
  deck.Plants.splice(index, 1);
  const leader = Number(deck.Leader) || 0;
  if (index === leader) deck.Leader = 0;
  else if (index < leader) deck.Leader = leader - 1;
}

export function getCardDeckIssues(extra, originalExtra) {
  return ['Recommended', 'Challenging'].flatMap((kind) => getCardDecks(extra, kind).flatMap((deck, index) => {
    const inherited = getCardDecks(originalExtra, kind).some((original) =>
      original.Leader === deck?.Leader && JSON.stringify(original.Plants) === JSON.stringify(deck?.Plants));
    if (!Array.isArray(deck?.Plants) || !deck.Plants.length) return [{ kind, index, reason: 'empty', inherited }];
    if (!Number.isInteger(deck.Leader) || deck.Leader < 0 || deck.Leader >= deck.Plants.length) {
      return [{ kind, index, reason: 'leader', inherited }];
    }
    return [];
  }));
}
