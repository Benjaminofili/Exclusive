/**
 * Get a sanitized array of string IDs from localStorage.
 * @param {string} key - The localStorage key.
 * @returns {string[]} - Array of unique string IDs.
 */
export function getSanitizedIdArray(key) {
  let arr = [];
  try {
    arr = JSON.parse(localStorage.getItem(key)) || [];
    arr = arr.filter(id => typeof id === "string");
    arr = Array.from(new Set(arr));
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {
    arr = [];
  }
  return arr;
}

/**
 * Add a string ID to a localStorage array, ensuring uniqueness.
 * @param {string} key - The localStorage key.
 * @param {string} id - The ID to add.
 */
export function addIdToStorageArray(key, id) {
  let arr = getSanitizedIdArray(key);
  if (!arr.includes(id)) {
    arr.push(id);
    localStorage.setItem(key, JSON.stringify(arr));
  }
}

/**
 * Remove a string ID from a localStorage array.
 * @param {string} key - The localStorage key.
 * @param {string} id - The ID to remove.
 */
export function removeIdFromStorageArray(key, id) {
  let arr = getSanitizedIdArray(key);
  arr = arr.filter(item => item !== id);
  localStorage.setItem(key, JSON.stringify(arr));
}
