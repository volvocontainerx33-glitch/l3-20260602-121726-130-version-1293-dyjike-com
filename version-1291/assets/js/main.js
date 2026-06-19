(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");

    if (navToggle && nav) {
      navToggle.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;

      function show(next) {
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
          show(parseInt(dot.getAttribute("data-hero-dot"), 10));
        });
      });

      setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    var searchInput = document.getElementById("searchInput");
    var categoryFilter = document.getElementById("categoryFilter");
    var yearFilter = document.getElementById("yearFilter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));
    var emptyState = document.getElementById("emptyState");

    function filterCards() {
      if (!cards.length) {
        return;
      }

      var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var category = categoryFilter ? categoryFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-tags") || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
        var ok = true;

        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (category && card.getAttribute("data-category") !== category) {
          ok = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          ok = false;
        }

        card.style.display = ok ? "block" : "none";
        if (ok) {
          shown += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = shown ? "none" : "block";
      }
    }

    [searchInput, categoryFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });
  });
})();
