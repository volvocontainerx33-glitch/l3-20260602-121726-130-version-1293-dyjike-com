document.addEventListener('DOMContentLoaded', function () {
    var root = document.body.getAttribute('data-root') || '';
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    initHeroSlider();
    initLocalFilter();
    initTableFilter();
    initSearchPage();
    initPlayer();

    function initHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        if (!slides.length || !dots.length) {
            return;
        }

        function show(nextIndex) {
            index = nextIndex;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
                show(nextIndex);
                restart();
            });
        });

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show((index + 1) % slides.length);
            }, 5200);
        }

        restart();
    }

    function initLocalFilter() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]'));

        inputs.forEach(function (input) {
            var section = input.closest('.section-block') || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
            var empty = section.querySelector('[data-empty-note]');

            input.addEventListener('input', function () {
                filterCards(cards, input.value, empty);
            });
        });
    }

    function initSearchPage() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        var searchInput = document.querySelector('[data-search-page-input]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty-note]');

        if (searchInput) {
            searchInput.value = q;
        }

        if (q && cards.length) {
            filterCards(cards, q, empty);
        }
    }

    function filterCards(cards, keyword, emptyNode) {
        var query = normalize(keyword);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-region')
            ].join(' '));
            var matched = !query || haystack.indexOf(query) !== -1;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (emptyNode) {
            emptyNode.hidden = visible !== 0;
        }
    }

    function initTableFilter() {
        var input = document.querySelector('[data-table-filter]');
        var table = document.querySelector('[data-rank-table]');

        if (!input || !table) {
            return;
        }

        var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr'));

        input.addEventListener('input', function () {
            var query = normalize(input.value);
            rows.forEach(function (row) {
                row.hidden = query && normalize(row.textContent).indexOf(query) === -1;
            });
        });
    }

    function initPlayer() {
        var video = document.getElementById('videoPlayer');
        var overlay = document.querySelector('[data-player-overlay]');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-hls-src');

        if (source) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                overlay.classList.add('is-hidden');
                video.play().catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            });

            video.addEventListener('play', function () {
                overlay.classList.add('is-hidden');
            });
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }
});
