const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear().toString();
}

const languageButtons = document.querySelectorAll(".language-button");
const translatableElements = document.querySelectorAll("[data-es][data-en]");
const navigation = document.querySelector("nav[data-es-label][data-en-label]");
const pageDescription = document.querySelector("#page-description");
const presentationViewer = document.querySelector(".presentation-viewer");
const presentationSlide = document.querySelector("#liber-slide");
const slideCount = document.querySelector("#liber-slide-count");
const previousSlideButton = document.querySelector("#previous-slide");
const nextSlideButton = document.querySelector("#next-slide");
const presentationError = document.querySelector("#liber-slide-error");
const presentationSlideTotal = 24;
let currentPresentationSlide = 1;
let currentLanguage = document.documentElement.lang;

const projectsSection = document.querySelector("#proyectos");
const talksSection = document.querySelector("#ponencias");

if (projectsSection && talksSection) {
  projectsSection.after(talksSection);
}

for (const viewer of document.querySelectorAll("[data-step-viewer]")) {
  const stage = viewer.querySelector("[data-step-stage]");
  const steps = [...viewer.querySelectorAll("[data-step]")];
  const previousButton = viewer.querySelector("[data-step-previous]");
  const nextButton = viewer.querySelector("[data-step-next]");
  const count = viewer.querySelector("[data-step-count]");
  let currentStep = 0;

  const showStep = (index) => {
    currentStep = index;
    steps.forEach((step, stepIndex) => {
      step.hidden = stepIndex !== currentStep;
    });
    if (count) {
      count.textContent = `${currentStep + 1} / ${steps.length}`;
    }
    if (previousButton) {
      previousButton.disabled = currentStep === 0;
    }
    if (nextButton) {
      nextButton.disabled = currentStep === steps.length - 1;
    }
    steps[currentStep]?.querySelector("[data-flipbook]")?.refreshFlipbook?.();
  };

  // Permite que los lectores de páginas internos pasen a la publicación vecina.
  viewer.stepCount = steps.length;
  viewer.currentStepIndex = () => currentStep;
  viewer.goToStep = (index, edge) => {
    if (index < 0 || index >= steps.length) {
      return;
    }
    showStep(index);
    const flipbook = steps[index].querySelector("[data-flipbook]");
    flipbook?.showFlipEdge?.(edge);
  };

  stage?.addEventListener("click", (event) => {
    if (event.target.closest("a, button, [data-flipbook]")) {
      return;
    }
    showStep((currentStep + 1) % steps.length);
  });

  previousButton?.addEventListener("click", () => {
    if (currentStep > 0) {
      showStep(currentStep - 1);
    }
  });

  nextButton?.addEventListener("click", () => {
    if (currentStep < steps.length - 1) {
      showStep(currentStep + 1);
    }
  });

  showStep(0);

  // Avance automático: solo si la pestaña está abierta y nadie está
  // interactuando con el carrusel, y nunca con "reducir movimiento".
  const autoplayDelay = Number(viewer.dataset.stepAutoplay);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (autoplayDelay > 0 && !reduceMotion) {
    let paused = false;
    viewer.addEventListener("mouseenter", () => {
      paused = true;
    });
    viewer.addEventListener("mouseleave", () => {
      paused = false;
    });
    viewer.addEventListener("focusin", () => {
      paused = true;
    });
    viewer.addEventListener("focusout", () => {
      paused = false;
    });
    // Con data-step-autoplay-from, las primeras partes (por ejemplo, un texto)
    // esperan a que la persona avance, y luego solo se repiten las fotos.
    const autoplayFrom = Number(viewer.dataset.stepAutoplayFrom) || 0;
    window.setInterval(() => {
      const container = viewer.closest("details");
      const isVisible = (!container || container.open) && viewer.getClientRects().length > 0;
      if (!paused && isVisible && !document.hidden && currentStep >= autoplayFrom) {
        const next = currentStep + 1 < steps.length ? currentStep + 1 : autoplayFrom;
        showStep(next);
      }
    }, autoplayDelay);
  }
}

for (const flipbook of document.querySelectorAll("[data-flipbook]")) {
  const pages = [...flipbook.querySelectorAll("[data-flip-page]")];
  const spreadElement = flipbook.querySelector("[data-flip-spread]");
  const previousButton = flipbook.querySelector("[data-flip-prev]");
  const nextButton = flipbook.querySelector("[data-flip-next]");
  const count = flipbook.querySelector("[data-flip-count]");
  const narrowScreen = window.matchMedia("(max-width: 600px)");
  let currentSpread = 0;

  // Revista: portada sola, luego pliegos de dos páginas y contraportada sola.
  const singlePages = flipbook.hasAttribute("data-flip-single");

  const buildSpreads = () => {
    if (singlePages || narrowScreen.matches) {
      return pages.map((_, index) => [index]);
    }
    const spreads = [[0]];
    for (let index = 1; index < pages.length - 1; index += 2) {
      spreads.push(index + 1 < pages.length - 1 ? [index, index + 1] : [index]);
    }
    if (pages.length > 1) {
      spreads.push([pages.length - 1]);
    }
    return spreads;
  };

  let spreads = buildSpreads();

  const showSpread = (index) => {
    currentSpread = Math.max(0, Math.min(index, spreads.length - 1));
    const visible = spreads[currentSpread];
    pages.forEach((page, pageIndex) => {
      page.hidden = !visible.includes(pageIndex);
    });
    spreadElement?.classList.toggle("is-single", visible.length === 1);
    if (count) {
      const first = visible[0] + 1;
      const last = visible[visible.length - 1] + 1;
      count.textContent =
        first === last ? `${first} / ${pages.length}` : `${first}–${last} / ${pages.length}`;
    }
    if (previousButton) {
      previousButton.disabled = currentSpread === 0 && !hasNeighbor(-1);
    }
    if (nextButton) {
      nextButton.disabled = currentSpread === spreads.length - 1 && !hasNeighbor(1);
    }
  };

  // Si el lector está dentro de un carrusel, al terminar sus páginas
  // continúa con la publicación siguiente (o vuelve a la anterior).
  const parentViewer = flipbook.closest("[data-step-viewer]");
  const hasNeighbor = (direction) => {
    if (!parentViewer?.goToStep) {
      return false;
    }
    const target = parentViewer.currentStepIndex() + direction;
    return target >= 0 && target < parentViewer.stepCount;
  };

  const goForward = () => {
    if (currentSpread < spreads.length - 1) {
      showSpread(currentSpread + 1);
    } else if (hasNeighbor(1)) {
      parentViewer.goToStep(parentViewer.currentStepIndex() + 1, "start");
    }
  };

  const goBack = () => {
    if (currentSpread > 0) {
      showSpread(currentSpread - 1);
    } else if (hasNeighbor(-1)) {
      parentViewer.goToStep(parentViewer.currentStepIndex() - 1, "end");
    }
  };

  flipbook.showFlipEdge = (edge) => {
    showSpread(edge === "end" ? spreads.length - 1 : 0);
    flipbook.focus({ preventScroll: true });
  };
  flipbook.refreshFlipbook = () => showSpread(currentSpread);

  previousButton?.addEventListener("click", goBack);
  nextButton?.addEventListener("click", goForward);

  flipbook.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      event.stopPropagation();
      goBack();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      event.stopPropagation();
      goForward();
    }
  });

  narrowScreen.addEventListener("change", () => {
    const firstVisiblePage = spreads[currentSpread][0];
    spreads = buildSpreads();
    showSpread(spreads.findIndex((spread) => spread.includes(firstVisiblePage)));
  });

  showSpread(0);
}

function setLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;

  for (const element of translatableElements) {
    element.textContent = element.getAttribute(`data-${language}`) ?? "";
  }

  for (const image of document.querySelectorAll("[data-es-alt][data-en-alt]")) {
    image.setAttribute("alt", image.getAttribute(`data-${language}-alt`) ?? "");
  }

  for (const element of document.querySelectorAll("[data-es-title][data-en-title]")) {
    element.setAttribute("title", element.getAttribute(`data-${language}-title`) ?? "");
  }

  for (const element of document.querySelectorAll(
    "[data-es-aria-label][data-en-aria-label]",
  )) {
    element.setAttribute(
      "aria-label",
      element.getAttribute(`data-${language}-aria-label`) ?? "",
    );
  }

  if (navigation) {
    navigation.setAttribute(
      "aria-label",
      navigation.getAttribute(`data-${language}-label`) ?? "",
    );
  }

  if (presentationViewer) {
    presentationViewer.setAttribute(
      "aria-label",
      presentationViewer.getAttribute(`data-${language}-label`) ?? "",
    );
  }

  for (const button of [previousSlideButton, nextSlideButton]) {
    if (button) {
      button.setAttribute(
        "aria-label",
        button.getAttribute(`data-${language}-label`) ?? "",
      );
    }
  }

  updatePresentationSlide();

  if (pageDescription) {
    pageDescription.setAttribute(
      "content",
      language === "es"
        ? "Susan Montalvo, gestora cultural especializada en la industria editorial y su internacionalización: ferias internacionales del libro, bibliotecas, metadatos y datos abiertos."
        : "Susan Montalvo, cultural manager specializing in publishing and its internationalization: international book fairs, libraries, metadata, and open data.",
    );
  }

  document.title =
    language === "es"
      ? "Susan Montalvo · Gestión cultural y editorial"
      : "Susan Montalvo · Cultural and Publishing Management";

  for (const button of languageButtons) {
    const isActive = button.getAttribute("data-language") === language;
    button.setAttribute("aria-pressed", isActive.toString());
    button.classList.toggle("is-active", isActive);
  }
}

function updatePresentationSlide() {
  if (!presentationSlide || !slideCount) {
    return;
  }

  const slideNumber = currentPresentationSlide.toString().padStart(2, "0");
  presentationSlide.src =
    `assets/liber/presentacion-completa/diapositiva-18-1/Diapositiva${slideNumber}.jpg`;
  presentationSlide.alt =
    currentLanguage === "es"
      ? `Diapositiva ${currentPresentationSlide} de la presentación de Liber`
      : `Slide ${currentPresentationSlide} of the Liber presentation`;
  slideCount.textContent =
    currentLanguage === "es"
      ? `Diapositiva ${currentPresentationSlide} de ${presentationSlideTotal}`
      : `Slide ${currentPresentationSlide} of ${presentationSlideTotal}`;

  if (previousSlideButton) {
    previousSlideButton.disabled = currentPresentationSlide === 1;
  }

  if (nextSlideButton) {
    nextSlideButton.disabled =
      currentPresentationSlide === presentationSlideTotal;
  }

  if (presentationError) {
    presentationError.hidden = true;
  }
}

if (presentationSlide && presentationError) {
  presentationSlide.addEventListener("error", () => {
    presentationError.hidden = false;
  });
}

previousSlideButton?.addEventListener("click", () => {
  if (currentPresentationSlide > 1) {
    currentPresentationSlide -= 1;
    updatePresentationSlide();
  }
});

nextSlideButton?.addEventListener("click", () => {
  if (currentPresentationSlide < presentationSlideTotal) {
    currentPresentationSlide += 1;
    updatePresentationSlide();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" && currentPresentationSlide > 1) {
    currentPresentationSlide -= 1;
    updatePresentationSlide();
  } else if (
    event.key === "ArrowRight" &&
    currentPresentationSlide < presentationSlideTotal
  ) {
    currentPresentationSlide += 1;
    updatePresentationSlide();
  }
});

for (const button of languageButtons) {
  button.addEventListener("click", () => {
    const language = button.getAttribute("data-language");

    if (language === "es" || language === "en") {
      setLanguage(language);
    }
  });
}
