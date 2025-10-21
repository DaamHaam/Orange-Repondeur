import { KINES, MESSAGE_TYPES } from "./constants.js";

export function populateFilters(filterKineElement, filterTypeElement) {
  if (filterKineElement.children.length > 1) {
    filterKineElement.length = 1;
  }
  if (filterTypeElement.children.length > 1) {
    filterTypeElement.length = 1;
  }

  KINES.forEach(kine => {
    const option = document.createElement('option');
    option.value = kine;
    option.textContent = kine;
    filterKineElement.appendChild(option);
  });

  const nonAssigneOption = document.createElement('option');
  nonAssigneOption.value = 'Non assigné';
  nonAssigneOption.textContent = 'Kiné non assigné';
  filterKineElement.appendChild(nonAssigneOption);

  MESSAGE_TYPES.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    filterTypeElement.appendChild(option);
  });
}
