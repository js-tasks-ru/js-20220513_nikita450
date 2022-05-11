/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let sortedArr = [];
  sortedArr = arr.sort((a, b) => {
    if (param === 'asc' && typeof a === 'string') {
      return a.localeCompare(b, 'ru', { caseFirst: 'upper' });
    }
    if (param === 'desc' && typeof b === 'string') {
      return b.localeCompare(a, 'ru');
    }
    return 0;
  });
  return sortedArr;
}
