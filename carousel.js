(() => {
  const carousel = document.querySelector(".carousel");
  if (!carousel) return;

  const track = carousel.querySelector(".track");
  const slides = [...track.children];
  const caption = document.querySelector(".shots .caption");
  const dotsBox = document.querySelector(".shots .dots");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let active = -1;
  let frame = 0;

  const dots = slides.map((slide, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("aria-label", `Screenshot ${i + 1} of ${slides.length}`);
    dot.addEventListener("click", () => go(i));
    dotsBox.append(dot);
    return dot;
  });

  function offsetFor(i) {
    const slide = slides[i];
    return slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2;
  }

  function go(i, instant = false) {
    const index = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({
      left: offsetFor(index),
      behavior: instant || reduceMotion.matches ? "auto" : "smooth",
    });
    setActive(index);
  }

  function setActive(i) {
    if (i === active) return;
    active = i;
    slides.forEach((slide, n) => {
      slide.classList.toggle("is-active", n === i);
      slide.setAttribute("aria-hidden", n === i ? "false" : "true");
    });
    dots.forEach((dot, n) => dot.toggleAttribute("aria-current", n === i));
    caption.textContent = slides[i].dataset.caption || "";
    carousel.querySelector(".prev").disabled = i === 0;
    carousel.querySelector(".next").disabled = i === slides.length - 1;
  }

  function nearest() {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDistance = Infinity;
    slides.forEach((slide, i) => {
      const distance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    return best;
  }

  track.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(nearest()));
    },
    { passive: true },
  );

  slides.forEach((slide, i) => {
    slide.addEventListener("click", () => {
      if (i !== active) go(i);
    });
  });

  carousel.querySelector(".prev").addEventListener("click", () => go(active - 1));
  carousel.querySelector(".next").addEventListener("click", () => go(active + 1));

  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(active - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(active + 1);
    }
  });

  window.addEventListener("resize", () => go(active, true));

  go(Math.floor(slides.length / 2), true);
})();
