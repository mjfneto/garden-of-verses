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
 * Splits an array into "compartments" (subarrays) of a specified maximum size.
 *
 * @template T
 * @param {T[]} array - The original array to be split.
 * @param {number} [size=50] - The maximum size of each compartment. Must be a positive integer.
 * @returns {T[][]} An array of subarrays, each containing up to `size` elements.
 *
 * @throws {TypeError} If `array` is not an Array or if `size` is not a number.
 * @throws {RangeError} If `size` is not an integer greater than zero.
 *
 * @example
 * // returns [[1, 2, 3], [4, 5, 6], [7]]
 * batchArray([1, 2, 3, 4, 5, 6, 7], 3);
 *
 * @example
 * // returns []
 * batchArray([], 10);
 */
export function batchArray(array, size = 50) {
  // Type validations
  if (!Array.isArray(array)) {
    throw new TypeError('First argument must be an Array.')
  }
  if (typeof size !== 'number' || Number.isNaN(size)) {
    throw new TypeError('Size must be a number.')
  }

  // Value validation
  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError('Size must be an integer greater than zero.')
  }

  const compartments = []

  // Iterate through the array in steps of `size` and slice
  for (let start = 0; start < array.length; start += size) {
    compartments.push(array.slice(start, start + size))
  }

  return compartments
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
