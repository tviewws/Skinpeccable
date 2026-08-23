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

// Pesapal config is read when the router module is first evaluated.
process.env.PESAPAL_CONSUMER_KEY = "key";
process.env.PESAPAL_CONSUMER_SECRET = "secret";
process.env.PESAPAL_IPN_URL =
  "https://skinpeccable.co.ke/api/payments/pesapal/ipn";
process.env.PESAPAL_CALLBACK_URL =
  "https://skinpeccable.co.ke/checkout/success";

const SANDBOX = "https://cybqa.pesapal.com";
const SANDBOX_PREFIX = "/pesapalv3";
const LIVE = "https://pay.pesapal.com";
const LIVE_PREFIX = "/v3";

const validOrder = {
  amount: 3800,
  customer: {
    firstName: "Amina",
    lastName: "Wanjiru",
    email: "amina@example.com",
    phone: "0712345678",
    address: "12 Denis Pritt Road",
    city: "Nairobi",
  },
  items: [{ name: "Glow Serum", price: 2500, qty: 1 }],
  notes: "Leave at the gate",
};

async function makeApp(env = "sandbox") {
  process.env.PESAPAL_ENV = env;
  vi.resetModules();
  const router = (await import("./payments.js")).default;
  const app = express();
  app.use(express.json());
  app.use("/api/payments", router);
  return app;
}

function mockToken(host = SANDBOX, prefix = SANDBOX_PREFIX, token = "tok-123") {
  return nock(host)
    .post(`${prefix}/api/Auth/RequestToken`)
    .reply(200, token ? { token } : {});
}

function mockIpn(ipnId = "ipn-1", host = SANDBOX, prefix = SANDBOX_PREFIX) {
  return nock(host)
    .post(`${prefix}/api/URLSetup/RegisterIPN`)
    .reply(200, ipnId ? { ipn_id: ipnId } : {});
}

beforeEach(() => {
  nock.cleanAll();
  nock.disableNetConnect();
  nock.enableNetConnect("127.0.0.1");
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

describe("POST /api/payments/pesapal/initiate", () => {
  it("rejects invalid order data before contacting Pesapal", async () => {
    const app = await makeApp();

    const res = await request(app)
      .post("/api/payments/pesapal/initiate")
      .send({
        ...validOrder,
        amount: -1,
        customer: { ...validOrder.customer, email: "nope" },
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Invalid order data");
    expect(Object.keys(res.body.details.fieldErrors)).toContain("amount");
    expect(nock.pendingMocks()).toEqual([]);
  });

  it.each([
    ["an empty cart", { items: [] }],
    [
      "a short phone number",
      { customer: { ...validOrder.customer, phone: "0712" } },
    ],
    ["a missing city", { customer: { ...validOrder.customer, city: "" } }],
  ])("rejects %s", async (_label, override) => {
    const app = await makeApp();

    const res = await request(app)
      .post("/api/payments/pesapal/initiate")
      .send({ ...validOrder, ...override });

    expect(res.status).toBe(400);
  });

  it("returns the Pesapal redirect URL and tracking id", async () => {
    mockToken();
    mockIpn();
    let submitted;
    let authHeader;
    nock(SANDBOX)
      .post(`${SANDBOX_PREFIX}/api/Transactions/SubmitOrderRequest`)
      .reply(function (_uri, body) {
        submitted = body;
        authHeader = this.req.headers.authorization;
        return [
          200,
          {
            redirect_url: "https://cybqa.pesapal.com/pay/abc",
            order_tracking_id: "track-9",
          },
        ];
      });
    const app = await makeApp();

    const res = await request(app)
      .post("/api/payments/pesapal/initiate")
      .send(validOrder);

    expect(res.body).toEqual({
      success: true,
      redirect_url: "https://cybqa.pesapal.com/pay/abc",
      order_tracking_id: "track-9",
    });
    expect(authHeader).toBe("Bearer tok-123");
    expect(submitted).toMatchObject({
      currency: "KES",
      amount: 3800,
      description: "Skinpeccable order — 1 item(s)",
      notification_id: "ipn-1",
      callback_url: process.env.PESAPAL_CALLBACK_URL,
      billing_address: {
        first_name: "Amina",
        last_name: "Wanjiru",
        email_address: "amina@example.com",
        phone_number: "0712345678",
        line_1: "12 Denis Pritt Road",
        city: "Nairobi",
        country_code: "KE",
      },
    });
    expect(submitted.id).toMatch(/^SKP-\d+$/);
  });

  it("registers the configured IPN URL for GET notifications", async () => {
    mockToken();
    let ipnBody;
    nock(SANDBOX)
      .post(`${SANDBOX_PREFIX}/api/URLSetup/RegisterIPN`)
      .reply((_uri, body) => {
        ipnBody = body;
        return [200, { ipn_id: "ipn-1" }];
      });
    nock(SANDBOX)
      .post(`${SANDBOX_PREFIX}/api/Transactions/SubmitOrderRequest`)
      .reply(200, { redirect_url: "https://pay", order_tracking_id: "t" });
    const app = await makeApp();

    await request(app).post("/api/payments/pesapal/initiate").send(validOrder);

    expect(ipnBody).toEqual({
      url: process.env.PESAPAL_IPN_URL,
      ipn_notification_type: "GET",
    });
  });

  it("uses the live Pesapal host when PESAPAL_ENV is live", async () => {
    mockToken(LIVE, LIVE_PREFIX);
    mockIpn("ipn-1", LIVE, LIVE_PREFIX);
    nock(LIVE)
      .post(`${LIVE_PREFIX}/api/Transactions/SubmitOrderRequest`)
      .reply(200, {
        redirect_url: "https://pay.pesapal.com/x",
        order_tracking_id: "t",
      });
    const app = await makeApp("live");

    const res = await request(app)
      .post("/api/payments/pesapal/initiate")
      .send(validOrder);

    expect(res.body.success).toBe(true);
    expect(nock.pendingMocks()).toEqual([]);
  });

  it("fails with a clear message when auth returns no token", async () => {
    mockToken(SANDBOX, SANDBOX_PREFIX, null);
    const app = await makeApp();

    const res = await request(app)
      .post("/api/payments/pesapal/initiate")
      .send(validOrder);

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Pesapal auth failed/);
  });

  it("fails when IPN registration returns no id", async () => {
    mockToken();
    mockIpn(null);
    const app = await makeApp();

    const res = await request(app)
      .post("/api/payments/pesapal/initiate")
      .send(validOrder);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("IPN registration failed");
  });

  it("fails when Pesapal returns no redirect URL", async () => {
    mockToken();
    mockIpn();
    nock(SANDBOX)
      .post(`${SANDBOX_PREFIX}/api/Transactions/SubmitOrderRequest`)
      .reply(200, { order_tracking_id: "t" });
    const app = await makeApp();

    const res = await request(app)
      .post("/api/payments/pesapal/initiate")
      .send(validOrder);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("No redirect URL returned from Pesapal");
  });
});

describe("GET /api/payments/pesapal/status", () => {
  it("requires an orderTrackingId", async () => {
    const app = await makeApp();

    const res = await request(app).get("/api/payments/pesapal/status");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: "orderTrackingId is required",
    });
  });

  it("returns the payment status description and raw payload", async () => {
    mockToken();
    nock(SANDBOX)
      .get(`${SANDBOX_PREFIX}/api/Transactions/GetTransactionStatus`)
      .query({ orderTrackingId: "track-9" })
      .reply(200, { payment_status_description: "Completed", amount: 3800 });
    const app = await makeApp();

    const res = await request(app).get(
      "/api/payments/pesapal/status?orderTrackingId=track-9"
    );

    expect(res.body).toEqual({
      success: true,
      status: "Completed",
      data: { payment_status_description: "Completed", amount: 3800 },
    });
  });

  it("returns 500 when the status lookup fails", async () => {
    mockToken();
    nock(SANDBOX)
      .get(`${SANDBOX_PREFIX}/api/Transactions/GetTransactionStatus`)
      .query(true)
      .reply(500, { error: "upstream" });
    const app = await makeApp();

    const res = await request(app).get(
      "/api/payments/pesapal/status?orderTrackingId=track-9"
    );

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/payments/pesapal/ipn", () => {
  it("acknowledges the notification with status 200 after checking the transaction", async () => {
    mockToken();
    nock(SANDBOX)
      .get(`${SANDBOX_PREFIX}/api/Transactions/GetTransactionStatus`)
      .query({ orderTrackingId: "track-9" })
      .reply(200, { payment_status_description: "Completed" });
    const app = await makeApp();

    const res = await request(app).get(
      "/api/payments/pesapal/ipn?orderTrackingId=track-9&orderMerchantReference=SKP-1&orderNotificationType=IPNCHANGE"
    );

    expect(res.body).toEqual({
      orderNotificationType: "IPNCHANGE",
      orderTrackingId: "track-9",
      orderMerchantReference: "SKP-1",
      status: "200",
    });
  });

  it("returns 500 when the transaction lookup fails", async () => {
    mockToken(SANDBOX, SANDBOX_PREFIX, null);
    const app = await makeApp();

    const res = await request(app).get(
      "/api/payments/pesapal/ipn?orderTrackingId=track-9"
    );

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Pesapal auth failed/);
  });
});
