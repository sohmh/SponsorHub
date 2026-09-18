import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function unauthenticatedContext(): TrpcContext {
  return {
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("sponsors authorization", () => {
  it("rejects sponsor list access without an authenticated team member", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.sponsors.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects sponsor creation without an authenticated team member", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.sponsors.create({ displayId: "SP-999", companyName: "Example Co" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
