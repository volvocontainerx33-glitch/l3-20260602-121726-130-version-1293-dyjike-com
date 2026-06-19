(function () {
  const HLS_LIBRARY_URL = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
  let hlsLibraryPromise = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    const carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    const prev = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    if (slides.length <= 1) {
      return;
    }
    let activeIndex = 0;
    let timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 6500);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(activeIndex - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(activeIndex + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startTimer();
      });
    });
    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);
    startTimer();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getSearchFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  }

  function setupFilters() {
    const list = document.querySelector("[data-filter-list]");
    if (!list) {
      setupHeaderSearchOnly();
      return;
    }
    const cards = Array.from(list.querySelectorAll(".movie-card, .rank-item"));
    const searchInput = document.querySelector("[data-filter-search]");
    const categorySelect = document.querySelector("[data-filter-category]");
    const typeSelect = document.querySelector("[data-filter-type]");
    const yearSelect = document.querySelector("[data-filter-year]");
    const result = document.querySelector("[data-filter-result]");
    const initialSearch = getSearchFromUrl();

    if (searchInput && initialSearch) {
      searchInput.value = initialSearch;
      window.setTimeout(function () {
        document.getElementById("library")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }

    function applyFilters() {
      const query = normalize(searchInput ? searchInput.value : "");
      const category = normalize(categorySelect ? categorySelect.value : "");
      const type = normalize(typeSelect ? typeSelect.value : "");
      const year = normalize(yearSelect ? yearSelect.value : "");
      let visible = 0;

      cards.forEach(function (card) {
        const matchesQuery = !query || normalize(card.dataset.search).includes(query) || normalize(card.dataset.title).includes(query);
        const matchesCategory = !category || normalize(card.dataset.category) === category;
        const matchesType = !type || normalize(card.dataset.type) === type;
        const matchesYear = !year || normalize(card.dataset.year) === year;
        const shouldShow = matchesQuery && matchesCategory && matchesType && matchesYear;
        card.classList.toggle("is-hidden", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (result) {
        result.textContent = "当前显示 " + visible + " 部内容，共 " + cards.length + " 部";
      }
    }

    [searchInput, categorySelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
    setupHeaderSearchOnly();
  }

  function setupHeaderSearchOnly() {
    const forms = document.querySelectorAll("[data-header-search]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        const input = form.querySelector("input[name='search']");
        const query = input ? input.value.trim() : "";
        if (!query) {
          return;
        }
        event.preventDefault();
        const action = form.getAttribute("action") || "index.html";
        window.location.href = action + "?search=" + encodeURIComponent(query) + "#library";
      });
    });
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLibraryPromise) {
      return hlsLibraryPromise;
    }
    hlsLibraryPromise = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = HLS_LIBRARY_URL;
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error("HLS 库加载失败"));
        }
      };
      script.onerror = function () {
        reject(new Error("无法加载 HLS 播放库"));
      };
      document.head.appendChild(script);
    });
    return hlsLibraryPromise;
  }

  function setupPlayers() {
    const players = Array.from(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      const video = player.querySelector("video[data-hls-src]");
      const button = player.querySelector("[data-play-button]");
      const status = player.querySelector("[data-player-status]");
      let hlsInstance = null;

      if (!video || !button) {
        return;
      }

      function setStatus(message, visible) {
        if (!status) {
          return;
        }
        status.textContent = message || "";
        status.classList.toggle("is-visible", Boolean(visible && message));
      }

      function playVideo() {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            setStatus("浏览器已拦截自动播放，请再次点击视频播放。", true);
          });
        }
      }

      function attachNativeSource(source) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        player.classList.add("is-ready");
        video.load();
      }

      function attachHlsSource(source) {
        return loadHlsLibrary().then(function (Hls) {
          if (!Hls.isSupported()) {
            throw new Error("当前浏览器不支持 MSE HLS 播放");
          }
          if (hlsInstance) {
            hlsInstance.destroy();
          }
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            player.classList.add("is-ready");
            setStatus("", false);
            playVideo();
          });
          hlsInstance.on(Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setStatus("播放源加载失败，请稍后重试。", true);
              try {
                hlsInstance.destroy();
              } catch (error) {
                console.warn(error);
              }
            }
          });
        });
      }

      button.addEventListener("click", function () {
        const source = video.dataset.hlsSrc;
        if (!source) {
          setStatus("未找到播放源。", true);
          return;
        }
        setStatus("正在初始化播放器…", true);
        if (video.dataset.initialized === "true") {
          setStatus("", false);
          playVideo();
          return;
        }
        video.dataset.initialized = "true";
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          attachNativeSource(source);
        } else {
          attachHlsSource(source).catch(function (error) {
            video.dataset.initialized = "false";
            setStatus(error.message || "播放器初始化失败。", true);
          });
        }
      });

      video.addEventListener("playing", function () {
        player.classList.add("is-playing");
        setStatus("", false);
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
