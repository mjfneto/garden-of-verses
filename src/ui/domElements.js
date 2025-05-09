/**
 * This module serves as a central access point ("DOM barrel file")
 * for commonly used DOM elements throughout the UI layer.
 * Centralizing these queries improves performance, avoids repetition,
 * and makes the codebase easier to maintain.
 */

import { SELECTORS } from './domSelectors.js'

export const searchForm = document.querySelector(SELECTORS.searchForm)
export const searchResults = document.querySelector(SELECTORS.searchResults)
export const listControlsForm = document.querySelector(SELECTORS.listControls)
export const resultCount = document.querySelector(SELECTORS.resultCount)
export const authorFilterOptions = document.querySelector(
  SELECTORS.authorOptions
)
export const allAuthorNames = document.querySelector(SELECTORS.allAuthors)
export const firstAuthorCheckboxContainer = document.querySelector(
  SELECTORS.authorCheckboxContainers
)
export const pagination = document.querySelector(SELECTORS.pagination)
