// Qucik Sort Algorithm
function swap(arr, i, j) {
  let temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

function partition(arr, low, high, key, reverse = false) {
  let pivot = arr[high][key];

  let i = low - 1;

  for (let j = low; j <= high - 1; j++) {
    if (!reverse ? arr[j][key] < pivot : arr[j][key] > pivot) {
      i++;
      swap(arr, i, j);
    }
  }
  swap(arr, i + 1, high);
  return i + 1;
}

function quickSort(arr, low, high, key, reverse = false) {
  if (low < high) {
    let pi = partition(arr, low, high, key, reverse);

    quickSort(arr, low, pi - 1, key, reverse);
    quickSort(arr, pi + 1, high, key, reverse);
  }
}

// Binary Search
function binarySearch(arr, l, r, x, key) {
  if (r >= l) {
    let mid = l + Math.floor((r - l) / 2);
    if (arr[mid][key] >= x) return mid;

    if (arr[mid][key] > x) return binarySearch(arr, l, mid - 1, x, key);

    return binarySearch(arr, mid + 1, r, x, key);
  }

  return -1;
}

module.exports = { quickSort, binarySearch };
