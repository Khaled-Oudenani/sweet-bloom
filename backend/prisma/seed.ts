// import "dotenv/config";
// import bcrypt from "bcryptjs";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   // ───── Admin ─────
//   const email = process.env.ADMIN_EMAIL;
//   const password = process.env.ADMIN_PASSWORD;
//   if (!email || !password) throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD missing in .env");

//   await prisma.admin.upsert({
//     where: { email },
//     update: {},
//     create: { email, passwordHash: await bcrypt.hash(password, 12), name: "Admin" },
//   });

//   // ───── Categories ─────
//   const categories = [
//     { name: "Cakes", slug: "cakes", sortOrder: 1 },
//     { name: "Macarons", slug: "macarons", sortOrder: 2 },
//     { name: "Cookies", slug: "cookies", sortOrder: 3 },
//     { name: "Cupcakes", slug: "cupcakes", sortOrder: 4 },
//     { name: "Brownies", slug: "brownies", sortOrder: 5 },
//     { name: "Pastries", slug: "pastries", sortOrder: 6 },
//   ];
//   for (const c of categories) {
//     await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
//   }

//   // ───── Dietary tags & flavors ─────
//   const tags = ["Vegan", "Gluten-Free", "Nut-Free", "Low Sugar", "Halal"];
//   for (const name of tags) {
//     const slug = name.toLowerCase().replace(/\s+/g, "-");
//     await prisma.dietaryTag.upsert({ where: { slug }, update: {}, create: { name, slug } });
//   }
//   const flavors = ["Strawberry", "Chocolate", "Pistachio", "Salted Caramel", "Lemon", "Vanilla"];
//   for (const name of flavors) {
//     const slug = name.toLowerCase().replace(/\s+/g, "-");
//     await prisma.flavor.upsert({ where: { slug }, update: {}, create: { name, slug } });
//   }

//   // ───── Delivery zones (أسعار تجريبية، عدّلها لاحقًا) ─────
//   const zones = [
//     { wilaya: "Laghouat", fee: 300, freeAbove: 5000 },
//     { wilaya: "Djelfa", fee: 600, freeAbove: 8000 },
//     { wilaya: "Ghardaïa", fee: 700, freeAbove: 8000 },
//     { wilaya: "Alger", fee: 800, freeAbove: 10000 },
//     { wilaya: "Oran", fee: 900, freeAbove: 10000 },
//     { wilaya: "Constantine", fee: 900, freeAbove: 10000 },
//   ];
//   for (const z of zones) {
//     await prisma.deliveryZone.upsert({ where: { wilaya: z.wilaya }, update: {}, create: z });
//   }

//   // ───── Coupon ─────
//   await prisma.coupon.upsert({
//     where: { code: "BLOOM20" },
//     update: {},
//     create: { code: "BLOOM20", type: "PERCENT", value: 20, minOrder: 2000 },
//   });


//   // ───── Products ─────
//   const products = [
//     {
//       name: "Strawberry Blossom Cloud Cake",
//       slug: "strawberry-blossom-cloud-cake",
//       category: "cakes",
//       badge: "BESTSELLER" as const,
//       shortDescription: "Layers of light genoise, whipped vanilla buttercream and fresh strawberries.",
//       isFeatured: true,
//       tags: ["halal"],
//       flavors: ["strawberry", "vanilla"],
//       variants: [
//         { label: '6"', serves: "4-6 guests", price: 4500, stock: 10 },
//         { label: '8"', serves: "8-10 guests", price: 6500, stock: 10 },
//         { label: '10"', serves: "12-16 guests", price: 8500, stock: 5 },
//       ],
//     },
//     {
//       name: "Pastel Parisian Macaron Box",
//       slug: "pastel-parisian-macaron-box",
//       category: "macarons",
//       badge: "CHEFS_PICK" as const,
//       shortDescription: "Assorted rose, pistachio, salted caramel and chocolate macarons.",
//       isFeatured: true,
//       tags: ["gluten-free", "halal"],
//       flavors: ["pistachio", "salted-caramel"],
//       variants: [
//         { label: "Box of 6", serves: "6 pieces", price: 1800, stock: 30 },
//         { label: "Box of 12", serves: "12 pieces", price: 3200, stock: 20 },
//       ],
//     },
//     {
//       name: "Belgian Triple Chocolate Brownies",
//       slug: "belgian-triple-chocolate-brownies",
//       category: "brownies",
//       badge: "POPULAR" as const,
//       shortDescription: "Dense dark chocolate brownies with sea salt flakes.",
//       isFeatured: true,
//       tags: ["halal"],
//       flavors: ["chocolate"],
//       variants: [
//         { label: "Box of 6", serves: "6 pieces", price: 1500, stock: 25 },
//         { label: "Box of 12", serves: "12 pieces", price: 2800, stock: 15 },
//       ],
//     },
//     {
//       name: "Salted Caramel Cookies",
//       slug: "salted-caramel-cookies",
//       category: "cookies",
//       badge: "NEW" as const,
//       shortDescription: "Chewy cookies with molten salted caramel centers.",
//       isFeatured: false,
//       tags: ["halal"],
//       flavors: ["salted-caramel"],
//       variants: [
//         { label: "Box of 4", serves: "4 pieces", price: 900, stock: 40 },
//         { label: "Box of 8", serves: "8 pieces", price: 1700, stock: 30 },
//       ],
//     },
//     {
//       name: "Tahitian Vanilla Cupcakes",
//       slug: "tahitian-vanilla-cupcakes",
//       category: "cupcakes",
//       badge: null,
//       shortDescription: "Delicate sponge with velvety Swiss meringue buttercream.",
//       isFeatured: false,
//       tags: ["halal"],
//       flavors: ["vanilla", "strawberry"],
//       variants: [{ label: "Box of 6", serves: "6 pieces", price: 1600, stock: 20 }],
//     },
//     {
//       name: "Pistachio Raspberry Tartlet Duo",
//       slug: "pistachio-raspberry-tartlet-duo",
//       category: "pastries",
//       badge: "LIMITED" as const,
//       shortDescription: "Almond pâte sucrée filled with silky pistachio frangipane.",
//       isFeatured: false,
//       tags: ["halal"],
//       flavors: ["pistachio"],
//       variants: [{ label: "Set of 2", serves: "2 tartlets", price: 1200, stock: 12 }],
//     },
//   ];

//   for (const p of products) {
//     const category = await prisma.category.findUniqueOrThrow({ where: { slug: p.category } });
//     await prisma.product.upsert({
//       where: { slug: p.slug },
//       update: {},
//       create: {
//         name: p.name,
//         slug: p.slug,
//         shortDescription: p.shortDescription,
//         badge: p.badge,
//         isFeatured: p.isFeatured,
//         categoryId: category.id,
//         variants: { create: p.variants },
//         dietaryTags: { connect: p.tags.map((slug) => ({ slug })) },
//         flavors: { connect: p.flavors.map((slug) => ({ slug })) },
//       },
//     });
//   }

//   console.log("✅ Seed completed");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(() => prisma.$disconnect());

// v2


import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ───── Admin ─────
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD missing in .env");
  }

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      name: "Admin",
    },
  });

  // ───── Categories ─────
  const categories = [
    { name: "Cakes", slug: "cakes", sortOrder: 1 },
    { name: "Macarons", slug: "macarons", sortOrder: 2 },
    { name: "Cookies", slug: "cookies", sortOrder: 3 },
    { name: "Cupcakes", slug: "cupcakes", sortOrder: 4 },
    { name: "Brownies", slug: "brownies", sortOrder: 5 },
    { name: "Pastries", slug: "pastries", sortOrder: 6 },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  // ───── Dietary Tags & Flavors ─────
  const tags = ["Vegan", "Gluten-Free", "Nut-Free", "Low Sugar", "Halal"];

  for (const name of tags) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");

    await prisma.dietaryTag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  const flavors = [
    "Strawberry",
    "Chocolate",
    "Pistachio",
    "Salted Caramel",
    "Lemon",
    "Vanilla",
  ];

  for (const name of flavors) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");

    await prisma.flavor.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  // ───── Delivery Zones ─────
  const zones = [
    { wilaya: "Laghouat", fee: 300, freeAbove: 5000 },
    { wilaya: "Djelfa", fee: 600, freeAbove: 8000 },
    { wilaya: "Ghardaïa", fee: 700, freeAbove: 8000 },
    { wilaya: "Alger", fee: 800, freeAbove: 10000 },
    { wilaya: "Oran", fee: 900, freeAbove: 10000 },
    { wilaya: "Constantine", fee: 900, freeAbove: 10000 },
  ];

  for (const z of zones) {
    await prisma.deliveryZone.upsert({
      where: { wilaya: z.wilaya },
      update: {},
      create: z,
    });
  }

  // ───── Coupon ─────
  await prisma.coupon.upsert({
    where: { code: "BLOOM20" },
    update: {},
    create: {
      code: "BLOOM20",
      type: "PERCENT",
      value: 20,
      minOrder: 2000,
    },
  });

  // ───── Products ─────
  const products = [
    {
      name: "Strawberry Blossom Cloud Cake",
      slug: "strawberry-blossom-cloud-cake",
      category: "cakes",
      badge: "BESTSELLER" as const,
      shortDescription:
        "Layers of light genoise, whipped vanilla buttercream and fresh strawberries.",
      isFeatured: true,
      tags: ["halal"],
      flavors: ["strawberry", "vanilla"],
      variants: [
        { label: '6"', serves: "4-6 guests", price: 4500, stock: 10 },
        { label: '8"', serves: "8-10 guests", price: 6500, stock: 10 },
        { label: '10"', serves: "12-16 guests", price: 8500, stock: 5 },
      ],
    },
    {
      name: "Pastel Parisian Macaron Box",
      slug: "pastel-parisian-macaron-box",
      category: "macarons",
      badge: "CHEFS_PICK" as const,
      shortDescription:
        "Assorted rose, pistachio, salted caramel and chocolate macarons.",
      isFeatured: true,
      tags: ["gluten-free", "halal"],
      flavors: ["pistachio", "salted-caramel"],
      variants: [
        { label: "Box of 6", serves: "6 pieces", price: 1800, stock: 30 },
        { label: "Box of 12", serves: "12 pieces", price: 3200, stock: 20 },
      ],
    },
    {
      name: "Belgian Triple Chocolate Brownies",
      slug: "belgian-triple-chocolate-brownies",
      category: "brownies",
      badge: "POPULAR" as const,
      shortDescription:
        "Dense dark chocolate brownies with sea salt flakes.",
      isFeatured: true,
      tags: ["halal"],
      flavors: ["chocolate"],
      variants: [
        { label: "Box of 6", serves: "6 pieces", price: 1500, stock: 25 },
        { label: "Box of 12", serves: "12 pieces", price: 2800, stock: 15 },
      ],
    },
    {
      name: "Salted Caramel Cookies",
      slug: "salted-caramel-cookies",
      category: "cookies",
      badge: "NEW" as const,
      shortDescription:
        "Chewy cookies with molten salted caramel centers.",
      isFeatured: false,
      tags: ["halal"],
      flavors: ["salted-caramel"],
      variants: [
        { label: "Box of 4", serves: "4 pieces", price: 900, stock: 40 },
        { label: "Box of 8", serves: "8 pieces", price: 1700, stock: 30 },
      ],
    },
    {
      name: "Tahitian Vanilla Cupcakes",
      slug: "tahitian-vanilla-cupcakes",
      category: "cupcakes",
      badge: null,
      shortDescription:
        "Delicate sponge with velvety Swiss meringue buttercream.",
      isFeatured: false,
      tags: ["halal"],
      flavors: ["vanilla", "strawberry"],
      variants: [
        { label: "Box of 6", serves: "6 pieces", price: 1600, stock: 20 },
      ],
    },
    {
      name: "Pistachio Raspberry Tartlet Duo",
      slug: "pistachio-raspberry-tartlet-duo",
      category: "pastries",
      badge: "LIMITED" as const,
      shortDescription:
        "Almond pâte sucrée filled with silky pistachio frangipane.",
      isFeatured: false,
      tags: ["halal"],
      flavors: ["pistachio"],
      variants: [
        { label: "Set of 2", serves: "2 tartlets", price: 1200, stock: 12 },
      ],
    },
  ];

  for (const p of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: p.category },
    });

    // Base price = lowest price among product variants
    const basePrice = Math.min(...p.variants.map((v) => v.price));

    await prisma.product.upsert({
      where: { slug: p.slug },

      // Update the base price for existing products
      update: {
        basePrice,
      },

      // Create new products with their base price
      create: {
        basePrice,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        badge: p.badge,
        isFeatured: p.isFeatured,
        categoryId: category.id,
        variants: {
          create: p.variants,
        },
        dietaryTags: {
          connect: p.tags.map((slug) => ({ slug })),
        },
        flavors: {
          connect: p.flavors.map((slug) => ({ slug })),
        },
      },
    });
  }

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
