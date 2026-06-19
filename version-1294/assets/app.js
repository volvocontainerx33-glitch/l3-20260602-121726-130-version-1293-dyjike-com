(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5000);
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        var input = document.querySelector("#movieSearch");
        var region = document.querySelector("#regionFilter");
        var type = document.querySelector("#typeFilter");
        var year = document.querySelector("#yearFilter");
        var empty = document.querySelector("#emptyState");
        if (!cards.length || (!input && !region && !type && !year)) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        if (input && params.get("q")) {
            input.value = params.get("q");
        }
        if (region && params.get("region")) {
            region.value = params.get("region");
        }
        if (type && params.get("type")) {
            type.value = params.get("type");
        }
        if (year && params.get("year")) {
            year.value = params.get("year");
        }
        function run() {
            var q = normalize(input && input.value);
            var r = region && region.value ? region.value : "";
            var t = type && type.value ? type.value : "";
            var y = year && year.value ? year.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var meta = normalize(card.getAttribute("data-meta"));
                var match = true;
                if (q && meta.indexOf(q) === -1) {
                    match = false;
                }
                if (r && card.getAttribute("data-region") !== r) {
                    match = false;
                }
                if (t && card.getAttribute("data-type") !== t) {
                    match = false;
                }
                if (y && card.getAttribute("data-year") !== y) {
                    match = false;
                }
                card.style.display = match ? "" : "none";
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }
        [input, region, type, year].forEach(function (el) {
            if (el) {
                el.addEventListener("input", run);
                el.addEventListener("change", run);
            }
        });
        run();
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>'"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                "\"": "&quot;"
            }[char];
        });
    }

    function card(movie) {
        var tags = Array.isArray(movie.tags) ? movie.tags.join(" ") : "";
        var line = movie.oneLine || movie.genre || "";
        return "" +
            "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\" data-filter-card data-title=\"" + escapeHtml(movie.title) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-tags=\"" + escapeHtml(tags) + "\" data-meta=\"" + escapeHtml([movie.title, movie.region, movie.type, movie.genre, tags].join(" ")) + "\">" +
            "<div class=\"card-poster\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"duration\">" + escapeHtml(movie.duration) + "</span><span class=\"play-dot\">▶</span></div>" +
            "<div class=\"card-body\"><div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.year) + "</span></div><h3>" + escapeHtml(movie.title) + "</h3><p>" + escapeHtml(line) + "</p><div class=\"card-foot\"><span class=\"rating\">★ " + escapeHtml(movie.rating) + "</span><span>" + escapeHtml(movie.heatText) + " 热度</span></div></div>" +
            "</a>";
    }

    function setupSearchPage() {
        var holder = document.querySelector("#searchResults");
        var input = document.querySelector("#searchPageInput");
        var form = document.querySelector("#searchPageForm");
        if (!holder || !window.siteMovies) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (input) {
            input.value = initial;
        }
        function render(query) {
            var q = normalize(query);
            var list = window.siteMovies.filter(function (movie) {
                var text = normalize([movie.title, movie.region, movie.type, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" "));
                return q ? text.indexOf(q) !== -1 : true;
            }).slice(0, 120);
            holder.innerHTML = list.map(card).join("");
            var empty = document.querySelector("#searchEmpty");
            if (empty) {
                empty.classList.toggle("show", list.length === 0);
            }
        }
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var q = input ? input.value : "";
                var url = new URL(window.location.href);
                if (q) {
                    url.searchParams.set("q", q);
                } else {
                    url.searchParams.delete("q");
                }
                window.history.replaceState({}, "", url.toString());
                render(q);
            });
        }
        if (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
        }
        render(initial);
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
}());
