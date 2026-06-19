(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = panel.classList.toggle("open");
            document.body.classList.toggle("menu-open", open);
            toggle.textContent = open ? "×" : "☰";
        });
        panel.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                panel.classList.remove("open");
                document.body.classList.remove("menu-open");
                toggle.textContent = "☰";
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearchForms() {
        document.querySelectorAll("form[action='./search.html']").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                }
            });
        });
    }

    function setupSearchPage() {
        var results = document.querySelector(".search-results");
        if (!results) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var input = document.querySelector(".search-input");
        var form = document.querySelector(".search-page-form");
        var empty = document.querySelector(".empty-state");
        var cards = Array.prototype.slice.call(results.querySelectorAll(".movie-card"));
        if (input) {
            input.value = query;
        }
        function filter(value) {
            var words = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-filter") || card.textContent || "").toLowerCase();
                var match = words.length === 0 || words.every(function (word) {
                    return text.indexOf(word) !== -1;
                });
                card.style.display = match ? "" : "none";
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }
        if (form && input) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var value = input.value.trim();
                var next = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
                history.replaceState(null, "", next);
                filter(value);
            });
            input.addEventListener("input", function () {
                filter(input.value);
            });
        }
        filter(query);
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearchForms();
        setupSearchPage();
    });
})();

function initMoviePlayer(source) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    var start = document.getElementById("player-start");
    if (!video || !source) {
        return;
    }
    var hlsInstance = null;
    var loaded = false;

    function attach() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 60
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                }
            });
        } else {
            video.src = source;
        }
    }

    function play(event) {
        if (event) {
            event.preventDefault();
        }
        attach();
        if (cover) {
            cover.classList.add("player-cover-hidden");
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (cover) {
                    cover.classList.remove("player-cover-hidden");
                }
            });
        }
    }

    if (cover) {
        cover.addEventListener("click", play);
    }
    if (start) {
        start.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (!loaded) {
            play();
        }
    });
    video.addEventListener("play", function () {
        if (cover) {
            cover.classList.add("player-cover-hidden");
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
