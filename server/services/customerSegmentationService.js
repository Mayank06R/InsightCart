const Order = require("../models/Order");
const { REVENUE_STATUSES, round2 } = require("../utils/queryHelpers");

// Assign relative 1-5 scores based on each metric's rank among customers.
// Recency is inverted: fewer days since the last purchase earns a higher score.
function scoreCustomers(customers, field, lowerIsBetter = false) {
  const uniqueValues = [
    ...new Set(customers.map((customer) => customer[field])),
  ].sort((a, b) => a - b);

  if (uniqueValues.length === 0) return;

  customers.forEach((customer) => {
    const rank = uniqueValues.indexOf(customer[field]);
    const bucket = Math.min(
      4,
      Math.floor((rank / uniqueValues.length) * 5)
    );

    customer[`${field}Score`] = lowerIsBetter
      ? 5 - bucket
      : 1 + bucket;
  });
}

function getSegment({ recencyScore, frequencyScore, monetaryScore }) {
  if (recencyScore >= 4 && frequencyScore >= 4 && monetaryScore >= 4) {
    return "Champions";
  }
  if (frequencyScore >= 4 && recencyScore >= 3) {
    return "Loyal Customers";
  }
  if (recencyScore >= 4 && frequencyScore >= 2) {
    return "Potential Loyalists";
  }
  if (recencyScore <= 2 && frequencyScore >= 3) {
    return "At Risk";
  }
  if (recencyScore <= 2 && frequencyScore <= 2) {
    return "Hibernating";
  }
  return "Needs Attention";
}

async function getCustomerSegments() {
  const customers = await Order.aggregate([
    {
      $match: {
        status: { $in: REVENUE_STATUSES },
      },
    },
    {
      $group: {
        _id: "$customer",
        lastPurchase: { $max: "$createdAt" },
        frequency: { $sum: 1 },
        monetary: { $sum: "$totalAmount" },
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "_id",
        as: "customerInfo",
      },
    },
    { $unwind: "$customerInfo" },
    {
      $project: {
        _id: 0,
        customerId: { $toString: "$_id" },
        name: "$customerInfo.name",
        email: "$customerInfo.email",
        city: "$customerInfo.city",
        country: "$customerInfo.country",
        lastPurchase: 1,
        frequency: 1,
        monetary: { $round: ["$monetary", 2] },
      },
    },
  ]);

  const now = Date.now();
  customers.forEach((customer) => {
    customer.recencyDays = Math.max(
      0,
      Math.floor(
        (now - new Date(customer.lastPurchase).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    customer.monetary = round2(customer.monetary);
  });

  scoreCustomers(customers, "recencyDays", true);
  scoreCustomers(customers, "frequency");
  scoreCustomers(customers, "monetary");

  customers.forEach((customer) => {
    customer.segment = getSegment({
      recencyScore: customer.recencyDaysScore,
      frequencyScore: customer.frequencyScore,
      monetaryScore: customer.monetaryScore,
    });
    customer.rfmScore =
      `${customer.recencyDaysScore}` +
      `${customer.frequencyScore}` +
      `${customer.monetaryScore}`;
  });

  const segmentNames = [
    "Champions",
    "Loyal Customers",
    "Potential Loyalists",
    "At Risk",
    "Hibernating",
    "Needs Attention",
  ];

  const segments = segmentNames.map((name) => {
    const members = customers.filter((customer) => customer.segment === name);
    return {
      name,
      count: members.length,
      revenue: round2(
        members.reduce((total, customer) => total + customer.monetary, 0)
      ),
    };
  });

  customers.sort((a, b) => b.monetary - a.monetary);

  return {
    totalCustomers: customers.length,
    segments,
    customers,
  };
}

module.exports = { getCustomerSegments };