import log from './utlis/log';

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
    const objectStoreList = _parseJSONData(configStoreConfig, 'storeName');

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
    _getAllRequest(transaction, storeName).onsuccess = ({ target }) => {
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
    _parseJSONData(configStoreConfig, 'storeName').forEach((storeConfig) => {
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

    _parseJSONData(initialData, 'initial').forEach((data, index) => {
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

  function _parseJSONData(rawdata, name) {
    try {
      const parsedData = JSON.parse(JSON.stringify(rawdata));

      return parsedData;
    } catch (error) {
      window.alert(`please set correct ${name} array object`);
      console.log(error);
      throw error;
    }
  }

  function getLength(storeName = _defaultStoreName) {
    return _presentKey[storeName];
  }

  function getNewKey(storeName = _defaultStoreName) {
    _presentKey[storeName] += 1;

    return _presentKey[storeName];
  }

  /* CRUD */

  function addItem(newData, successCallback, storeName = _defaultStoreName) {
    const transaction = _db.transaction([storeName], 'readwrite');
    const addRequest = transaction.objectStore(storeName).add(newData);

    addRequest.onsuccess = () => {
      log.success(`add ${storeName}'s ${addRequest.source.keyPath}  = ${newData[addRequest.source.keyPath]} data succeed`);
      if (successCallback) {
        successCallback(newData);
      }
    };
  }

  function getItem(key, successCallback, storeName = _defaultStoreName) {
    const transaction = _db.transaction([storeName]);
    const getRequest = transaction.objectStore(storeName).get(parseInt(key, 10)); // get it by index

    getRequest.onsuccess = () => {
      log.success(`get ${storeName}'s ${getRequest.source.keyPath} = ${key} data success`);
      if (successCallback) {
        successCallback(getRequest.result);
      }
    };
  }

  // get conditional data (boolean condition)
  function getWhetherConditionItem(condition, whether, successCallback, storeName = _defaultStoreName) {
    const transaction = _db.transaction([storeName]);
    const result = []; // use an array to storage eligible data

    _getAllRequest(transaction, storeName).onsuccess = ({ target }) => {
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

  function getAll(successCallback, storeName = _defaultStoreName) {
    const transaction = _db.transaction([storeName]);
    const result = [];

    _getAllRequest(transaction, storeName).onsuccess = ({ target }) => {
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

  function removeItem(key, successCallback, storeName = _defaultStoreName) {
    const transaction = _db.transaction([storeName], 'readwrite');
    const deleteRequest = transaction.objectStore(storeName).delete(key);

    deleteRequest.onsuccess = () => {
      log.success(`remove ${storeName}'s  ${deleteRequest.source.keyPath} = ${key} data success`);
      if (successCallback) {
        successCallback(key);
      }
    };
  }

  function removeWhetherConditionItem(condition, whether, successCallback, storeName = _defaultStoreName) {
    const transaction = _db.transaction([storeName], 'readwrite');

    _getAllRequest(transaction, storeName).onsuccess = ({ target }) => {
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

  function clear(successCallback, storeName = _defaultStoreName) {
    const transaction = _db.transaction([storeName], 'readwrite');

    _getAllRequest(transaction, storeName).onsuccess = ({ target }) => {
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
  function updateItem(newData, successCallback, storeName = _defaultStoreName) {
    const transaction = _db.transaction([storeName], 'readwrite');
    const putRequest = transaction.objectStore(storeName).put(newData);

    putRequest.onsuccess = () => {
      log.success(`update ${storeName}'s ${putRequest.source.keyPath}  = ${newData[putRequest.source.keyPath]} data success`);
      if (successCallback) {
        successCallback(newData);
      }
    };
  }

  function _getAllRequest(transaction, storeName) {
    return transaction.objectStore(storeName).openCursor(IDBKeyRange.lowerBound(1), 'next');
  }

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
