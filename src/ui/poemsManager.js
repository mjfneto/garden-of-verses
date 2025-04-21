import { getPoems } from '../poetryDBapi.js'
import { disableForm, enableForm, clearElement } from './general.js'
import { randomNotFoundMsg } from '../utils.js'

const searchForm = document.getElementById('search-form')
const searchResults = document.getElementById('search-results')

export async function loadPoems(params) {
  try {
    disableForm(searchForm)

    const data = await getPoems(params)

    console.log(data)

    if (data instanceof Array) {
      clearElement(searchResults)
      showSearchResults(data)
    } else if (typeof data === 'object' && data !== null) {
      clearElement(searchResults)
      showNotFound(data)
    } else {
      console.warn('Data in unknown format:', data)
    }

    enableForm(searchForm)
  } catch (error) {
    console.log(error)
  }
}

function showSearchResults(data) {
  let ol = document.createElement('ol')

  for (const { title, author, linecount } of data) {
    ol.insertAdjacentHTML(
      'beforeend',
      `
          <li>
            ${title} (${author})
            <p class="line-count"><data value="${linecount}">Lines: ${linecount}</data></p>
          </li>
        `
    )
  }

  searchResults.appendChild(ol)
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
