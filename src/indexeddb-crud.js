import log from './utlis/log';
import crud from './utlis/crud';
import getAllRequest from './utlis/getAllRequest';
import parseJSONData from './utlis/parseJSONData';
import promiseGenerator from './utlis/promiseGenerator';

let _db;
let _defaultStoreName;
const _presentKey = {}; // store multi-objectStore's presentKey

/* first step, open it and use others API */

const open = config =>
  new Promise((resolve, reject) => {
    if (window.indexedDB) {
      _openHandler(config, resolve);
    } else {
      log.fail('Your browser doesn\'t support a stable version of IndexedDB. You can install latest Chrome or FireFox to handler it');
      reject();
    }
  });

/* synchronous API */

const getLength = (storeName = _defaultStoreName) => _presentKey[storeName];

const getNewKey = (storeName = _defaultStoreName) => {
  _presentKey[storeName] += 1;

  return _presentKey[storeName];
};

/* asynchronous API: crud methods */

const getItem = (key, storeName = _defaultStoreName) =>
  crud.get(_db, key, storeName);

const getWhetherConditionItem = (condition, whether, storeName = _defaultStoreName) =>
  crud.getWhetherCondition(_db, condition, whether, storeName);

const getAll = (storeName = _defaultStoreName) =>
  crud.getAll(_db, storeName);

const addItem = (newData, storeName = _defaultStoreName) =>
  crud.add(_db, newData, storeName);

const removeItem = (key, storeName = _defaultStoreName) =>
  crud.remove(_db, key, storeName);

const removeWhetherConditionItem = (condition, whether, storeName = _defaultStoreName) =>
  crud.removeWhetherCondition(_db, condition, whether, storeName);

const clear = (storeName = _defaultStoreName) =>
  crud.clear(_db, storeName);

const updateItem = (newData, storeName = _defaultStoreName) =>
  crud.update(_db, newData, storeName);

function _openHandler(config, successCallback) {
  const openRequest = window.indexedDB.open(config.name, config.version); // open indexedDB

  // an onblocked event is fired until they are closed or reloaded
  openRequest.onblocked = () => {
    // If some other tab is loaded with the database, then it needs to be closed before we can proceed.
    log.fail('Please close all other tabs with this site open');
  };

  // Creating or updating the version of the database
  openRequest.onupgradeneeded = ({ target }) => {
    // All other databases have been closed. Set everything up.
    _db = target.result;
    log.success('onupgradeneeded in');
    _createObjectStoreHandler(config.storeConfig);
  };

  openRequest.onsuccess = ({ target }) => {
    _db = target.result;
    _db.onversionchange = () => {
      _db.close();
      log.fail('A new version of this page is ready. Please reload');
    };
    _openSuccessCallbackHandler(config.storeConfig, successCallback);
  };

  // use error events bubble to handle all error events
  openRequest.onerror = ({ target }) => {
    log.fail('Something is wrong with indexedDB, for more information, checkout console');
    log.fail(target.error);
    throw new Error(target.error);
  };
}

function _openSuccessCallbackHandler(configStoreConfig, successCallback) {
  const objectStoreList = parseJSONData(configStoreConfig, 'storeName');

  objectStoreList.forEach((storeConfig, index) => {
    if (index === 0) {
      _defaultStoreName = storeConfig.storeName; // PUNCHLINE: the last storeName is defaultStoreName
    }
    if (index === (objectStoreList.length - 1)) {
      _getPresentKey(storeConfig.storeName, () => {
        successCallback();
        log.success('open indexedDB success');
      });
    } else {
      _getPresentKey(storeConfig.storeName);
    }
  });
}

// set present key value to _presentKey (the private property)
function _getPresentKey(storeName, successCallback) {
  const transaction = _db.transaction([storeName]);
  const successMessage = `now ${storeName} 's max key is ${_presentKey[storeName]}`; // initial value is 0

  _presentKey[storeName] = 0;
  getAllRequest(transaction, storeName).onsuccess = ({ target }) => {
    const cursor = target.result;

    if (cursor) {
      _presentKey[storeName] = cursor.value.id;
      cursor.continue();
    }
  };
  promiseGenerator.transaction(transaction, successMessage)
    .then(successCallback);
}

function _createObjectStoreHandler(configStoreConfig) {
  parseJSONData(configStoreConfig, 'storeName').forEach((storeConfig) => {
    if (!(_db.objectStoreNames.contains(storeConfig.storeName))) {
      _createObjectStore(storeConfig);
    }
  });
}

function _createObjectStore({ storeName, key, initialData }) {
  const store = _db.createObjectStore(storeName, { keyPath: key, autoIncrement: true });
  const { transaction } = store;
  const successMessage = `create ${storeName} 's object store succeed`;

  promiseGenerator.transaction(transaction, successMessage)
    .then(() => {
      if (initialData) {
        // Store initial values in the newly created object store.
        _initialDataHandler(storeName, initialData);
      }
    });
}

function _initialDataHandler(storeName, initialData) {
  const transaction = _db.transaction([storeName], 'readwrite');
  const objectStore = transaction.objectStore(storeName);
  const successMessage = `add all ${storeName} 's initial data done`;

  parseJSONData(initialData, 'initial').forEach((data, index) => {
    const addRequest = objectStore.add(data);

    addRequest.onsuccess = () => {
      log.success(`add initial data[${index}] successed`);
    };
  });
  promiseGenerator.transaction(transaction, successMessage)
    .then(() => { _getPresentKey(storeName); });
}

export default {
  open,
  getLength,
  getNewKey,
  getItem,
  getWhetherConditionItem,
  getAll,
  addItem,
  removeItem,
  removeWhetherConditionItem,
  clear,
  updateItem,
};
