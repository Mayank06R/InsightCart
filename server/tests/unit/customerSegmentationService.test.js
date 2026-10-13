import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const Order = require("../../models/Order");
const { REVENUE_STATUSES } = require("../../utils/queryHelpers");
const customerSegmentationService = require("../../services/customerSegmentationService");

describe("customerSegmentationService.getCustomerSegments", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-13T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("scores customers and assigns expected RFM segments from aggregation results", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValue([
      {
        customerId: "customer-a",
        name: "Avery Champion",
        email: "avery@example.com",
        city: "Mumbai",
        country: "India",
        lastPurchase: new Date("2026-10-12T12:00:00.000Z"),
        frequency: 10,
        monetary: 1000,
      },
      {
        customerId: "customer-b",
        name: "Blake Potential",
        email: "blake@example.com",
        city: "Pune",
        country: "India",
        lastPurchase: new Date("2026-09-01T12:00:00.000Z"),
        frequency: 5,
        monetary: 500,
      },
      {
        customerId: "customer-c",
        name: "Casey Hibernating",
        email: "casey@example.com",
        city: "Delhi",
        country: "India",
        lastPurchase: new Date("2026-05-01T12:00:00.000Z"),
        frequency: 2,
        monetary: 100,
      },
    ]);

    const result = await customerSegmentationService.getCustomerSegments();

    expect(result.totalCustomers).toBe(3);
    expect(result.customers).toHaveLength(3);
    expect(result.customers[0]).toMatchObject({
      customerId: "customer-a",
      recencyDays: 1,
      recencyDaysScore: 5,
      frequencyScore: 4,
      monetaryScore: 4,
      rfmScore: "544",
      segment: "Champions",
    });

    const segmentsByName = Object.fromEntries(
      result.segments.map((segment) => [segment.name, segment])
    );
    expect(segmentsByName.Champions).toMatchObject({ count: 1, revenue: 1000 });
    expect(segmentsByName["Potential Loyalists"]).toMatchObject({ count: 1, revenue: 500 });
    expect(segmentsByName.Hibernating).toMatchObject({ count: 1, revenue: 100 });
    expect(result.segments.reduce((sum, segment) => sum + segment.count, 0)).toBe(3);
  });

  it("uses only the application's eligible revenue statuses in the aggregation", async () => {
    const aggregateSpy = vi.spyOn(Order, "aggregate").mockResolvedValue([]);

    const result = await customerSegmentationService.getCustomerSegments();

    expect(aggregateSpy).toHaveBeenCalledOnce();
    expect(aggregateSpy.mock.calls[0][0][0]).toEqual({
      $match: { status: { $in: REVENUE_STATUSES } },
    });
    expect(result).toMatchObject({ totalCustomers: 0, customers: [] });
    expect(result.segments.every((segment) => segment.count === 0 && segment.revenue === 0)).toBe(true);
  });
});
