import {
  searchForm,
  listControlsForm,
  pagination,
} from './src/ui/domElements.js'
import { handleCheckboxes, loadPoems, updatePoems } from './src/ui/poemsUI.js'
import { noSpecialCharsRegex } from './src/validationPatterns.js'
import { buildSearchParams } from './src/utils/searchHelpers.js'
import { handlePagination } from './src/ui/poemsManager.js'

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
  if (event.target.type === 'checkbox') handleCheckboxes(event)
  updatePoems()
}

function onPaginationClicked(event) {
  const eventTarget = event.target

  if (
    eventTarget.tagName !== 'BUTTON' &&
    eventTarget.parentElement.tagName !== 'BUTTON'
  )
    return

  handlePagination(eventTarget.closest('button'))
  updatePoems()
}

searchForm.addEventListener('submit', onSearchSubmit)
listControlsForm.addEventListener('change', onListControlsChange)
pagination.addEventListener('click', onPaginationClicked)
