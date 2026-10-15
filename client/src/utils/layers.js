// Later in the array = drawn on top. Each function returns a new array and never changes the old one.
export function bringToFront(elements, selectedIds) {
  const selected = elements.filter((element) => selectedIds.includes(element.id));
  const others = elements.filter((element) => !selectedIds.includes(element.id));
  return [...others, ...selected];
}

export function sendToBack(elements, selectedIds) {
  const selected = elements.filter((element) => selectedIds.includes(element.id));
  const others = elements.filter((element) => !selectedIds.includes(element.id));
  return [...selected, ...others];
}

// Swap each selected element with the unselected neighbour above it.
export function bringForward(elements, selectedIds) {
  const result = [...elements];
  for (let index = result.length - 2; index >= 0; index--) {
    const isSelected = selectedIds.includes(result[index].id);
    const isNextSelected = selectedIds.includes(result[index + 1].id);
    if (isSelected && !isNextSelected) {
      [result[index], result[index + 1]] = [result[index + 1], result[index]];
    }
  }
  return result;
}

export function sendBackward(elements, selectedIds) {
  const result = [...elements];
  for (let index = 1; index < result.length; index++) {
    const isSelected = selectedIds.includes(result[index].id);
    const isPreviousSelected = selectedIds.includes(result[index - 1].id);
    if (isSelected && !isPreviousSelected) {
      [result[index], result[index - 1]] = [result[index - 1], result[index]];
    }
  }
  return result;
}
