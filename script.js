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
const archiveCarousel = document.querySelector("#archive-carousel");
const archiveCarouselImage = document.querySelector("#archive-carousel-image");
const archiveCarouselCaption = document.querySelector("#archive-carousel-caption");
const archiveCarouselCount = document.querySelector("#archive-carousel-count");
const archiveCarouselPrevious = document.querySelector(
  "#archive-carousel-previous",
);
const archiveCarouselNext = document.querySelector("#archive-carousel-next");
const archiveCarouselError = document.querySelector("#archive-carousel-error");
const archiveCarouselImages = [
  {
    src: "assets/liber/diapositiva-18-2.png",
    esAlt:
      "Afiche de la Feria Internacional del Libro de Cusco 2020 y sus tiendas virtuales",
    enAlt: "Poster for the 2020 Cusco International Book Fair and its virtual stores",
    esCaption: "Afiche de FIL Cusco 2020",
    enCaption: "FIL Cusco 2020 poster",
  },
  {
    src: "assets/liber/diapositiva-18-3.jpeg",
    esAlt: "Gráfica promocional de las tiendas virtuales de FIL Cusco 2020",
    enAlt: "Promotional graphic for the FIL Cusco 2020 virtual stores",
    esCaption: "Promoción de tiendas virtuales",
    enCaption: "Virtual stores promotion",
  },
  {
    src: "assets/liber/diapositiva-20-1.jpg",
    esAlt: "Panel de administración de la página de Facebook de FIL Cusco",
    enAlt: "FIL Cusco Facebook page administration dashboard",
    esCaption: "Gestión de la página de FIL Cusco",
    enCaption: "FIL Cusco page management",
  },
  {
    src: "assets/liber/diapositiva-20-3.png",
    esAlt:
      "Gráfica de FIL Cusco 2020 con el número de invitados nacionales e internacionales",
    enAlt:
      "FIL Cusco 2020 graphic showing the number of national and international guests",
    esCaption: "Invitados nacionales e internacionales",
    enCaption: "National and international guests",
  },
  {
    src: "assets/liber/diapositiva-20-4.jpeg",
    esAlt: "Afiche de actividades del programa infantil de FIL Cusco",
    enAlt: "Poster of children's program activities at FIL Cusco",
    esCaption: "Actividades culturales",
    enCaption: "Cultural activities",
  },
  {
    src: "assets/liber/diapositiva-22-1.jpeg",
    esAlt:
      "Afiche de cierre de la Feria Internacional del Libro de Cusco 2020",
    enAlt: "Closing poster for the 2020 Cusco International Book Fair",
    esCaption: "Cierre de FIL Cusco 2020",
    enCaption: "FIL Cusco 2020 closing",
  },
];
let currentArchiveCarouselImage = 0;

const projectsSection = document.querySelector("#proyectos");
const talksSection = document.querySelector("#ponencias");
const digitalInitiativesSection = document.querySelector("#iniciativas-digitales");

if (projectsSection && talksSection) {
  projectsSection.after(talksSection);
}

if (digitalInitiativesSection && archiveCarousel) {
  digitalInitiativesSection.append(archiveCarousel);
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
  updateArchiveCarousel();

  if (pageDescription) {
    pageDescription.setAttribute(
      "content",
      language === "es"
        ? "Sitio web personal de Susan."
        : "Susan's personal website.",
    );
  }

  document.title = language === "es" ? "Website Susan" : "Susan's Website";

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
    `assets/liber/presentacion-completa/diapositiva-18-1/Diapositiva${slideNumber}.png`;
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

function updateArchiveCarousel() {
  if (
    !archiveCarouselImage ||
    !archiveCarouselCaption ||
    !archiveCarouselCount
  ) {
    return;
  }

  const image = archiveCarouselImages[currentArchiveCarouselImage];
  archiveCarouselImage.src = image.src;
  archiveCarouselImage.alt =
    currentLanguage === "es" ? image.esAlt : image.enAlt;
  archiveCarouselCaption.textContent =
    currentLanguage === "es" ? image.esCaption : image.enCaption;
  archiveCarouselCount.textContent =
    currentLanguage === "es"
      ? `${currentArchiveCarouselImage + 1} de ${archiveCarouselImages.length}`
      : `${currentArchiveCarouselImage + 1} of ${archiveCarouselImages.length}`;

  if (archiveCarouselPrevious) {
    archiveCarouselPrevious.disabled = currentArchiveCarouselImage === 0;
  }

  if (archiveCarouselNext) {
    archiveCarouselNext.disabled =
      currentArchiveCarouselImage === archiveCarouselImages.length - 1;
  }

  if (archiveCarouselError) {
    archiveCarouselError.hidden = true;
  }
}

archiveCarouselImage?.addEventListener("error", () => {
  if (archiveCarouselError) {
    archiveCarouselError.hidden = false;
  }
});

archiveCarouselPrevious?.addEventListener("click", () => {
  if (currentArchiveCarouselImage > 0) {
    currentArchiveCarouselImage -= 1;
    updateArchiveCarousel();
  }
});

archiveCarouselNext?.addEventListener("click", () => {
  if (currentArchiveCarouselImage < archiveCarouselImages.length - 1) {
    currentArchiveCarouselImage += 1;
    updateArchiveCarousel();
  }
});

archiveCarousel?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" && currentArchiveCarouselImage > 0) {
    event.preventDefault();
    event.stopPropagation();
    currentArchiveCarouselImage -= 1;
    updateArchiveCarousel();
  } else if (
    event.key === "ArrowRight" &&
    currentArchiveCarouselImage < archiveCarouselImages.length - 1
  ) {
    event.preventDefault();
    event.stopPropagation();
    currentArchiveCarouselImage += 1;
    updateArchiveCarousel();
  }
});

if (presentationSlide && presentationError) {
  presentationSlide.addEventListener("error", () => {
    presentationError.hidden = false;
  });
}

updateArchiveCarousel();

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
