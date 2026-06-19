(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dotsWrap = carousel.querySelector("[data-hero-dots]");
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "切换推荐影片");
        dot.addEventListener("click", function () {
          show(i);
          play();
        });
        dotsWrap.appendChild(dot);
      });
    }

    show(0);
    play();
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
  var emptyState = document.querySelector("[data-empty-state]");
  if (filterInput && filterCards.length) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    filterInput.value = initial;

    function applyFilter() {
      var query = filterInput.value.trim().toLowerCase();
      var visible = 0;
      filterCards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var matched = !query || text.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle("show", visible === 0);
      }
    }

    filterInput.addEventListener("input", applyFilter);
    applyFilter();
  }
})();

function setupMoviePlayer(source) {
  var video = document.getElementById("movie-player");
  var button = document.querySelector("[data-play-button]");
  var cover = document.querySelector("[data-player-cover]");
  var loaded = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function loadVideo() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startVideo() {
    loadVideo();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", startVideo);
  }
  if (cover && cover !== button) {
    cover.addEventListener("click", startVideo);
  }
  video.addEventListener("click", function () {
    if (!loaded || video.paused) {
      startVideo();
    }
  });
  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });
  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
