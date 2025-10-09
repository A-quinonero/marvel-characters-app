/// <reference types="cypress" />

describe("Flujo completo Marvel (buscar → detalle → favoritos → quitar)", () => {
  beforeEach(() => {
    cy.clearLocalStorage("favorites");

    // ÚNICA intercept necesaria en cliente: la búsqueda por nombre
    // Tu fetchCharacters espera { results: [...] }
    cy.intercept("GET", "**/api/marvel/characters**", (req) => {
      const url = new URL(req.url);
      const q = (url.searchParams.get("nameStartsWith") || "").toLowerCase();

      if (q === "adam warlock") {
        req.reply({ fixture: "characters.adam-warlock.json" }); // { results: [ {…} ] }
      } else {
        req.reply({ statusCode: 200, body: { results: [] } });
      }
    }).as("search");

    cy.visit("/");
  });

  it("permite buscar, ver detalle, añadir a favoritos, ver en favoritos y eliminar", () => {
    // Grid visible
    cy.get("[data-cy=character-grid]", { timeout: 10000 }).should("be.visible");

    // Buscar (con debounce 300ms)
    cy.get("[data-cy=search-input]").clear().type("Adam Warlock");
    cy.wait("@search");

    // Asegura que aparece la card
    cy.contains("[data-cy=character-card]", "Adam Warlock", { timeout: 10000 })
      .scrollIntoView()
      .should("be.visible");

    // Entrar al detalle desde el link de la card
    cy.contains("[data-cy=character-card]", "Adam Warlock").within(() => {
      cy.get("a").first().click();
    });

    // En Next App Router el detalle/cómics vienen del SSR (MOCK_API=1), no hay XHR que esperar.
    cy.location("pathname", { timeout: 10000 }).should("match", /\/character\/\d+/);
    cy.get("h1", { timeout: 10000 }).should("contain.text", "Adam Warlock");

    // Marcar favorito en el detalle
    cy.get("[data-cy=detail-favorite-button]").click();

    // Ir a favoritos desde el header
    cy.get("[data-cy=header-favorites-button]").click();
    cy.url().should("include", "?favorites=1");

    // Debe aparecer en la lista de favoritos
    cy.contains("[data-cy=character-card]", "Adam Warlock")
      .scrollIntoView()
      .should("be.visible");

    // Quitar de favoritos desde la card
    cy.contains("[data-cy=character-card]", "Adam Warlock").within(() => {
      cy.get("[data-cy=favorite-toggle-button]").click();
    });

    // Ya no aparece
    cy.contains("[data-cy=character-card]", "Adam Warlock").should("not.exist");

    // Contador en header = 0
    cy.get("[data-cy=header-favorites-button]").should("contain.text", "0");

    // Volver a home
    cy.get("[data-cy=header-logo]").click();
    cy.location("pathname").should("eq", "/");
    cy.get("[data-cy=search-input]").should("be.visible");
  });
});
