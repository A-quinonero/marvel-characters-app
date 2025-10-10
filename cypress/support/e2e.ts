// cypress/support/e2e.ts
Cypress.on("uncaught:exception", (err) => {
  // Ignora únicamente este caso concreto
  if (/Failed to execute 'removeChild'/.test(err.message) || /NotFoundError/.test(err.name)) {
    return false; // evita que Cypress lo marque
  }
  // otros errores sí deben romper
  return true;
});

import "./commands";
