export function buildSearchParams(entries) {
  let inputFields = []
  let searchTerms = []

  for (const [field, term] of Object.entries(entries)) {
    if (entries.random && field === 'poemcount') continue
    if (!term) continue

    inputFields.push(field)
    if (field === 'random') {
      searchTerms.push(entries.poemcount || '1')
    } else {
      searchTerms.push(term)
    }
  }

  return { inputFields, searchTerms }
}
