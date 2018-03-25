import log from './log';

function requestPromise(request, successMessage, data) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      let successData = data;

      if (data.property) {
        successData = request[data.property]; // for getItem
      }
      log.success(successMessage);
      resolve(successData);
    };
    request.onerror = () => {
      log.fail(request.error);
      reject();
    };
  });
}

function transactionPromise(transaction, successMessage, data) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      log.success(successMessage);
      resolve(data);
    };
    transaction.onerror = () => {
      log.fail(transaction.error);
      reject();
    };
  });
}

export default {
  request: requestPromise,
  transaction: transactionPromise,
};
