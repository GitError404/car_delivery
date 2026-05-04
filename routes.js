(function () {
  const places = Array.isArray(window.roadPlaces) ? window.roadPlaces : [];
  const mapContainer = document.querySelector("#routes-map-canvas");
  const listContainer = document.querySelector("#routes-list-container");
  const routeFilterOptions = document.querySelector("#route-filter-options");
  const categoryFilterOptions = document.querySelector("#category-filter-options");
  const resultsMeta = document.querySelector("#routes-results-meta");
  const activeFilterLabel = document.querySelector("#routes-active-filter");
  const countEl = document.querySelector("#routes-count");
  const routeCountEl = document.querySelector("#routes-route-count");

  if (!mapContainer || !listContainer || !window.L) return;

  const state = {
    route: "all",
    category: "all",
    selectedId: places[0]?.id || null,
  };

  const routeOptions = ["all", ...new Set(places.map((place) => place.route))];
  const categoryOptions = ["all", ...new Set(places.map((place) => place.category))];
  const markers = new Map();

  if (countEl) countEl.textContent = String(places.length);
  if (routeCountEl) routeCountEl.textContent = String(routeOptions.length - 1);

  const map = L.map(mapContainer, {
    zoomControl: true,
    scrollWheelZoom: false,
  }).setView([49.2, 31.6], 6.5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  function makeFilterButton(value, label, group, currentValue) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "routes-filter-chip";
    if (value === currentValue) {
      button.classList.add("is-active");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.setAttribute("aria-pressed", "false");
    }
    button.textContent = label;
    button.addEventListener("click", () => {
      state[group] = value;
      renderFilters();
      renderPlaces();
    });
    return button;
  }

  function renderFilters() {
    if (routeFilterOptions) {
      routeFilterOptions.innerHTML = "";
      routeOptions.forEach((option) => {
        routeFilterOptions.append(
          makeFilterButton(option, option === "all" ? "Усі траси" : option, "route", state.route)
        );
      });
    }

    if (categoryFilterOptions) {
      categoryFilterOptions.innerHTML = "";
      categoryOptions.forEach((option) => {
        categoryFilterOptions.append(
          makeFilterButton(option, option === "all" ? "Усі формати" : option, "category", state.category)
        );
      });
    }
  }

  function getVisiblePlaces() {
    return places.filter((place) => {
      const routeMatch = state.route === "all" || place.route === state.route;
      const categoryMatch = state.category === "all" || place.category === state.category;
      return routeMatch && categoryMatch;
    });
  }

  function getMarkerIcon(place, isActive) {
    const tone = isActive ? "#86121c" : "#c91e2b";
    return L.divIcon({
      className: "routes-marker-wrapper",
      html: `<span class="routes-marker${isActive ? " is-active" : ""}" style="--marker-tone:${tone};"></span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -24],
    });
  }

  function focusPlace(place, options = {}) {
    state.selectedId = place.id;
    markers.forEach((marker, markerId) => {
      const markerPlace = places.find((item) => item.id === markerId);
      marker.setIcon(getMarkerIcon(markerPlace, markerId === state.selectedId));
    });

    if (!options.skipPan) {
      map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 8), {
        animate: true,
        duration: 0.5,
      });
    }

    const activeCard = listContainer.querySelector(`[data-place-id="${place.id}"]`);
    listContainer.querySelectorAll(".routes-place-card").forEach((card) => {
      card.classList.toggle("is-active", card.dataset.placeId === place.id);
    });

    if (activeCard && !options.skipScroll) {
      activeCard.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  function renderPlaces() {
    const visiblePlaces = getVisiblePlaces();
    const bounds = [];

    markers.forEach((marker) => marker.remove());
    markers.clear();
    listContainer.innerHTML = "";

    if (!visiblePlaces.some((place) => place.id === state.selectedId)) {
      state.selectedId = visiblePlaces[0]?.id || null;
    }

    if (!visiblePlaces.length) {
      listContainer.innerHTML = `
        <article class="routes-place-card">
          <h4>Поки що нічого не знайдено</h4>
          <p>Спробуй іншу трасу або інший тип зупинки. Це нормально для тестового набору даних.</p>
        </article>
      `;
      if (resultsMeta) {
        resultsMeta.textContent = "Показано 0 місць";
      }
      if (activeFilterLabel) {
        const routeText = state.route === "all" ? "Усі напрямки" : state.route;
        const categoryText = state.category === "all" ? "усі формати" : state.category.toLowerCase();
        activeFilterLabel.textContent = `${routeText} • ${categoryText}`;
      }
      map.setView([49.2, 31.6], 6.5);
      return;
    }

    visiblePlaces.forEach((place) => {
      const marker = L.marker([place.lat, place.lng], {
        icon: getMarkerIcon(place, place.id === state.selectedId),
      }).addTo(map);

      marker.bindPopup(
        `<strong>${place.name}</strong><br>${place.route} • ${place.km}<br>${place.category}`
      );
      marker.on("click", () => focusPlace(place, { skipPan: true, skipScroll: false }));
      markers.set(place.id, marker);
      bounds.push([place.lat, place.lng]);

      const card = document.createElement("article");
      card.className = "routes-place-card";
      card.dataset.placeId = place.id;
      if (place.id === state.selectedId) {
        card.classList.add("is-active");
      }

      const tagsMarkup = place.tags
        .map((tag) => `<li class="routes-tag">${tag}</li>`)
        .join("");

      card.innerHTML = `
        <div class="routes-place-top">
          <div>
            <p class="routes-place-route">${place.route} • ${place.km}</p>
            <h4>${place.name}</h4>
          </div>
          <span class="routes-place-category">${place.category}</span>
        </div>
        <p class="routes-place-city">${place.city}</p>
        <p>${place.description}</p>
        <ul class="routes-tags">${tagsMarkup}</ul>
        <p class="routes-place-accent">${place.accent}</p>
        <dl class="routes-place-meta">
          <div><dt>Адреса</dt><dd>${place.address}</dd></div>
          <div><dt>Години</dt><dd>${place.hours}</dd></div>
        </dl>
        <div class="routes-place-actions">
          <button type="button" class="button button-secondary routes-focus-button">Показати на карті</button>
          <a class="button button-primary" target="_blank" rel="noreferrer" href="https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=15/${place.lat}/${place.lng}">Відкрити карту</a>
        </div>
      `;

      card.addEventListener("click", (event) => {
        if (event.target.closest("a, button")) return;
        focusPlace(place);
      });

      card.querySelector(".routes-focus-button").addEventListener("click", () => focusPlace(place));
      listContainer.append(card);
    });

    if (bounds.length) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    if (resultsMeta) {
      resultsMeta.textContent = `Показано ${visiblePlaces.length} місць`;
    }

    if (activeFilterLabel) {
      const routeText = state.route === "all" ? "Усі напрямки" : state.route;
      const categoryText = state.category === "all" ? "усі формати" : state.category.toLowerCase();
      activeFilterLabel.textContent = `${routeText} • ${categoryText}`;
    }
  }

  renderFilters();
  renderPlaces();

  if (places[0]) {
    focusPlace(places[0], { skipPan: true, skipScroll: true });
  }
})();
