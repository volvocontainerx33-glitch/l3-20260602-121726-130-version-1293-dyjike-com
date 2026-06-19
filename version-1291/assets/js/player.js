(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-video-url]"));

    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      var url = shell.getAttribute("data-video-url");
      var started = false;
      var hlsInstance = null;

      function playVideo() {
        if (!video || !url) {
          return;
        }

        if (cover) {
          cover.classList.add("is-hidden");
        }

        if (!started) {
          started = true;
          video.setAttribute("controls", "controls");

          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.addEventListener("loadedmetadata", function () {
              video.play().catch(function () {});
            }, { once: true });
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = url;
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  });
})();
