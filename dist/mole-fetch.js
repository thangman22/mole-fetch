'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MoleFetch = function () {
  function MoleFetch() {
    _classCallCheck(this, MoleFetch);

    this.prefix = 'bgfetch-';
    this.debug = true;
  }

  // For Client


  _createClass(MoleFetch, [{
    key: 'onResponse',
    value: function onResponse(taskName) {
      return new Promise(function (resolve, reject) {
        navigator.serviceWorker.addEventListener('message', function (event) {
          var messageData = JSON.parse(event.data);

          if (messageData.taskName === taskName) {
            resolve(messageData.result);
          }
        });
      });
    }
  }, {
    key: 'sendRequest',
    value: function sendRequest(taskName, url, data, method) {
      var _this = this;

      return navigator.serviceWorker.ready.then(function (registration) {
        _this.logDebug('ServiceWorker is Ready');
        var requestData = {
          url: url,
          method: method,
          body: data
        };
        _this.logDebug('Save request to LocalForage [' + _this.prefix + taskName + ']');

        localforage.setItem(_this.prefix + taskName, JSON.stringify(requestData)).then(function () {
          _this.logDebug('Register sync [' + _this.prefix + taskName + ']');
          _this.registerSync(taskName);
        });
      });
    }
  }, {
    key: 'registerSync',
    value: function registerSync(taskName) {
      var _this2 = this;

      return navigator.serviceWorker.ready.then(function (registration) {
        registration.sync.register(_this2.prefix + taskName).then(function () {
          _this2.updateTaskStatus(taskName, 'requested');
        });
      });
    }
  }, {
    key: 'getCacheResponse',
    value: function getCacheResponse(taskName, expireTime) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {

        if (!localforage) {
          reject('localForage is required.');
        }

        var keyName = _this3.prefix + taskName + '-result';
        localforage.getItem(keyName).then(function (value) {
          if (value) {
            localforage.removeItem(keyName);
            _this3.updateTaskStatus(taskName, 'completed');
            if (value.time <= expireTime || !expireTime) {
              _this3.logDebug('Found cache for [' + taskName + ']');
              resolve(value.result);
            } else {
              _this3.logDebug('Found cache but Expired [' + taskName + ']');
              resolve(false);
            }
          } else {
            _this3.logDebug('Not found cache [' + taskName + ']');
            resolve(false);
          }
        });
      });
    }
  }, {
    key: 'initBackgroudfetch',
    value: function initBackgroudfetch(event) {
      var _this4 = this;

      if (event.tag.indexOf(this.prefix) !== -1) {
        this.logDebug('Found bgfetch request [' + event.tag + ']');
        localforage.getItem(event.tag).then(function (value) {

          var fetchData = _this4.makeFetchConfig(value);
          _this4.logDebug('Begin fetch request [' + event.tag + ']');

          var taskName = event.tag.replace(_this4.prefix, '');
          _this4.updateTaskStatus(taskName, 'fetching');
          _this4.makeFetch(fetchData, event.tag, taskName);
        });
      }
    }
  }, {
    key: 'makeFetch',
    value: function makeFetch(fetchData, tag, taskName) {
      var _this5 = this;

      return fetch(fetchData.url, fetchData.config).then(function (response) {
        return response.text();
      }).then(function (response) {
        _this5.logDebug('Fetch is Completed [' + tag + ']');
        localforage.removeItem(tag);
        var reponseWithoutBr = response.replace(/(\r\n|\n|\r)/gm, '');
        _this5.logDebug('Publish data to client [' + tag + ']');

        _this5.publishResult(taskName, reponseWithoutBr);
      });
    }
  }, {
    key: 'makeFetchConfig',
    value: function makeFetchConfig(value) {
      var fetchData = JSON.parse(value);
      if (fetchData) {
        var url = fetchData.url;
        fetchData.mode = 'cors';
        fetchData.cache = 'default';
        return {
          url: url,
          config: fetchData
        };
      }
    }
  }, {
    key: 'publishResult',
    value: function publishResult(taskName, result, forceOffline) {
      var _this6 = this;

      this.logDebug('List client [' + this.prefix + taskName + ']');
      self.clients.matchAll({
        includeUncontrolled: true
      }).then(function (clientList) {
        if (clientList.length == 0 || forceOffline === true) {
          _this6.updateTaskStatus(taskName, 'cached');
          _this6.saveResultWhenOffline(taskName, result);
        } else {
          _this6.updateTaskStatus(taskName, 'completed');
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = clientList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var client = _step.value;

              _this6.postResult(taskName, result, client);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
      });
    }
  }, {
    key: 'saveResultWhenOffline',
    value: function saveResultWhenOffline(taskName, result) {
      var _this7 = this;

      return new Promise(function (resolve, reject) {
        _this7.logDebug('client is offline save to LocalForage [' + _this7.prefix + taskName + ']');
        localforage.setItem(_this7.prefix + taskName + '-result', {
          'result': result,
          'time': new Date().getTime() / 1000
        }).then(function () {
          resolve({
            status: 'success'
          });
        });
      });
    }
  }, {
    key: 'postResult',
    value: function postResult(taskName, result, client) {
      this.logDebug('Push to client ' + client.id + ' [' + this.prefix + taskName + ']');
      var responseMessage = {
        'result': result,
        'taskName': taskName
      };
      client.postMessage(JSON.stringify(responseMessage));
    }
  }, {
    key: 'updateTaskStatus',
    value: function updateTaskStatus(taskName, status) {
      var _this8 = this;

      return new Promise(function (resolve, reject) {
        if (status !== 'completed') {
          localforage.setItem(_this8.prefix + taskName + '-status', status);
          resolve({
            status: 'success'
          });
        } else {
          localforage.removeItem(_this8.prefix + taskName + '-status');
          resolve({
            status: 'success'
          });
        }
      });
    }
  }, {
    key: 'getTaskStatus',
    value: function getTaskStatus(taskName) {
      var _this9 = this;

      return new Promise(function (resolve, reject) {
        localforage.getItem(_this9.prefix + taskName + '-status').then(function (value) {
          resolve(value);
        });
      });
    }
  }, {
    key: 'logDebug',
    value: function logDebug(text) {
      if (this.debug === true) {
        console.log(text);
      }
    }
  }]);

  return MoleFetch;
}();