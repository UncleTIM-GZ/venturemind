import { describe, it, expect } from "vitest";
import { ok, created, error, unauthorized, notFound, validationError } from "../envelope";

describe("API Envelope", () => {
  describe("ok", () => {
    it("returns success response with data", async () => {
      const response = ok({ id: "123", name: "Test" });
      const body = await response.json();
      expect(body).toEqual({
        success: true,
        data: { id: "123", name: "Test" },
      });
      expect(response.status).toBe(200);
    });

    it("returns success response with pagination meta", async () => {
      const meta = { total: 100, page: 2, limit: 20, hasMore: true };
      const response = ok([{ id: "1" }], meta);
      const body = await response.json();
      expect(body).toEqual({
        success: true,
        data: [{ id: "1" }],
        meta: { total: 100, page: 2, limit: 20, hasMore: true },
      });
    });

    it("returns success without meta when not provided", async () => {
      const response = ok("simple data");
      const body = await response.json();
      expect(body.meta).toBeUndefined();
    });
  });

  describe("created", () => {
    it("returns 201 status", async () => {
      const response = created({ id: "new-123" });
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe("new-123");
    });
  });

  describe("error", () => {
    it("returns error response with message and code", async () => {
      const response = error("Something went wrong", "INTERNAL_ERROR", 500);
      const body = await response.json();
      expect(body).toEqual({
        success: false,
        error: "Something went wrong",
        code: "INTERNAL_ERROR",
      });
      expect(response.status).toBe(500);
    });

    it("defaults to 400 status", async () => {
      const response = error("Bad input", "BAD_INPUT");
      expect(response.status).toBe(400);
    });
  });

  describe("unauthorized", () => {
    it("returns 401 with UNAUTHORIZED code", async () => {
      const response = unauthorized();
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.code).toBe("UNAUTHORIZED");
    });
  });

  describe("notFound", () => {
    it("returns 404 with entity name in message", async () => {
      const response = notFound("Deal");
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toBe("Deal not found");
      expect(body.code).toBe("NOT_FOUND");
    });
  });

  describe("validationError", () => {
    it("returns 400 with VALIDATION_ERROR code", async () => {
      const response = validationError("name: Required");
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("name: Required");
      expect(body.code).toBe("VALIDATION_ERROR");
    });
  });
});
