// @vitest-environment node
import express from "express";
import nock from "nock";
import request from "supertest";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

// Odoo credentials are read when the router module is first evaluated.
process.env.ODOO_URL = "https://odoo.test";
process.env.ODOO_DB = "skinpeccable";
process.env.ODOO_USERNAME = "shop@skinpeccable.co.ke";
process.env.ODOO_API_KEY = "api-key";

const ODOO_HOST = "https://odoo.test";
const SESSION_COOKIE = "session_id=abc; Path=/";

// Queue of JSON-RPC payloads returned by successive call_kw requests, plus a
// log of the params each request sent.
let callResults;
let callLog;
let authFails;

function queueCall(result) {
  callResults.push({ result });
}

function queueCallError(message) {
  callResults.push({ error: { data: { message } } });
}

async function makeApp() {
  vi.resetModules();
  const router = (await import("./odoo.js")).default;
  const app = express();
  app.use(express.json());
  app.use("/api/odoo", router);
  return app;
}

beforeEach(() => {
  callResults = [];
  callLog = [];
  authFails = false;
  nock.cleanAll();
  nock.disableNetConnect();
  nock.enableNetConnect("127.0.0.1");

  nock(ODOO_HOST)
    .persist()
    .post("/web/session/authenticate")
    .reply(() =>
      authFails
        ? [200, { result: {} }]
        : [200, { result: { uid: 2 } }, { "set-cookie": SESSION_COOKIE }]
    );

  nock(ODOO_HOST)
    .persist()
    .post("/web/dataset/call_kw")
    .reply((_uri, body) => {
      callLog.push(body.params);
      const next = callResults.shift();
      if (!next) {
        throw new Error(`Unexpected call_kw: ${JSON.stringify(body.params)}`);
      }
      return [200, next];
    });

  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  nock.cleanAll();
  vi.restoreAllMocks();
});

afterAll(() => {
  nock.enableNetConnect();
});

const rawProducts = [
  {
    id: 7,
    name: "Glow Serum",
    description: "<p>  Brightening serum </p>",
    description_sale: "sale copy",
    list_price: 2500,
    image_1920: "BASE64IMAGE",
    categ_id: [3, "Face Serums"],
    qty_available: 4,
    product_tag_ids: [1, 2],
  },
  {
    id: 8,
    name: "Sold Out Cream",
    description: false,
    description_sale: "<b>Rich cream</b>",
    list_price: 1800,
    image_1920: false,
    categ_id: [1, "Moisturisers"],
    qty_available: 0,
    product_tag_ids: false,
  },
  {
    id: 9,
    name: "Uncategorised Freebie",
    description: false,
    description_sale: false,
    list_price: 0,
    image_1920: false,
    categ_id: false,
    qty_available: 10,
  },
];

describe("GET /api/odoo/products", () => {
  it("shapes Odoo products for the storefront", async () => {
    queueCall(rawProducts);
    const app = await makeApp();

    const res = await request(app).get("/api/odoo/products");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.products).toEqual([
      {
        id: "odoo_7",
        name: "Glow Serum",
        brand: "Skinpeccable",
        category: "face-serums",
        price: 2500,
        description: "Brightening serum",
        image: "data:image/png;base64,BASE64IMAGE",
        tagIds: [1, 2],
      },
      {
        id: "odoo_8",
        name: "Sold Out Cream",
        brand: "Skinpeccable",
        category: "moisturisers",
        price: "SOLD OUT",
        description: "Rich cream",
        image: "/placeholder.png",
        tagIds: [],
      },
      {
        id: "odoo_9",
        name: "Uncategorised Freebie",
        brand: "Skinpeccable",
        category: "all",
        price: "SOLD OUT",
        description: "",
        image: "/placeholder.png",
        tagIds: [],
      },
    ]);
  });

  it("only requests published products", async () => {
    queueCall([]);
    const app = await makeApp();

    await request(app).get("/api/odoo/products");

    expect(callLog[0].model).toBe("product.template");
    expect(callLog[0].method).toBe("search_read");
    expect(callLog[0].args).toEqual([[["is_published", "=", true]]]);
  });

  it("serves the second request from cache", async () => {
    queueCall(rawProducts);
    const app = await makeApp();

    await request(app).get("/api/odoo/products");
    const res = await request(app).get("/api/odoo/products");

    expect(res.body.products).toHaveLength(3);
    expect(callLog).toHaveLength(1);
  });

  it("returns 500 with the Odoo error message", async () => {
    queueCallError("Access denied");
    const app = await makeApp();

    const res = await request(app).get("/api/odoo/products");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, error: "Access denied" });
  });

  it("returns 500 when authentication fails", async () => {
    authFails = true;
    const app = await makeApp();

    const res = await request(app).get("/api/odoo/products");

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/authentication failed/i);
  });

  it("authenticates once and reuses the session cookie across calls", async () => {
    const authRequests = [];
    const cookies = [];
    const app = await makeApp();

    nock.cleanAll();
    nock(ODOO_HOST)
      .persist()
      .post("/web/session/authenticate")
      .reply(function () {
        authRequests.push(this.req.path);
        return [200, { result: { uid: 2 } }, { "set-cookie": SESSION_COOKIE }];
      });
    nock(ODOO_HOST)
      .persist()
      .post("/web/dataset/call_kw")
      .reply(function () {
        cookies.push(this.req.headers.cookie);
        return [200, { result: [] }];
      });

    await request(app).get("/api/odoo/products");
    await request(app).get("/api/odoo/categories");

    expect(authRequests).toHaveLength(1);
    expect(cookies).toEqual([SESSION_COOKIE, SESSION_COOKIE]);
  });
});

describe("GET /api/odoo/categories", () => {
  it("derives unique slugged categories sorted by label after All Products", async () => {
    queueCall([
      { categ_id: [3, "Face Serums"] },
      { categ_id: [1, "Body Care"] },
      { categ_id: [3, "Face Serums"] },
      { categ_id: false },
    ]);
    const app = await makeApp();

    const res = await request(app).get("/api/odoo/categories");

    expect(res.body.categories).toEqual([
      { id: "all", label: "All Products" },
      { id: "body-care", label: "Body Care" },
      { id: "face-serums", label: "Face Serums" },
    ]);
  });

  it("caches the derived categories", async () => {
    queueCall([{ categ_id: [1, "Body Care"] }]);
    const app = await makeApp();

    await request(app).get("/api/odoo/categories");
    await request(app).get("/api/odoo/categories");

    expect(callLog).toHaveLength(1);
  });
});

describe("GET /api/odoo/warmup", () => {
  it("primes both caches so later reads hit no Odoo calls", async () => {
    queueCall(rawProducts);
    const app = await makeApp();

    const res = await request(app).get("/api/odoo/warmup");

    expect(res.body).toEqual({
      success: true,
      message: "Warmed up cache with 3 products and 3 categories",
    });

    const products = await request(app).get("/api/odoo/products");
    const categories = await request(app).get("/api/odoo/categories");

    expect(products.body.products).toHaveLength(3);
    expect(categories.body.categories).toHaveLength(3);
    expect(callLog).toHaveLength(1);
  });
});

describe("GET /api/odoo/tags", () => {
  it("returns id/name pairs and caches them", async () => {
    queueCall([
      { id: 1, name: "Acne", extra: "ignored" },
      { id: 2, name: "Oily Skin" },
    ]);
    const app = await makeApp();

    const res = await request(app).get("/api/odoo/tags");
    await request(app).get("/api/odoo/tags");

    expect(res.body.tags).toEqual([
      { id: 1, name: "Acne" },
      { id: 2, name: "Oily Skin" },
    ]);
    expect(callLog).toHaveLength(1);
  });
});

describe("GET /api/odoo/content-blocks", () => {
  const block = {
    id: 4,
    x_name: "Winter Glow",
    x_studio_subtitle: false,
    x_studio_link_url: false,
    x_studio_section_1: "Home Hero",
    x_studio_image: "IMG",
  };

  it("maps studio fields and defaults missing text to empty strings", async () => {
    queueCall([block]);
    const app = await makeApp();

    const res = await request(app).get("/api/odoo/content-blocks");

    expect(res.body.blocks).toEqual([
      {
        id: 4,
        title: "Winter Glow",
        subtitle: "",
        linkUrl: "",
        section: "Home Hero",
        image: "data:image/png;base64,IMG",
      },
    ]);
    expect(callLog[0].args).toEqual([[["x_active", "=", true]]]);
  });

  it("filters by section and caches each section separately", async () => {
    queueCall([block]);
    queueCall([]);
    const app = await makeApp();

    await request(app).get("/api/odoo/content-blocks?section=Home Hero");
    await request(app).get("/api/odoo/content-blocks?section=Banners");
    await request(app).get("/api/odoo/content-blocks?section=Home Hero");

    expect(callLog).toHaveLength(2);
    expect(callLog[0].args).toEqual([
      [
        ["x_active", "=", true],
        ["x_studio_section_1", "=", "Home Hero"],
      ],
    ]);
  });

  it("leaves the image null when the block has none", async () => {
    queueCall([{ ...block, x_studio_image: false }]);
    const app = await makeApp();

    const res = await request(app).get("/api/odoo/content-blocks");

    expect(res.body.blocks[0].image).toBeNull();
  });
});

describe("GET /api/odoo/discount/validate", () => {
  it("rejects a missing code without calling Odoo", async () => {
    const app = await makeApp();

    const res = await request(app).get("/api/odoo/discount/validate");

    expect(res.body).toEqual({ success: false, error: "No code provided." });
    expect(callLog).toHaveLength(0);
  });

  it("uppercases the code when searching loyalty rules", async () => {
    queueCall([{ id: 1, program_id: [5, "Promo"], minimum_amount: 0 }]);
    queueCall([
      { discount: 5, discount_mode: "percent", reward_type: "discount" },
    ]);
    const app = await makeApp();

    await request(app).get(
      "/api/odoo/discount/validate?code=muldibo5&subtotal=1000"
    );

    expect(callLog[0].args).toEqual([[["code", "=", "MULDIBO5"]]]);
  });

  it("returns a percentage discount for a matching rule", async () => {
    queueCall([{ id: 1, program_id: [5, "Promo"], minimum_amount: 1000 }]);
    queueCall([
      { discount: 5, discount_mode: "percent", reward_type: "discount" },
    ]);
    const app = await makeApp();

    const res = await request(app).get(
      "/api/odoo/discount/validate?code=MULDIBO5&subtotal=3500"
    );

    expect(res.body).toEqual({
      success: true,
      discount: { type: "percentage", value: 5, label: "5% off" },
    });
  });

  it("returns a fixed discount with a formatted label", async () => {
    queueCall([{ id: 1, program_id: [5, "Promo"], minimum_amount: 0 }]);
    queueCall([
      {
        discount: 1500,
        discount_mode: "fixed_amount",
        reward_type: "discount",
      },
    ]);
    const app = await makeApp();

    const res = await request(app).get(
      "/api/odoo/discount/validate?code=FLAT&subtotal=3500"
    );

    expect(res.body.discount).toEqual({
      type: "fixed",
      value: 1500,
      label: "KSh 1,500 off",
    });
  });

  it("enforces the minimum spend from the rule", async () => {
    queueCall([{ id: 1, program_id: [5, "Promo"], minimum_amount: 5000 }]);
    const app = await makeApp();

    const res = await request(app).get(
      "/api/odoo/discount/validate?code=MULDIBO5&subtotal=3500"
    );

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(
      "Minimum spend of KSh 5,000 required for this code."
    );
  });

  it("treats a missing subtotal as zero spend", async () => {
    queueCall([{ id: 1, program_id: [5, "Promo"], minimum_amount: 100 }]);
    const app = await makeApp();

    const res = await request(app).get(
      "/api/odoo/discount/validate?code=MULDIBO5"
    );

    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Minimum spend/);
  });

  it("falls back to matching a promo program by name", async () => {
    queueCall([]); // no matching loyalty.rule
    queueCall([{ id: 9, name: "MULDIBO5%" }]); // loyalty.program search
    queueCall([{ minimum_amount: 0 }]); // rules for that program
    queueCall([{ discount: 5, discount_mode: "percent" }]);
    const app = await makeApp();

    const res = await request(app).get(
      "/api/odoo/discount/validate?code=MULDIBO5&subtotal=3500"
    );

    expect(res.body.success).toBe(true);
    expect(callLog[1].args).toEqual([[["program_type", "=", "promo_code"]]]);
  });

  it("reports an invalid code when no program matches", async () => {
    queueCall([]);
    queueCall([{ id: 9, name: "SOMETHINGELSE" }]);
    const app = await makeApp();

    const res = await request(app).get(
      "/api/odoo/discount/validate?code=NOPE&subtotal=3500"
    );

    expect(res.body).toEqual({
      success: false,
      error: "Invalid discount code.",
    });
  });

  it("reports when the program has no reward", async () => {
    queueCall([{ id: 1, program_id: [5, "Promo"], minimum_amount: 0 }]);
    queueCall([]);
    const app = await makeApp();

    const res = await request(app).get(
      "/api/odoo/discount/validate?code=MULDIBO5&subtotal=3500"
    );

    expect(res.body).toEqual({
      success: false,
      error: "No reward found for this code.",
    });
  });

  it("returns a friendly error when Odoo fails", async () => {
    queueCallError("boom");
    const app = await makeApp();

    const res = await request(app).get(
      "/api/odoo/discount/validate?code=MULDIBO5&subtotal=3500"
    );

    expect(res.body).toEqual({
      success: false,
      error: "Could not validate code. Please try again.",
    });
  });
});

describe("POST /api/odoo/order", () => {
  const body = {
    customer: {
      name: "Amina Wanjiru",
      email: "amina@example.com",
      phone: "0712345678",
      address: "12 Denis Pritt Road",
      city: "Nairobi",
    },
    items: [{ name: "Glow Serum", price: 2500, qty: 2 }],
    total: 5300,
    deliveryFee: 300,
    deliveryZone: "Zone 2 — Central Nairobi",
    notes: "Leave at the gate",
  };

  it("reuses an existing customer and product and confirms the order", async () => {
    queueCall([{ id: 11, name: "Amina Wanjiru", email: "amina@example.com" }]);
    queueCall([{ id: 22, name: "Glow Serum" }]);
    queueCall([{ id: 33, name: "Delivery Fee" }]);
    queueCall(99); // sale.order create
    queueCall(true); // action_confirm
    const app = await makeApp();

    const res = await request(app).post("/api/odoo/order").send(body);

    expect(res.body).toEqual({
      success: true,
      sale_order_id: 99,
      message: "Order #99 created in Odoo",
    });

    const created = callLog[3].args[0];
    expect(created.partner_id).toBe(11);
    expect(created.order_line).toEqual([
      [
        0,
        0,
        {
          product_id: 22,
          name: "Glow Serum",
          product_uom_qty: 2,
          price_unit: 2500,
        },
      ],
      [
        0,
        0,
        {
          product_id: 33,
          name: "Delivery — Zone 2 — Central Nairobi",
          product_uom_qty: 1,
          price_unit: 300,
        },
      ],
    ]);
    expect(created.note).toContain("Customer note: Leave at the gate");
    expect(created.note).toContain("Delivery zone: Zone 2 — Central Nairobi");
    expect(created.note).toContain(
      "Delivery address: 12 Denis Pritt Road, Nairobi"
    );
    expect(created.note).toContain("Order total (incl. delivery): KES 5300");
    expect(callLog[4]).toMatchObject({
      model: "sale.order",
      method: "action_confirm",
      args: [[99]],
    });
  });

  it("creates the customer and product when they do not exist yet", async () => {
    queueCall([]); // res.partner search
    queueCall(12); // res.partner create
    queueCall([]); // product search
    queueCall(23); // product create
    queueCall(99); // sale.order create
    queueCall(true);
    const app = await makeApp();

    await request(app)
      .post("/api/odoo/order")
      .send({ ...body, deliveryFee: 0 });

    expect(callLog[1]).toMatchObject({
      model: "res.partner",
      method: "create",
    });
    expect(callLog[1].args[0]).toMatchObject({
      name: "Amina Wanjiru",
      email: "amina@example.com",
      phone: "0712345678",
      customer_rank: 1,
    });
    expect(callLog[3].args[0]).toMatchObject({
      name: "Glow Serum",
      list_price: 2500,
      type: "consu",
    });
  });

  it("omits the delivery line when there is no fee", async () => {
    queueCall([{ id: 11 }]);
    queueCall([{ id: 22 }]);
    queueCall(99);
    queueCall(true);
    const app = await makeApp();

    await request(app)
      .post("/api/odoo/order")
      .send({ ...body, deliveryFee: 0 });

    expect(callLog[2].args[0].order_line).toHaveLength(1);
  });

  it("falls back to first/last name when no full name is given", async () => {
    queueCall([{ id: 11 }]);
    queueCall([{ id: 22 }]);
    queueCall(99);
    queueCall(true);
    const app = await makeApp();

    await request(app)
      .post("/api/odoo/order")
      .send({
        ...body,
        deliveryFee: 0,
        customer: {
          firstName: "Amina",
          lastName: "Wanjiru",
          email: "amina@example.com",
        },
      });

    expect(callLog[0].args).toEqual([[["email", "=", "amina@example.com"]]]);
  });

  it("creates the delivery product once when it is missing", async () => {
    queueCall([{ id: 11 }]);
    queueCall([{ id: 22 }]);
    queueCall([]); // delivery product search
    queueCall(44); // delivery product create
    queueCall(99);
    queueCall(true);
    const app = await makeApp();

    await request(app).post("/api/odoo/order").send(body);

    expect(callLog[3].args[0]).toEqual({
      name: "Delivery Fee",
      list_price: 0,
      type: "service",
      sale_ok: true,
      purchase_ok: false,
    });
    expect(callLog[4].args[0].order_line[1][2].product_id).toBe(44);
  });

  it("returns 500 when Odoo rejects the order", async () => {
    queueCall([{ id: 11 }]);
    queueCall([{ id: 22 }]);
    queueCall([{ id: 33 }]);
    queueCallError("invalid order");
    const app = await makeApp();

    const res = await request(app).post("/api/odoo/order").send(body);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, error: "invalid order" });
  });
});
