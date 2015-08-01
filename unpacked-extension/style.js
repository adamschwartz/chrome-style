(function(window, document, undefined) {
  var TAB_KEY_CODE = 9;
  var M_KEY_CODE = 77;

  var SOFT_TAB = '    ';
  var SOFT_TAB_LENGTH = SOFT_TAB.length;

  var ONLY_WHITESPACE_REGEX = /^\s*$/;
  var WHITESPACE_SPLIT_REGEX = /\s+$/g;

  function throttle(fn, timeout) {
    return function throttledFn() {
      if (!throttledFn.timer) {
        var args = arguments;
        var that = this;

        throttledFn.timer = setTimeout(function() {
          fn.apply(that, args);

          throttledFn.timer = undefined;
        }, timeout);
      }
    };
  }

  function storageKey() {
    return location.hostname;
  }

  String.prototype.trim = function() {
    return this.replace(/(^\s+|\s+$)/g, '');
  };

  window.addEventListener('DOMContentLoaded', function(event) {
    var head = document.getElementsByTagName('head')[0];
    var body = document.body;

    var style = document.createElement('style');
    var textarea = document.createElement('textarea');

    textarea.style.display = 'none';
    textarea.id = 'style-chrome-extension-textarea';
    textarea.spellcheck = false;

    head.appendChild(style);
    body.appendChild(textarea);

    chrome.storage.sync.get(storageKey(), function(obj){
      if (!obj || !obj[storageKey()]) {
        return;
      }

      style.innerHTML = obj[storageKey()] || '';
      textarea.value = style.innerHTML;
    });

    var saveStyles = throttle(function() {
      var obj = {};
      obj[storageKey()] = style.innerHTML;

      chrome.storage.sync.set(obj, function() {
        textarea.setAttribute('syncing', false);
      });
    }, 500);

    function updateAndSaveStyles() {
      style.innerHTML = textarea.value;
      textarea.setAttribute('syncing', true);
      saveStyles();
    }

    textarea.addEventListener('keyup', updateAndSaveStyles);
    textarea.addEventListener('change', updateAndSaveStyles);

    textarea.addEventListener('keydown', function(event){
      var keyCode = event.keyCode;

      if (keyCode === 9) {
        event.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;

        spaces = '  ';
        this.value = this.value.substring(0, start) + spaces + this.value.substring(end);

        this.selectionStart = this.selectionEnd = start + spaces.length;
      }
    });

    window.addEventListener('keydown', function(event) {
      if (event.ctrlKey && event.keyCode === M_KEY_CODE) {
        if (textarea.style.display == 'none') {
          textarea.style.display = 'block';
          textarea.focus();
        } else {
          textarea.style.display = 'none';
        }
      }
    });
  });
})(this, this.document);
