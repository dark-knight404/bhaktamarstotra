(function (window) {
  "use strict";

  // Firefox 1.0+
  var isFirefox = typeof InstallTrigger !== "undefined";

  // audio element
  var track = document.getElementById("track");

  // play/pause button element
  var controlBtn = document.getElementById("play-pause");

  // To toggle play/pause button
  function playPause() {
    if (track.paused) {
      track.play();
      controlBtn.querySelector("i").className = "fs-1 bi bi-pause-circle";
    } else {
      track.pause();
      controlBtn.querySelector("i").className = "fs-1 bi bi-play-circle";
    }
  }

  controlBtn.addEventListener("click", playPause);
  track.addEventListener("ended", function () {
    controlBtn.querySelector("i").className = "fs-1 bi bi-play-circle";
  });
  track.addEventListener("play", function () {
    controlBtn.querySelector("i").className = "fs-1 bi bi-pause-circle";
  });

  // To parse lrc file
  function parse(data) {
    let regexp = /\[\d{2}:\d{2}.\d{2}\]/g;
    function linesCleanup(input) {
      let output = [];
      for (let i = 0; i < input.length; i++) {
        if (input[i].search(regexp) >= 0) {
          output.push(input[i]);
        } else {
          console.warn(
            "parse(): Line " +
              i +
              ' is not a valid lyrics line, would be ignored. Line: "' +
              input[i] +
              '"'
          );
        }
      }
      return output;
    }
    let lines = linesCleanup(data.split("\n"));
    let result = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let nodes = line.match(regexp);
      let splitted = line.replace(regexp, "").trim().split("|");
      let text = splitted[0].trim();
      for (let j = 0; j < nodes.length; j++) {
        let t = nodes[j].slice(1, -1).split(":");
        let resultItem = [
          parseInt(t[0], 10) * 60 + parseFloat(t[1]),
          text == "" ? "&nbsp;" : text,
        ];
        result.push(resultItem);
      }
    }
    return result.sort((a, b) => a[0] - b[0]);
  }

  // To create html element
  function createCustomElement(tag, initClassName, initHTML) {
    let element = document.createElement(tag);
    if (initClassName) {
      element.className = initClassName;
    }
    if (initHTML) {
      element.innerHTML = initHTML;
    }
    return element;
  }

  function textClicked(time) {
    if ((isFirefox && time == "16.51") || time == "25.17") {
      time = time - 1.5;
      console.log("Clicked:" + time + " CT:" + track.currentTime);
    }
    track.pause();
    track.currentTime = time;
    track.play();
  }

  // class lyricController
  function lyricController(desc) {
    // Outer DOM element
    this.domOuter = document.querySelector(desc.el);

    // Create inner DOM element to populate lyrics
    this.domInner = createCustomElement("div");

    // Parsed lyrics
    this.data = null;

    // Recording current line #. Upon change during lyrics scrolling.
    this.currentLine = 0;

    // Setup default styles
    this.domOuter.innerHTML = "";
    this.domOuter.appendChild(this.domInner);
    this.domInner.className =
      "text-muted position-relative mh-100 user-select-none";
    this.domInner.id = "lyric-inner";
  }

  lyricController.prototype.clear = function () {
    this.data = null;
  };

  lyricController.prototype.load = function (data) {
    this.data = parse(data);
    this.currentLine = -1;
    this.domInner.innerHTML = "";
    for (var i = 0; i < this.data.length; i++) {
      let p = createCustomElement("p", null, this.data[i][1]);
      p.id = this.data[i][0];
      p.addEventListener("click", function () {
        textClicked(this.id);
      });
      this.domInner.appendChild(p);
    }
  };

  lyricController.prototype.update = function (time) {
    if (this.data) {
      for (let i = this.data.length - 1; i >= 0; i--) {
        if (time >= this.data[i][0]) {
          if (i != this.currentLine) {
            let currentLine = this.domInner.querySelectorAll("p")[i];
            let lastActiveLine =
              this.domInner.querySelectorAll("p")[this.currentLine];
            if (lastActiveLine != undefined) {
              lastActiveLine.className = "";
            }
            this.currentLine = i;
            currentLine.className = "fw-bold fs-5 text-dark";
          }
          break;
        }
      }
    }
  };

  if (typeof window.lyricCntrlr === "undefined") {
    window.lyricCntrlr = lyricController;
  }
})(window);
