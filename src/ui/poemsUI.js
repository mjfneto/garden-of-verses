/**
 * Barrel file for UI modules
 * A barrel file re-exports selected exports from multiple modules,
 * providing a single entry point for imports. It simplifies module
 * management by centralizing exports in one file.
 */

export { handleCheckboxes, loadPoems, updatePoems } from './poemsManager.js'
export {
  clearAfter,
  clearElement,
  disableForm,
  enableForm,
  toggleAccordion,
} from './general.js'
export { SELECTORS } from './domSelectors.js'
