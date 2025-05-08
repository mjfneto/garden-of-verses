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

export function toggleAccordion() {
  this.classList.toggle('active')

  let panel = this.nextElementSibling

  if (panel.style.maxHeight) {
    panel.style.maxHeight = null
  } else {
    panel.style.maxHeight = panel.scrollHeight + 'px'
  }
}
