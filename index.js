import { SELECTORS } from './src/ui/domSelectors.js'
import {
  handleCheckboxes,
  loadPoems,
  updatePoems,
} from './src/ui/poemsManager.js'

const searchForm = document.querySelector(SELECTORS.searchForm)
const listControlsForm = document.querySelector(SELECTORS.listControls)

export let searchFormEntries = {}

function onSearchSubmit(event) {
  event.preventDefault()

  const searchFormData = new FormData(searchForm)
  searchFormEntries = Object.fromEntries(searchFormData.entries())

  if (Object.values(searchFormEntries).every((val) => !val)) {
    alert('Kindly fill out at least one field before you submit the form.')
    return
  }

  const { inputFields, searchTerms } = buildSearchParams(searchFormEntries)
  loadPoems(`${inputFields.join(',')}/${searchTerms.join(';')}`)
}

function onListControlsChange(event) {
  handleCheckboxes(event)
  updatePoems()
}

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

searchForm.addEventListener('submit', onSearchSubmit)
listControlsForm.addEventListener('change', onListControlsChange)
