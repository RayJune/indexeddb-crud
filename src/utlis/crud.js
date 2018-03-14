import log from './log';
import requestPromise from './requestPromise';
import getAllRequest from './getAllRequest';

function get(dbValue, key, storeName) {
  const transaction = dbValue.transaction([storeName]);
  const getRequest = transaction.objectStore(storeName).get(parseInt(key, 10)); // get it by index
  const successMessage = `get ${storeName}'s ${getRequest.source.keyPath} = ${key} data success`;
  const data = { property: 'result' };

  return requestPromise(getRequest, successMessage, data);
}

// get conditional data (boolean condition)
function getWhetherCondition(dbValue, condition, whether, successCallback, storeName) {
  const transaction = dbValue.transaction([storeName]);
  const result = []; // use an array to storage eligible data

  getAllRequest(transaction, storeName).onsuccess = ({ target }) => {
    const cursor = target.result;

    if (cursor) {
      if (cursor.value[condition] === whether) {
        result.push(cursor.value);
      }
      cursor.continue();
    }
  };
  transaction.oncomplete = () => {
    log.success(`get ${storeName}'s ${condition} = ${whether} data success`);
    if (successCallback) {
      successCallback(result);
    }
  };
}

function getAll(dbValue, successCallback, storeName) {
  const transaction = dbValue.transaction([storeName]);
  const result = [];

  getAllRequest(transaction, storeName).onsuccess = ({ target }) => {
    const cursor = target.result;

    if (cursor) {
      result.push(cursor.value);
      cursor.continue();
    }
  };
  transaction.oncomplete = () => {
    log.success(`get ${storeName}'s all data success`);
    if (successCallback) {
      successCallback(result);
    }
  };
}

function add(dbValue, newData, storeName) {
  const transaction = dbValue.transaction([storeName], 'readwrite');
  const addRequest = transaction.objectStore(storeName).add(newData);
  const successMessage = `add ${storeName}'s ${addRequest.source.keyPath}  = ${newData[addRequest.source.keyPath]} data succeed`;

  return requestPromise(addRequest, successMessage, newData);
}

function remove(dbValue, key, storeName) {
  const transaction = dbValue.transaction([storeName], 'readwrite');
  const deleteRequest = transaction.objectStore(storeName).delete(key);
  const successMessage = `remove ${storeName}'s  ${deleteRequest.source.keyPath} = ${key} data success`;

  return requestPromise(deleteRequest, successMessage, key);
}

function removeWhetherCondition(dbValue, condition, whether, successCallback, storeName) {
  const transaction = dbValue.transaction([storeName], 'readwrite');

  getAllRequest(transaction, storeName).onsuccess = ({ target }) => {
    const cursor = target.result;

    if (cursor) {
      if (cursor.value[condition] === whether) {
        cursor.delete();
      }
      cursor.continue();
    }
  };
  transaction.oncomplete = () => {
    log.success(`remove ${storeName}'s ${condition} = ${whether} data success`);
    if (successCallback) {
      successCallback();
    }
  };
}

function clear(dbValue, successCallback, storeName) {
  const transaction = dbValue.transaction([storeName], 'readwrite');

  getAllRequest(transaction, storeName).onsuccess = ({ target }) => {
    const cursor = target.result;

    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };
  transaction.oncomplete = () => {
    log.success(`clear ${storeName}'s all data success`);
    if (successCallback) {
      successCallback('clear all data success');
    }
  };
}

// update one
function update(dbValue, newData, storeName) {
  const transaction = dbValue.transaction([storeName], 'readwrite');
  const putRequest = transaction.objectStore(storeName).put(newData);
  const successMessage = `update ${storeName}'s ${putRequest.source.keyPath}  = ${newData[putRequest.source.keyPath]} data success`;

  return requestPromise(putRequest, successMessage, newData);
}

const crud = {
  get,
  getWhetherCondition,
  getAll,
  add,
  remove,
  removeWhetherCondition,
  clear,
  update,
};

export default crud;
