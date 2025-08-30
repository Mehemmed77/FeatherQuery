export default function areArraysEqualEvery(arr1: unknown[], arr2: unknown[]) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  return arr1.every((value, index) => value === arr2[index]);
}