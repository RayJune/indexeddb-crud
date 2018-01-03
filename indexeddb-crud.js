'use strict';
var IndexedDBHandler = function IndexedDBHandler(config, openSuccessCallback, openFailCallback) {
  var _that;

  /* init indexedDB */
  // firstly inspect browser's support for indexedDB
  if (!window.indexedDB) {
    window.alert('Your browser doesn\'t support a stable version of IndexedDB. We will offer you the without indexedDB mode');
    if (openFailCallback) {
      openFailCallback(); // PUNCHLINE: offer without-DB handler
    }
    return 0;
  }
  _that = this;
  /* private propeties */
  _that._db;
  _that._presentKey = 0;
  _that._key = config.key;
  _that._storeName = config.storeName;
  _openHandler();

  function _openHandler() {
    var openRequest = window.indexedDB.open(config.name, config.version); // open indexedDB

    // an onblocked event is fired until they are closed or reloaded
    openRequest.onblocked = function blockedSchemeUp() {
    // If some other tab is loaded with the database, then it needs to be closed before we can proceed.
      window.alert('Please close all other tabs with this site open');
    };

    // Creating or updating the version of the database
    openRequest.onupgradeneeded = function schemaUp(e) {
    // All other databases have been closed. Set everything up.
      _that._db = e.target.result;
      console.log('onupgradeneeded in');
      if (!(_that._db.objectStoreNames.contains(_that._storeName))) {
        _createStoreHandler();
      }
    };

    openRequest.onsuccess = function openSuccess(e) {
      _that._db = e.target.result;
      console.log('\u2713 open storeName = ' + _that._storeName + ' indexedDB objectStore success');
      _getPresentKey();
    };

    openRequest.onerror = function openError(e) {
    // window.alert('Pity, fail to load indexedDB. We will offer you the without indexedDB mode');
      window.alert('Something is wrong with indexedDB, for more information, checkout console');
      console.log(e.target.error);
    };
  }

  // set present key value to _that._presentKey (the private property)
  function _getPresentKey() {
    _getAllRequest().onsuccess = function getAllSuccess(e) {
      var cursor = e.target.result;

      if (cursor) {
        _that._presentKey = cursor.value.id;
        cursor.continue();
      } else {
        console.log('\u2713 now objectSotre = ' + _that._storeName + ' \'s key = ' +  _that._presentKey); // initial value is 0
        if (openSuccessCallback) {
          openSuccessCallback();
          console.log('\u2713 openSuccessCallback finished');
        }
      }
    };
  }

  function _createStoreHandler() {
    var objectStore = _that._db.createObjectStore(_that._storeName, { keyPath: _that._key, autoIncrement: true });

    // Use transaction oncomplete to make sure the objectStore creation is
    objectStore.transaction.oncomplete = function addinitialData() {
      var addRequest;

      console.log('create ' + _that._storeName + '\'s objectStore succeed');
      if (config.initialData) {
        addRequest = function addRequestGenerator(data) {
          _transactionGenerator().add(data);
        };
        // Store initial values in the newly created objectStore.
        try {
          JSON.parse(JSON.stringify(config.initialData)).forEach(function addEveryInitialData(data, index) {
            addRequest(data).success = function addInitialSuccess() {
              console.log('add initial data[' + index + '] successed');
            };
          });
        } catch (error) {
          window.alert('please set correct initial array object data :)');
          console.log(error);
          throw error;
        }
      }
    };
  }

  function _transactionGenerator() {
    return _that._db.transaction([_that._storeName], 'readwrite').objectStore(_that._storeName);
  }

  function _getAllRequest() {
    return _transactionGenerator().openCursor(IDBKeyRange.lowerBound(1), 'next');
  }
};

IndexedDBHandler.prototype = (function prototypeGenerator() {
  function _whetherWriteTransaction(whetherWrite) {
    var transaction;
    console.dir(this);
    if (whetherWrite) {
      transaction = this._db.transaction([this._storeName], 'readwrite');
    } else {
      transaction = this._db.transaction([this._storeName]);
    }

    return transaction.objectStore(this._storeName);
  }

  function _getAllRequest() {
    return _whetherWriteTransaction(true).openCursor(IDBKeyRange.lowerBound(1), 'next');
  }

  function getLength() {
    return this._presentKey;
  }

  function getNewKey() {
    this._presentKey += 1;

    return this._presentKey;
  }

  /* CRUD */

  function addItem(newData, successCallback) {
    var addRequest = _whetherWriteTransaction(true).add(newData);

    addRequest.onsuccess = function addSuccess() {
      console.log('\u2713 add ' + this._key + ' = ' + newData[this._key] + ' data succeed :)');
      if (successCallback) {
        successCallback(newData);
      }
    };
  }

  function getItem(key, successCallback) {
    var getRequest = _whetherWriteTransaction(false).get(parseInt(key, 10));  // get it by index

    getRequest.onsuccess = function getSuccess() {
      console.log('\u2713 get '  + this._key + ' = ' + key + ' data success :)');
      if (successCallback) {
        successCallback(getRequest.result);
      }
    };
  }

  // get conditional data (boolean condition)
  function getConditionItem(condition, whether, successCallback) {
    var result = []; // use an array to storage eligible data

    _getAllRequest().onsuccess = function getAllSuccess(e) {
      var cursor = e.target.result;

      if (cursor) {
        if (whether) {
          if (cursor.value[condition]) {
            result.push(cursor.value);
          }
        } else if (!whether) {
          if (!cursor.value[condition]) {
            result.push(cursor.value);
          }
        }
        cursor.continue();
      } else if (successCallback) {
        successCallback(result);
      }
    };
  }

  function getAll(successCallback) {
    var result = [];

    _getAllRequest().onsuccess = function getAllSuccess(e) {
      var cursor = e.target.result;

      if (cursor) {
        result.push(cursor.value);
        cursor.continue();
      } else {
        console.log('\u2713 get all data success :)');
        if (successCallback) {
          successCallback(result);
        }
      }
    };
  }

  function removeItem(key, successCallback) {
    var deleteRequest = _whetherWriteTransaction(true).delete(key);

    deleteRequest.onsuccess = function deleteSuccess() {
      console.log('\u2713 remove ' + this._key + ' = ' + key + ' data success :)');
      if (successCallback) {
        successCallback(key);
      }
    };
  }

  function removeConditionItem(condition, whether, successCallback) {
    _getAllRequest().onsuccess = function getAllSuccess(e) {
      var cursor = e.target.result;

      if (cursor) {
        if (whether) {
          if (cursor.value[condition]) {
            cursor.delete();
          }
        } else if (!whether) {
          if (!cursor.value[condition]) {
            cursor.delete();
          }
        }
        cursor.continue();
      } else if (successCallback) {
        successCallback();
      }
    };
  }

  function clear(successCallback) {
    _getAllRequest().onsuccess = function getAllSuccess(e) {
      var cursor = e.target.result;

      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        console.log('\u2713 clear all data success :)');
        if (successCallback) {
          successCallback('clear all data success');
        }
      }
    };
  }

  // update one
  function updateItem(newData, successCallback) {
    var putRequest = _whetherWriteTransaction(true).put(newData);

    putRequest.onsuccess = function putSuccess() {
      console.log('\u2713 update ' + this._key + ' = ' + newData[this._key] + ' data success :)');
      if (successCallback) {
        successCallback(newData);
      }
    };
  }

  return {
    constructor: IndexedDBHandler,
    /* public interface */
    getLength: getLength,
    getNewKey: getNewKey,
    getItem: getItem,
    getConditionItem: getConditionItem,
    getAll: getAll,
    addItem: addItem,
    removeItem: removeItem,
    removeConditionItem: removeConditionItem,
    clear: clear,
    updateItem: updateItem
  };
}());


module.exports = IndexedDBHandler;

