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

/**
 * @see The implementation and documentation were generated/assisted by Google Gemini / Programming Partner.
 *
 * Creates a deep copy of a JSON-serializable value using JSON.parse(JSON.stringify()).
 *
 * IMPORTANT LIMITATIONS:
 * This method relies on JSON serialization and has significant constraints.
 * It is suitable ONLY for values composed exclusively of JSON-compatible data:
 * plain objects ({}), arrays ([]), strings, numbers (finite), booleans, and null.
 *
 * It WILL NOT correctly handle or will silently alter/omit the following:
 * - undefined values (properties with undefined are omitted)
 * - Functions (properties with functions are omitted)
 * - Symbols (properties with Symbol values are omitted)
 * - Date objects (converted to ISO strings, not Date objects)
 * - RegExp objects (converted to empty objects {})
 * - Infinity, -Infinity, NaN (converted to null)
 * - Map, Set, WeakMap, WeakSet
 * - TypedArrays, ArrayBuffer, Blob, File, etc.
 * - Circular references (will throw a TypeError)
 * - Object prototypes and class instances (will result in plain objects)
 * - Getters and setters (only the final value is copied)
 *
 * For a more robust deep copy solution in modern environments, consider
 * the native structuredClone() API. For broader compatibility or more complex
 * types, external libraries like Lodash's `_.cloneDeep()` are recommended.
 *
 * Use this function with caution and awareness of its limitations.
 *
 * @param {any} value - The value to deep copy. Must be JSON-serializable.
 * @returns {any} A deep copy of the value, or might throw an error/return incomplete data if the value is not fully JSON-serializable.
 */
export function cloneViaJson(value) {
  // Handle null and undefined explicitly to avoid JSON.stringify issues with them directly
  if (value === null || value === undefined) {
    return value
  }

  try {
    return JSON.parse(JSON.stringify(value))
  } catch (error) {
    // Optionally handle or rethrow error, e.g., if value has circular references
    console.error('cloneViaJson failed:', error)
    throw new Error(
      'Failed to deep copy value using JSON serialization. Check for non-serializable data or circular references.'
    )
  }
}
