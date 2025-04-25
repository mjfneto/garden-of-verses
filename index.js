import { loadPoems, updatePoems } from './src/ui/poemsManager.js'

const searchForm = document.getElementById('search-form')

const listControlsForm = document.getElementById('list-controls-form')

const listControlsFormData = new FormData(listControlsForm)
export let listControlsFormEntries = Object.fromEntries(
  listControlsFormData.entries()
)

export let searchFormEntries = {}

searchForm.addEventListener('submit', function (event) {
  event.preventDefault()

  const searchFormData = new FormData(searchForm)
  const searchFormEntries = searchFormData.entries()
  let inputFields = []
  let searchTerms = []

  for (const [inputField, searchTerm] of searchFormEntries) {
    searchFormEntries[inputField] = searchTerm
  }

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

listControlsForm.addEventListener('change', function () {
  const listControlsFormData = new FormData(listControlsForm)
  listControlsFormEntries = Object.fromEntries(listControlsFormData.entries())
  updatePoems()
})
