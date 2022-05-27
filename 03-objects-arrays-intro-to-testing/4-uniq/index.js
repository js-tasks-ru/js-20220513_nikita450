/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  if (arr === undefined) return []
  const uniqArr = arr.filter((el, idx, arr) => arr.indexOf(el) === idx)
  return uniqArr
}
