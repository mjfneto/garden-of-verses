import { closeModalBtn, modal, searchResults } from './domElements.js'

export function clearElement(element) {
  while (element.firstChild) {
    element.firstChild.remove()
  }
}

export function clearAfter(element) {
  while (element.nextElementSibling) {
    element.nextElementSibling.remove()
  }
}

export function disableForm(form) {
  for (let input of form) {
    input.disabled = true
  }
}

export function enableForm(form) {
  for (let input of form) {
    input.disabled = false
  }
}

export function toggleAccordion(accordion, index) {
  accordion.classList.toggle('active')

  let panel = searchResults.querySelector(`#lines-peek-${index}`)

  if (panel.style.maxHeight) {
    panel.style.maxHeight = null
    panel.style.padding = '0px'
  } else {
    panel.style.maxHeight = panel.scrollHeight + 'px'
    panel.style.padding = '0.25rem 0px'
  }
}

export function openModal() {
  document.body.classList.add('modal-open')
  modal.classList.add('active')
}

export function closeModal() {
  document.body.classList.remove('modal-open')
  modal.classList.remove('active')
  closeModalBtn.removeEventListener('click', closeModal)
}
