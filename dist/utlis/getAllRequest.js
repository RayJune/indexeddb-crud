'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getAllRequest = function getAllRequest(transaction, storeName) {
  return transaction.objectStore(storeName).openCursor(IDBKeyRange.lowerBound(1), 'next');
};

exports.default = getAllRequest;
//# sourceMappingURL=getAllRequest.js.map