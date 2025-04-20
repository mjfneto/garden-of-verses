const form = document.getElementsByTagName('form')[0]
const inputFieldset = document.getElementById('input-field')
const randomCheckbox = document.getElementById('random')
const lineCount = document.getElementById('linecount')
const poemCount = document.getElementById('poemcount')

const baseURL = 'https://poetrydb.org'

const rightContainer = document.getElementById('right-container')

const notFoundMsgs = [
  'The muse has whispered no verses for this query.',
  'Our digital inkwell yielded no stanzas this time.',
  'The rhythm of our search found no matching rhyme.',
  'The verses you seek remain unsung in our collection.',
  'No poetic echoes resonate with your request.',
  'The tapestry of our words holds no thread quite like that.',
  'The quill of our search has drawn a blank on this subject.',
  'No sonnets bloom from the seeds of your search.',
  'The ballad of your query has no matching verse in our library.',
  'Silence answers your poetic call; no verses were discovered.',
]

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
      handleData(data)
    })
    .catch(function (error) {
      console.log(error)
    })
    .finally(function () {
      enableForm()
    })
}

function handleData(data) {
  if (data instanceof Array) {
    clearElement(rightContainer)
    showSearchResults(data)
  } else if (typeof data === 'object' && data !== null) {
    clearElement(rightContainer)
    showNotFound(data)
  } else {
    console.warn('Data in unknown format:', data)
  }
}

function showSearchResults(data) {
  let ol = document.createElement('ol')

  for (const poem of data) {
    let li = document.createElement('li')
    li.textContent = `${poem.title} (${poem.author})`
    ol.appendChild(li)
  }

  rightContainer.appendChild(ol)
}

function showNotFound(data) {
  const { status } = data
  let p = document.createElement('p')

  switch (status) {
    case 404:
      const randomIndex = getRandomIntInclusive(0, notFoundMsgs.length - 1)
      p.textContent = notFoundMsgs[randomIndex]
      break
    default:
      p.textContent = 'Unexpected result.'
  }

  rightContainer.appendChild(p)
}

function clearElement(element) {
  while (element.firstChild) {
    element.firstChild.remove()
  }
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

/**
 * Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
 */
function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled) // The maximum is inclusive and the minimum is inclusive
}
