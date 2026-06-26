import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function unsplash(id: string, w = 800) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
}

async function main() {
  // ── Categories (slugs match STATIC_DEPARTMENTS in CategoryMenu) ─────────────
  const cat = async (name: string, slug: string, position: number) =>
    prisma.category.upsert({
      where: { slug },
      update: { name, position },
      create: { name, slug, position, isActive: true },
    });

  const cellphones   = await cat("Cellphones & Wearables", "cellphones-wearables", 1);
  const computers    = await cat("Computers & Tablets",    "computers-tablets",    2);
  const tvAudio      = await cat("TV, Audio & Video",      "tv-audio-video",       3);
  const beauty       = await cat("Beauty",                 "beauty",               4);
  const homeKitchen  = await cat("Home & Kitchen",         "home-kitchen",         5);
  const sport        = await cat("Sport",                  "sport",                6);
  const fashion      = await cat("Fashion",                "fashion",              7);
  const babyToddler  = await cat("Baby & Toddler",         "baby-toddler",         8);
  const health       = await cat("Health",                 "health",               9);
  const camping      = await cat("Camping & Outdoors",     "camping-outdoors",     10);
  const toys         = await cat("Toys",                   "toys",                 11);
  const books        = await cat("Books",                  "books",                12);
  const garden       = await cat("Garden, Pool & Patio",   "garden-pool-patio",    13);
  const luggage      = await cat("Luggage & Travel",       "luggage-travel",       14);
  const pets         = await cat("Pets",                   "pets",                 15);
  const cameras      = await cat("Cameras",                "cameras",              16);
  const deals        = await cat("Deals",                  "deals",                17);

  // Keep backwards-compatible alias slugs for existing product connections
  const electronics  = await cat("Electronics",            "electronics",          99);
  const homeLiving   = await cat("Home & Living",          "home-living",          99);
  const groceries    = await cat("Groceries",              "groceries",            99);
  const automotive   = await cat("Automotive",             "automotive",           99);
  const babyKids     = await cat("Baby & Kids",            "baby-kids",            99);
  const sports       = await cat("Sports & Outdoors",      "sports",               99);

  // ── Sub-categories ──────────────────────────────────────────────────────────
  const subs = [
    // Cellphones & Wearables
    { name: "Smartphones",           slug: "smartphones",           parentId: cellphones.id,  position: 1 },
    { name: "Feature Phones",        slug: "feature-phones",        parentId: cellphones.id,  position: 2 },
    { name: "Smartwatches",          slug: "smartwatches",          parentId: cellphones.id,  position: 3 },
    { name: "Fitness Trackers",      slug: "fitness-trackers",      parentId: cellphones.id,  position: 4 },
    { name: "Tablets",               slug: "tablets-phones",        parentId: cellphones.id,  position: 5 },
    { name: "Accessories",           slug: "phone-accessories",     parentId: cellphones.id,  position: 6 },

    // Computers & Tablets
    { name: "Laptops",               slug: "laptops",               parentId: computers.id,   position: 1 },
    { name: "Desktops",              slug: "desktops",              parentId: computers.id,   position: 2 },
    { name: "Tablets",               slug: "tablets",               parentId: computers.id,   position: 3 },
    { name: "Monitors",              slug: "monitors",              parentId: computers.id,   position: 4 },
    { name: "Keyboards & Mice",      slug: "keyboards-mice",        parentId: computers.id,   position: 5 },
    { name: "Storage & Memory",      slug: "storage-memory",        parentId: computers.id,   position: 6 },
    { name: "Networking",            slug: "networking",            parentId: computers.id,   position: 7 },

    // TV, Audio & Video
    { name: "Televisions",           slug: "televisions",           parentId: tvAudio.id,     position: 1 },
    { name: "Soundbars",             slug: "soundbars",             parentId: tvAudio.id,     position: 2 },
    { name: "Headphones",            slug: "headphones",            parentId: tvAudio.id,     position: 3 },
    { name: "Bluetooth Speakers",    slug: "bluetooth-speakers",    parentId: tvAudio.id,     position: 4 },
    { name: "Home Theatre",          slug: "home-theatre",          parentId: tvAudio.id,     position: 5 },
    { name: "Streaming Devices",     slug: "streaming-devices",     parentId: tvAudio.id,     position: 6 },

    // Beauty
    { name: "Skincare",              slug: "skincare",              parentId: beauty.id,      position: 1 },
    { name: "Hair Care",             slug: "hair-care",             parentId: beauty.id,      position: 2 },
    { name: "Makeup",                slug: "makeup",                parentId: beauty.id,      position: 3 },
    { name: "Fragrances",            slug: "fragrances",            parentId: beauty.id,      position: 4 },
    { name: "Nail Care",             slug: "nail-care",             parentId: beauty.id,      position: 5 },
    { name: "Men's Grooming",        slug: "mens-grooming",         parentId: beauty.id,      position: 6 },

    // Home & Kitchen
    { name: "Kitchen Appliances",    slug: "kitchen-appliances",    parentId: homeKitchen.id, position: 1 },
    { name: "Cookware",              slug: "cookware",              parentId: homeKitchen.id, position: 2 },
    { name: "Bedding",               slug: "bedding",               parentId: homeKitchen.id, position: 3 },
    { name: "Furniture",             slug: "furniture",             parentId: homeKitchen.id, position: 4 },
    { name: "Lighting",              slug: "lighting",              parentId: homeKitchen.id, position: 5 },
    { name: "Storage & Organisation",slug: "storage-organisation",  parentId: homeKitchen.id, position: 6 },
    { name: "Cleaning Supplies",     slug: "cleaning-supplies",     parentId: homeKitchen.id, position: 7 },

    // Sport
    { name: "Gym Equipment",         slug: "gym-equipment",         parentId: sport.id,       position: 1 },
    { name: "Running",               slug: "running",               parentId: sport.id,       position: 2 },
    { name: "Yoga & Pilates",        slug: "yoga-pilates",          parentId: sport.id,       position: 3 },
    { name: "Team Sports",           slug: "team-sports",           parentId: sport.id,       position: 4 },
    { name: "Cycling",               slug: "cycling",               parentId: sport.id,       position: 5 },
    { name: "Swimming",              slug: "swimming",              parentId: sport.id,       position: 6 },
    { name: "Sports Nutrition",      slug: "sports-nutrition",      parentId: sport.id,       position: 7 },

    // Fashion
    { name: "Men's Clothing",        slug: "mens-clothing",         parentId: fashion.id,     position: 1 },
    { name: "Women's Clothing",      slug: "womens-clothing",       parentId: fashion.id,     position: 2 },
    { name: "Shoes",                 slug: "shoes",                 parentId: fashion.id,     position: 3 },
    { name: "Bags & Accessories",    slug: "bags-accessories",      parentId: fashion.id,     position: 4 },
    { name: "Jewellery",             slug: "jewellery",             parentId: fashion.id,     position: 5 },
    { name: "Sunglasses",            slug: "sunglasses",            parentId: fashion.id,     position: 6 },
    { name: "Watches",               slug: "watches",               parentId: fashion.id,     position: 7 },

    // Baby & Toddler
    { name: "Baby Clothing",         slug: "baby-clothing",         parentId: babyToddler.id, position: 1 },
    { name: "Feeding",               slug: "feeding",               parentId: babyToddler.id, position: 2 },
    { name: "Nappies & Wipes",       slug: "nappies-wipes",         parentId: babyToddler.id, position: 3 },
    { name: "Prams & Car Seats",     slug: "prams-car-seats",       parentId: babyToddler.id, position: 4 },
    { name: "Nursery",               slug: "nursery",               parentId: babyToddler.id, position: 5 },
    { name: "Toys & Learning",       slug: "baby-toys-learning",    parentId: babyToddler.id, position: 6 },

    // Health
    { name: "Vitamins & Supplements",slug: "vitamins-supplements",  parentId: health.id,      position: 1 },
    { name: "Medical Equipment",     slug: "medical-equipment",     parentId: health.id,      position: 2 },
    { name: "Personal Care",         slug: "personal-care",         parentId: health.id,      position: 3 },
    { name: "Weight Management",     slug: "weight-management",     parentId: health.id,      position: 4 },
    { name: "Eye Care",              slug: "eye-care",              parentId: health.id,      position: 5 },

    // Camping & Outdoors
    { name: "Tents & Shelters",      slug: "tents-shelters",        parentId: camping.id,     position: 1 },
    { name: "Sleeping Bags",         slug: "sleeping-bags",         parentId: camping.id,     position: 2 },
    { name: "Hiking",                slug: "hiking",                parentId: camping.id,     position: 3 },
    { name: "Braai & Cooking",       slug: "braai-cooking",         parentId: camping.id,     position: 4 },
    { name: "Outdoor Clothing",      slug: "outdoor-clothing",      parentId: camping.id,     position: 5 },

    // Toys
    { name: "Action Figures",        slug: "action-figures",        parentId: toys.id,        position: 1 },
    { name: "Board Games",           slug: "board-games",           parentId: toys.id,        position: 2 },
    { name: "Educational Toys",      slug: "educational-toys",      parentId: toys.id,        position: 3 },
    { name: "Remote Control",        slug: "remote-control",        parentId: toys.id,        position: 4 },
    { name: "Outdoor Play",          slug: "outdoor-play",          parentId: toys.id,        position: 5 },
    { name: "Puzzles",               slug: "puzzles",               parentId: toys.id,        position: 6 },

    // Books
    { name: "Fiction",               slug: "fiction",               parentId: books.id,       position: 1 },
    { name: "Non-Fiction",           slug: "non-fiction",           parentId: books.id,       position: 2 },
    { name: "Children's Books",      slug: "childrens-books",       parentId: books.id,       position: 3 },
    { name: "Academic & Textbooks",  slug: "academic-textbooks",    parentId: books.id,       position: 4 },
    { name: "Business & Finance",    slug: "business-finance",      parentId: books.id,       position: 5 },

    // Garden, Pool & Patio
    { name: "Garden Tools",          slug: "garden-tools",          parentId: garden.id,      position: 1 },
    { name: "Outdoor Furniture",     slug: "outdoor-furniture",     parentId: garden.id,      position: 2 },
    { name: "Pool & Spa",            slug: "pool-spa",              parentId: garden.id,      position: 3 },
    { name: "Plants & Seeds",        slug: "plants-seeds",          parentId: garden.id,      position: 4 },
    { name: "Irrigation",            slug: "irrigation",            parentId: garden.id,      position: 5 },

    // Luggage & Travel
    { name: "Suitcases",             slug: "suitcases",             parentId: luggage.id,     position: 1 },
    { name: "Backpacks",             slug: "backpacks",             parentId: luggage.id,     position: 2 },
    { name: "Travel Accessories",    slug: "travel-accessories",    parentId: luggage.id,     position: 3 },
    { name: "Handbags",              slug: "handbags",              parentId: luggage.id,     position: 4 },

    // Pets
    { name: "Dog Supplies",          slug: "dog-supplies",          parentId: pets.id,        position: 1 },
    { name: "Cat Supplies",          slug: "cat-supplies",          parentId: pets.id,        position: 2 },
    { name: "Pet Food",              slug: "pet-food",              parentId: pets.id,        position: 3 },
    { name: "Aquatics",              slug: "aquatics",              parentId: pets.id,        position: 4 },
    { name: "Pet Healthcare",        slug: "pet-healthcare",        parentId: pets.id,        position: 5 },

    // Cameras
    { name: "DSLR & Mirrorless",     slug: "dslr-mirrorless",       parentId: cameras.id,     position: 1 },
    { name: "Action Cameras",        slug: "action-cameras",        parentId: cameras.id,     position: 2 },
    { name: "Camera Lenses",         slug: "camera-lenses",         parentId: cameras.id,     position: 3 },
    { name: "Drones",                slug: "drones",                parentId: cameras.id,     position: 4 },
    { name: "Camera Accessories",    slug: "camera-accessories",    parentId: cameras.id,     position: 5 },
  ];

  for (const sub of subs) {
    await prisma.category.upsert({
      where: { slug: sub.slug },
      update: { name: sub.name, position: sub.position, parentId: sub.parentId },
      create: { ...sub, isActive: true },
    });
  }

  // Alias: keep old slugs active but hidden (position 99)
  const _cameras = cameras; void _cameras;
  const _deals = deals; void _deals;

  // ── Brands ──────────────────────────────────────────────────────────────────
  const brandData = [
    { name: "Exobe Essentials", slug: "exobe-essentials" },
    { name: "TechPro ZA", slug: "techpro-za" },
    { name: "SoundWave", slug: "soundwave" },
    { name: "ActiveFit", slug: "activefit" },
    { name: "CasaLux", slug: "casalux" },
    { name: "PureGlow", slug: "pureglow" },
    { name: "SwiftStyle", slug: "swiftstyle" },
    { name: "GreenLeaf", slug: "greenleaf" },
    { name: "KidSpace", slug: "kidspace" },
    { name: "AutoMax", slug: "automax" },
  ];

  const brands: Record<string, string> = {};
  for (const b of brandData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
    brands[b.slug] = brand.id;
  }

  // ── Products ─────────────────────────────────────────────────────────────────
  const products = [
    // Electronics
    {
      name: "Wireless Noise-Cancelling Headphones",
      slug: "wireless-noise-cancelling-headphones",
      sku: "EXB-ELEC-001",
      basePrice: 1899,
      salePrice: 1599,
      categoryId: electronics.id,
      brandSlug: "soundwave",
      isFeatured: true,
      description: "Premium over-ear headphones with active noise cancellation and 30-hour battery life. Deep bass response and crystal clear highs.",
      image: unsplash("1505740420928-5e560c06d30e"),
    },
    {
      name: "Smart Fitness Watch",
      slug: "smart-fitness-watch",
      sku: "EXB-ELEC-002",
      basePrice: 2499,
      categoryId: electronics.id,
      brandSlug: "techpro-za",
      isFeatured: true,
      description: "Track workouts, heart rate, SpO2, and sleep with a vivid AMOLED always-on display. Water resistant to 50m.",
      image: unsplash("1523275335684-37898b6baf30"),
    },
    {
      name: "Portable Bluetooth Speaker",
      slug: "portable-bluetooth-speaker",
      sku: "EXB-ELEC-003",
      basePrice: 899,
      salePrice: 749,
      categoryId: electronics.id,
      brandSlug: "soundwave",
      description: "IP67 splash-proof speaker with 12-hour playtime and 360° surround sound.",
      image: unsplash("1608043152269-423dbba4e7e1"),
    },
    {
      name: "65W USB-C GaN Fast Charger",
      slug: "65w-usb-c-fast-charger",
      sku: "EXB-ELEC-004",
      basePrice: 449,
      categoryId: electronics.id,
      brandSlug: "techpro-za",
      description: "Compact GaN charger with 3 ports (2x USB-C + USB-A) for simultaneous charging.",
      image: unsplash("1610945264803-c22b62d2a7b3"),
    },
    {
      name: "4K Action Camera",
      slug: "4k-action-camera",
      sku: "EXB-ELEC-005",
      basePrice: 3299,
      salePrice: 2899,
      categoryId: electronics.id,
      brandSlug: "techpro-za",
      isFeatured: true,
      description: "Waterproof 4K60 action camera with EIS image stabilization, 170° wide-angle lens.",
      image: unsplash("1526170375885-4d8ecf77b99f"),
    },
    {
      name: "True Wireless Earbuds Pro",
      slug: "true-wireless-earbuds-pro",
      sku: "EXB-ELEC-006",
      basePrice: 1199,
      salePrice: 999,
      categoryId: electronics.id,
      brandSlug: "soundwave",
      isFeatured: true,
      description: "Active noise cancelling true wireless earbuds with 8hr playtime + 24hr charging case.",
      image: unsplash("1572635196237-14b3f281503f"),
    },
    {
      name: "Mechanical Gaming Keyboard",
      slug: "mechanical-gaming-keyboard",
      sku: "EXB-ELEC-007",
      basePrice: 1499,
      categoryId: electronics.id,
      brandSlug: "techpro-za",
      description: "Tenkeyless RGB mechanical keyboard with tactile Brown switches.",
      image: unsplash("1587829741301-dc798b83add3"),
    },
    {
      name: "10000mAh Power Bank",
      slug: "10000mah-power-bank",
      sku: "EXB-ELEC-008",
      basePrice: 599,
      salePrice: 499,
      categoryId: electronics.id,
      brandSlug: "techpro-za",
      description: "Slim 10000mAh power bank with 22.5W fast charging and two USB-A ports.",
      image: unsplash("1512054502232-10a0a035d672"),
    },

    // Fashion
    {
      name: "Classic Leather Backpack",
      slug: "classic-leather-backpack",
      sku: "EXB-FASH-001",
      basePrice: 1299,
      categoryId: fashion.id,
      brandSlug: "swiftstyle",
      description: "Handcrafted genuine leather backpack with padded 15\" laptop compartment.",
      image: unsplash("1548036328-c9fa89d128fa"),
    },
    {
      name: "Organic Cotton T-Shirt 3-Pack",
      slug: "organic-cotton-t-shirt",
      sku: "EXB-FASH-002",
      basePrice: 349,
      salePrice: 299,
      categoryId: fashion.id,
      brandSlug: "swiftstyle",
      description: "Sustainably sourced 100% organic cotton tees in 3 neutral colours.",
      image: unsplash("1521572163474-6864f9cf17ab"),
    },
    {
      name: "Slim Fit Stretch Denim Jeans",
      slug: "slim-fit-denim-jeans",
      sku: "EXB-FASH-003",
      basePrice: 799,
      categoryId: fashion.id,
      brandSlug: "swiftstyle",
      isFeatured: true,
      description: "4-way stretch denim with classic 5-pocket design and tapered leg.",
      image: unsplash("1542272604-787c3835535d"),
    },
    {
      name: "Everyday Canvas Sneakers",
      slug: "everyday-canvas-sneakers",
      sku: "EXB-FASH-004",
      basePrice: 649,
      salePrice: 529,
      categoryId: fashion.id,
      brandSlug: "swiftstyle",
      description: "Lightweight canvas sneakers with memory foam insole.",
      image: unsplash("1525966222134-fcfa99b8ae77"),
    },
    {
      name: "Merino Wool Oversized Scarf",
      slug: "merino-wool-scarf",
      sku: "EXB-FASH-005",
      basePrice: 399,
      categoryId: fashion.id,
      brandSlug: "swiftstyle",
      description: "Extra-soft merino wool scarf in herringbone pattern.",
      image: unsplash("1520006403909-838d6b92c22e"),
    },
    {
      name: "Linen Summer Dress",
      slug: "linen-summer-dress",
      sku: "EXB-FASH-006",
      basePrice: 899,
      salePrice: 699,
      categoryId: fashion.id,
      brandSlug: "swiftstyle",
      isFeatured: true,
      description: "Flowy linen midi dress with adjustable waist tie. Perfect for warm weather.",
      image: unsplash("1539008835657-9e8e9680c956"),
    },
    {
      name: "Leather Wallet Slim Card Holder",
      slug: "leather-wallet-slim",
      sku: "EXB-FASH-007",
      basePrice: 299,
      categoryId: fashion.id,
      brandSlug: "swiftstyle",
      description: "RFID-blocking slim genuine leather wallet with 6 card slots.",
      image: unsplash("1624096187268-41b48e29a866"),
    },

    // Home & Living
    {
      name: "Ceramic Pour-Over Coffee Set",
      slug: "ceramic-pour-over-coffee-set",
      sku: "EXB-HOME-001",
      basePrice: 749,
      categoryId: homeLiving.id,
      brandSlug: "casalux",
      isFeatured: true,
      description: "Minimalist ceramic dripper, carafe, and two mugs for the perfect morning ritual.",
      image: unsplash("1495474472287-4d71bcdd2085"),
    },
    {
      name: "Linen Throw Blanket",
      slug: "linen-throw-blanket",
      sku: "EXB-HOME-002",
      basePrice: 599,
      categoryId: homeLiving.id,
      brandSlug: "casalux",
      description: "Breathable washed linen throw in warm sand tones.",
      image: unsplash("1505693416388-ac5ce068fe85"),
    },
    {
      name: "Bamboo Cutting Board Set (3-piece)",
      slug: "bamboo-cutting-board-set",
      sku: "EXB-HOME-003",
      basePrice: 449,
      salePrice: 379,
      categoryId: homeLiving.id,
      brandSlug: "greenleaf",
      description: "Three sustainably sourced bamboo boards with anti-slip feet.",
      image: unsplash("1556909114-44e3e70034e2"),
    },
    {
      name: "Scented Soy Candle Trio",
      slug: "scented-soy-candle-trio",
      sku: "EXB-HOME-004",
      basePrice: 329,
      salePrice: 259,
      categoryId: homeLiving.id,
      brandSlug: "casalux",
      description: "Hand-poured soy candles in cedarwood, citrus & vanilla. 45hr burn each.",
      image: unsplash("1603006905003-be475563bc59"),
    },
    {
      name: "16-Piece Stoneware Dinner Set",
      slug: "stoneware-dinner-set-16-piece",
      sku: "EXB-HOME-005",
      basePrice: 1199,
      categoryId: homeLiving.id,
      brandSlug: "casalux",
      description: "Matte stoneware service for four — dinner plates, side plates, bowls & mugs.",
      image: unsplash("1578916171728-46686eac8d58"),
    },
    {
      name: "Egyptian Cotton Duvet Cover Set",
      slug: "egyptian-cotton-duvet-cover",
      sku: "EXB-HOME-006",
      basePrice: 899,
      salePrice: 749,
      categoryId: homeLiving.id,
      brandSlug: "casalux",
      isFeatured: true,
      description: "400 thread-count Egyptian cotton duvet cover with two pillow cases. Queen size.",
      image: unsplash("1522771739844-6a9f6a0981f8"),
    },
    {
      name: "Smart LED Floor Lamp",
      slug: "smart-led-floor-lamp",
      sku: "EXB-HOME-007",
      basePrice: 1499,
      categoryId: homeLiving.id,
      brandSlug: "casalux",
      description: "App-controlled RGB floor lamp with dimmer and warm/cool white modes.",
      image: unsplash("1507473885765-e6ed057f782c"),
    },

    // Beauty & Care
    {
      name: "Vitamin C Brightening Serum",
      slug: "vitamin-c-brightening-serum",
      sku: "EXB-BEAUTY-001",
      basePrice: 489,
      salePrice: 399,
      categoryId: beauty.id,
      brandSlug: "pureglow",
      isFeatured: true,
      description: "15% stable Vitamin C serum for radiant, even-toned skin. All skin types.",
      image: unsplash("1556228720-195a672e8a03"),
    },
    {
      name: "Natural Hair Growth Oil",
      slug: "natural-hair-growth-oil",
      sku: "EXB-BEAUTY-002",
      basePrice: 299,
      categoryId: beauty.id,
      brandSlug: "pureglow",
      description: "Blend of castor, argan, and biotin oil to strengthen and grow hair.",
      image: unsplash("1620916566398-39f1143ab7be"),
    },
    {
      name: "Charcoal Face Wash",
      slug: "charcoal-face-wash",
      sku: "EXB-BEAUTY-003",
      basePrice: 189,
      salePrice: 149,
      categoryId: beauty.id,
      brandSlug: "pureglow",
      description: "Deep-cleansing activated charcoal gel face wash. Removes impurities.",
      image: unsplash("1556228578-8c89e6adf883"),
    },
    {
      name: "Shea Butter Body Lotion 500ml",
      slug: "shea-butter-body-lotion",
      sku: "EXB-BEAUTY-004",
      basePrice: 249,
      categoryId: beauty.id,
      brandSlug: "pureglow",
      description: "Rich moisturising lotion with unrefined shea butter and aloe vera.",
      image: unsplash("1556228453-efd6c1ff04f6"),
    },

    // Sports & Outdoors
    {
      name: "Adjustable Dumbbell Set 40kg",
      slug: "adjustable-dumbbell-set-40kg",
      sku: "EXB-SPORT-001",
      basePrice: 4999,
      salePrice: 3999,
      categoryId: sports.id,
      brandSlug: "activefit",
      isFeatured: true,
      description: "Quick-lock 5–20kg per dumbbell set replacing 15 pairs. Compact storage.",
      image: unsplash("1571019613454-1cb2f99b2d8b"),
    },
    {
      name: "Yoga Mat Non-Slip Premium",
      slug: "yoga-mat-non-slip",
      sku: "EXB-SPORT-002",
      basePrice: 599,
      salePrice: 499,
      categoryId: sports.id,
      brandSlug: "activefit",
      description: "6mm thick eco TPE yoga mat with alignment lines and carrying strap.",
      image: unsplash("1518611012118-696072aa579a"),
    },
    {
      name: "Hydration Running Belt",
      slug: "hydration-running-belt",
      sku: "EXB-SPORT-003",
      basePrice: 399,
      categoryId: sports.id,
      brandSlug: "activefit",
      description: "Bounce-free running belt with two 250ml flasks and phone pocket.",
      image: unsplash("1537791831959-00002fd4e3ab"),
    },
    {
      name: "Trail Running Shoes",
      slug: "trail-running-shoes",
      sku: "EXB-SPORT-004",
      basePrice: 1899,
      categoryId: sports.id,
      brandSlug: "activefit",
      isFeatured: true,
      description: "Lightweight trail running shoes with Vibram outsole and Gore-Tex lining.",
      image: unsplash("1542291026-7eec264c27ff"),
    },

    // Groceries
    {
      name: "Organic Rooibos Tea 100-Pack",
      slug: "organic-rooibos-tea-100",
      sku: "EXB-GROC-001",
      basePrice: 129,
      categoryId: groceries.id,
      brandSlug: "greenleaf",
      description: "100% South African organic rooibos, caffeine-free, in biodegradable bags.",
      image: unsplash("1556679343-c7306c1976bc"),
    },
    {
      name: "Cold-Press Coconut Oil 500ml",
      slug: "cold-press-coconut-oil-500ml",
      sku: "EXB-GROC-002",
      basePrice: 189,
      categoryId: groceries.id,
      brandSlug: "greenleaf",
      description: "Virgin cold-pressed coconut oil, unrefined. Ideal for cooking and skincare.",
      image: unsplash("1615485500704-8e990f9900f7"),
    },
    {
      name: "Raw Honey 1kg Jar",
      slug: "raw-honey-1kg",
      sku: "EXB-GROC-003",
      basePrice: 229,
      categoryId: groceries.id,
      brandSlug: "greenleaf",
      isFeatured: true,
      description: "Unprocessed South African wildflower honey, direct from the hive.",
      image: unsplash("1558642452-9d2a7deb7f62"),
    },

    // Baby & Kids
    {
      name: "Wooden Learning Puzzle Set",
      slug: "wooden-learning-puzzle-set",
      sku: "EXB-BABY-001",
      basePrice: 299,
      salePrice: 249,
      categoryId: babyKids.id,
      brandSlug: "kidspace",
      description: "Non-toxic painted wooden puzzles for shapes, numbers, and letters.",
      image: unsplash("1587654780291-39c9404d746b"),
    },
    {
      name: "Baby Organic Cotton Bodysuit 5-Pack",
      slug: "baby-organic-cotton-bodysuit",
      sku: "EXB-BABY-002",
      basePrice: 449,
      categoryId: babyKids.id,
      brandSlug: "kidspace",
      description: "Gentle on sensitive skin. GOTS certified organic cotton. Sizes 0-18M.",
      image: unsplash("1522771930-78848d9293e8"),
    },

    // Automotive
    {
      name: "Car Phone Mount Magnetic",
      slug: "car-phone-mount-magnetic",
      sku: "EXB-AUTO-001",
      basePrice: 199,
      salePrice: 149,
      categoryId: automotive.id,
      brandSlug: "automax",
      description: "Universal magnetic vent mount with 360° rotation and strong N52 magnet.",
      image: unsplash("1526725106-a49a9ca78c19"),
    },
    {
      name: "Dash Cam Full HD 1080p",
      slug: "dash-cam-full-hd",
      sku: "EXB-AUTO-002",
      basePrice: 799,
      categoryId: automotive.id,
      brandSlug: "automax",
      description: "Loop recording dashcam with night vision, G-sensor, and parking mode.",
      image: unsplash("1449965408869-eaa3f722e508"),
    },
  ];

  const exobeBrandId = brands["exobe-essentials"];

  for (const product of products) {
    const brandId = brands[product.brandSlug] ?? exobeBrandId;
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        shortDescription: product.description.substring(0, 120),
        basePrice: product.basePrice,
        salePrice: (product as { salePrice?: number }).salePrice,
        currency: "ZAR",
        stockQuantity: Math.floor(Math.random() * 80) + 10,
        status: "PUBLISHED",
        isFeatured: (product as { isFeatured?: boolean }).isFeatured ?? false,
        brandId,
        categories: { connect: { id: product.categoryId } },
        images: { create: [{ url: product.image, position: 0 }] },
      },
    });
  }

  // ── Shipping & Tax ─────────────────────────────────────────────────────────
  const standardShipping = await prisma.shippingMethod.upsert({
    where: { id: "standard-shipping" },
    update: {},
    create: {
      id: "standard-shipping",
      name: "Standard Shipping",
      description: "Delivered in 3-5 business days",
      rates: {
        create: [
          { country: "ZA", price: 75 },
          { country: "NA", price: 150 },
          { country: "BW", price: 150 },
        ],
      },
    },
  });

  await prisma.shippingMethod.upsert({
    where: { id: "express-shipping" },
    update: {},
    create: {
      id: "express-shipping",
      name: "Express Shipping",
      description: "Delivered in 1-2 business days",
      rates: { create: [{ country: "ZA", price: 180 }] },
    },
  });

  await prisma.taxRate.upsert({
    where: { id: "za-vat" },
    update: {},
    create: { id: "za-vat", name: "South Africa VAT", country: "ZA", rate: 0.15 },
  });

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENT",
      value: 10,
      usageLimitPerCustomer: 1,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "SAVE50" },
    update: {},
    create: {
      code: "SAVE50",
      type: "FIXED",
      value: 50,
      minOrderAmount: 500,
      isActive: true,
    },
  });

  // ── Users ──────────────────────────────────────────────────────────────────
  const demoCustomer = await prisma.customer.upsert({
    where: { email: "demo@exobe.africa" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "demo@exobe.africa",
      passwordHash: await bcrypt.hash("password123", 10),
    },
  });

  const superAdmin = await prisma.admin.upsert({
    where: { email: "superadmin@exobe.africa" },
    update: {},
    create: {
      name: "Exobe Super Admin",
      email: "superadmin@exobe.africa",
      passwordHash: await bcrypt.hash("password123", 10),
      role: "SUPER_ADMIN",
    },
  });

  await prisma.admin.upsert({
    where: { email: "admin@exobe.africa" },
    update: {},
    create: {
      name: "Exobe Admin",
      email: "admin@exobe.africa",
      passwordHash: await bcrypt.hash("password123", 10),
      role: "ADMIN",
    },
  });

  // ── Vendor 1: Approved ─────────────────────────────────────────────────────
  const approvedVendor = await prisma.customer.upsert({
    where: { email: "vendor@exobe.africa" },
    update: { isVendor: true },
    create: {
      name: "Thandiwe Dlamini",
      email: "vendor@exobe.africa",
      passwordHash: await bcrypt.hash("password123", 10),
      isVendor: true,
    },
  });

  const approvedStore = await prisma.store.upsert({
    where: { customerId: approvedVendor.id },
    update: {},
    create: {
      customerId: approvedVendor.id,
      name: "Thandiwe's Market",
      slug: "thandiwes-market",
      email: "vendor@exobe.africa",
      phone: "+27 82 555 0101",
      country: "ZA",
      description:
        "Locally sourced home goods, handmade crafts, and organic beauty products from Cape Town artisans.",
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: superAdmin.id,
    },
  });

  await prisma.vendorWallet.upsert({
    where: { storeId: approvedStore.id },
    update: {},
    create: { storeId: approvedStore.id },
  });

  const vendorProducts = [
    {
      name: "Handwoven Storage Basket",
      slug: "handwoven-storage-basket",
      sku: "VEND-HOME-001",
      basePrice: 459,
      description: "Hand-woven seagrass storage basket made by Cape Town artisans.",
      image: unsplash("1584589167171-541ce45f1eea"),
    },
    {
      name: "Recycled Glass Vase",
      slug: "recycled-glass-vase",
      sku: "VEND-HOME-002",
      basePrice: 329,
      description: "Hand-blown vase from 100% recycled glass in earthy hues.",
      image: unsplash("1578500351865-d6c3706f46bc"),
      status: "PENDING_REVIEW" as const,
    },
    {
      name: "African Print Tote Bag",
      slug: "african-print-tote-bag",
      sku: "VEND-FASH-001",
      basePrice: 249,
      description: "Hand-stitched wax print tote bag. Unique, vibrant, durable.",
      image: unsplash("1561436260-d5e9d69c2268"),
    },
  ];

  for (const vp of vendorProducts) {
    await prisma.product.upsert({
      where: { slug: vp.slug },
      update: {},
      create: {
        name: vp.name,
        slug: vp.slug,
        sku: vp.sku,
        description: vp.description,
        shortDescription: vp.description,
        basePrice: vp.basePrice,
        currency: "ZAR",
        stockQuantity: 25,
        status: (vp as { status?: "PUBLISHED" | "PENDING_REVIEW" }).status ?? "PUBLISHED",
        storeId: approvedStore.id,
        submittedAt: new Date(),
        reviewedAt: (vp as { status?: string }).status === "PENDING_REVIEW" ? undefined : new Date(),
        reviewedBy: (vp as { status?: string }).status === "PENDING_REVIEW" ? undefined : superAdmin.id,
        categories: { connect: { id: homeLiving.id } },
        images: { create: [{ url: vp.image, position: 0 }] },
      },
    });
  }

  // ── Vendor 2: Pending ──────────────────────────────────────────────────────
  const pendingVendor = await prisma.customer.upsert({
    where: { email: "pending-vendor@exobe.africa" },
    update: {},
    create: {
      name: "Sipho Ndlovu",
      email: "pending-vendor@exobe.africa",
      passwordHash: await bcrypt.hash("password123", 10),
    },
  });

  await prisma.store.upsert({
    where: { customerId: pendingVendor.id },
    update: {},
    create: {
      customerId: pendingVendor.id,
      name: "Sipho's Tech Stop",
      slug: "siphos-tech-stop",
      email: "pending-vendor@exobe.africa",
      phone: "+27 82 555 0202",
      country: "ZA",
      description: "Refurbished electronics and accessories at great prices.",
      status: "PENDING",
    },
  });

  console.log("✅ Seed complete:", {
    categories: 17 + subs.length,
    brands: brandData.length,
    products: products.length + vendorProducts.length,
    shipping: standardShipping.name,
    accounts: {
      superAdmin: "superadmin@exobe.africa",
      admin: "admin@exobe.africa",
      vendor: "vendor@exobe.africa",
      customer: demoCustomer.email,
      pendingVendor: pendingVendor.email,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
