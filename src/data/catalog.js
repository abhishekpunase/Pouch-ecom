export const SITE = {
  name: 'Apna Packaging Solution',
  domain: 'apnapackagingsolution.com',
  tagline: 'Pouches, boxes & labels',
  description:
    'Elevate your brand with food-grade pouches, shipping boxes and product labels — designed to protect, preserve and impress.',
  email: 'hello@apnapackagingsolution.com',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  gst: '07ABCDE1234F1Z5',
  address: 'Plot 12, Packaging Hub, Okhla Industrial Area, New Delhi — 110020, India',
  freeShippingFrom: 1000,
  shippingFee: 80,
  company: 'Apna Packaging Solution',
}

export const CATEGORIES = [
  {
    slug: 'pouches',
    name: 'Pouches',
    headline: 'Standup zipper pouches',
    description:
      'Food-grade standup pouches with zipper, tear notch and strong barrier layers. Pick size, colour and pack pieces.',
    image: '/products/pouch-hero.png',
  },
  {
    slug: 'boxes',
    name: 'Boxes',
    headline: 'Shipping & gift boxes',
    description:
      'Corrugated mailers, folding cartons and rigid gift boxes. Choose size, colour and pack pieces.',
    image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'labels',
    name: 'Labels',
    headline: 'Product labels & stickers',
    description:
      'Waterproof vinyl, kraft, clear and thermal labels for jars, pouches and cartons.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1200&q=80',
  },
]

export const REVIEWS = [
  {
    name: 'Nava Jain',
    text: 'Excellent quality pouches. Very satisfied with the pouches.',
    image: '/products/pouch-gold-glossy.png',
  },
  {
    name: 'Rohit Mehra',
    text: 'Zipper pouches arrived sturdy. The gold glossy finish looks premium on shelf.',
    image: '/products/pouch-kraft-window.png',
  },
  {
    name: 'Sana Kapoor',
    text: 'Transparent pouches are crystal clear. Size and pieces options made bulk ordering easy.',
    image: '/products/pouch-transparent.png',
  },
]

const POUCH_SIZES = [
  { id: '100g', label: '4x7 — 100gm', dim: '11cm × 18cm', multiplier: 1 },
  { id: '250g', label: '5x8 — 250gm', dim: '13cm × 20cm', multiplier: 1.25 },
  { id: '500g', label: '6x9 — 500gm', dim: '16cm × 23cm', multiplier: 1.55 },
  { id: '750g', label: '7x10 — 750gm', dim: '18cm × 26cm', multiplier: 1.9 },
  { id: '1kg', label: '8x12 — 1kg', dim: '21cm × 31cm', multiplier: 2.3 },
]

const PACKS = [
  { id: '50', pieces: 50, label: '50 pcs', multiplier: 1 },
  { id: '100', pieces: 100, label: '100 pcs', multiplier: 0.92 },
  { id: '250', pieces: 250, label: '250 pcs', multiplier: 0.84 },
  { id: '500', pieces: 500, label: '500 pcs', multiplier: 0.76 },
  { id: '1000', pieces: 1000, label: '1000 pcs', multiplier: 0.68 },
]

const BOX_SIZES = [
  { id: 's', label: 'Small', dim: '4 × 4 × 2 in', multiplier: 1 },
  { id: 'm', label: 'Medium', dim: '8 × 6 × 4 in', multiplier: 1.55 },
  { id: 'l', label: 'Large', dim: '12 × 10 × 6 in', multiplier: 2.1 },
  { id: 'xl', label: 'XL', dim: '16 × 12 × 8 in', multiplier: 2.8 },
]

const LABEL_SIZES = [
  { id: '2x1', label: '2 × 1 in', dim: '50 × 25 mm', multiplier: 1 },
  { id: '3x2', label: '3 × 2 in', dim: '76 × 51 mm', multiplier: 1.35 },
  { id: '4x3', label: '4 × 3 in', dim: '102 × 76 mm', multiplier: 1.7 },
  { id: 'circle', label: '2 in circle', dim: '50 mm Ø', multiplier: 1.2 },
]

export const PRODUCTS = [
  {
    id: 'pouch-gold-glossy',
    slug: 'golden-standup-pouch-glossy',
    name: 'Golden Standup Pouch Glossy',
    category: 'pouches',
    badge: 'Premium Gloss',
    featured: true,
    rating: 4.9,
    reviews: 210,
    basePrice: 7.5,
    inStock: true,
    shortDescription: 'Golden standup pouch with zipper',
    description:
      'Both-side glossy gold standup zipper pouch with a clear window. High-barrier metallized film for dry fruits, sweets and premium snacks. Choose size, colour finish and pack pieces.',
    images: ['/products/pouch-gold-glossy.png', '/products/pouch-hero.png'],
    sizes: POUCH_SIZES,
    colours: [
      { id: 'gold', label: 'Gloss Gold', hex: '#d4af37' },
      { id: 'champagne', label: 'Champagne', hex: '#e8d48b' },
    ],
    packs: PACKS,
    features: ['Gloss metallic gold', 'Clear product window', 'Zipper + tear notch', 'Food-grade barrier'],
  },
  {
    id: 'pouch-gold-matte',
    slug: 'golden-matte-standup-pouch',
    name: 'Golden Matte Standup Pouch',
    category: 'pouches',
    badge: 'Premium Gloss',
    featured: true,
    rating: 4.8,
    reviews: 164,
    basePrice: 13,
    inStock: true,
    shortDescription: 'Golden standup pouch with zipper',
    description:
      'Soft-touch matte gold standup pouch with a viewing window. Luxury look for gourmet foods, pasta, spices and gifting.',
    images: ['/products/pouch-gold-matte.png', '/products/pouch-gold-glossy.png'],
    sizes: POUCH_SIZES,
    colours: [
      { id: 'matte-gold', label: 'Matte Gold', hex: '#b8860b' },
      { id: 'antique', label: 'Antique Gold', hex: '#996515' },
    ],
    packs: PACKS,
    features: ['Matte gold finish', 'Window display', 'Resealable zipper', 'Light & moisture barrier'],
  },
  {
    id: 'pouch-milky',
    slug: 'both-side-milky-standup-zipper-pouch',
    name: 'Both Side Milky Stand up Zipper Pouch',
    category: 'pouches',
    badge: 'Food Grade',
    featured: true,
    rating: 4.8,
    reviews: 186,
    basePrice: 4,
    inStock: true,
    shortDescription: 'Both Side Milky Pouch with zipper',
    description:
      'Opaque milky-white standup zipper pouch. Food-grade, label-ready, and available in multiple fill sizes and piece packs.',
    images: ['/products/pouch-milky-white.png', '/products/pouch-hero.png'],
    sizes: POUCH_SIZES,
    colours: [
      { id: 'milky', label: 'Milky White', hex: '#f8fafc' },
      { id: 'ivory', label: 'Ivory', hex: '#f5f5f4' },
    ],
    packs: PACKS,
    features: ['Both-side milky film', 'Food grade', 'Zipper lock', 'Great for custom labels'],
  },
  {
    id: 'pouch-transparent',
    slug: 'both-side-transparent-pouches',
    name: 'Both Side Transparent Pouches',
    category: 'pouches',
    badge: 'Food Grade',
    featured: true,
    rating: 4.9,
    reviews: 198,
    basePrice: 5.5,
    inStock: true,
    shortDescription: 'Transparent Pouches with zipper',
    description:
      'Crystal-clear both-side transparent standup pouches so customers can see the product from every angle. Ideal for nuts, snacks and retail display.',
    images: ['/products/pouch-transparent.png', '/products/pouch-hero.png'],
    sizes: POUCH_SIZES,
    colours: [
      { id: 'clear', label: 'Clear', hex: '#e5e7eb' },
      { id: 'frost', label: 'Frost', hex: '#cbd5e1' },
    ],
    packs: PACKS,
    features: ['100% transparent', 'Food-grade PET/PE', 'Zipper + tear notch', 'Stand-up gusset'],
  },
  {
    id: 'pouch-silver',
    slug: 'transparent-silver-zip-lock-pouch',
    name: 'Transparent Silver Zip Lock Pouch',
    category: 'pouches',
    badge: 'Airtight Seal',
    featured: true,
    rating: 4.7,
    reviews: 121,
    basePrice: 6.5,
    inStock: true,
    shortDescription: 'Silver back with clear front window',
    description:
      'Silver foil reverse with a transparent front — strong barrier plus product visibility. Popular for coffee, masala and protein.',
    images: ['/products/pouch-silver-window.png', '/products/pouch-transparent.png'],
    sizes: POUCH_SIZES,
    colours: [
      { id: 'silver', label: 'Silver', hex: '#94a3b8' },
      { id: 'silver-clear', label: 'Silver + Clear', hex: '#cbd5e1' },
    ],
    packs: PACKS,
    features: ['Foil barrier', 'Clear front', 'Airtight zipper', 'Retail stand-up base'],
  },
  {
    id: 'pouch-black',
    slug: 'matte-black-standup-pouch',
    name: 'Matte Black Standup Pouch',
    category: 'pouches',
    badge: 'Airtight Seal',
    featured: true,
    rating: 4.8,
    reviews: 142,
    basePrice: 8,
    inStock: true,
    shortDescription: 'Matte black zipper pouch',
    description:
      'Soft-touch matte black standup zipper pouch. Light-blocking film for coffee, cosmetics and gourmet foods.',
    images: ['/products/pouch-black-matte.png', '/products/pouch-hero.png'],
    sizes: POUCH_SIZES,
    colours: [
      { id: 'black', label: 'Matte Black', hex: '#111827' },
      { id: 'charcoal', label: 'Charcoal', hex: '#374151' },
    ],
    packs: PACKS,
    features: ['Soft-touch matte', 'Light-blocking', 'Zipper + tear notch', 'Premium unboxing feel'],
  },
  {
    id: 'pouch-color',
    slug: 'multi-color-standup-pouches',
    name: 'Multi Color Standup Pouches',
    category: 'pouches',
    badge: 'Food Grade',
    featured: true,
    rating: 4.7,
    reviews: 98,
    basePrice: 6,
    inStock: true,
    shortDescription: 'Red, green, purple, black and kraft pouches',
    description:
      'Colourful standup zipper pouches with windows. Pick a colour, size and piece pack for snacks, spices and D2C brands.',
    images: ['/products/pouch-multicolor.png', '/products/pouch-green-glossy.png'],
    sizes: POUCH_SIZES,
    colours: [
      { id: 'red', label: 'Red', hex: '#b91c1c' },
      { id: 'green', label: 'Green', hex: '#166534' },
      { id: 'purple', label: 'Purple', hex: '#6b21a8' },
      { id: 'black', label: 'Black', hex: '#111827' },
      { id: 'kraft', label: 'Kraft', hex: '#b45309' },
    ],
    packs: PACKS,
    features: ['Multiple colours', 'Clear window options', 'Food grade', 'Zipper lock'],
  },
  {
    id: 'pouch-green',
    slug: 'green-glossy-standup-pouch',
    name: 'Green Glossy Standup Pouch',
    category: 'pouches',
    badge: 'Premium Gloss',
    featured: false,
    rating: 4.6,
    reviews: 76,
    basePrice: 7,
    inStock: true,
    shortDescription: 'Glossy green zipper pouch',
    description:
      'Bright glossy green standup pouches with zipper. High shelf impact for organic, herbal and snack brands.',
    images: ['/products/pouch-green-glossy.png', '/products/pouch-multicolor.png'],
    sizes: POUCH_SIZES,
    colours: [
      { id: 'green', label: 'Gloss Green', hex: '#15803d' },
      { id: 'forest', label: 'Forest', hex: '#14532d' },
    ],
    packs: PACKS,
    features: ['Gloss green film', 'Zipper + tear notch', 'Food grade', 'Multiple sizes'],
  },
  {
    id: 'pouch-kraft',
    slug: 'kraft-standup-pouch-window',
    name: 'Kraft Standup Pouch with Window',
    category: 'pouches',
    badge: 'Food Grade',
    featured: true,
    rating: 4.8,
    reviews: 133,
    basePrice: 5.5,
    inStock: true,
    shortDescription: 'Natural kraft pouch with zipper',
    description:
      'Brown kraft standup pouch with a clear window, zipper lock and moisture barrier. Perfect for tea, coffee and organic snacks.',
    images: ['/products/pouch-kraft-window.png', '/products/pouch-hero.png'],
    sizes: POUCH_SIZES,
    colours: [
      { id: 'kraft', label: 'Kraft', hex: '#b45309' },
      { id: 'dark-kraft', label: 'Dark Kraft', hex: '#78350f' },
    ],
    packs: PACKS,
    features: ['Natural kraft laminate', 'Clear window', 'Zipper + tear notch', 'Eco-premium look'],
  },
  {
    id: 'sample-kit',
    slug: 'sample-kit',
    name: 'Sample Kit',
    category: 'pouches',
    badge: 'New look',
    featured: false,
    rating: 5,
    reviews: 1783,
    basePrice: 99,
    inStock: true,
    isSample: true,
    shortDescription: 'All types and colour pouches — try before you bulk-order',
    description:
      'Explore our complete range of high-quality stand-up pouches designed for food, dry fruits, spices, tea, coffee, pulses, pet food, and retail packaging applications.',
    images: ['/products/pouch-sample-kit.png', '/products/pouch-hero.png'],
    sizes: [{ id: 'kit', label: 'Assorted', dim: 'Mixed pouch samples', multiplier: 1 }],
    colours: [{ id: 'mixed', label: 'Mixed', hex: '#22c55e' }],
    packs: [{ id: '1', pieces: 1, label: '1 kit', multiplier: 1 }],
    features: ['Food Grade', 'Heat Sealable', 'Leak Proof', 'High Barrier', 'Airtight Zipper', 'Moisture Free'],
  },
  {
    id: 'box-corrugated',
    slug: 'corrugated-shipping-box',
    name: 'Corrugated Shipping Box',
    category: 'boxes',
    badge: 'Best Seller',
    featured: true,
    rating: 4.8,
    reviews: 156,
    basePrice: 18,
    inStock: true,
    shortDescription: '3-ply / 5-ply corrugated carton',
    description:
      'Strong corrugated shipping carton for e-commerce and wholesale. Pick inner size, kraft or white finish, and pack pieces.',
    images: [
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=80',
    ],
    sizes: BOX_SIZES,
    colours: [
      { id: 'kraft', label: 'Kraft', hex: '#b45309' },
      { id: 'white', label: 'White', hex: '#f8fafc' },
    ],
    packs: PACKS,
    features: ['3-ply / 5-ply options', 'E-commerce ready', 'Printable outer', 'Stack-strong'],
  },
  {
    id: 'box-mailer',
    slug: 'tuck-in-mailer-box',
    name: 'Tuck-in Mailer Box',
    category: 'boxes',
    badge: 'D2C Favourite',
    featured: true,
    rating: 4.7,
    reviews: 98,
    basePrice: 22,
    inStock: true,
    shortDescription: 'Unboxing-ready mailer carton',
    description:
      'Tuck-in mailer box for apparel, cosmetics and subscription brands. Clean edges, easy assembly, custom-print ready.',
    images: [
      'https://images.unsplash.com/photo-1607166452427-7e4477079cb9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=900&q=80',
    ],
    sizes: BOX_SIZES,
    colours: [
      { id: 'white', label: 'White', hex: '#f8fafc' },
      { id: 'black', label: 'Black', hex: '#111827' },
      { id: 'kraft', label: 'Kraft', hex: '#b45309' },
    ],
    packs: PACKS,
    features: ['Tuck-in lid', 'Premium unboxing', 'Lightweight', 'Brand-print ready'],
  },
  {
    id: 'box-rigid',
    slug: 'rigid-gift-box',
    name: 'Rigid Gift Box',
    category: 'boxes',
    badge: 'Premium',
    featured: true,
    rating: 4.9,
    reviews: 74,
    basePrice: 45,
    inStock: true,
    shortDescription: 'Magnetic lid rigid box',
    description:
      'Hard-board rigid gift box with magnetic lid. Ideal for jewellery, hampers and luxury D2C kits.',
    images: [
      'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1607166452427-7e4477079cb9?auto=format&fit=crop&w=900&q=80',
    ],
    sizes: BOX_SIZES.slice(0, 3),
    colours: [
      { id: 'black', label: 'Matte Black', hex: '#111827' },
      { id: 'navy', label: 'Navy', hex: '#1e3a8a' },
      { id: 'ivory', label: 'Ivory', hex: '#f5f5f4' },
    ],
    packs: PACKS.filter((p) => Number(p.pieces) <= 250),
    features: ['Magnetic lid', 'Rigid board', 'Foam insert option', 'Luxury finish'],
  },
  {
    id: 'box-folding',
    slug: 'folding-carton-box',
    name: 'Folding Carton Box',
    category: 'boxes',
    badge: 'Retail',
    featured: false,
    rating: 4.6,
    reviews: 61,
    basePrice: 12,
    inStock: true,
    shortDescription: 'Shelf-ready folding carton',
    description:
      'Printed folding carton for FMCG, tea, snacks and pharma-style retail packs. Flat-shipped, easy to erect.',
    images: [
      'https://images.unsplash.com/photo-1578768079052-aa76e52b45d8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=900&q=80',
    ],
    sizes: BOX_SIZES,
    colours: [
      { id: 'white', label: 'White', hex: '#f8fafc' },
      { id: 'kraft', label: 'Kraft', hex: '#b45309' },
    ],
    packs: PACKS,
    features: ['Flat packed', 'Retail shelf ready', 'CMYK print ready', 'Food-safe board'],
  },
  {
    id: 'label-vinyl',
    slug: 'waterproof-vinyl-labels',
    name: 'Waterproof Vinyl Labels',
    category: 'labels',
    badge: 'Waterproof',
    featured: true,
    rating: 4.8,
    reviews: 188,
    basePrice: 2.4,
    inStock: true,
    shortDescription: 'Die-cut vinyl for bottles & pouches',
    description:
      'Weatherproof vinyl labels with strong adhesive. Perfect for bottles, pouches, chillers and outdoor SKUs.',
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1563906267088-b029e7109504?auto=format&fit=crop&w=900&q=80',
    ],
    sizes: LABEL_SIZES,
    colours: [
      { id: 'white', label: 'White', hex: '#f8fafc' },
      { id: 'clear', label: 'Clear', hex: '#e5e7eb' },
      { id: 'black', label: 'Black', hex: '#111827' },
    ],
    packs: PACKS,
    features: ['Waterproof', 'Die-cut', 'Strong adhesive', 'Outdoor durable'],
  },
  {
    id: 'label-kraft',
    slug: 'kraft-paper-labels',
    name: 'Kraft Paper Labels',
    category: 'labels',
    badge: 'Eco',
    featured: true,
    rating: 4.7,
    reviews: 112,
    basePrice: 1.8,
    inStock: true,
    shortDescription: 'Natural kraft stickers',
    description:
      'Uncoated kraft paper labels for organic, bakery and handmade brands. Warm, earthy shelf look.',
    images: [
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80',
    ],
    sizes: LABEL_SIZES,
    colours: [
      { id: 'kraft', label: 'Kraft', hex: '#b45309' },
      { id: 'dark-kraft', label: 'Dark Kraft', hex: '#78350f' },
    ],
    packs: PACKS,
    features: ['Eco look', 'Writable surface', 'Food-safe adhesive', 'Custom die-cut'],
  },
  {
    id: 'label-clear',
    slug: 'clear-transparent-labels',
    name: 'Clear Transparent Labels',
    category: 'labels',
    badge: 'No-label look',
    featured: true,
    rating: 4.9,
    reviews: 97,
    basePrice: 2.8,
    inStock: true,
    shortDescription: 'Crystal-clear no-label look',
    description:
      'Transparent labels that disappear on glass and PET. Premium no-label look for serums, oils and beverages.',
    images: [
      'https://images.unsplash.com/photo-1563906267088-b029e7109504?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80',
    ],
    sizes: LABEL_SIZES,
    colours: [
      { id: 'clear', label: 'Clear', hex: '#e5e7eb' },
      { id: 'frost', label: 'Frost', hex: '#cbd5e1' },
    ],
    packs: PACKS,
    features: ['No-label look', 'Waterproof film', 'UV print ready', 'Residue-light adhesive'],
  },
  {
    id: 'label-thermal',
    slug: 'thermal-barcode-labels',
    name: 'Thermal Barcode Labels',
    category: 'labels',
    badge: 'Warehouse',
    featured: false,
    rating: 4.6,
    reviews: 83,
    basePrice: 1.2,
    inStock: true,
    shortDescription: 'Direct thermal shipping labels',
    description:
      'Direct thermal labels for Shiprocket / Amazon / warehouse printers. Sharp barcodes, no ink ribbon needed.',
    images: [
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80',
    ],
    sizes: [
      { id: '4x6', label: '4 × 6 in', dim: '100 × 150 mm', multiplier: 1 },
      { id: '4x3', label: '4 × 3 in', dim: '100 × 76 mm', multiplier: 0.85 },
      { id: '2x1', label: '2 × 1 in', dim: '50 × 25 mm', multiplier: 0.55 },
    ],
    colours: [{ id: 'white', label: 'White', hex: '#f8fafc' }],
    packs: PACKS,
    features: ['Direct thermal', 'Sharp barcodes', '4×6 shipping size', 'Core-compatible rolls'],
  },
]

export const REELS = [
  {
    id: 'reel-gold-glossy',
    productSlug: 'golden-standup-pouch-glossy',
    title: 'Gold glossy pouches',
    caption: 'Shelf-ready shine with zipper + window',
    views: '24.1k',
    poster: '/products/pouch-gold-glossy.png',
  },
  {
    id: 'reel-kraft',
    productSlug: 'kraft-standup-pouch-window',
    title: 'Kraft window pouches',
    caption: 'Natural look, food-grade barrier',
    views: '18.6k',
    poster: '/products/pouch-kraft-window.png',
  },
  {
    id: 'reel-transparent',
    productSlug: 'both-side-transparent-pouches',
    title: 'Crystal clear pouches',
    caption: 'Show the product. Protect the pack.',
    views: '15.9k',
    poster: '/products/pouch-transparent.png',
  },
  {
    id: 'reel-black',
    productSlug: 'matte-black-standup-pouch',
    title: 'Matte black standup',
    caption: 'Premium snack finish in bulk packs',
    views: '12.4k',
    poster: '/products/pouch-black-matte.png',
  },
  {
    id: 'reel-box',
    productSlug: 'corrugated-shipping-box',
    title: 'All India shipping boxes',
    caption: 'Strong mailers for every pincode',
    views: '21.3k',
    poster: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'reel-gift',
    productSlug: 'rigid-gift-box',
    title: 'Rigid gift boxes',
    caption: 'Unbox moments that feel premium',
    views: '9.8k',
    poster: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'reel-labels',
    productSlug: 'waterproof-vinyl-labels',
    title: 'Waterproof vinyl labels',
    caption: 'Stick, ship, stay readable',
    views: '11.2k',
    poster: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'reel-sample',
    productSlug: 'sample-kit',
    title: 'Sample kit',
    caption: 'Try finishes before you bulk order',
    views: '31.7k',
    poster: '/products/pouch-sample-kit.png',
  },
]

export function mergeCatalog(local) {
  if (!Array.isArray(local) || !local.length) return PRODUCTS
  const byId = new Map(local.map((p) => [p.id, p]))
  for (const product of PRODUCTS) {
    if (!byId.has(product.id)) {
      byId.set(product.id, product)
      continue
    }
    if (product.id === 'sample-kit') {
      const saved = byId.get(product.id)
      byId.set(product.id, {
        ...saved,
        name: product.name,
        slug: product.slug,
        basePrice: product.basePrice,
        isSample: true,
        description: product.description,
      })
    }
  }
  return [...byId.values()]
}

export function calcPrice(product, size, pack) {
  if (!product?.basePrice) return 0
  const perPiece = product.basePrice * (size?.multiplier || 1) * (pack?.multiplier || 1)
  const total = perPiece * (pack?.pieces || 1)
  return Math.max(1, Math.round(total))
}

export const GST_RATE = 0.18
export const BULK_MIN_QTY = 100
export const BULK_QTY_STEP = 100

export const BULK_TIERS = [
  { min: 100, max: 1000, off: 0, label: 'Standard' },
  { min: 1100, max: 3000, off: 5, label: '5% OFF' },
  { min: 3100, max: 5000, off: 7, label: '7% OFF' },
  { min: 5100, max: 10000, off: 12, label: '12% OFF' },
  { min: 10100, max: Infinity, off: 15, label: '15% OFF' },
]

export function bulkTier(pieces) {
  const qty = Number(pieces) || BULK_MIN_QTY
  return BULK_TIERS.find((t) => qty >= t.min && qty <= t.max) || BULK_TIERS[0]
}

export function nextBulkTier(pieces) {
  const current = bulkTier(pieces)
  const index = BULK_TIERS.findIndex((t) => t.min === current.min)
  return BULK_TIERS[index + 1] || null
}

export function piecePriceExcl(product, size, pieces) {
  if (!product?.basePrice) return 0
  const base = Number(product.basePrice) * (size?.multiplier || 1)
  const discounted = base * (1 - bulkTier(pieces).off / 100)
  return Math.round(discounted * 100) / 100
}

export function withGst(amount) {
  return Math.round(Number(amount) * (1 + GST_RATE) * 100) / 100
}

export function formatInr(n) {
  const num = Number(n)
  const digits = Number.isInteger(num) ? 0 : 2
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: 2 })}`
}

export function formatPiece(n) {
  return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
