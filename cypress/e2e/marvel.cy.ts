// cypress/e2e/marvel.cy.ts

describe("Flujo completo de usuario en la aplicación de Marvel", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.clearLocalStorage("favorites");
  });

  it("debería permitir a un usuario buscar un personaje, añadirlo a favoritos, verlo y eliminarlo", () => {
    cy.get("[data-cy=character-grid]").should("be.visible");
    cy.get("[data-cy=character-card]").should("have.length.greaterThan", 5);
    cy.get("[data-cy=search-input]").type("Adam Warlock");

    cy.intercept("GET", "/api/marvel/character/*").as("getCharacter");

    cy.contains("[data-cy=character-card]", "Adam Warlock").should("be.visible").click();

    cy.wait("@getCharacter");

    cy.url().should("include", "/character/");
    cy.get("h1").should("contain.text", "Adam Warlock");

    cy.get("[data-cy=detail-favorite-button]").click();
    cy.get("[data-cy=header-favorites-button]").click();
    cy.url().should("include", "?favorites=1");
    cy.contains("[data-cy=character-card]", "Adam Warlock").should("be.visible");
    
    cy.contains("[data-cy=character-card]", "Adam Warlock")
      .find("[data-cy=favorite-toggle-button]")
      .click();
      
    cy.contains("[data-cy=character-card]", "Adam Warlock").should("not.exist");
    cy.contains("0 Favorites").should("be.visible");
    cy.get("[data-cy=header-logo]").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.get("[data-cy=search-input]").should("be.visible");
  });
});