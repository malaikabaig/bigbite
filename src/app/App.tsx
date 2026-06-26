import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Clock,
  Zap,
  Leaf,
  Star,
  Tag,
  Menu,
  X,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import Logo from '../../public/assets/images/logo.png';
import deliveryVideo from '../../public/assets/videos/deliveryvideo.mp4';
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaGlobe,
  FaWhatsapp,
} from 'react-icons/fa';

const WHATSAPP =
  'https://wa.me/923137788169?text=Hi%20BigBite!%20I%20want%20to%20place%20an%20order.';

// ─────────────────────────────────────────────
// CART TYPES
// ─────────────────────────────────────────────
interface SizeOption {
  label: string;
  price: number;
}

interface CartItem {
  id: string; // unique key: `${name}__${size}`
  name: string;
  category: string;
  size: string | null;
  price: number;
  qty: number;
}

// ─────────────────────────────────────────────
// PRICE PARSING HELPERS
// ─────────────────────────────────────────────

/** Returns size options for categories that have multiple sizes.
 *  Returns null for single-price items. */
function getSizeOptions(
  category: string,
  priceStr: string,
): SizeOption[] | null {
  const isPizza =
    category === 'Classic Pizzas' || category === 'Special Pizzas';
  const isFries = category === 'Fries';
  const isPasta = category === 'Pastas';

  if (!isPizza && !isFries && !isPasta) return null;

  const parts = priceStr.split('/').map((p) => p.trim().replace(/[^0-9]/g, ''));

  if (isPizza) {
    // Up to 4 sizes: S M L XL — some items only have 3 (stuffed crust) or 2 (square)
    const labels = ['S', 'M', 'L', 'XL'];
    return parts.map((p, i) => ({
      label: labels[i] ?? `Size ${i + 1}`,
      price: Number(p),
    }));
  }

  if (isFries || isPasta) {
    const labels = ['R', 'L'];
    return parts.map((p, i) => ({
      label: labels[i] ?? `Size ${i + 1}`,
      price: Number(p),
    }));
  }

  return null;
}

/** Parse a single numeric price from strings like "Rs 230" or "230". */
function parseSinglePrice(priceStr: string): number {
  const n = priceStr.replace(/[^0-9]/g, '');
  return Number(n) || 0;
}

const deals = [
  {
    name: 'Savor Deal',
    items: ['1 Large Pizza', '10 Oven Baked Wings', '1L Drink'],
    price: 'Rs 1,650',
    tag: '🍕',
  },
  {
    name: 'Student Deal',
    items: ['4 Small Pizzas', '1L Drink'],
    price: 'Rs 1,650',
    tag: '🎓',
  },
  {
    name: 'Fun Deal',
    items: ['2 Large Pizzas', '1.5L Drink'],
    price: 'Rs 2,200',
    tag: '🎉',
  },
  {
    name: 'Jumbo Deal',
    items: ['2 Medium Pizzas', '1L Drink'],
    price: 'Rs 1,580',
    tag: '💥',
  },
  {
    name: 'Super Deal',
    items: ['1 Medium Pizza', '1 Large Pasta', '1L Drink'],
    price: 'Rs 1,399',
    tag: '⚡',
  },
  {
    name: 'Dine-In Deal',
    items: ['1 Large Pizza', '4 Zinger Burgers', '1L Drink'],
    price: 'Rs 2,499',
    tag: '🍽️',
  },
  {
    name: 'Birthday Deal',
    items: [
      '2 Large Pizzas',
      '1 Pound Cake',
      '2 Zinger Burgers',
      '10 Hot Wings',
      '2L Drink',
    ],
    price: 'Rs 3,800',
    tag: '🎂',
  },
  {
    name: 'Zinger Feast',
    items: ['4 Zinger Burgers', '1.5L Drink'],
    price: 'Rs 1,599',
    tag: '🔥',
  },
];

const menuData: Record<string, { name: string; price: string }[]> = {
  Burgers: [
    { name: 'Patty Burger', price: 'Rs 230' },
    { name: 'Tikka Masala Burger', price: 'Rs 270' },
    { name: 'Grilled Burger', price: 'Rs 299' },
    { name: 'Pizza Burger', price: 'Rs 300' },
    { name: 'Zinger Burger', price: 'Rs 350' },
    { name: 'Jalapeno Burger', price: 'Rs 370' },
    { name: 'Tower Burger', price: 'Rs 450' },
    { name: 'Dynamite Burger', price: 'Rs 450' },
  ],
  'Classic Pizzas': [
    { name: 'Chicken Tikka', price: '370 / 730 / 1050 / 1399' },
    { name: 'Chicken Fajita', price: '370 / 730 / 1050 / 1399' },
    { name: 'Hot & Spicy', price: '370 / 730 / 1050 / 1399' },
    { name: 'The Euro', price: '370 / 730 / 1050 / 1399' },
    { name: 'Chicken Tandoori', price: '370 / 730 / 1050 / 1399' },
    { name: 'Cheese Lovers', price: '350 / 700 / 1000 / 1300' },
    { name: 'Vegetarian', price: '350 / 700 / 1000 / 1250' },
  ],
  'Special Pizzas': [
    { name: 'Big Bite Special', price: '430 / 780 / 1150 / 1499' },
    { name: 'Chicken Supreme', price: '430 / 780 / 1150 / 1499' },
    { name: 'Malai Boti', price: '450 / 850 / 1250 / 1650' },
    { name: 'Bihari Kebab', price: '480 / 850 / 1300 / 1700' },
    { name: 'Royal Crust', price: '500 / 999 / 1400 / 1699' },
    { name: 'Kebab Stuffed Crust', price: '999 / 1400 / 1750' },
    { name: 'Cheese Stuffed Crust', price: '999 / 1400 / 1750' },
    { name: 'New York Stuffed Crust', price: '999 / 1400 / 1750' },
    { name: 'Lava Pizza', price: '1250 / 1550 / 1950' },
    { name: 'Square Pizza', price: '1000 / 1300' },
  ],
  Fries: [
    { name: 'French Fries', price: '250 / 350' },
    { name: 'Mayo Garlic Fries', price: '300 / 400' },
    { name: 'Masala Fries', price: '250 / 350' },
    { name: 'Loaded Fries', price: '350 / 550' },
    { name: 'Cheese Fries', price: '350 / 450' },
  ],
  'Rolls & Shawarma': [
    { name: 'Chicken Shawarma', price: 'Rs 190' },
    { name: 'Chicken Paratha Roll', price: 'Rs 250' },
    { name: 'Zinger Shawarma', price: 'Rs 290' },
    { name: 'Zinger Paratha Roll', price: 'Rs 300' },
    { name: 'Malai Boti Shawarma', price: 'Rs 250' },
    { name: 'Pizza Paratha Roll', price: 'Rs 300' },
    { name: 'Malai Boti Paratha Roll', price: 'Rs 300' },
    { name: '2 Bread + Chicken Sauce + Drink', price: 'Rs 480' },
    { name: 'Kebab Shawarma', price: 'Rs 300' },
    { name: 'Kebab Paratha Roll', price: 'Rs 300' },
  ],
  Starters: [
    { name: '1 Spin Roll + 6 Wings + 300ml Drink', price: 'Rs 900' },
    { name: 'Hot Wings (10 pcs)', price: 'Rs 550' },
    { name: 'Oven Baked Wings (10 pcs)', price: 'Rs 480' },
    { name: 'Nuggets (10 pcs)', price: 'Rs 450' },
  ],
  'Cheese Sticks': [
    { name: 'Small', price: 'Rs 450' },
    { name: 'Medium', price: 'Rs 750' },
    { name: 'Large', price: 'Rs 980' },
  ],
  Sandwiches: [
    { name: 'Club Sandwich', price: 'Rs 350' },
    { name: 'Mexican Sandwich', price: 'Rs 550' },
    { name: 'Chicken Wrap', price: 'Rs 450' },
    { name: 'Special Sandwich', price: 'Rs 350' },
    { name: 'Spin Ring Roll', price: 'Rs 480' },
    { name: 'Dual Doner', price: 'Rs 550' },
  ],
  Pastas: [
    { name: 'Special Pasta', price: '350 / 530' },
    { name: 'Kebabish Pasta', price: '350 / 580' },
  ],
  Desserts: [{ name: 'Brownie', price: 'Rs 280' }],
};

const categoryImages: Record<string, string> = {
  Burgers:
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=240&fit=crop&auto=format',
  'Classic Pizzas':
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=240&fit=crop&auto=format',
  'Special Pizzas':
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=240&fit=crop&auto=format',
  Fries:
    'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=240&fit=crop&auto=format',
  'Rolls & Shawarma':
    'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=240&fit=crop&auto=format',
  Starters:
    'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=240&fit=crop&auto=format',
  'Cheese Sticks':
    'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=240&fit=crop&auto=format',
  Sandwiches:
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=240&fit=crop&auto=format',
  Pastas:
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=240&fit=crop&auto=format',
  Desserts:
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=240&fit=crop&auto=format',
};

const bestSellers = [
  {
    name: 'Big Bite Special Pizza',
    desc: 'Our signature masterpiece with premium toppings and layers of flavor.',
    price: 'Rs 430+',
    // cartPrice: price string used by getSizeOptions — matches Special Pizzas entry
    cartCategory: 'Special Pizzas',
    cartPrice: '430 / 780 / 1150 / 1499',
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=260&fit=crop&auto=format',
  },
  {
    name: 'Chicken Supreme Pizza',
    desc: 'Juicy chicken with supreme sauce and a blanket of melted cheese.',
    price: 'Rs 430+',
    cartCategory: 'Special Pizzas',
    cartPrice: '430 / 780 / 1150 / 1499',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=260&fit=crop&auto=format',
  },
  {
    name: 'Zinger Burger',
    desc: 'Crispy zinger fillet, fresh lettuce, and our secret sauce.',
    price: 'Rs 350',
    cartCategory: 'Burgers',
    cartPrice: 'Rs 350',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=260&fit=crop&auto=format',
  },
  {
    name: 'Dynamite Burger',
    desc: 'Stacked high with fiery dynamite sauce and every fix-in.',
    price: 'Rs 450',
    cartCategory: 'Burgers',
    cartPrice: 'Rs 450',
    img: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=260&fit=crop&auto=format',
  },
  {
    name: 'Loaded Fries',
    desc: 'Crispy fries piled with cheese, sauces, and toppings galore.',
    price: 'Rs 350+',
    cartCategory: 'Fries',
    cartPrice: '350 / 550',
    img: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=260&fit=crop&auto=format',
  },
  {
    name: 'Chicken Shawarma',
    desc: 'Fresh-rolled with grilled chicken and signature garlic sauce.',
    price: 'Rs 190',
    cartCategory: 'Rolls & Shawarma',
    cartPrice: 'Rs 190',
    img: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=260&fit=crop&auto=format',
  },
];

const galleryItems = [
  {
    label: 'Pizzas',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&h=480&fit=crop&auto=format',
  },
  {
    label: 'Burgers',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&h=480&fit=crop&auto=format',
  },
  {
    label: 'Shawarma',
    img: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=700&h=900&fit=crop&auto=format',
  },
  {
    label: 'Fries',
    img: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=700&h=480&fit=crop&auto=format',
  },
  {
    label: 'Wings',
    img: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=700&h=480&fit=crop&auto=format',
  },
  {
    label: 'Pasta',
    img: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=700&h=480&fit=crop&auto=format',
  },
];

const whyUs: { icon: ReactNode; title: string; desc: string }[] = [
  {
    icon: <Leaf size={28} />,
    title: 'Fresh Ingredients',
    desc: 'We source only the finest, freshest ingredients every day. No shortcuts, no compromises — ever.',
  },
  {
    icon: <Zap size={28} />,
    title: 'Fast Delivery',
    desc: 'Hot food at your door in record time. We move fast so your food stays hot.',
  },
  {
    icon: <Star size={28} />,
    title: 'Premium Quality',
    desc: 'Restaurant-grade quality in every single bite. We take pride in every plate we send out.',
  },
  {
    icon: <Tag size={28} />,
    title: 'Affordable Prices',
    desc: "Big flavors that don't break the bank. Incredible value for every craving.",
  },
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState('Burgers');
  const [currentDeal, setCurrentDeal] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const categories = Object.keys(menuData);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── CART STATE ───
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  /** Tracks which size is selected per menu card: key = `${category}__${itemName}` */
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(
    {},
  );

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  function addToCart(
    category: string,
    itemName: string,
    priceStr: string,
    overrideKey?: string,
  ) {
    const sizeOpts = getSizeOptions(category, priceStr);
    let size: string | null = null;
    let price = 0;

    if (sizeOpts) {
      const key = overrideKey ?? `${category}__${itemName}`; // ← yahan change
      const chosen = selectedSizes[key];
      if (!chosen) {
        alert('Please select a size first!');
        return;
      }
      const opt = sizeOpts.find((o) => o.label === chosen);
      if (!opt) return;
      size = chosen;
      price = opt.price;
    } else {
      price = parseSinglePrice(priceStr);
    }

    const id = `${itemName}__${size ?? 'single'}`;
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing) {
        return prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { id, name: itemName, category, size, price, qty: 1 }];
    });
  }

  function changeQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0),
    );
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }

  function buildWhatsAppMessage(): string {
    if (cart.length === 0) return '';
    let msg = '🍔 *BIG BITE ORDER*\n\n';
    cart.forEach((item) => {
      const sizeStr = item.size ? ` (${item.size})` : '';
      msg += `• ${item.name}${sizeStr} x${item.qty} — Rs ${(item.price * item.qty).toLocaleString()}\n`;
    });
    msg += `\n*Total: Rs ${cartTotal.toLocaleString()}*\n\n`;
    msg += 'Customer Name:\nCustomer Phone:\n\nPlease confirm my order.';
    return msg;
  }

  function orderOnWhatsApp() {
    const msg = buildWhatsAppMessage();
    const url = `https://wa.me/923137788169?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentDeal((p) => (p + 1) % deals.length);
    }, 3500);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const goTo = (i: number) => {
    setCurrentDeal(i);
    startTimer();
  };
  const prev = () => goTo((currentDeal - 1 + deals.length) % deals.length);
  const next = () => goTo((currentDeal + 1) % deals.length);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const btnRed: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ff2b3d, #b50018)',
    color: '#fff',
    padding: '14px 30px',
    borderRadius: 999,
    fontWeight: 700,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 40px rgba(255,43,61,0.3)',
    fontSize: 14,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  const card: React.CSSProperties = {
    background: '#121212',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 28,
    overflow: 'hidden',
    transition: 'transform 0.4s ease, border-color 0.4s ease',
  };

  const wrap: React.CSSProperties = {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '0 20px',
  };

  const sectionLabel: React.CSSProperties = {
    color: '#ffb703',
    letterSpacing: 4,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 'clamp(42px, 5vw, 68px)',
    fontWeight: 400,
    lineHeight: 1,
    margin: 0,
  };

  const socialStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(255,255,255,.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    textDecoration: 'none',
  };

  const footerLink = {
    color: 'rgba(255,255,255,.7)',
    textDecoration: 'none',
  };

  return (
    <div
      style={{
        background: '#070707',
        color: '#f5f5f5',
        fontFamily: "'Inter', sans-serif",
        overflowX: 'hidden',
      }}
    >
      <style>{`
  @keyframes float {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(-16px); }
  }

  @keyframes fallDown {
    0% {
      opacity: 0;
      transform: translateY(-250px) scale(0.7);
    }

    60% {
      opacity: 1;
      transform: translateY(20px) scale(1.05);
    }

    80% {
      transform: translateY(-10px) scale(0.98);
    }

    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .bb-float {
    animation: float 4s ease-in-out infinite;
  }

  .big-drop {
    display: block;
    animation: fallDown 1.2s cubic-bezier(0.22,1,0.36,1) forwards;
  }

  .bite-drop {
    display: block;
    opacity: 0;
    animation: fallDown 1.2s cubic-bezier(0.22,1,0.36,1) forwards;
    animation-delay: 0.5s;
  }

  .bb-card:hover {
    transform: translateY(-10px) !important;
    border-color: rgba(255,43,61,0.4) !important;
  }

  .bb-btn:hover {
    transform: translateY(-3px) !important;
    box-shadow: 0 20px 50px rgba(255,43,61,0.45) !important;
  }

  .bb-outline:hover {
    border-color: rgba(255,255,255,0.55) !important;
    background: rgba(255,255,255,0.05) !important;
  }

  .bb-nav:hover {
    color: #fff !important;
  }

  .bb-gal {
    position: relative;
    overflow: hidden;
    border-radius: 20px;
    background: #1a1a1a;
  }

  .bb-gal img {
    transition: transform 0.5s ease;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .bb-gal:hover img {
    transform: scale(1.07);
  }

  .bb-gal-lbl {
    opacity: 0;
    transition: opacity 0.3s ease;
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    padding: 18px 20px;
    background: linear-gradient(to top, rgba(0,0,0,0.65), transparent);
    pointer-events: none;
  }

  .bb-gal:hover .bb-gal-lbl {
    opacity: 1;
  }

  .bb-tab:hover {
    background: rgba(255,255,255,0.08) !important;
  }

  html {
    scroll-behavior: smooth;
  }

  *::-webkit-scrollbar {
    width: 4px;
  }

  *::-webkit-scrollbar-track {
    background: transparent;
  }

  *::-webkit-scrollbar-thumb {
    background: rgba(255,43,61,0.3);
    border-radius: 2px;
  }
`}</style>

      {/* BG glow */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at top right, rgba(255,43,61,0.2), transparent 30%), radial-gradient(circle at 15% 70%, rgba(255,43,61,0.1), transparent 25%)',
        }}
      />

      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: scrolled ? '10px 0' : '18px 0',
          transition: 'padding 0.4s ease',
        }}
      >
        <div style={wrap}>
          <div
            style={{
              background: 'rgba(14,14,14,0.88)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(24px)',
              borderRadius: 999,
              padding: '14px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
            }}
          >
            <button
              type="button"
              onClick={() => scrollTo('home')}
              aria-label="Go to Big Bite home"
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <img
                src={Logo}
                alt="Big Bite"
                style={{
                  height: scrolled ? 44 : 54,
                  width: 'auto',
                  maxWidth: 165,
                  objectFit: 'contain',
                  display: 'block',
                  transition: 'height 0.4s ease',
                  filter: 'drop-shadow(0 0 12px rgba(255,43,61,0.22))',
                }}
              />
            </button>

            <ul
              style={{ gap: 4, listStyle: 'none', margin: 0, padding: 0 }}
              className="hidden lg:flex"
            >
              {[
                ['Home', 'home'],
                ['Menu', 'menu'],
                ['Deals', 'deals'],
                ['Best Sellers', 'bestsellers'],
                ['Contact', 'contact'],
              ].map(([label, id]) => (
                <li key={id}>
                  <button
                    className="bb-nav"
                    onClick={() => scrollTo(id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#aaa',
                      fontWeight: 600,
                      padding: '8px 14px',
                      cursor: 'pointer',
                      fontSize: 14,
                      transition: 'color 0.3s',
                      fontFamily: 'inherit',
                    }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>

            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="bb-btn hidden lg:inline-flex"
              style={{
                ...btnRed,
                textDecoration: 'none',
                padding: '12px 24px',
              }}
            >
              Order Now
            </a>

            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div
              style={{
                background: 'rgba(10,10,10,0.97)',
                backdropFilter: 'blur(24px)',
                borderRadius: 20,
                marginTop: 8,
                padding: '16px 20px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {[
                ['Home', 'home'],
                ['Menu', 'menu'],
                ['Deals', 'deals'],
                ['Best Sellers', 'bestsellers'],
                ['Contact', 'contact'],
              ].map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#ccc',
                    fontWeight: 600,
                    padding: '13px 0',
                    cursor: 'pointer',
                    fontSize: 15,
                    textAlign: 'left',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    fontFamily: 'inherit',
                  }}
                >
                  {label}
                </button>
              ))}
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...btnRed,
                  display: 'flex',
                  marginTop: 16,
                  textDecoration: 'none',
                }}
              >
                Order On WhatsApp
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        id="home"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '140px 0 80px',
        }}
      >
        <div style={{ ...wrap, width: '100%' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '10px 22px',
                  borderRadius: 999,
                  background: 'rgba(255,183,3,0.06)',
                  border: '1px solid rgba(255,183,3,0.2)',
                  color: '#d8b96d',
                  fontSize: 11,
                  letterSpacing: 4,
                  marginBottom: 32,
                  fontWeight: 700,
                }}
              >
                Faisalabad • Mansoorabad
              </div>

              <h1
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'clamp(90px, 12vw, 200px)',
                  lineHeight: 0.85,
                  letterSpacing: '-4px',
                  margin: '0 0 24px 0',
                  fontWeight: 400,
                }}
              >
                <span className="big-drop">BIG</span>

                <span
                  className="bite-drop"
                  style={{
                    color: '#ff2b3d',
                    textShadow: '0 0 40px rgba(255,43,61,0.4)',
                  }}
                >
                  BITE
                </span>
              </h1>

              <h3
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: '#ffb703',
                  fontSize: 'clamp(24px, 3vw, 48px)',
                  margin: '0 0 20px 0',
                  fontWeight: 400,
                  letterSpacing: 1,
                }}
              >
                WE DELIVER TASTE + QUALITY
              </h3>

              <p
                style={{
                  color: '#9e9e9e',
                  fontSize: 17,
                  lineHeight: 1.85,
                  maxWidth: 480,
                  margin: 0,
                }}
              >
                Pizzas straight from the oven, burgers stacked tall, wings
                glazed in signature sauces and shawarmas rolled fresh to order.
                Cooked hot and delivered fast.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  marginTop: 38,
                  flexWrap: 'wrap',
                }}
              >
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bb-btn"
                  style={{
                    ...btnRed,
                    padding: '16px 34px',
                    fontSize: 15,
                    textDecoration: 'none',
                  }}
                >
                  ORDER ON WHATSAPP
                </a>
                <button
                  className="bb-outline"
                  onClick={() => scrollTo('menu')}
                  style={{
                    background: 'none',
                    border: '2px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    padding: '16px 34px',
                    borderRadius: 999,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 15,
                    fontFamily: 'inherit',
                    transition: 'border-color 0.3s, background 0.3s',
                  }}
                >
                  SEE MENU
                </button>
              </div>
            </div>

            {/* Video */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 700,
              }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                className="bb-float"
                style={{
                  width: 290,
                  maxHeight: 580,
                  objectFit: 'contain',
                  borderRadius: 28,
                  filter:
                    'drop-shadow(0 0 30px rgba(255,43,61,0.3)) drop-shadow(0 40px 80px rgba(0,0,0,0.8))',
                }}
              >
                <source src={deliveryVideo} type="video/mp4" />
              </video>
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  marginTop: '50 px',
                  bottom: 22,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: 'max-content',
                  maxWidth: '90%',
                  padding: '12px 18px',
                  borderRadius: 999,
                  background: 'rgba(18,18,18,0.82)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(18px)',
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  textAlign: 'center',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.35)',
                }}
              >
                <MapPin size={15} style={{ color: '#ffb703', flexShrink: 0 }} />
                <span>
                  Delivering across Mansoorabad, Kashmir Road, Gulistan Colony &
                  Millat Road
                </span>
              </div>
              <div
                className="hidden lg:flex"
                style={{
                  position: 'absolute',
                  top: 80,
                  left: 20,
                  width: 132,
                  height: 132,
                  borderRadius: '50%',
                  background: '#ffb703',
                  color: '#111',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 15,
                  lineHeight: 1.1,
                  transform: 'rotate(-10deg)',
                  padding: 10,
                }}
              >
                TRY THE BIG BITE SPECIAL
              </div>

              <div
                style={{
                  position: 'absolute',
                  right: 10,
                  bottom: 80,
                  padding: '18px 22px',
                  background: '#ff2b3d',
                  color: 'white',
                  borderRadius: 999,
                  transform: 'rotate(8deg)',
                  boxShadow: '0 10px 40px rgba(255,43,61,0.5)',
                }}
              >
                <div
                  style={{ fontSize: 10, letterSpacing: 2, fontWeight: 700 }}
                >
                  STARTING FROM ONLY
                </div>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 38,
                    lineHeight: 1,
                  }}
                >
                  RS 230
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEALS ── */}
      <section id="deals">
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={sectionLabel}>Special Offers</div>
            <h2 style={sectionTitle}>
              Featured <span style={{ color: '#ff2b3d' }}>Deals</span>
            </h2>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ overflow: 'hidden', borderRadius: 28 }}>
              <div
                style={{
                  display: 'flex',
                  transition: 'transform 0.65s cubic-bezier(0.22,1,0.36,1)',
                  transform: `translateX(-${currentDeal * 100}%)`,
                }}
              >
                {deals.map((deal, i) => (
                  <div key={i} style={{ minWidth: '100%' }}>
                    <div
                      style={{
                        background: '#121212',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 28,
                        overflow: 'hidden',
                      }}
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Red panel */}
                        <div
                          style={{
                            background:
                              'linear-gradient(135deg, #ff2b3d 0%, #80000e 100%)',
                            padding: '40px 44px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                          className="lg:w-72"
                        >
                          <div
                            style={{
                              fontSize: 48,
                              lineHeight: 1,
                              marginBottom: 10,
                            }}
                          >
                            {deal.tag}
                          </div>
                          <h3
                            style={{
                              fontFamily: "'Bebas Neue', sans-serif",
                              fontSize: 44,
                              margin: 0,
                              lineHeight: 1,
                              color: '#fff',
                              fontWeight: 400,
                            }}
                          >
                            {deal.name}
                          </h3>
                          <div
                            style={{
                              marginTop: 18,
                              background: 'rgba(255,255,255,0.18)',
                              borderRadius: 999,
                              padding: '9px 20px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 8,
                              alignSelf: 'flex-start',
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                letterSpacing: 2,
                                color: 'rgba(255,255,255,0.85)',
                                fontWeight: 700,
                              }}
                            >
                              ONLY
                            </span>
                            <span
                              style={{
                                fontFamily: "'Bebas Neue', sans-serif",
                                fontSize: 30,
                                color: '#fff',
                                lineHeight: 1,
                              }}
                            >
                              {deal.price}
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        <div
                          style={{
                            padding: '40px 44px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: 12,
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              color: '#ffb703',
                              fontSize: 11,
                              letterSpacing: 3,
                              fontWeight: 700,
                              marginBottom: 4,
                            }}
                          >
                            WHAT YOU GET
                          </div>
                          {deal.items.map((item, j) => (
                            <div
                              key={j}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                              }}
                            >
                              <CheckCircle2
                                size={17}
                                style={{ color: '#ff2b3d', flexShrink: 0 }}
                              />
                              <span style={{ fontSize: 16, fontWeight: 500 }}>
                                {item}
                              </span>
                            </div>
                          ))}
                          <a
                            href={WHATSAPP}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bb-btn"
                            style={{
                              ...btnRed,
                              marginTop: 12,
                              alignSelf: 'flex-start',
                              textDecoration: 'none',
                            }}
                          >
                            Order This Deal
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={prev}
              className="hidden lg:flex"
              style={{
                position: 'absolute',
                left: -22,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'rgba(18,18,18,0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="hidden lg:flex"
              style={{
                position: 'absolute',
                right: -22,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'rgba(18,18,18,0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              marginTop: 28,
            }}
          >
            {deals.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === currentDeal ? 28 : 8,
                  height: 8,
                  borderRadius: 999,
                  background:
                    i === currentDeal ? '#ff2b3d' : 'rgba(255,255,255,0.18)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Mobile arrows */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              marginTop: 16,
            }}
            className="lg:hidden"
          >
            <button
              onClick={prev}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(18,18,18,0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(18,18,18,0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── MENU ── */}
      <section id="menu" style={{ padding: '60px 0' }}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={sectionLabel}>Freshly Crafted Menu</div>
            <h2 style={sectionTitle}>
              Explore The <span style={{ color: '#ff2b3d' }}>Flavor</span>
            </h2>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              justifyContent: 'center',
              marginBottom: 44,
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                className="bb-tab"
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 999,
                  border: '1px solid',
                  borderColor:
                    activeCategory === cat
                      ? '#ff2b3d'
                      : 'rgba(255,255,255,0.1)',
                  background:
                    activeCategory === cat
                      ? 'rgba(255,43,61,0.14)'
                      : 'rgba(255,255,255,0.03)',
                  color: activeCategory === cat ? '#fff' : '#888',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 13,
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {menuData[activeCategory].map((item, i) => {
              const sizeOpts = getSizeOptions(activeCategory, item.price);
              const cardKey = `${activeCategory}__${item.name}`;
              const chosenSize = selectedSizes[cardKey] ?? '';

              return (
                <div key={i} className="bb-card" style={card}>
                  <div
                    style={{
                      height: 200,
                      overflow: 'hidden',
                      background: '#1a1a1a',
                    }}
                  >
                    <img
                      src={categoryImages[activeCategory]}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div style={{ padding: '20px 22px' }}>
                    <div
                      style={{
                        color: '#ffb703',
                        fontSize: 10,
                        letterSpacing: 3,
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      {activeCategory.toUpperCase()}
                    </div>
                    <h5
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        margin: '0 0 8px 0',
                      }}
                    >
                      {item.name}
                    </h5>

                    {/* ── SIZE SELECTOR (Pizza / Fries / Pasta) ── */}
                    {sizeOpts ? (
                      <div style={{ marginBottom: 14 }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: 6,
                            flexWrap: 'wrap',
                            marginBottom: 10,
                          }}
                        >
                          {sizeOpts.map((opt) => (
                            <button
                              key={opt.label}
                              onClick={() =>
                                setSelectedSizes((prev) => ({
                                  ...prev,
                                  [cardKey]: opt.label,
                                }))
                              }
                              style={{
                                padding: '7px 13px',
                                borderRadius: 999,
                                border: '1px solid',
                                borderColor:
                                  chosenSize === opt.label
                                    ? '#ff2b3d'
                                    : 'rgba(255,255,255,0.12)',
                                background:
                                  chosenSize === opt.label
                                    ? 'rgba(255,43,61,0.18)'
                                    : '#111',
                                color:
                                  chosenSize === opt.label ? '#fff' : '#ffb703',
                                fontWeight: 700,
                                fontSize: 13,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontFamily: 'inherit',
                              }}
                            >
                              {opt.label} — Rs {opt.price.toLocaleString()}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          color: '#ffb703',
                          fontSize: 18,
                          fontWeight: 700,
                          marginBottom: 14,
                        }}
                      >
                        {item.price.startsWith('Rs')
                          ? item.price
                          : `Rs ${item.price}`}
                      </div>
                    )}

                    {/* ── ADD TO CART BUTTON ── */}
                    <button
                      className="bb-btn"
                      onClick={() =>
                        addToCart(activeCategory, item.name, item.price)
                      }
                      style={{
                        ...btnRed,
                        width: '100%',
                        fontSize: 13,
                        padding: '11px 16px',
                        gap: 6,
                        border: 'none',
                      }}
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ── */}
      <section id="bestsellers">
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={sectionLabel}>Crowd Favorites</div>
            <h2 style={sectionTitle}>
              Best <span style={{ color: '#ff2b3d' }}>Sellers</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestSellers.map((item, i) => {
              const sizeOpts = getSizeOptions(
                item.cartCategory,
                item.cartPrice,
              );
              const cardKey = `bs__${item.name}`;
              const chosenSize = selectedSizes[cardKey] ?? '';

              return (
                <div
                  key={i}
                  className="bb-card"
                  style={{ ...card, position: 'relative' }}
                >
                  {/* Image */}
                  <div
                    style={{
                      height: 220,
                      overflow: 'hidden',
                      background: '#1a1a1a',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      loading="lazy"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        background: '#ff2b3d',
                        color: '#fff',
                        borderRadius: 999,
                        padding: '5px 13px',
                        fontWeight: 700,
                        fontSize: 11,
                        letterSpacing: 1,
                      }}
                    >
                      BEST SELLER
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '24px 26px' }}>
                    <h4
                      style={{
                        fontSize: 19,
                        fontWeight: 700,
                        margin: '0 0 8px 0',
                      }}
                    >
                      {item.name}
                    </h4>
                    <p
                      style={{
                        color: '#9e9e9e',
                        fontSize: 14,
                        lineHeight: 1.7,
                        margin: '0 0 14px 0',
                      }}
                    >
                      {item.desc}
                    </p>

                    {/* Size selector for Pizza / Fries */}
                    {sizeOpts ? (
                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          flexWrap: 'wrap',
                          marginBottom: 14,
                        }}
                      >
                        {sizeOpts.map((opt) => (
                          <button
                            key={opt.label}
                            onClick={() =>
                              setSelectedSizes((prev) => ({
                                ...prev,
                                [cardKey]: opt.label,
                              }))
                            }
                            style={{
                              padding: '7px 13px',
                              borderRadius: 999,
                              border: '1px solid',
                              borderColor:
                                chosenSize === opt.label
                                  ? '#ff2b3d'
                                  : 'rgba(255,255,255,0.12)',
                              background:
                                chosenSize === opt.label
                                  ? 'rgba(255,43,61,0.18)'
                                  : '#111',
                              color:
                                chosenSize === opt.label ? '#fff' : '#ffb703',
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              fontFamily: 'inherit',
                            }}
                          >
                            {opt.label} — Rs {opt.price.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          color: '#ffb703',
                          fontSize: 22,
                          fontWeight: 700,
                          marginBottom: 14,
                        }}
                      >
                        {item.price}
                      </div>
                    )}

                    {/* Add to Cart button */}
                    <button
                      className="bb-btn"
                      onClick={() =>
                        addToCart(
                          item.cartCategory,
                          item.name,
                          item.cartPrice,
                          cardKey,
                        )
                      }
                      style={{
                        ...btnRed,
                        width: '100%',
                        fontSize: 13,
                        padding: '11px 20px',
                        gap: 8,
                        border: 'none',
                        justifyContent: 'center',
                      }}
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section style={{ padding: '60px 0' }}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={sectionLabel}>Why People Love BigBite</div>
            <h2 style={sectionTitle}>
              Crafted For The{' '}
              <span style={{ color: '#ff2b3d' }}>Perfect Bite</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyUs.map((item, i) => (
              <div
                key={i}
                className="bb-card"
                style={{ ...card, padding: '36px 28px' }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: 'rgba(255,43,61,0.1)',
                    border: '1px solid rgba(255,43,61,0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ff2b3d',
                    marginBottom: 20,
                  }}
                >
                  {item.icon}
                </div>
                <h4
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    margin: '0 0 10px 0',
                  }}
                >
                  {item.title}
                </h4>
                <p
                  style={{
                    color: '#9e9e9e',
                    fontSize: 14,
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About US ── */}

      <section
        id="about"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '70px 24px',
        }}
      >
        {/* TOP CONTENT */}

        <div
          style={{
            textAlign: 'center',
            marginBottom: '35px',
          }}
        >
          <span
            style={{
              color: '#ffcc33',
              fontSize: '14px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            About Big Bite
          </span>

          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(38px, 5vw, 70px)',
              lineHeight: 0.95,
              margin: '20px 0',
              letterSpacing: '-2px',
            }}
          >
            MORE THAN JUST
            <br />
            <span
              style={{
                color: '#ff2b3d',
                textShadow: '0 0 30px rgba(255,43,61,.35)',
              }}
            >
              FAST FOOD
            </span>
          </h2>

          <p
            style={{
              maxWidth: '900px',
              margin: '0 auto',
              color: 'rgba(255,255,255,.65)',
              fontSize: '18px',
              lineHeight: 1.9,
            }}
          >
            Big Bite delivers premium burgers, pizzas, shawarmas and loaded fast
            food crafted fresh every day with quality ingredients and
            unforgettable flavor.
          </p>
        </div>

        {/* GRID */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(450px,1fr))',
            gap: '30px',
            alignItems: 'stretch',
          }}
        >
          {/* LEFT IMAGE */}

          <div
            style={{
              position: 'relative',
              borderRadius: '32px',
              overflow: 'hidden',
              minHeight: '520px',
            }}
          >
            <img
              src="../../public/assets/images/about.jpg"
              alt="Big Bite"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to top, rgba(0,0,0,.9), rgba(0,0,0,.15))',
              }}
            />

            <div
              style={{
                position: 'absolute',
                bottom: '25px',
                left: '35px',
                right: '35px',
              }}
            >
              <span
                style={{
                  background: 'rgba(255,255,255,.12)',
                  padding: '10px 22px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  letterSpacing: '2px',
                }}
              >
                Big Bite Experience
              </span>

              <h3
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'clamp(40px,4vw,65px)',
                  lineHeight: '.9',
                  margin: '20px 0',
                }}
              >
                TASTE THE
                <br />
                <span style={{ color: '#ff2b3d' }}>DIFFERENCE</span>
              </h3>

              <p
                style={{
                  color: 'rgba(255,255,255,.8)',
                  lineHeight: 1.8,
                  maxWidth: '500px',
                }}
              >
                A comfortable dine-in experience, delicious meals and
                unforgettable moments for friends and families.
              </p>
            </div>
          </div>

          {/* RIGHT CARD */}

          <div
            style={{
              background: 'linear-gradient(135deg,#090909,#040404)',
              border: '1px solid rgba(255,255,255,.06)',
              borderRadius: '32px',
              padding: '35px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(255,43,61,.12)',
                  border: '1px solid rgba(255,43,61,.2)',
                  color: '#ffcc33',
                  padding: '10px 22px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  letterSpacing: '2px',
                  marginBottom: '30px',
                }}
              >
                Local Favorite Spot
              </span>

              <h3
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'clamp(40px,4vw,65px)',
                  lineHeight: '.9',
                  marginBottom: '25px',
                }}
              >
                GOOD FOOD
                <br />
                <span style={{ color: '#ff2b3d' }}>DONE RIGHT</span>
              </h3>

              <p
                style={{
                  color: 'rgba(255,255,255,.75)',
                  lineHeight: 2,
                  fontSize: '18px',
                }}
              >
                From cheesy pizzas to juicy burgers and signature shawarmas, Big
                Bite brings fresh ingredients, quick service and unforgettable
                taste together.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2,1fr)',
                  gap: '20px',
                  marginTop: '40px',
                }}
              >
                <div
                  style={{
                    padding: '25px',
                    borderRadius: '24px',
                    background: 'rgba(255,255,255,.03)',
                  }}
                >
                  <h4
                    style={{
                      color: '#ffcc33',
                      marginBottom: '12px',
                    }}
                  >
                    📍 Location
                  </h4>

                  <a
                    href="https://www.google.com/maps/place/BIG+BITE/@31.4363317,73.1128357,17z/data=!4m6!3m5!1s0x392269609357341f:0xc4eb2e1a3795daa0!8m2!3d31.4363317!4d73.1128357!16s%2Fg%2F11ffvt2qdw?entry=ttu&g_ep=EgoyMDI2MDYyMS4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: '#fff',
                      textDecoration: 'none',
                      lineHeight: 1.8,
                    }}
                  >
                    Main Bazar Mansoorabad, Faisalabad
                  </a>
                </div>

                <div
                  style={{
                    padding: '25px',
                    borderRadius: '24px',
                    background: 'rgba(255,255,255,.03)',
                  }}
                >
                  <h4
                    style={{
                      color: '#ffcc33',
                      marginBottom: '12px',
                    }}
                  >
                    📞 Contact
                  </h4>

                  <p
                    style={{
                      margin: 0,
                      lineHeight: 1.8,
                      color: 'rgba(255,255,255,.75)',
                    }}
                  >
                    0313-7788169
                    <br />
                    0303-5555845
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '18px',
                marginTop: '45px',
                flexWrap: 'wrap',
              }}
            >
              <a
                href="#menu"
                className="bb-btn"
                style={{
                  textDecoration: 'none',
                  padding: '18px 34px',
                  borderRadius: '999px',
                  background: '#ff2b3d',
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                Explore Menu
              </a>

              <a
                href="https://wa.me/923137788169"
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: 'none',
                  padding: '18px 34px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,.1)',
                  color: '#fff',
                }}
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section style={{ padding: '10px 0' }}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={sectionTitle}>Gallery</h2>
          </div>

          {/* Desktop Gallery */}
          <div className="hidden md:block">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: '280px 280px',
                gap: 14,
              }}
            >
              {/* Row 1 */}
              {galleryItems.slice(0, 2).map((item, i) => (
                <div key={i} className="bb-gal" style={{ height: 280 }}>
                  <img src={item.img} alt={item.label} />
                  <div className="bb-gal-lbl">
                    <span
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 24,
                        color: '#fff',
                        letterSpacing: 1,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}

              {/* Tall Image */}
              <div
                className="bb-gal"
                style={{
                  gridColumn: 3,
                  gridRow: '1 / 3',
                  height: '100%',
                }}
              >
                <img
                  src={galleryItems[2].img}
                  alt={galleryItems[2].label}
                  style={{ height: '100%' }}
                />
                <div className="bb-gal-lbl">
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 24,
                      color: '#fff',
                      letterSpacing: 1,
                    }}
                  >
                    {galleryItems[2].label}
                  </span>
                </div>
              </div>

              {/* Bottom Row */}
              {galleryItems.slice(3).map((item, i) => (
                <div key={i + 3} className="bb-gal" style={{ height: 280 }}>
                  <img src={item.img} alt={item.label} />
                  <div className="bb-gal-lbl">
                    <span
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 24,
                        color: '#fff',
                        letterSpacing: 1,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Gallery */}
          <div className="grid md:hidden gap-4">
            {/* 1 Image */}
            <div className="bb-gal" style={{ height: 260 }}>
              <img src={galleryItems[0].img} alt={galleryItems[0].label} />
            </div>

            {/* 2 Images */}
            <div className="grid grid-cols-2 gap-4">
              {galleryItems.slice(1, 3).map((item, i) => (
                <div key={i} className="bb-gal" style={{ height: 220 }}>
                  <img src={item.img} alt={item.label} />
                </div>
              ))}
            </div>

            {/* 3 Images */}
            <div className="grid grid-cols-3 gap-4">
              {galleryItems.slice(3, 6).map((item, i) => (
                <div key={i} className="bb-gal" style={{ height: 180 }}>
                  <img src={item.img} alt={item.label} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        id="order"
        style={{
          maxWidth: '1400px',
          margin: '120px auto',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '40px',
            padding: '120px 40px',
            textAlign: 'center',
            background:
              'radial-gradient(circle at center, rgba(255,43,61,0.22), #050505 65%)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* TOP BADGE */}

          <span
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              borderRadius: '999px',
              background: 'rgba(255,43,61,.12)',
              border: '1px solid rgba(255,43,61,.25)',
              color: '#ffcc33',
              fontSize: '13px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            Ready To Order?
          </span>

          {/* HEADING */}

          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(40px,4vw,65px)',
              lineHeight: '.9',
              margin: '35px 0 25px',
            }}
          >
            TASTE THE
            <br />
            <span
              style={{
                color: '#ff2b3d',
                textShadow: '0 0 35px rgba(255,43,61,.35)',
              }}
            >
              DIFFERENCE
            </span>
          </h2>

          {/* TEXT */}

          <p
            style={{
              maxWidth: '700px',
              margin: '0 auto',
              color: 'rgba(255,255,255,.75)',
              fontSize: '20px',
              lineHeight: 1.8,
            }}
          >
            Fresh burgers, loaded pizzas, shawarmas and unforgettable flavor
            delivered straight to your doorstep.
          </p>

          {/* BUTTONS */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '18px',
              flexWrap: 'wrap',
              marginTop: '45px',
            }}
          >
            <a
              href="https://wa.me/923137788169"
              target="_blank"
              rel="noreferrer"
              className="bb-btn"
              style={{
                textDecoration: 'none',
                padding: '18px 38px',
                borderRadius: '999px',
                background: '#ff2b3d',
                color: '#fff',
                fontWeight: 700,
                fontSize: '17px',
              }}
            >
              Whatsapp Now
            </a>

            {/* <a
              href="tel:03137788169"
              style={{
                textDecoration: 'none',
                padding: '18px 38px',
                borderRadius: '999px',
                background: '#fff',
                color: '#111',
                fontWeight: 700,
                fontSize: '17px',
              }}
            >
              Call Us
            </a> */}
          </div>

          {/* BOTTOM INFO */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              flexWrap: 'wrap',
              marginTop: '55px',
              color: 'rgba(255,255,255,.7)',
            }}
          >
            <span>📞 0313-7788169</span>

            <span>🕒 Open Daily: 12 PM - 2 AM</span>

            <a
              href="https://www.google.com/maps/place/BIG+BITE/@31.4363317,73.1128357,17z/data=!4m6!3m5!1s0x392269609357341f:0xc4eb2e1a3795daa0!8m2!3d31.4363317!4d73.1128357!16s%2Fg%2F11ffvt2qdw?entry=ttu&g_ep=EgoyMDI2MDYyMS4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noreferrer"
              style={{
                color: '#ffcc33',
                textDecoration: 'none',
              }}
            >
              📍 Locate Us
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '100px 24px 40px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
            gap: '50px',
            paddingBottom: '50px',
            borderBottom: '1px solid rgba(255,255,255,.06)',
          }}
        >
          {/* BRAND */}

          <div>
            <h2
              style={{
                color: '#ff2b3d',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '52px',
                marginBottom: '20px',
              }}
            >
              BIGBITE
            </h2>

            <p
              style={{
                color: 'rgba(255,255,255,.65)',
                lineHeight: 2,
              }}
            >
              Premium fast food experience. Big bites, bigger vibes and
              unforgettable flavor.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '25px',
              }}
            >
              <a
                href="https://www.facebook.com/Bigbitefsd/"
                style={socialStyle}
              >
                <FaFacebookF />
              </a>

              <a
                href="https://www.instagram.com/bigbite_faisalabad_official?igsh=MTJrZmFjMmU2Ym5ibA%3D%3D"
                style={socialStyle}
              >
                <FaInstagram />
              </a>

              <a
                href="https://www.tiktok.com/@bigbite.fsd.official?_r=1&_t=ZS-97TLqkSZrBX"
                style={socialStyle}
              >
                <FaTiktok />
              </a>

              <a
                href="https://bigbite-tau.vercel.app"
                target="_blank"
                rel="noreferrer"
                style={socialStyle}
              >
                <FaGlobe />
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}

          <div>
            <h3
              style={{
                marginBottom: '20px',
                color: '#fff',
              }}
            >
              Quick Links
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <a href="#menu" style={footerLink}>
                Menu
              </a>

              <a href="#about" style={footerLink}>
                About Us
              </a>

              <a href="#reviews" style={footerLink}>
                Reviews
              </a>

              <a href="#order" style={footerLink}>
                Order Now
              </a>
            </div>
          </div>

          {/* CONTACT */}

          <div>
            <h3
              style={{
                marginBottom: '20px',
                color: '#fff',
              }}
            >
              Contact
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                color: 'rgba(255,255,255,.7)',
              }}
            >
              <a
                href="https://www.google.com/maps/place/BIG+BITE/@31.4363317,73.1128357,17z/data=!4m6!3m5!1s0x392269609357341f:0xc4eb2e1a3795daa0!8m2!3d31.4363317!4d73.1128357!16s%2Fg%2F11ffvt2qdw?entry=ttu&g_ep=EgoyMDI2MDYyMS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noreferrer"
                style={footerLink}
              >
                📍 Near Main Bazar Mansoorabad, Faisalabad
              </a>

              <a href="tel:03137788169" style={footerLink}>
                📞 0313-7788169
              </a>

              <a href="tel:03035555845" style={footerLink}>
                📞 0303-5555845
              </a>

              <a href="mailto:hello@bigbite.com" style={footerLink}>
                ✉ hello@bigbite.com
              </a>
            </div>
          </div>

          {/* NEWSLETTER */}

          <div>
            <h3
              style={{
                marginBottom: '20px',
                color: '#fff',
              }}
            >
              Newsletter
            </h3>

            <p
              style={{
                color: 'rgba(255,255,255,.65)',
                lineHeight: 1.8,
                marginBottom: '20px',
              }}
            >
              Subscribe for exclusive deals and updates.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '10px',
              }}
            >
              <input
                placeholder="Your email"
                style={{
                  flex: 1,
                  background: '#111',
                  border: '1px solid rgba(255,255,255,.08)',
                  color: '#fff',
                  padding: '16px',
                  borderRadius: '999px',
                  outline: 'none',
                }}
              />

              <button
                className="bb-btn"
                style={{
                  border: 'none',
                  padding: '16px 28px',
                  borderRadius: '999px',
                  background: '#ff2b3d',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM */}

        <div
          style={{
            marginTop: '35px',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            color: 'rgba(255,255,255,.45)',
          }}
        >
          <span>© 2026 Big Bite. All rights reserved.</span>

          <div
            style={{
              display: 'flex',
              gap: '25px',
            }}
          >
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Policy</span>
          </div>
        </div>
      </footer>
      {/* ── FLOATING CART BUTTON (above WhatsApp) ── */}
      <button
        onClick={() => setCartOpen(true)}
        style={{
          position: 'fixed',
          bottom: '115px',
          right: '25px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff2b3d, #b50018)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 9998,
          boxShadow: '0 0 25px rgba(255,43,61,0.5)',
          transition: 'all .3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <ShoppingBag size={24} />
        {cartCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ffb703',
              color: '#111',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {cartCount}
          </span>
        )}
      </button>

      {/* ── CART DRAWER ── */}
      {cartOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setCartOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 10000,
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Drawer */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '440px',
              background: '#0e0e0e',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRight: 'none',
              zIndex: 10001,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 24px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingBag size={20} style={{ color: '#ff2b3d' }} />
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 24,
                    letterSpacing: 1,
                  }}
                >
                  YOUR CART
                </span>
                {cartCount > 0 && (
                  <span
                    style={{
                      background: '#ff2b3d',
                      color: '#fff',
                      borderRadius: 999,
                      padding: '2px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {cartCount} items
                  </span>
                )}
              </div>
              <button
                onClick={() => setCartOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Cart Items */}
            <div style={{ flex: 1, padding: '16px 24px', overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '80px 0',
                    color: 'rgba(255,255,255,0.35)',
                  }}
                >
                  <ShoppingBag
                    size={48}
                    style={{
                      margin: '0 auto 16px',
                      display: 'block',
                      opacity: 0.3,
                    }}
                  />
                  <p style={{ fontSize: 16 }}>Your cart is empty</p>
                  <p style={{ fontSize: 13, marginTop: 8 }}>
                    Add items from the menu above
                  </p>
                </div>
              ) : (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: '#121212',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 16,
                        padding: '16px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      {/* Item name + remove */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 8,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>
                            {item.name}
                            {item.size && (
                              <span
                                style={{
                                  marginLeft: 8,
                                  background: 'rgba(255,183,3,0.12)',
                                  border: '1px solid rgba(255,183,3,0.25)',
                                  color: '#ffb703',
                                  borderRadius: 999,
                                  padding: '2px 9px',
                                  fontSize: 11,
                                  fontWeight: 700,
                                }}
                              >
                                {item.size}
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: 'rgba(255,255,255,0.4)',
                              marginTop: 3,
                            }}
                          >
                            {item.category}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: 'rgba(255,43,61,0.1)',
                            border: '1px solid rgba(255,43,61,0.2)',
                            color: '#ff2b3d',
                            borderRadius: '50%',
                            width: 28,
                            height: 28,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <X size={13} />
                        </button>
                      </div>

                      {/* Price row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        {/* Qty controls */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0,
                            background: '#1a1a1a',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 999,
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            onClick={() => changeQty(item.id, -1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#fff',
                              width: 34,
                              height: 34,
                              cursor: 'pointer',
                              fontSize: 18,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            −
                          </button>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 14,
                              minWidth: 24,
                              textAlign: 'center',
                            }}
                          >
                            {item.qty}
                          </span>
                          <button
                            onClick={() => changeQty(item.id, 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#fff',
                              width: 34,
                              height: 34,
                              cursor: 'pointer',
                              fontSize: 18,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div style={{ textAlign: 'right' }}>
                          <div
                            style={{
                              fontSize: 11,
                              color: 'rgba(255,255,255,0.4)',
                            }}
                          >
                            Rs {item.price.toLocaleString()} × {item.qty}
                          </div>
                          <div
                            style={{
                              fontWeight: 700,
                              color: '#ffb703',
                              fontSize: 16,
                            }}
                          >
                            Rs {(item.price * item.qty).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with total + WhatsApp button */}
            {cart.length > 0 && (
              <div
                style={{
                  padding: '20px 24px 28px',
                  borderTop: '1px solid rgba(255,255,255,0.07)',
                  background: '#0a0a0a',
                }}
              >
                {/* Total */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 18,
                    padding: '14px 18px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 15 }}>
                    Total Amount
                  </span>
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 26,
                      color: '#ffb703',
                      letterSpacing: 1,
                    }}
                  >
                    Rs {cartTotal.toLocaleString()}
                  </span>
                </div>

                {/* Order on WhatsApp */}
                <button
                  className="bb-btn"
                  onClick={orderOnWhatsApp}
                  style={{
                    ...btnRed,
                    width: '100%',
                    fontSize: 15,
                    padding: '16px',
                    gap: 10,
                    border: 'none',
                    justifyContent: 'center',
                  }}
                >
                  <FaWhatsapp style={{ fontSize: 18 }} />
                  Order on WhatsApp
                </button>

                <button
                  onClick={() => setCart([])}
                  style={{
                    width: '100%',
                    marginTop: 10,
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.4)',
                    borderRadius: 999,
                    padding: '10px',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/923137788169"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '25px',
          right: '25px',
          width: '80px',
          height: '75px',
          borderRadius: '50%',
          background: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '50px',
          textDecoration: 'none',
          zIndex: 9999,
          boxShadow: '0 0 25px rgba(37,211,102,.5)',
          transition: 'all .3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <FaWhatsapp />
      </a>
    </div>
  );
}
