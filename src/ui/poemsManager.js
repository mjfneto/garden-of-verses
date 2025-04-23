import { formEntries } from '../../index.js'
import { getPoems } from '../poetryDBapi.js'
import {
  disableForm,
  enableForm,
  clearElement,
  toggleAccordion,
} from './general.js'
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
  const linesRegExp = new RegExp(formEntries.lines, 'gi')

  for (const { title, author, linecount, lines } of data) {
    if (formEntries.lines) {
      const matches = lines
        .map((line, index) => `(${index + 1}) ${line}`)
        .filter(function (line) {
          return linesRegExp.test(line)
        })
        .map(function (line) {
          return `<li>${line.replaceAll(
            linesRegExp,
            (line) => `<span>${line}</span>`
          )}</li>`
        })
        .join('')

      ol.insertAdjacentHTML(
        'beforeend',
        `
            <li>
              <p class="search-result-title">${title}</p>
              <p class="search-result-author">${author}</p>
              <p class="line-count"><data value="${linecount}">Lines: ${linecount}</data></p>
              <button type="button" class="accordion matching-lines">Matching lines</button>
              <ul class="panel lines-peek">${matches}</ul>
            </li>
          `
      )

      // Add "click" event listener to the button with class accordion of the last (current) li
      ol.lastElementChild
        .querySelector('.accordion')
        .addEventListener('click', toggleAccordion)
    } else {
      ol.insertAdjacentHTML(
        'beforeend',
        `
            <li>
              <p class="search-result-title">${title}</p>
              <p class="search-result-author">${author}</p>
              <p class="line-count"><data value="${linecount}">Lines: ${linecount}</data></p>
            </li>
          `
      )
    }
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
