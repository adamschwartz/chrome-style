(function(window, document, undefined) {
  var hidePage = function() {
    document.documentElement.style.opacity = 0;
  };
  hidePage();

  var showPage = function() {
    document.documentElement.style.opacity = 1;
  };

  var throttle = function(fn, timeout) {
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
  };

  var storageKey = function() {
    return location.hostname;
  };

  var ranSetupDOM = false;
  var setupDOM = function() {
    if (ranSetupDOM || !document) {
      return
    }

    var head = document.getElementsByTagName('head')[0];
    var body = document.body;

    if (!head || !body) {
      return;
    }

    ranSetupDOM = true;

    var style = document.createElement('style');
    var textarea = document.createElement('textarea');

    textarea.id = 'style-chrome-extension-textarea';
    textarea.style.display = 'none';
    textarea.spellcheck = false;

    head.appendChild(style);
    body.appendChild(textarea);

    chrome.storage.sync.get(storageKey(), function(obj){
      if (!obj || !obj[storageKey()]) {
        showPage();
        return;
      }

      style.innerHTML = obj[storageKey()] || '';
      textarea.value = style.innerHTML;
      requestAnimationFrame(showPage);
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
      var spaces = '  ';
      var tabKeyCode = 9;

      if (event.keyCode === tabKeyCode) {
        event.preventDefault();

        var start = this.selectionStart;
        var end = this.selectionEnd;

        this.value = this.value.substring(0, start) + spaces + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + spaces.length;
      }
    });

    window.addEventListener('keydown', function(event) {
      var emKeyCode = 77;
      if (event.ctrlKey && event.keyCode === emKeyCode) {
        if (textarea.style.display == 'none') {
          textarea.style.display = 'block';
          textarea.focus();
        } else {
          textarea.style.display = 'none';
        }
      }
    });
  };

  document.addEventListener('DOMNodeInserted', setupDOM);
  document.addEventListener("DOMContentLoaded", setupDOM);

})(this, this.document);
