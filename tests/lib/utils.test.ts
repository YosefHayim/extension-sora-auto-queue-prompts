import { cn, generateUniqueId } from "../../src/lib/utils";

describe("lib/utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    });

    it("should handle undefined and null", () => {
      expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });

    it("should merge Tailwind classes correctly", () => {
      // Tailwind merge should deduplicate conflicting classes
      const result = cn("px-2 py-1", "px-4");
      expect(result).toContain("px-4");
      expect(result).not.toContain("px-2");
    });

    it("should handle empty strings", () => {
      expect(cn("foo", "", "bar")).toBe("foo bar");
    });

    it("should handle arrays", () => {
      expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
    });

    it("should handle objects", () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
    });

    it("should handle mixed inputs", () => {
      expect(cn("foo", ["bar", "baz"], { qux: true })).toBe("foo bar baz qux");
    });
  });

  describe("generateUniqueId", () => {
    it("should generate a unique ID", () => {
      const id1 = generateUniqueId();
      const id2 = generateUniqueId();
      expect(id1).not.toBe(id2);
    });

    it("should generate ID with timestamp prefix", () => {
      const id = generateUniqueId();
      expect(id).toMatch(/^\d+-/);
    });

    it("should generate ID with random suffix", () => {
      const id = generateUniqueId();
      const parts = id.split("-");
      expect(parts.length).toBeGreaterThan(1);
      // The second part should be a random string
      expect(parts[1]).toBeTruthy();
    });

    it("should generate different IDs on subsequent calls", () => {
      const ids = Array.from({ length: 10 }, () => generateUniqueId());
      const uniqueIds = new Set(ids);
      // All IDs should be unique (very high probability)
      expect(uniqueIds.size).toBe(10);
    });

    it("should generate IDs with consistent format", () => {
      const id = generateUniqueId();
      // Format: timestamp-randomString
      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });
});
