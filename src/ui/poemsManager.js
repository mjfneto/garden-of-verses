import { searchFormEntries } from '../../index.js'
import { getPoems } from '../poetryDBapi.js'
import {
  disableForm,
  enableForm,
  clearElement,
  toggleAccordion,
  clearAfter,
  openModal,
  closeModal,
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
  pagination,
  modal,
  closeModalBtn,
  modalBody,
} from './domElements.js'

let cachedLinesRegExp = null
let cachedSearchTerm = ''

let state = {
  originalPoems: [],
  currentPage: 1,
  totalPages: 0,
  pageSize: 50,
}

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
      state.originalPoems = data
      state.currentPage = 1
      state.totalPages = 0

      renderCount({ count: state.originalPoems.length, status: STATUS.SUCCESS })

      clearAfter(firstAuthorCheckboxContainer)
      insertAuthorCheckboxes()

      enableForm(listControlsForm)

      updatePoems()
    } else if (typeof data === 'object' && data !== null) {
      state.originalPoems = []
      state.currentPage = 1
      state.totalPages = 0

      clearAfter(firstAuthorCheckboxContainer)
      clearElement(searchResults)
      clearElement(pagination)

      switch (data.status) {
        case 404:
          renderCount({ text: randomNotFoundMsg(), status: STATUS.ERROR })
          break
        default:
          setMessage({ text: 'Unexpected result', status: 'error' })
      }

      disableForm(listControlsForm)
    } else {
      state.originalPoems = []
      state.currentPage = 1
      state.totalPages = 0

      clearAfter(firstAuthorCheckboxContainer)
      clearElement(searchResults)
      clearElement(pagination)

      console.warn('Data in unknown format:', data)

      disableForm(listControlsForm)
    }

    enableForm(searchForm)
  } catch (error) {
    console.log(error)

    state.originalPoems = []
    state.currentPage = 1
    state.totalPages = 0

    renderCount({
      text: 'Oops—something went wrong. Try again!',
      status: STATUS.ERROR,
    })
  }
}

export function updatePoems() {
  const filtered = filterPoems(cloneViaJson(state.originalPoems))
  const sorted = sortPoems(filtered)
  const paginated = batchArray(sorted, state.pageSize)

  if (state.currentPage > paginated.length) state.currentPage = 1

  state.totalPages = paginated.length

  clearElement(pagination)
  paginated.length && insertPaginationButtons(paginated)

  const currentPageButton = pagination.querySelector(
    `[data-page="${state.currentPage}"]`
  )
  currentPageButton &&
    currentPageButton.scrollIntoView({ block: 'nearest', inline: 'center' })

  const currentIndex = state.currentPage - 1
  clearElement(searchResults)
  showSearchResults(paginated[currentIndex], currentIndex * state.pageSize + 1)

  renderCount(
    filtered.length === 0
      ? {
          text: 'No filters, no rhymes—tick a box to unleash the poetry!',
          status: STATUS.ERROR,
        }
      : { count: filtered.length, status: STATUS.SUCCESS }
  )
}

function filterPoems(poems) {
  const listControlsFormData = new FormData(listControlsForm)
  const authorFilters = listControlsFormData
    .getAll('authorFilter')
    .filter((author) => author !== 'All')

  return poems.filter(({ author }) => authorFilters.includes(author))
}

function sortPoems(poems) {
  const listControlsFormData = new FormData(listControlsForm)
  const sortCriteria = listControlsFormData.get('sortCriteria')
  const sortDirection = listControlsFormData.get('sortDirection')

  if (sortDirection === 'asc' || sortDirection === 'desc') {
    poems.sort(function (a, b) {
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

  return poems
}

function insertAuthorCheckboxes() {
  const authors = state.originalPoems
    .map(({ author }) => author)
    .filter((author, index, array) => array.indexOf(author) === index)
    .sort((a, b) => a.localeCompare(b))

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

function insertPaginationButtons(pages) {
  let previousButton = document.createElement('button')
  previousButton.type = 'button'
  previousButton.dataset.page = 'previous'
  previousButton.ariaLabel = 'Previous page'
  previousButton.classList.add('pagination-button')
  previousButton.textContent = '\u2039' // SINGLE LEFT-POINTING ANGLE QUOTATION MARK

  pagination.appendChild(previousButton)

  let paginationList = document.createElement('ol')
  paginationList.id = 'pagination-list'

  for (let i = 1; i <= pages.length; i += 1) {
    let li = document.createElement('li')
    let button = document.createElement('button')

    if (i === state.currentPage) {
      button.classList.add('current')
      button.ariaCurrent = 'page'
    }

    button.dataset.page = i
    button.type = 'button'
    button.classList.add('pagination-button')
    button.textContent = i
    li.appendChild(button)
    paginationList.appendChild(li)
  }

  pagination.appendChild(paginationList)

  let nextButton = document.createElement('button')
  nextButton.type = 'button'
  nextButton.dataset.page = 'next'
  nextButton.ariaLabel = 'Next page'
  nextButton.classList.add('pagination-button')
  nextButton.textContent = '\u203a' // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK

  const { currentPage, pageSize } = state

  let divInterval = document.createElement('div')
  divInterval.id = 'pagination-interval'
  divInterval.ariaLive = 'polite'
  let pInterval = document.createElement('p')
  const currentIndex = currentPage - 1
  const startNum = currentIndex * pageSize + 1
  const endNum = startNum + pages[currentIndex].length - 1
  pInterval.innerHTML = `Showing poems <strong>${startNum}</strong> through <strong>${endNum}</strong>`
  divInterval.appendChild(pInterval)

  pagination.appendChild(nextButton)
  pagination.appendChild(divInterval)
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
  const button = event.target

  const { page } = button.dataset
  const { totalPages } = state

  if (page === 'previous') {
    state.currentPage =
      state.currentPage === 1 ? totalPages : state.currentPage - 1
  } else if (page === 'next') {
    state.currentPage =
      state.currentPage === totalPages ? 1 : state.currentPage + 1
  } else {
    const pageNum = Number(page)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      state.currentPage = pageNum
    }
  }

  const allButtons = pagination.querySelectorAll('[data-page]')
  allButtons.forEach((btn) => btn.classList.remove('current'))
  const currentButton = pagination.querySelector(
    `[data-page="${state.currentPage}"]`
  )
  currentButton.classList.add('current')
}

function showSearchResults(page = [], start = 1) {
  const linesRegExp = getLinesRegExp()
  let listItemsHTML = ''

  for (let i = 0; i < page.length; i += 1) {
    const { title, author, linecount, lines } = page[i]

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
          <div class="search-result-controls">
            <button 
              type="button" 
              aria-haspopup="dialog" 
              aria-controls="modal" 
              class="open-modal">
              Read
            </button>

            <button 
              type="button" 
              class="accordion matching-lines" 
              aria-expanded="false" 
              aria-controls="lines-peek-${i}">
              Matching lines
            </button>
          </div>
          <ul id="lines-peek-${i}" class="panel lines-peek">${matchesHTML}</ul>
        </li>
      `
    } else {
      listItemsHTML += `
        <li>
          <p class="search-result-title">${title}</p>
          <p class="search-result-author">${author}</p>
          <p class="line-count"><data value="${linecount}">Lines: ${linecount}</data></p>
          <div class="search-result-controls">
            <button 
              type="button" 
              aria-haspopup="dialog" 
              aria-controls="modal" 
              class="open-modal">
              Read
            </button>
          </div>
        </li>
      `
    }
  }

  let ol = document.createElement('ol')
  ol.start = start
  ol.insertAdjacentHTML('beforeend', listItemsHTML)
  searchResults.appendChild(ol)

  if (searchFormEntries.lines) {
    ol.querySelectorAll('.accordion').forEach(function (button, index) {
      button.addEventListener('click', (event) =>
        toggleAccordion(event.target, index)
      )
    })
  }

  ol.querySelectorAll('.open-modal').forEach(function (button, index) {
    button.addEventListener('click', () => {
      openModal()
      closeModalBtn.addEventListener('click', closeModal)
      modalBody.scroll({ top: 0 })
      renderPoem(page[index], index)
    })
  })
}

function renderPoem({ title, author, linecount, lines }, index) {
  const modalTitleId = `modal-title-${index}`

  modal.setAttribute('aria-labelledby', modalTitleId)

  modalBody.insertAdjacentHTML(
    'beforeend',
    `
      <header class="modal-header">
        <h2 id="${modalTitleId}">${title}</h2>
      </header>

      <section class="poem-info">
        <p class="poem-author"><strong>Author:</strong> ${author}</p>
        <p class="poem-linecount"><strong>Lines:</strong> ${linecount}</p>
      </section>

      <section aria-labelledby="poem-heading">
        <h3 id="poem-heading" class="visually-hidden">Poem content</h3>
        <pre aria-describedby="${modalTitleId}">${lines.join('\n')}</pre>
    </section>
    `
  )
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
