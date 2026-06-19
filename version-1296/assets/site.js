(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        var search = document.querySelector(".nav-search");

        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("open");
                if (search) {
                    search.classList.toggle("open");
                }
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var index = 0;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var yearFilter = document.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

        function applyFilter() {
            var q = filterInput ? filterInput.value.trim().toLowerCase() : "";
            var year = yearFilter ? yearFilter.value : "";
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-text") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var matched = (!q || text.indexOf(q) !== -1) && (!year || cardYear === year);
                card.classList.toggle("hidden-card", !matched);
            });
        }

        if (filterInput) {
            filterInput.addEventListener("input", applyFilter);
        }
        if (yearFilter) {
            yearFilter.addEventListener("change", applyFilter);
        }

        var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector("[data-player-button]");
            if (!video) {
                return;
            }
            var source = video.getAttribute("data-video-src");
            var loaded = false;

            function loadVideo() {
                if (loaded || !source) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
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

            function playVideo() {
                loadVideo();
                shell.classList.add("playing");
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", playVideo);
            }
            video.addEventListener("play", function () {
                shell.classList.add("playing");
            });
            video.addEventListener("click", function () {
                loadVideo();
            });
        });

        var results = document.querySelector("[data-search-results]");
        if (results && window.SITE_INDEX) {
            var params = new URLSearchParams(window.location.search);
            var qValue = params.get("q") || "";
            var largeInput = document.querySelector("[data-search-input]");
            if (largeInput) {
                largeInput.value = qValue;
            }
            var qLower = qValue.trim().toLowerCase();
            var list = window.SITE_INDEX.filter(function (item) {
                if (!qLower) {
                    return item.hot;
                }
                return item.text.toLowerCase().indexOf(qLower) !== -1;
            }).slice(0, 80);

            results.innerHTML = list.map(function (item) {
                return [
                    "<article class=\"movie-card\" data-movie-card>",
                    "<a class=\"poster-link\" href=\"" + item.url + "\" aria-label=\"" + item.title + "\">",
                    "<img src=\"" + item.image + "\" alt=\"" + item.title + "\" loading=\"lazy\">",
                    "<span class=\"play-dot\">▶</span>",
                    "</a>",
                    "<div class=\"card-body\">",
                    "<div class=\"card-meta\">" + item.year + " · " + item.region + " · " + item.type + "</div>",
                    "<h2><a href=\"" + item.url + "\">" + item.title + "</a></h2>",
                    "<p>" + item.desc + "</p>",
                    "<div class=\"tag-row\"><span>" + item.category + "</span></div>",
                    "</div>",
                    "</article>"
                ].join("");
            }).join("");
        }
    });
})();
