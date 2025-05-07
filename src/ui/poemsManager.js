import { searchFormEntries } from '../../index.js'
import { getPoems } from '../poetryDBapi.js'
import {
  disableForm,
  enableForm,
  clearElement,
  toggleAccordion,
  clearAfter,
  enablePaginationButtons,
  disablePaginationButtons,
} from './general.js'
import { cloneViaJson, batchArray, randomNotFoundMsg } from '../utils/utils.js'
import {
  searchForm,
  searchResults,
  listControlsForm,
  resultCount,
  authorFilterOptions,
  allAuthorNames,
  firstAuthorCheckboxContainer,
  paginationList,
} from './domElements.js'

let cachedLinesRegExp = null
let cachedSearchTerm = ''

let poems = []
let poemsClone = []
let poemsPages = []
let currentPage = 1

/**
 * Extract class names into constants.
 * If you ever need to tweak styles, it’s safer to avoid magic strings. That prevents typos and makes your linter happier.
 */
const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
}

export async function loadPoems(params) {
  try {
    disableForm(searchForm)

    renderCount({ text: 'Searching for poems...', status: STATUS.LOADING })

    const data = await getPoems(params)

    console.log(data)

    allAuthorNames.checked = true

    if (data instanceof Array) {
      poems = data
      poemsClone = cloneViaJson(poems)

      poemsPages = batchArray(cloneViaJson(poems))

      console.log(poemsPages)
      clearElement(paginationList)
      insertPaginationButtons(poemsPages.length)

      renderCount({ count: poems.length, status: STATUS.SUCCESS })

      clearAfter(firstAuthorCheckboxContainer)
      insertAuthorCheckboxes()

      clearElement(searchResults)
      sortPoems()
      showSearchResults(poemsPages[0])
      enableForm(listControlsForm)
    } else if (typeof data === 'object' && data !== null) {
      poems = []
      poemsClone = []
      poemsPages = []
      clearAfter(firstAuthorCheckboxContainer)
      clearElement(searchResults)

      switch (data.status) {
        case 404:
          renderCount({ text: randomNotFoundMsg(), status: STATUS.ERROR })
          break
        default:
          setMessage({ text: 'Unexpected result', status: 'error' })
      }

      disableForm(listControlsForm)
    } else {
      poems = []
      poemsClone = []
      poemsPages = []
      console.warn('Data in unknown format:', data)
      disableForm(listControlsForm)
    }

    enableForm(searchForm)
  } catch (error) {
    console.log(error)
    renderCount({
      text: 'Oops—something went wrong. Try again!',
      status: STATUS.ERROR,
    })
  }
}

/**
 * Renders the count area in one place.
 *
 * @param {Object} options
 * @param {'idle'|'loading'|'error'|'success'} options.status
 * @param {string} [options.text]     // for idle/loading/error
 * @param {number} [options.count]    // for success
 * @param {string} [options.postfix]  // optional custom suffix
 */
function renderCount({ status, text = '', count = 0, postfix = '' }) {
  resultCount.className = '' // reset
  resultCount.classList.add(status) // e.g. 'loading', 'error', 'success'
  resultCount.textContent = '' // clear existing

  if (status === 'success') {
    const numberEl = document.createElement('strong')
    numberEl.id = 'result-number'
    numberEl.textContent = count
    const label = `${
      postfix ||
      ` poetic gem${
        count > 1 ? 's' : ''
      }  unearthed—time to get lost in the lines!`
    }`
    resultCount.append(numberEl, document.createTextNode(label))
  } else {
    // idle / loading / error all go here
    resultCount.textContent = text
  }
}

function insertPaginationButtons(length) {
  let previousLi = document.createElement('li')
  let previousButton = document.createElement('button')
  previousButton.type = 'button'
  previousButton.dataset.page = 'previous'
  previousButton.ariaLabel = 'Previous page'
  previousButton.textContent = 'Previous'

  previousLi.appendChild(previousButton)
  paginationList.appendChild(previousLi)

  for (let i = 1; i <= length; i += 1) {
    let li = document.createElement('li')
    let button = document.createElement('button')

    if (i === 1) {
      currentPage = i
      button.classList.add('current')
    }

    button.dataset.page = i
    button.type = 'button'
    button.ariaLabel = `Page ${i}`
    button.textContent = i
    li.appendChild(button)
    paginationList.appendChild(li)
  }

  let nextLi = document.createElement('li')
  let nextButton = document.createElement('button')
  nextButton.type = 'button'
  nextButton.dataset.page = 'next'
  nextButton.ariaLabel = 'Next page'
  nextButton.textContent = 'Next'

  nextLi.appendChild(nextButton)
  paginationList.appendChild(nextLi)
}

function showSearchResults(page = []) {
  const linesRegExp = getLinesRegExp()
  let listItemsHTML = ''

  for (const { title, author, linecount, lines } of page) {
    let matchesHTML = ''

    if (searchFormEntries.lines) {
      matchesHTML = lines.reduce((html, line, index) => {
        const withLineNumber = `(${index + 1}) ${line}`

        const hasMatch = linesRegExp.test(withLineNumber)
        if (!hasMatch) return html

        const highlighted = withLineNumber.replaceAll(
          linesRegExp,
          (match) => `<span>${match}</span>`
        )

        return html + `<li>${highlighted}</li>`
      }, '')

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
  ol.insertAdjacentHTML('beforeend', listItemsHTML)
  searchResults.appendChild(ol)

  if (searchFormEntries.lines) {
    ol.querySelectorAll('.accordion').forEach(function (button) {
      button.addEventListener('click', toggleAccordion)
    })
  }
}

function filterPoems(formData = new FormData(listControlsForm)) {
  const authorFilters = formData
    .getAll('authorFilter')
    .filter((author) => author !== 'All')

  poemsClone = cloneViaJson(poems).filter(({ author }) =>
    authorFilters.includes(author)
  )
}

function sortPoems(formData = new FormData(listControlsForm)) {
  const sortCriteria = formData.get('sortCriteria')
  const sortDirection = formData.get('sortDirection')

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
  poemsPages = batchArray(poemsClone)

  clearElement(paginationList)
  poemsPages.length && insertPaginationButtons(poemsPages.length)

  clearElement(searchResults)
  showSearchResults(poemsPages[currentPage - 1])

  if (poemsClone.length === 0) {
    renderCount({
      text: 'No filters, no rhymes—tick a box to unleash the poetry!',
      status: STATUS.ERROR,
    })
  } else {
    renderCount({ count: poemsClone.length, status: STATUS.SUCCESS })
  }
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

export function handlePagination(event) {
  clearElement(searchResults)

  const button = event.target

  const { page } = button.dataset
  const totalPages = poemsPages.length

  if (page === 'previous') {
    currentPage = currentPage === 1 ? totalPages : currentPage - 1
  } else if (page === 'next') {
    currentPage = currentPage === totalPages ? 1 : currentPage + 1
  } else {
    const pageNum = Number(page)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      currentPage = pageNum
    }
  }

  const allButtons = paginationList.querySelectorAll('[data-page]')
  allButtons.forEach((btn) => btn.classList.remove('current'))
  const currentButton = paginationList.querySelector(
    `[data-page="${currentPage}"]`
  )
  currentButton.classList.add('current')

  showSearchResults(poemsPages[currentPage - 1])
}

/**
 * Returns a cached RegExp object for matching poem lines based on the user's input.
 *
 * This function checks if a cached version of the RegExp already exists for the current
 * search term (searchFormEntries.lines). If not, it creates a new global, case-insensitive
 * RegExp and caches it for future use. This avoids unnecessary re-creation of the same
 * regular expression and improves performance when filtering or highlighting matching lines.
 *
 * @returns {RegExp|null} A RegExp object for matching lines, or null if no search term is provided.
 */
function getLinesRegExp() {
  const term = searchFormEntries.lines
  if (term !== cachedSearchTerm) {
    cachedSearchTerm = term
    cachedLinesRegExp = new RegExp(term, 'gi')
  }
  return cachedLinesRegExp
}
