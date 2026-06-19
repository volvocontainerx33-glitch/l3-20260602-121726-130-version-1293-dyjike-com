function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var cover = document.getElementById('play-cover');
  var ready = false;
  var hls = null;

  if (!video || !cover || !streamUrl) {
    return;
  }

  function attachStream() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
    video.load();
  }

  function playNow() {
    attachStream();
    cover.classList.add('is-hidden');
    video.controls = true;

    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        cover.classList.remove('is-hidden');
      });
    }
  }

  cover.addEventListener('click', playNow);

  video.addEventListener('click', function () {
    if (video.paused) {
      playNow();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
