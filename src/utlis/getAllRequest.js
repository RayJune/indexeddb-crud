function getAllRequest(transaction, storeName) {
  return transaction.objectStore(storeName).openCursor(IDBKeyRange.lowerBound(1), 'next');
}

export default getAllRequest;
