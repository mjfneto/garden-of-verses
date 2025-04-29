import {
  SELECTORS,
  handleCheckboxes,
  loadPoems,
  updatePoems,
} from './src/ui/poemsUI.js'
import { buildSearchParams } from './src/utils/searchHelpers.js'

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

searchForm.addEventListener('submit', onSearchSubmit)
listControlsForm.addEventListener('change', onListControlsChange)
