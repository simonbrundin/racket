import { vi } from "vitest";

// Mocka @nuxt/ui för att undvika dispose-buggen
vi.mock("@nuxt/ui", () => ({}));
