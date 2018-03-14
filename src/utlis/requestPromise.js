import log from './log';

const requestPromise = (request, successMessage, data) => new Promise((resolve, reject) => {
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

export default requestPromise;
