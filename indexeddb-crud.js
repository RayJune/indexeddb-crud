'use strict';
var IndexedDBHandler = function IndexedDBHandler(config, openSuccessCallback, openFailCallback) {
  var that;

  /* init indexedDB */
  // firstly inspect browser's support for indexedDB
  if (!window.indexedDB) {
    if (openFailCallback) {
      openFailCallback(); // PUNCHLINE: offer without-DB handler
    } else {
      window.alert('Your browser doesn\'t support a stable version of IndexedDB. You can install latest Chrome or FireFox to handler it');
    }
    return 0;
  }
  that = this;

  /* private propeties */
  that._db;
  that._presentKey = 0;
  that._storeName = config.storeName;

  _openHandler();

  function _openHandler() {
    var openRequest = window.indexedDB.open(config.name, config.version); // open indexedDB

    // an onblocked event is fired until they are closed or reloaded
    openRequest.onblocked = function blockedSchemeUp() {
      // If some other tab is loaded with the database, then it needs to be closed before we can proceed.
      // window.alert('Please close all other tabs with this site open');
    };

    // Creating or updating the version of the database
    openRequest.onupgradeneeded = function schemaUp(e) {
      // All other databases have been closed. Set everything up.
      that._db = e.target.result;
      console.log('onupgradeneeded in');
      if (!(that._db.objectStoreNames.contains(that._storeName))) {
        _createStoreHandler();
      }
    };

    openRequest.onsuccess = function openSuccess(e) {
      that._db = e.target.result;
      console.log('\u2713 open ' + that._storeName + '\'s object store success');
      _getPresentKey();
    };

    // use error events bubble to handle all error events
    openRequest.onerror = function openError(e) {
      window.alert('Something is wrong with indexedDB, for more information, checkout console');
      console.log(e.target.error);
      throw new Error(e.target.error);
    };
  }

  function _createStoreHandler() {
    var objectStore = that._db.createObjectStore(that._storeName, { keyPath: config.key, autoIncrement: true });

    // Use transaction oncomplete to make sure the object Store creation is
    objectStore.transaction.oncomplete = function addinitialData() {
      console.log('create ' + that._storeName + '\'s object store succeed');
      if (config.initialData) {
        // Store initial values in the newly created object store.
        try {
          _initialDataHandler();
        } catch (error) {
          window.alert('please set correct initial array object data :)');
          console.log(error);
          throw error;
        }
      }
    };
  }

  function _initialDataHandler() {
    var initialData = JSON.parse(JSON.stringify(config.initialData));
    var transaction = that._db.transaction([that._storeName], 'readwrite');
    var objectStore = transaction.objectStore(that._storeName);

    initialData.forEach(function addEveryInitialData(data, index) {
      var addRequest = objectStore.add(data);

      addRequest.onsuccess = function addInitialSuccess() {
        console.log('add initial data[' + index + '] successed');
        if (index === (initialData.length - 1)) {
          console.log('\u2713 add all initial done :)');
        }
      };
    });
  }

  // set present key value to that._presentKey (the private property)
  function _getPresentKey() {
    _getAllRequest().onsuccess = function getAllSuccess(e) {
      var cursor = e.target.result;

      if (cursor) {
        that._presentKey = cursor.value.id;
        cursor.continue();
      } else {
        console.log('\u2713 now ' + that._storeName + '\'s max key is ' +  that._presentKey); // initial value is 0
        if (openSuccessCallback) {
          openSuccessCallback();
          console.log('\u2713 ' + that._storeName + '\'s openSuccessCallback: ' + openSuccessCallback.name + ' finished');
        }
      }
    };
  }

  function _transactionGenerator() {
    return that._db.transaction([that._storeName], 'readwrite').objectStore(that._storeName);
  }

  function _getAllRequest() {
    return _transactionGenerator().openCursor(IDBKeyRange.lowerBound(1), 'next');
  }
};

IndexedDBHandler.prototype = (function prototypeGenerator() {
  function getLength() {
    return this._presentKey;
  }

  function getNewKey() {
    this._presentKey += 1;

    return this._presentKey;
  }

  /* CRUD */

  function addItem(newData, successCallback) {
    var that = this;
    var addRequest = _objectStoeHandler(that._db, that._storeName, true).add(newData);

    addRequest.onsuccess = function addSuccess() {
      console.log('\u2713 add ' + addRequest.source.keyPath + ' = ' + newData[addRequest.source.keyPath] + ' data succeed :)');
      if (successCallback) {
        successCallback(newData);
      }
    };
  }

  function getItem(key, successCallback) {
    var that = this;
    var getRequest = _objectStoeHandler(that._db, that._storeName, false).get(parseInt(key, 10));  // get it by index

    getRequest.onsuccess = function getSuccess() {
      console.log('\u2713 get '  + getRequest.source.keyPath + ' = ' + key + ' data success :)');
      if (successCallback) {
        successCallback(getRequest.result);
      }
    };
  }

  // get conditional data (boolean condition)
  function getConditionItem(condition, whether, successCallback) {
    var that = this;
    var result = []; // use an array to storage eligible data

    _getAllRequest(that._db, that._storeName).onsuccess = function getAllSuccess(e) {
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
    var that = this;
    var result = [];

    _getAllRequest(that._db, that._storeName).onsuccess = function getAllSuccess(e) {
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
    var that = this;
    var deleteRequest = _objectStoeHandler(that._db, that._storeName, true).delete(key);

    deleteRequest.onsuccess = function deleteSuccess() {
      console.log('\u2713 remove ' + deleteRequest.source.keyPath + ' = ' + key + ' data success :)');
      if (successCallback) {
        successCallback(key);
      }
    };
  }

  function removeConditionItem(condition, whether, successCallback) {
    var that = this;

    _getAllRequest(that._db, that._storeName).onsuccess = function getAllSuccess(e) {
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
    var that = this;

    _getAllRequest(that._db, that._storeName).onsuccess = function getAllSuccess(e) {
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
    var that = this;
    var putRequest = _objectStoeHandler(that._db, that._storeName, true).put(newData);

    putRequest.onsuccess = function putSuccess() {
      console.log('\u2713 update ' + putRequest.source.keyPath + ' = ' + newData[putRequest.source.keyPath] + ' data success :)');
      if (successCallback) {
        successCallback(newData);
      }
    };
  }

  /* private methods */
  function _objectStoeHandler(db, storeName, whetherWrite) {
    var transaction;

    if (whetherWrite) {
      transaction = db.transaction([storeName], 'readwrite');
    } else {
      transaction = db.transaction([storeName]);
    }

    return transaction.objectStore(storeName);
  }

  function _getAllRequest(db, storeName) {
    return _objectStoeHandler(db, storeName, true).openCursor(IDBKeyRange.lowerBound(1), 'next');
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
