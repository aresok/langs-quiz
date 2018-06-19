(function() {
  "use strict";

  var NOT_FOUND = -1;
  var SECOND = 1000;
  var MINUTE = 60 * SECOND;
  var HOUR = 60 * MINUTE;
  var randomNumber = function(config) {
    var min = config.min || 1;
    var max = config.max || 99;

    return Math.floor(Math.random() * (max - min) + min);
  };
  var deepCopy = function(input) {
    if (input instanceof Array) {
      return input.map(deepCopy);
    }

    if (input instanceof Object) {
      return Object.keys(input)
        .map(function(i) {
          return [i, deepCopy(input[i])];
        })
        .reduce(function(acc, i) {
          acc[i[0]] = i[1];

          return acc;
        }, {});
    }

    return input;
  };
  var shuffle = function (a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  };
  var fillTo2Digits = function (number) {
    return number < 10 ? [0, number].join('') : number;
  };
  var timeDiff = function (end, start) {
    var diff = end - start;
    
    var hours = Math.floor(diff / HOUR);

    diff = diff - (HOUR * hours);

    var minutes =  Math.floor(diff / MINUTE);

    diff = diff - Math.floor(minutes * MINUTE);

    var seconds = Math.floor(diff / SECOND);

    return {
      seconds: fillTo2Digits(seconds),
      minutes: fillTo2Digits(minutes),
      hours: fillTo2Digits(hours),
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
  var beforeProgressTo = {
    start: function() {
      var questionsCount = randomNumber({
        min: window.__INIT__.availableImagesCount * 0.7,
        max: window.__INIT__.availableImagesCount
      });
      setState({
        currentPage: availablePages[0],
        questionsList: shuffle(deepCopy(state.allQuestions)).slice(
          0,
          questionsCount
        ),
        questionsCount: questionsCount,
        currentQuizAnswers: [],
        currentQuizPage: null,
        startTime: new Date(),
        endTime: null,
      });
    },
    "quiz-page": function() {
      if (state.currentQuizPage === null) {
        setState({
          currentQuizPage: -1
        });
      }
      if (state.currentQuizPage + 1 === state.questionsList.length) {
        setTimeout(progressTo.bind(null, "finish"), 200);
        return;
      }
      setState({
        currentQuizPage: state.currentQuizPage + 1
      });
      setState({
        currentQuizQuestion: deepCopy(state.questionsList)[
          state.currentQuizPage
        ]
      });
    },
    finish: function() {
      setState({
        endTime: new Date(),
        currentQuizAnswers: state.currentQuizAnswers.map(function(answer, i) {
          return (
            NOT_FOUND !==
            deepCopy(state.questionsList)
              [i].answers
              .map(function(a) {
                return a.toLowerCase();
              })
              .indexOf(answer.toLowerCase())
          );
        })
      });
      setState({
        totalTime: timeDiff(state.endTime, state.startTime)
      });
    }
  };
  var progressTo = function(page, props) {
    beforeProgressTo[page]();
    setState({
      currentPage: page
    });
    if (props) {
      setState(props);
    }
    render();
    addEventListeners();
  };
  var forEach = function(ns, f) {
    Array.prototype.forEach.call(ns, f);
  };
  var eventListeners = {
    start: function() {
      forEach(document.querySelectorAll(".start .btn"), function(btn) {
        btn.addEventListener("click", function() {
          progressTo("quiz-page");
        });
      });
    },
    "quiz-page": function() {
      forEach(document.querySelectorAll(".quiz-question form"), function(btn) {
        btn.addEventListener("submit", function(e) {
          e.preventDefault();
          setState({
            currentQuizAnswers: deepCopy(state.currentQuizAnswers).concat([
              document.querySelector(".quiz-question .answer").value
            ])
          });
          progressTo("quiz-page");
        });
      });
    },
    finish: function() {
      forEach(document.querySelectorAll(".finish .btn"), function(btn) {
        btn.addEventListener("click", function() {
          progressTo("start");
        });
      });
    }
  };
  var state = {
    imageExt: window.__INIT__.imagesExt || "jpeg",
    allAnswers: window.__INIT__.allAnswers || [],
    imagesCount: null,
    questionsList: [],
    currentPage: null,
    startTime: null,
    endTime: null,
    currentQuizPage: null,
    currentQuizQuestion: null,
    currentQuizAnswers: null,
    questionsCount: null
  };
  var setState = function(props) {
    console.log(state, "stateBefore");
    state = Object.assign({}, state, props);
    console.log(state, "stateAfter");
  };
  var render = function() {
    appContainer.innerHTML = templates[state.currentPage](state);
  };
  var addEventListeners = function() {
    eventListeners[state.currentPage]();
  };
  var init = function() {
    setState({
      availableImagesCount: state.allAnswers.length,
      allQuestions: state.allAnswers.map(function(a, i) {
        return {
          answers: deepCopy(a),
          image: ["./images/", i + 1, ".", state.imageExt].join("")
        };
      })
    });
    progressTo("start");
  };
  init();
})();
