(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    var search = document.querySelector('.nav-search');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
        if (search) {
          search.classList.toggle('is-open');
        }
      });
    }

    initHero();
    initFilters();
    initPlayers();
  });

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-thumb]'));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      thumbs.forEach(function (thumb, itemIndex) {
        thumb.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var nextIndex = Number(thumb.getAttribute('data-hero-thumb') || '0');
        show(nextIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var keywordInput = document.querySelector('[data-filter-keyword]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var resetButton = document.querySelector('[data-filter-reset]');
    var countNode = document.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    if (!cards.length || !keywordInput) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      keywordInput.value = query;
    }

    function matches(card) {
      var keyword = keywordInput.value.trim().toLowerCase();
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' ').toLowerCase();

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }

      if (year && card.getAttribute('data-year') !== year) {
        return false;
      }

      if (type && card.getAttribute('data-type') !== type) {
        return false;
      }

      return true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.classList.toggle('is-filter-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        keywordInput.value = '';
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        apply();
      });
    }

    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('[data-player-toggle]');
      var status = box.querySelector('[data-player-status]');
      var src = box.getAttribute('data-video-src');
      var hlsInstance = null;
      var isReady = false;

      if (!video || !src) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function prepare() {
        if (isReady) {
          return Promise.resolve();
        }

        setStatus('正在加载播放源');
        isReady = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放源加载异常，请稍后重试');
            }
          });
          return Promise.resolve();
        }

        video.src = src;
        return Promise.resolve();
      }

      function play() {
        prepare().then(function () {
          return video.play();
        }).then(function () {
          if (button) {
            button.classList.add('is-hidden');
          }
          setStatus('正在播放');
        }).catch(function () {
          setStatus('点击视频控件继续播放');
        });
      }

      if (button) {
        button.addEventListener('click', play);
      }

      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
        setStatus('正在播放');
      });

      video.addEventListener('pause', function () {
        setStatus('已暂停');
      });

      video.addEventListener('ended', function () {
        setStatus('播放结束');
      });

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }
})();
