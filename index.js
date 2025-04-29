import { SELECTORS } from './src/ui/domSelectors.js'
import {
  handleCheckboxes,
  loadPoems,
  updatePoems,
} from './src/ui/poemsManager.js'

const searchForm = document.querySelector(SELECTORS.searchForm)

const listControlsForm = document.querySelector(SELECTORS.listControls)

export let searchFormEntries = {}

searchForm.addEventListener('submit', function (event) {
  event.preventDefault()

  const searchFormData = new FormData(searchForm)
  searchFormEntries = Object.fromEntries(searchFormData.entries())
  let inputFields = []
  let searchTerms = []

  if (Object.values(searchFormEntries).every((value) => !value)) {
    alert('Kindly fill out at least one field before you submit the form.')
    return
  }

  for (const [inputField, searchTerm] of Object.entries(searchFormEntries)) {
    if (searchFormEntries.random && inputField === 'poemcount') {
      continue
    }

    if (searchTerm) {
      inputFields.push(inputField)
      if (inputField === 'random') {
        if (searchFormEntries.poemcount) {
          searchTerms.push(searchFormEntries.poemcount)
        } else {
          searchTerms.push('1')
        }
      } else {
        searchTerms.push(searchTerm)
      }
    }
  }

  loadPoems(`${inputFields.join(',')}/${searchTerms.join(';')}`)
})

listControlsForm.addEventListener('change', function (event) {
  handleCheckboxes(event)
  updatePoems()
})
