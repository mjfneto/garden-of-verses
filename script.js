const form = document.getElementsByTagName('form')[0]
const inputFieldset = document.getElementById('input-field')
const randomCheckbox = document.getElementById('random')
const lineCount = document.getElementById('linecount')
const poemCount = document.getElementById('poemcount')

const baseURL = 'https://poetrydb.org'

form.addEventListener('submit', function (event) {
  event.preventDefault()

  const formData = new FormData(form)
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

  disableForm()

  const URL = `${baseURL}/${inputFields.join(',')}/${searchTerms.join(';')}`

  fetchFromPoetryDB(URL)
})

randomCheckbox.addEventListener('change', function () {
  inputFieldset.disabled = randomCheckbox.checked
})

function fetchFromPoetryDB(url) {
  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error(`Request error: ${response.status}`)
      }

      return response.json()
    })
    .then(function (data) {
      console.log(data)
    })
    .catch(function (error) {
      console.log(error)
    })
    .finally(function () {
      enableForm()
    })
}

function disableForm() {
  for (let input of form) {
    input.disabled = true
  }
}

function enableForm() {
  for (let input of form) {
    input.disabled = false
  }
}
