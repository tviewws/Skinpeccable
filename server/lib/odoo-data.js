const PUBLISHED_PRODUCT_FIELDS = [
  "id",
  "name",
  "description",
  "description_sale",
  "list_price",
  "image_1920",
  "categ_id",
  "qty_available",
  "product_tag_ids",
];

async function fetchPublishedProducts(odooCall) {
  return odooCall(
    "product.template",
    "search_read",
    [[["is_published", "=", true]]],
    { fields: PUBLISHED_PRODUCT_FIELDS }
  );
}

function shapeProduct(product) {
  let description = "";
  if (product.description && typeof product.description === "string") {
    description = product.description.replace(/<[^>]*>/g, "").trim();
  } else if (
    product.description_sale &&
    typeof product.description_sale === "string"
  ) {
    description = product.description_sale.replace(/<[^>]*>/g, "").trim();
  }

  const inStock = product.qty_available > 0;

  return {
    id: `odoo_${product.id}`,
    name: product.name,
    brand: "Skinpeccable",
    category:
      product.categ_id?.[1]?.toLowerCase().replace(/\s+/g, "-") || "all",
    price: product.list_price > 0 && inStock ? product.list_price : "SOLD OUT",
    description,
    image: product.image_1920
      ? `data:image/png;base64,${product.image_1920}`
      : "/placeholder.png",
    tagIds: product.product_tag_ids || [],
  };
}

function shapeProducts(products) {
  return products.map(shapeProduct);
}

function shapeCategories(products) {
  const categoryMap = new Map();
  for (const product of products) {
    if (product.categ_id && product.categ_id[0]) {
      categoryMap.set(product.categ_id[0], product.categ_id[1]);
    }
  }

  return [
    { id: "all", label: "All Products" },
    ...[...categoryMap.entries()]
      .map(([, name]) => ({
        id: name.toLowerCase().replace(/\s+/g, "-"),
        label: name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];
}

module.exports = {
  fetchPublishedProducts,
  shapeProducts,
  shapeCategories,
};
