import log from './utlis/log';
import crud from './utlis/crud';
import getAllRequest from './utlis/getAllRequest';
import parseJSONData from './utlis/parseJSONData';

const IndexedDBHandler = (() => {
  let _db;
  let _defaultStoreName;
  const _presentKey = {}; // store multi-objectStore's presentKey

  function open(config) {
    return new Promise((resolve, reject) => {

      if (window.indexedDB){
        _openHandler(config, resolve);
      } else {
        log.fail('Your browser doesn\'t support a stable version of IndexedDB. You can install latest Chrome or FireFox to handler it')
        reject(error);
      }
    });
  }

  function _openHandler(config, successCallback) {
    const openRequest = window.indexedDB.open(config.name, config.version); // open indexedDB

    // an onblocked event is fired until they are closed or reloaded
    openRequest.onblocked = () => {
      // If some other tab is loaded with the database, then it needs to be closed before we can proceed.
      window.alert('Please close all other tabs with this site open');
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
        window.alert('A new version of this page is ready. Please reload');
      };
      _openSuccessCallbackHandler(config.storeConfig, successCallback);
    };

    // use error events bubble to handle all error events
    openRequest.onerror = ({ target }) => {
      window.alert('Something is wrong with indexedDB, for more information, checkout console');
      console.log(target.error);
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

    _presentKey[storeName] = 0;
    getAllRequest(transaction, storeName).onsuccess = ({ target }) => {
      const cursor = target.result;

      if (cursor) {
        _presentKey[storeName] = cursor.value.id;
        cursor.continue();
      }
    };
    transaction.oncomplete = () => {
      log.success(`now ${storeName} 's max key is ${_presentKey[storeName]}`); // initial value is 0
      if (successCallback) {
        successCallback();
        log.success('openSuccessCallback finished');
      }
    };
  }

  function _createObjectStoreHandler(configStoreConfig) {
    parseJSONData(configStoreConfig, 'storeName').forEach((storeConfig) => {
      if (!(_db.objectStoreNames.contains(storeConfig.storeName))) {
        _createObjectStore(storeConfig);
      }
    });
  }

  function _createObjectStore(storeConfig) {
    const store = _db.createObjectStore(storeConfig.storeName, { keyPath: storeConfig.key, autoIncrement: true });

    // Use transaction oncomplete to make sure the object Store creation is finished
    store.transaction.oncomplete = () => {
      log.success(`create ${storeConfig.storeName} 's object store succeed`);
      if (storeConfig.initialData) {
        // Store initial values in the newly created object store.
        _initialDataHandler(storeConfig.storeName, storeConfig.initialData);
      }
    };
  }

  function _initialDataHandler(storeName, initialData) {
    const transaction = _db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);

    parseJSONData(initialData, 'initial').forEach((data, index) => {
      const addRequest = objectStore.add(data);

      addRequest.onsuccess = () => {
        log.success(`add initial data[${index}] successed`);
      };
    });
    transaction.oncomplete = () => {
      log.success(`add all ${storeName} 's initial data done`);
      _getPresentKey(storeName);
    };
  }

  function getLength(storeName = _defaultStoreName) {
    return _presentKey[storeName];
  }

  function getNewKey(storeName = _defaultStoreName) {
    _presentKey[storeName] += 1;

    return _presentKey[storeName];
  }

  /* crud methods */

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

  return {
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
})();

export default IndexedDBHandler;
