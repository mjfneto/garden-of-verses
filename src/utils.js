const notFoundMsgs = [
  'The muse has whispered no verses for this query.',
  'Our digital inkwell yielded no stanzas this time.',
  'The rhythm of our search found no matching rhyme.',
  'The verses you seek remain unsung in our collection.',
  'No poetic echoes resonate with your request.',
  'The tapestry of our words holds no thread quite like that.',
  'The quill of our search has drawn a blank on this subject.',
  'No sonnets bloom from the seeds of your search.',
  'The ballad of your query has no matching verse in our library.',
  'Silence answers your poetic call; no verses were discovered.',
]

/**
 * Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
 */
export function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled) // The maximum is inclusive and the minimum is inclusive
}

export function randomNotFoundMsg() {
  return notFoundMsgs[getRandomIntInclusive(0, notFoundMsgs.length - 1)]
}
