'use strict';
// use module pattern
var handleIndexedDB = (function handleIndexedDB() {

  // 3 private property
  var _dbResult;
  var _key;
  var _storeName;

  // init indexedDB
  function init(dbConfig, callback) {
    // firstly inspect browser's support for indexedDB
    if (!window.indexedDB) {
      window.alert('Your browser doesn\'t support a stable version of IndexedDB. Such and such feature will not be available.');
      return 0;
    }
    if (callback) {
      _openDB(dbConfig, callback);  // while it's ok, oepn it
    }

    return 0;
  }


  /* 3 private methods */

  function _openDB(dbConfig, callback) {
    var request = indexedDB.open(dbConfig.name, dbConfig.version); // open indexedDB

    _storeName = dbConfig.storeName;
    request.onerror = function error() {
      console.log('Pity, fail to load indexedDB');
    };
    request.onsuccess = function success(e) {
      _dbResult = e.target.result;
      getPresentKey(callback);
    };
    // When you create a new database or increase the version number of an existing database 
    // (by specifying a higher version number than you did previously, when Opening a database
    request.onupgradeneeded = function schemaChanged(e) {
      _dbResult = e.target.result;
      if (!_dbResult.objectStoreNames.contains(_storeName)) {
        // set dbConfig.key as keyPath
        var store = _dbResult.createObjectStore(_storeName, { keyPath: dbConfig.key, autoIncrement: true }); // 创建db
      }
      // add a new db demo
      store.add(dbConfig.dataDemo);
    };
  }

  function _handleTransaction(whetherWrite) {
    var transaction;

    if (whetherWrite) {
      transaction = _dbResult.transaction([_storeName], 'readwrite');
    } else {
      transaction = _dbResult.transaction([_storeName]);
    }

    return transaction.objectStore(_storeName);
  }

  function _rangeToAll() {
    return IDBKeyRange.lowerBound(0, true);
  }

  // set present key value to _key (the private property) 
  function getPresentKey(callback) {
    var storeHander = _handleTransaction(true);
    var range = IDBKeyRange.lowerBound(0);

    storeHander.openCursor(range, 'next').onsuccess = function getTheKey(e) {
      var cursor = e.target.result;

      if (cursor) {
        cursor.continue();
        _key = cursor.value.id;
      } else {
        console.log('now key is:' +  _key);
        callback();
      }
    };
  }


  /* CRUD */

  // Create 
  function add(newData, callback, callbackParaArr) {
    var storeHander = _handleTransaction(true);
    var addOpt = storeHander.add(newData);
    addOpt.onerror = function error() {
      console.log('Pity, failed to add one data to indexedDB');
    };
    addOpt.onsuccess = function success() {
      console.log('Bravo, success to add one data to indexedDB');
      if (callback) { // if has callback been input, execute it 
        if (!callbackParaArr) {
          callback();
        } else {
          callback.apply(null, callbackParaArr); // it has callback's parameters been input, get it
        }
      }
    };
  }

  // Retrieve

  // retrieve one data
  function get(key, callback, callbackParaArr) {
    var storeHander = _handleTransaction(false);
    var getDataKey = storeHander.get(key);  // get it by index

    getDataKey.onerror = function getDataKeyError() {
      console.log('Pity, get (key:' + key + '\'s) data' + ' faild');
    };
    getDataKey.onsuccess = function getDataKeySuccess() {
      console.log('Great, get (key:' + key + '\'s) data succeed');
      if (!callbackParaArr) {
        callback(getDataKey.result);
      } else {
        callbackParaArr.unshift(getDataKey.result);
        callback.apply(null, callbackParaArr);
      }
    };
  }

  // retrieve eligible data (boolean condition)
  function getWhether(whether, condition, callback, callbackParaArr) {
    var dataArr = []; // use an array to storage eligible data
    var storeHander = _handleTransaction(true);
    var range = _rangeToAll();

    storeHander.openCursor(range, 'next').onsuccess = function showWhetherDoneData(e) {
      var cursor = e.target.result;

      if (cursor) {
        if (whether) {
          if (cursor.value[condition]) {
            dataArr.push(cursor.value);
          }
        } else if (!whether) {
          if (!cursor.value[condition]) {
            dataArr.push(cursor.value);
          }
        }
        cursor.continue();
      } else if (callback) {
        if (!callbackParaArr) {
          callback(dataArr);  // put the eligible array to callback as parameter
        } else {
          callbackParaArr.unshift(dataArr);
          callback.apply(null, callbackParaArr);
        }
      }
    };
  }

  // retrieve all
  function getAll(callback, callbackParaArr) {
    var storeHander = _handleTransaction(true);
    var range = _rangeToAll();
    var allDataArr = [];

    storeHander.openCursor(range, 'next').onsuccess = function getAllData(e) {
      var cursor = e.target.result;

      if (cursor) {
        allDataArr.push(cursor.value);
        cursor.continue();
      } else if (callback) {
        if (!callbackParaArr) {
          callback(allDataArr);
        } else {
          callbackParaArr.unshift(allDataArr);
          callback.apply(null, callbackParaArr);
        }
      }
    };
  }

  // Update one
  function update(changedData, callback, callbackParaArr) {
    var storeHander = _handleTransaction(true);
    var putStore = storeHander.put(changedData);

    putStore.onerror = function putStoreError() {
      console.log('Pity, modify failed');
    };
    putStore.onsuccess = function putStoreSuccess() {
      console.log('Aha, modify succeed');
      if (callback) {
        if (!callbackParaArr) {
          callback();
        } else {
          callback.apply(null, callbackParaArr);
        }
      }
    };
  }

  // Delete 

  // delete one
  function deleteOne(key, callback, callbackParaArr) {
    var storeHander = _handleTransaction(true);
    var deleteOpt = storeHander.delete(key); // 将当前选中li的数据从数据库中删除

    deleteOpt.onerror = function error() {
      console.log('delete (key:' + key + '\'s) value faild');
    };
    deleteOpt.onsuccess = function success() {
      console.log('delete (key: ' + key +  '\'s) value succeed');
      if (callback) {
        if (!callbackParaArr) {
          callback();
        } else {
          callback.apply(callbackParaArr);
        }
      }
    };
  }

  // delete all
  function deleteAll(callback, callbackParaArr) {
    var storeHander = _handleTransaction(true);
    var range = _rangeToAll();

    storeHander.openCursor(range, 'next').onsuccess = function deleteData(e) {
      var cursor = e.target.result;
      var requestDel;

      if (cursor) {
        requestDel = cursor.delete();
        requestDel.onsuccess = function success() {
          console.log('Great, delete all data succeed');
        };
        requestDel.onerror = function error() {
          console.log('Pity, delete all data faild');
        };
        cursor.continue();
      } else if (callback) {
        if (!callbackParaArr) {
          callback();
        } else {
          callback.apply(null, this);
        }
      }
    };
  }

  // get present id
  // use closure to keep _key
  function getKey() {
    _key++;
    return _key;
  }

  /* public interface */
  return {
    init: init,
    getKey: getKey,
    add: add,
    get: get,
    getWhether: getWhether,
    getAll: getAll,
    update: update,
    delete: deleteOne,
    deleteAll: deleteAll
  };
}());

module.exports = handleIndexedDB;
