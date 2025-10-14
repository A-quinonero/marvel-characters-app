/// <reference types="cypress" />

describe("Flujo completo Marvel (buscar → detalle → favoritos → quitar)", () => {
  beforeEach(() => {
    cy.clearLocalStorage("favorites");

    cy.intercept("GET", "**/api/marvel/characters**", (req) => {
      const url = new URL(req.url);
      const q = (url.searchParams.get("nameStartsWith") || "").toLowerCase();

      if (q === "adam warlock") {
        req.reply({ fixture: "characters.adam-warlock.json" });
      } else {
        req.reply({ statusCode: 200, body: { results: [] } });
      }
    }).as("search");

    cy.visit("/");
  });

  it("permite buscar, ver detalle, añadir a favoritos, ver en favoritos y eliminar", () => {
    cy.get("[data-cy=character-grid]", { timeout: 10000 }).should("be.visible");

    cy.get("[data-cy=search-input]").clear();
    cy.get("[data-cy=search-input]").type("Adam Warlock");
    cy.wait("@search");

    cy.contains("[data-cy=character-card]", "Adam Warlock", { timeout: 10000 }).should("exist");
    cy.contains("[data-cy=character-card]", "Adam Warlock").scrollIntoView();
    cy.contains("[data-cy=character-card]", "Adam Warlock").should("be.visible");

    cy.intercept("GET", "**/character/*?_rsc=*").as("rscDetail");

    cy.get('a[href="/character/1010354"]').first().click();

    cy.wait("@rscDetail");

    cy.location("pathname", { timeout: 10000 }).should("match", /\/character\/\d+$/);
    cy.get("h1", { timeout: 10000 }).should("contain.text", "Adam Warlock");

    cy.get("[data-cy=detail-favorite-button]").click();

    cy.intercept("GET", "**/?favorites=1&_rsc=*").as("rscFav");

    cy.get("[data-cy=header-favorites-button]").click();

    cy.wait("@rscFav");
    cy.location("search", { timeout: 10000 }).should("include", "favorites=1");

    cy.get('a[href="/character/1010354"]').as("adamLink");
    cy.get("@adamLink").scrollIntoView();
    cy.get("@adamLink").should("be.visible");

    cy.get('a[href="/character/1010354"]')
      .parents('[data-cy="character-card"]')
      .first()
      .find('[data-cy="favorite-toggle-button"]')
      .click();

    cy.get('a[href="/character/1010354"]').should("not.exist");
    cy.get("[data-cy=header-favorites-button]").should("contain.text", "0");

    cy.get("[data-cy=header-logo]").click();
    cy.location("pathname", { timeout: 10000 }).should("eq", "/");
    cy.get("[data-cy=search-input]").should("be.visible");
  });
});
