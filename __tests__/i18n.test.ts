import { describe, it, expect } from "vitest";
import { t, dirFor, locales } from "../lib/i18n";

describe("i18n Localization Engine", () => {
  it("translates keys for English", () => {
    expect(t("en", "prompt.generate")).toBe("Generate");
    expect(t("en", "templates.ecommerce")).toBe("E-commerce");
  });

  it("translates keys for Spanish", () => {
    expect(t("es", "prompt.generate")).toBe("Generar");
    expect(t("es", "templates.ecommerce")).toBe("Comercio electrónico");
  });

  it("translates keys for German", () => {
    expect(t("de", "prompt.generate")).toBe("Generieren");
    expect(t("de", "nav.settings")).toBe("Einstellungen");
  });

  it("correctly identifies RTL direction for Arabic and Urdu", () => {
    expect(dirFor("ar")).toBe("rtl");
    expect(dirFor("ur")).toBe("rtl");
    expect(dirFor("en")).toBe("ltr");
    expect(dirFor("fr")).toBe("ltr");
    expect(dirFor("de")).toBe("ltr");
  });

  it("has complete dictionary entries for all 6 supported locales", () => {
    expect(locales.length).toBe(6);
    const codes = locales.map((l) => l.code);
    expect(codes).toEqual(["en", "es", "fr", "de", "ar", "ur"]);
  });
});
