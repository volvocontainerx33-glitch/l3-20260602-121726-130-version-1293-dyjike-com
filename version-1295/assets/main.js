(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterType = document.querySelector('[data-filter-type]');
  var filterItems = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var emptyState = document.querySelector('.empty-state');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    if (!filterItems.length) {
      return;
    }

    var query = normalize(filterInput && filterInput.value);
    var year = normalize(filterYear && filterYear.value);
    var type = normalize(filterType && filterType.value);
    var shown = 0;

    filterItems.forEach(function (item) {
      var title = normalize(item.getAttribute('data-title'));
      var itemYear = normalize(item.getAttribute('data-year'));
      var itemType = normalize(item.getAttribute('data-type'));
      var ok = true;

      if (query && title.indexOf(query) === -1) {
        ok = false;
      }

      if (year && itemYear !== year) {
        ok = false;
      }

      if (type && itemType.indexOf(type) === -1) {
        ok = false;
      }

      item.style.display = ok ? '' : 'none';
      if (ok) {
        shown += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = shown ? 'none' : 'block';
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }
  if (filterYear) {
    filterYear.addEventListener('change', applyFilter);
  }
  if (filterType) {
    filterType.addEventListener('change', applyFilter);
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q && filterInput) {
    filterInput.value = q;
    applyFilter();
  }

  var boxes = Array.prototype.slice.call(document.querySelectorAll('.player-box'));

  boxes.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-button');
    var stream = box.getAttribute('data-stream');

    function start() {
      if (!video || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.play();
        box.classList.add('ready');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play();
          box.classList.add('ready');
        });
        return;
      }

      video.src = stream;
      video.play();
      box.classList.add('ready');
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', start);
    }
  });
})();
