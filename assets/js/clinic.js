(() => {
  const body = document.body;

  // Preloader: hide once page is fully loaded (with a short minimum so the brand mark is visible)
  const preloader = document.querySelector(".preloader");
  if (preloader) {
    const minDisplay = 650;
    const showStart = performance.now();

    const hidePreloader = () => {
      const elapsed = performance.now() - showStart;
      const wait = Math.max(0, minDisplay - elapsed);
      setTimeout(() => {
        preloader.classList.add("is-hidden");
        setTimeout(() => {
          if (preloader.parentNode) {
            preloader.parentNode.removeChild(preloader);
          }
        }, 600);
      }, wait);
    };

    if (document.readyState === "complete") {
      hidePreloader();
    } else {
      window.addEventListener("load", hidePreloader);
      // Fallback: even if load doesn't fire for any reason, hide after 5s
      setTimeout(hidePreloader, 5000);
    }
  }

  // Sticky header shadow once scrolled
  const header = document.querySelector(".site-header");
  const syncHeader = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 10);
  };
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  // Mobile nav toggle
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      body.classList.toggle("menu-open", !expanded);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        body.classList.remove("menu-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Horizontal rail scroll controls
  document.querySelectorAll("[data-rail-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const rail = document.getElementById(button.dataset.railTarget);
      if (!rail) return;
      const direction = Number(button.dataset.railDir || 1);
      const amount = Math.max(rail.clientWidth * 0.82, 260);
      rail.scrollBy({ left: amount * direction, behavior: "smooth" });
      // Briefly pause auto-scroll after a manual nudge
      rail.dataset.autoPausedUntil = String(performance.now() + 4000);
    });
  });

  // Auto-scroll the service rails (gentle horizontal marquee, ping-pong at the ends)
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion) {
    document.querySelectorAll(".service-rail").forEach((rail) => {
      let dir = 1;
      const speed = 0.45; // px per frame (~27px/s at 60fps)
      let hovered = false;

      rail.addEventListener("mouseenter", () => { hovered = true; });
      rail.addEventListener("mouseleave", () => { hovered = false; });
      rail.addEventListener("touchstart", () => {
        rail.dataset.autoPausedUntil = String(performance.now() + 4000);
      }, { passive: true });

      const step = () => {
        const max = rail.scrollWidth - rail.clientWidth;
        const paused = hovered || performance.now() < Number(rail.dataset.autoPausedUntil || 0);
        if (!paused && max > 1) {
          rail.scrollLeft += speed * dir;
          if (rail.scrollLeft >= max - 0.5) {
            dir = -1;
          } else if (rail.scrollLeft <= 0.5) {
            dir = 1;
          }
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  // Reveal-on-scroll animations
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    reveals.forEach((item) => observer.observe(item));
  } else {
    reveals.forEach((item) => item.classList.add("is-visible"));
  }

  // Footer year
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
