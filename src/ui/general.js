export function clearElement(element) {
  while (element.firstChild) {
    element.firstChild.remove()
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
