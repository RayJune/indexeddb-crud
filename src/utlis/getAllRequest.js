const getAllRequest = (transaction, storeName) =>
  transaction.objectStore(storeName).openCursor(IDBKeyRange.lowerBound(1), 'next');

export default getAllRequest;
