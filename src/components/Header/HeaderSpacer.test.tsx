/** @jest-environment node */

import React from "react";
import { renderToString } from "react-dom/server";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";
import "@testing-library/jest-dom";
import { HeaderSpacer } from "./HeaderSpacer";

describe("HeaderSpacer (SSR CSS)", () => {
  it("define height usando la variable CSS --header-h", () => {
    const sheet = new ServerStyleSheet();
    try {
      renderToString(
        <StyleSheetManager sheet={sheet.instance}>
          <HeaderSpacer />
        </StyleSheetManager>
      );
      const css = sheet.getStyleTags();
      expect(css).toMatch(/height:\s*var\(--header-h\)/);
    } finally {
      sheet.seal();
    }
  });
});
