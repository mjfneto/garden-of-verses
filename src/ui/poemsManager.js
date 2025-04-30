import { searchFormEntries } from '../../index.js'
import { getPoems } from '../poetryDBapi.js'
import {
  disableForm,
  enableForm,
  clearElement,
  toggleAccordion,
  clearAfter,
} from './general.js'
import { cloneViaJson, randomNotFoundMsg } from '../utils/utils.js'
import { SELECTORS } from './domSelectors.js'

const searchForm = document.querySelector(SELECTORS.searchForm)
const searchResults = document.querySelector(SELECTORS.searchResults)
const listControlsForm = document.querySelector(SELECTORS.listControls)
const authorFilterOptions = document.querySelector(SELECTORS.authorOptions)
const allAuthorNames = document.querySelector(SELECTORS.allAuthors)
const firstAuthorCheckboxContainer = document.querySelector(
  SELECTORS.authorCheckboxContainers
)

let poems = []
let poemsClone = []

export async function loadPoems(params) {
  try {
    disableForm(searchForm)

    const data = await getPoems(params)

    console.log(data)

    allAuthorNames.checked = true

    if (data instanceof Array) {
      poems = data
      poemsClone = cloneViaJson(poems)

      clearAfter(firstAuthorCheckboxContainer)
      insertAuthorCheckboxes()
      clearElement(searchResults)
      sortPoems()
      showSearchResults()
      enableForm(listControlsForm)
    } else if (typeof data === 'object' && data !== null) {
      poems = []
      poemsClone = []
      clearAfter(firstAuthorCheckboxContainer)
      clearElement(searchResults)
      showNotFound(data)
      disableForm(listControlsForm)
    } else {
      poems = []
      poemsClone = []
      console.warn('Data in unknown format:', data)
      disableForm(listControlsForm)
    }

    enableForm(searchForm)
  } catch (error) {
    console.log(error)
  }
}

function showSearchResults() {
  const linesRegExp = new RegExp(searchFormEntries.lines, 'gi')
  let listItemsHTML = ''

  for (const { title, author, linecount, lines } of poemsClone) {
    let matchesHTML = ''

    if (searchFormEntries.lines) {
      matchesHTML = lines
        .map((line, index) => `(${index + 1}) ${line}`)
        .filter((line) => linesRegExp.test(line))
        .map(
          (line) =>
            `<li>${line.replaceAll(
              linesRegExp,
              (m) => `<span>${m}</span>`
            )}</li>`
        )
        .join('')

      listItemsHTML += `
        <li>
          <p class="search-result-title">${title}</p>
          <p class="search-result-author">${author}</p>
          <p class="line-count"><data value="${linecount}">Lines: ${linecount}</data></p>
          <button type="button" class="accordion matching-lines">Matching lines</button>
          <ul class="panel lines-peek">${matchesHTML}</ul>
        </li>
      `
    } else {
      listItemsHTML += `
        <li>
          <p class="search-result-title">${title}</p>
          <p class="search-result-author">${author}</p>
          <p class="line-count"><data value="${linecount}">Lines: ${linecount}</data></p>
        </li>
      `
    }
  }

  let ol = document.createElement('ol')
  ol.innerHTML = listItemsHTML
  searchResults.appendChild(ol)

  if (searchFormEntries.lines) {
    ol.querySelectorAll('.accordion').forEach(function (button) {
      button.addEventListener('click', toggleAccordion)
    })
  }
}

function showNotFound(data) {
  const { status } = data
  let p = document.createElement('p')

  switch (status) {
    case 404:
      p.textContent = randomNotFoundMsg()
      break
    default:
      p.textContent = 'Unexpected result.'
  }

  searchResults.appendChild(p)
}

function filterPoems() {
  const listControlsFormData = new FormData(listControlsForm)
  const authorFilters = listControlsFormData
    .getAll('authorFilter')
    .filter((author) => author !== 'All')

  poemsClone = cloneViaJson(poems).filter(({ author }) =>
    authorFilters.includes(author)
  )
}

function sortPoems() {
  const listControlsFormData = new FormData(listControlsForm)
  const sortCriteria = listControlsFormData.get('sortCriteria')
  const sortDirection = listControlsFormData.get('sortDirection')

  if (sortDirection === 'asc' || sortDirection === 'desc') {
    poemsClone.sort(function (a, b) {
      if (sortCriteria === 'title' || sortCriteria === 'author') {
        const stringA = a[sortCriteria]
        const stringB = b[sortCriteria]

        return sortDirection === 'asc'
          ? stringA.localeCompare(stringB)
          : stringB.localeCompare(stringA)
      }

      if (sortCriteria === 'linecount') {
        const x = Number(a[sortCriteria])
        const y = Number(b[sortCriteria])

        return sortDirection === 'asc' ? x - y : y - x
      }
    })
  }
}

export function updatePoems() {
  filterPoems()
  sortPoems()
  clearElement(searchResults)
  showSearchResults()
}

function insertAuthorCheckboxes() {
  const authors = poemsClone
    .map(({ author }) => author)
    .filter((author, index, array) => array.indexOf(author) === index)

  let checkboxes = authors
    .map(function (author, index) {
      return `
          <div class="author-checkbox-container">
            <label for="author-name-${index}">${author}</label>
            <input checked type="checkbox" id="author-name-${index}" class="author-checkbox" name="authorFilter" value="${author}" />
          </div>
        `
    })
    .join('')

  authorFilterOptions.insertAdjacentHTML('beforeend', checkboxes)
}

export function handleCheckboxes(event) {
  const isAuthorFilter = event.target.name === 'authorFilter'

  if (!isAuthorFilter) return

  const authorCheckboxes = Array.from(
    listControlsForm.querySelectorAll('.author-checkbox')
  )

  if (event.target === allAuthorNames) {
    authorCheckboxes.forEach(
      (checkbox) => (checkbox.checked = allAuthorNames.checked)
    )
  } else {
    allAuthorNames.checked = authorCheckboxes.every(
      (checkbox) => checkbox.checked
    )
  }
}
