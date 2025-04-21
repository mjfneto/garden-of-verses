import { loadPoems } from './src/ui/poemsManager.js'

const searchForm = document.getElementById('search-form')

searchForm.addEventListener('submit', function (event) {
  event.preventDefault()

  const formData = new FormData(searchForm)
  const entries = formData.entries()
  const formEntries = {}
  let inputFields = []
  let searchTerms = []

  for (const [inputField, searchTerm] of entries) {
    formEntries[inputField] = searchTerm
  }

  if (Object.values(formEntries).every((value) => !value)) {
    alert('Kindly fill out at least one field before you submit the form.')
    return
  }

  for (const [inputField, searchTerm] of Object.entries(formEntries)) {
    if (formEntries.random && inputField === 'poemcount') {
      continue
    }

    if (searchTerm) {
      inputFields.push(inputField)
      if (inputField === 'random') {
        if (formEntries.poemcount) {
          searchTerms.push(formEntries.poemcount)
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
