import promiseGenerator from './promiseGenerator';
import getAllRequest from './getAllRequest';

function get(dbValue, key, storeName) {
  const transaction = dbValue.transaction([storeName]);
  const getRequest = transaction.objectStore(storeName).get(parseInt(key, 10)); // get it by index
  const successMessage = `get ${storeName}'s ${getRequest.source.keyPath} = ${key} data success`;
  const data = { property: 'result' };

  return promiseGenerator.request(getRequest, successMessage, data);
}

// get conditional data (boolean condition)
function getWhetherCondition(dbValue, condition, whether, storeName) {
  const transaction = dbValue.transaction([storeName]);
  const result = []; // use an array to storage eligible data
  const successMessage = `get ${storeName}'s ${condition} = ${whether} data success`;

  getAllRequest(transaction, storeName).onsuccess = ({ target }) => {
    const cursor = target.result;

    if (cursor) {
      if (cursor.value[condition] === whether) {
        result.push(cursor.value);
      }
      cursor.continue();
    }
  };

  return promiseGenerator.transaction(transaction, successMessage, result);
}

function getAll(dbValue, storeName) {
  const transaction = dbValue.transaction([storeName]);
  const result = [];
  const successMessage = `get ${storeName}'s all data success`;

  getAllRequest(transaction, storeName).onsuccess = ({ target }) => {
    const cursor = target.result;

    if (cursor) {
      result.push(cursor.value);
      cursor.continue();
    }
  };

  return promiseGenerator.transaction(transaction, successMessage, result);
}

function add(dbValue, newData, storeName) {
  const transaction = dbValue.transaction([storeName], 'readwrite');
  const addRequest = transaction.objectStore(storeName).add(newData);
  const successMessage = `add ${storeName}'s ${addRequest.source.keyPath}  = ${newData[addRequest.source.keyPath]} data succeed`;

  return promiseGenerator.request(addRequest, successMessage, newData);
}

function remove(dbValue, key, storeName) {
  const transaction = dbValue.transaction([storeName], 'readwrite');
  const deleteRequest = transaction.objectStore(storeName).delete(key);
  const successMessage = `remove ${storeName}'s  ${deleteRequest.source.keyPath} = ${key} data success`;

  return promiseGenerator.request(deleteRequest, successMessage, key);
}

function removeWhetherCondition(dbValue, condition, whether, storeName) {
  const transaction = dbValue.transaction([storeName], 'readwrite');
  const successMessage = `remove ${storeName}'s ${condition} = ${whether} data success`;

  getAllRequest(transaction, storeName).onsuccess = ({ target }) => {
    const cursor = target.result;

    if (cursor) {
      if (cursor.value[condition] === whether) {
        cursor.delete();
      }
      cursor.continue();
    }
  };

  return promiseGenerator.transaction(transaction, successMessage);
}

function clear(dbValue, storeName) {
  const transaction = dbValue.transaction([storeName], 'readwrite');
  const successMessage = `clear ${storeName}'s all data success`;

  getAllRequest(transaction, storeName).onsuccess = ({ target }) => {
    const cursor = target.result;

    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };

  return promiseGenerator.transaction(transaction, successMessage);
}

// update one
function update(dbValue, newData, storeName) {
  const transaction = dbValue.transaction([storeName], 'readwrite');
  const putRequest = transaction.objectStore(storeName).put(newData);
  const successMessage = `update ${storeName}'s ${putRequest.source.keyPath}  = ${newData[putRequest.source.keyPath]} data success`;

  return promiseGenerator.request(putRequest, successMessage, newData);
}

export default {
  get,
  getWhetherCondition,
  getAll,
  add,
  remove,
  removeWhetherCondition,
  clear,
  update,
};
