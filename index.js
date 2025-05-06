import { pagination } from './src/ui/domElements.js'
import {
  SELECTORS,
  handleCheckboxes,
  loadPoems,
  updatePoems,
} from './src/ui/poemsUI.js'
import { noSpecialCharsRegex } from './src/validationPatterns.js'
import { buildSearchParams } from './src/utils/searchHelpers.js'
import { handlePaginationButtons } from './src/ui/poemsManager.js'

const searchForm = document.querySelector(SELECTORS.searchForm)
const listControlsForm = document.querySelector(SELECTORS.listControls)

export let searchFormEntries = {}

function onSearchSubmit(event) {
  event.preventDefault()

  const searchFormData = new FormData(searchForm)
  searchFormEntries = Object.fromEntries(searchFormData.entries())

  if (
    Object.values(searchFormEntries).some(
      (val) => !noSpecialCharsRegex.test(val)
    )
  ) {
    alert(
      'Please use only letters, numbers, and spaces. No special characters allowed.'
    )
    return
  }

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

function onPaginationClicked(event) {
  handlePaginationButtons(event)
}

searchForm.addEventListener('submit', onSearchSubmit)
listControlsForm.addEventListener('change', onListControlsChange)
pagination.addEventListener('click', onPaginationClicked)
