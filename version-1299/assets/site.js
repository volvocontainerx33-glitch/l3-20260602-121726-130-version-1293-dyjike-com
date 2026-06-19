(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

  scopes.forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var sort = scope.querySelector('[data-sort-select]');
    var list = scope.querySelector('[data-card-list]');
    var empty = scope.querySelector('[data-empty-card]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      if (!list) {
        return;
      }

      var query = normalize(input ? input.value : '');
      var visible = 0;
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-category'),
          card.getAttribute('data-genre')
        ].join(' '));
        var match = !query || haystack.indexOf(query) !== -1;
        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    }

    function applySort() {
      if (!list || !sort) {
        applyFilter();
        return;
      }

      var value = sort.value;
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

      cards.sort(function (a, b) {
        var ay = parseInt(a.getAttribute('data-year') || '0', 10) || 0;
        var by = parseInt(b.getAttribute('data-year') || '0', 10) || 0;
        var at = a.getAttribute('data-title') || '';
        var bt = b.getAttribute('data-title') || '';

        if (value === 'year-asc') {
          return ay - by || at.localeCompare(bt, 'zh-Hans-CN');
        }

        if (value === 'title') {
          return at.localeCompare(bt, 'zh-Hans-CN');
        }

        return by - ay || at.localeCompare(bt, 'zh-Hans-CN');
      });

      cards.forEach(function (card) {
        list.appendChild(card);
      });

      applyFilter();
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (sort) {
      sort.addEventListener('change', applySort);
    }

    applySort();
  });
})();
