(function() {
  "use strict";

  var Maybe = function(value) {
    if (!value) {
      value = null;
    }
    return {
      value: function() {
        return value;
      },
      apply: function(f) {
        if (value) {
          return new Maybe(f(value));
        } else {
          return new Maybe(value);
        }
      }
    };
  };
  var appContainer = document.getElementById("app");
  var availablePages = ["start", "quiz-page", "finish"];
  var templates = availablePages.reduce(function(acc, key) {
    var template = window.doT.template(
      document.querySelector(['[data-template="', key, '"]'].join("")).innerHTML
    );
    var newItem = {};
    newItem[key] = template;

    return Object.assign(acc, newItem);
  }, {});
  var progressTo = function (params) {
    throw new Error('progress To');
  };
  var forEach = function (ns, f) {
    Array.prototype.forEach.call(ns, f);
  }
  var eventListeners = {
    start: function() {
      forEach(document.querySelectorAll('.start .btn'), function (btn) {
        btn.addEventListener('click', function () {
          progressTo('quiz-page');
        })
      });
    },
    "quiz-page": function(params) {},
    finish: function(params) {}
  };
  var state = {
    imageExt: window.imageExt || "jpeg",
    imagesCount: 0,
    imagesList: [],
    currentPage: null,
    startTime: null,
    endTime: null
  };
  var setState = function(oldState, props) {
    state = Object.assign({}, oldState, props);
  };
  var render = function() {
    appContainer.innerHTML = templates[state.currentPage](state);
  };
  var addEventListeners = function () {
    eventListeners[state.currentPage]();
  };
  var init = function() {
    setState(state, {
      currentPage: availablePages[0]
    });
    addEventListeners();
    render();
  };

  init();
})();

throw new Error("TODO");
