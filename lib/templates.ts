// DevForge AI — Starter Code Templates

export const STARTER_TEMPLATES: Record<string, { prompt: string; code: string }> = {
  ecommerce: {
    prompt: "Modern E-Commerce Storefront with Product Grid and Cart Drawer",
    code: `import React, { useState } from "react";

const PRODUCTS = [
  { id: 1, name: "Minimalist Mechanical Keyboard", price: 129.99, category: "Electronics", rating: 4.8, image: "⌨️", description: "Hot-swappable tactile switches with customizable RGB backlighting." },
  { id: 2, name: "Ergonomic Wireless Mouse", price: 79.95, category: "Electronics", rating: 4.6, image: "🖱️", description: "Precision optical sensor with multi-device bluetooth pairing." },
  { id: 3, name: "Noise-Canceling Headphones", price: 249.00, category: "Audio", rating: 4.9, image: "🎧", description: "Studio-grade wireless audio with active noise cancellation." },
  { id: 4, name: "Ultra-Wide Curved Monitor 34-inch", price: 499.50, category: "Electronics", rating: 4.7, image: "🖥️", description: "144Hz WQHD display with 99% sRGB color accuracy." },
  { id: 5, name: "Aluminum Desk Riser", price: 45.00, category: "Accessories", rating: 4.5, image: "🪵", description: "Elevate your monitor to ergonomic eye level with cable routing." },
  { id: 6, name: "Leather Desk Mat", price: 34.99, category: "Accessories", rating: 4.6, image: "✍️", description: "Water-resistant vegan leather desk pad for precision mouse tracking." },
];

export default function App() {
  const [cart, setCart] = useState<{ id: number; name: string; price: number; qty: number }[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const categories = ["All", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const addToCart = (product: typeof PRODUCTS[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/20">
              ⚡
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">ApexHardware</h1>
              <p className="text-xs text-slate-400">Premium Developer Gear</p>
            </div>
          </div>

          <div className="relative hidden md:block w-96">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-95"
          >
            <span>🛒 Cart</span>
            {totalItems > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-indigo-600">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Banner */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 p-8 border border-indigo-500/20 shadow-2xl">
          <div className="max-w-xl">
            <span className="inline-block rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-3">
              Spring Sale — Up to 30% Off
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Upgrade Your Setup Today
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              High-performance peripherals crafted for software engineers, designers, and creators.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2">Categories:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={\`rounded-lg px-3 py-1.5 text-xs font-medium transition \${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }\`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700 hover:shadow-xl"
            >
              <div>
                <div className="flex h-36 items-center justify-center rounded-lg bg-slate-800/50 text-5xl group-hover:scale-105 transition-transform duration-300">
                  {p.image}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{p.category}</span>
                  <span className="text-xs text-amber-400 font-medium">★ {p.rating}</span>
                </div>
                <h3 className="mt-1 text-base font-bold text-white">{p.name}</h3>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{p.description}</p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-4">
                <span className="text-lg font-extrabold text-white">\${p.price.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(p)}
                  className="rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-600 hover:text-white active:scale-95 border border-slate-700 hover:border-indigo-500"
                >
                  + Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-md flex-col bg-slate-900 p-6 shadow-2xl border-l border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white">Your Shopping Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-3xl mb-2">🛒</p>
                  <p className="text-sm">Your cart is empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/40 p-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                      <p className="text-xs text-slate-400">\${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="h-7 w-7 rounded bg-slate-700 text-xs font-bold text-white hover:bg-slate-600"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-white w-4 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="h-7 w-7 rounded bg-slate-700 text-xs font-bold text-white hover:bg-slate-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-800 pt-4">
                <div className="flex justify-between text-sm text-slate-300 mb-2">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">\${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-4">
                  <span>Shipping</span>
                  <span className="text-emerald-400">Free</span>
                </div>
                <button
                  onClick={() => alert("Checkout simulated!")}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-95"
                >
                  Proceed to Checkout (\${totalPrice.toFixed(2)})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
`,
  },

  "saas-landing": {
    prompt: "Modern SaaS Landing Page with Hero, Feature Cards, Pricing and Footer",
    code: `import React, { useState } from "react";

export default function App() {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const features = [
    { title: "Real-time Streaming", icon: "⚡", desc: "Compile and stream code updates instantly as AI generates your full stack interface." },
    { title: "Multi-language Localization", icon: "🌐", desc: "Native LTR and RTL support with translation dictionaries for global deployment." },
    { title: "1-Click GitHub Deploy", icon: "🚀", desc: "Commit production ready Next.js codebases straight to your personal GitHub account." },
    { title: "AI Lead Capture", icon: "🎯", desc: "Integrate conversational agents that record qualified customer leads directly into Postgres." },
    { title: "Dynamic Style Tokens", icon: "🎨", desc: "Fine-tune primary colors, border radii, and font scales with live CSS variable patching." },
    { title: "Enterprise Reliability", icon: "🛡️", desc: "Built-in rate limiting, edge authentication middleware, and robust API fallbacks." },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              DF
            </div>
            <span className="text-lg font-bold text-white tracking-tight">DevForge AI</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-indigo-400 transition">Features</a>
            <a href="#pricing" className="hover:text-indigo-400 transition">Pricing</a>
            <a href="#testimonials" className="hover:text-indigo-400 transition">Testimonials</a>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2">Sign In</button>
            <a href="#pricing" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 text-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="relative mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 mb-6">
            ✨ Introducing DevForge 2.0 Engine
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            From Text Prompt to <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Production Web App</span>
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Build, preview, iterate, and deploy full-stack React applications in seconds. Empower your product team with AI acceleration.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#pricing" className="rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95">
              Start Free Trial →
            </a>
            <a href="#features" className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-base font-semibold text-slate-200 hover:bg-slate-800 transition">
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 border-t border-slate-800">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Engineered for Rapid Shipping</h2>
          <p className="mt-3 text-slate-400">Everything you need to turn ideas into live web applications.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 border-t border-slate-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Flexible Pricing Plans</h2>
          <p className="mt-3 text-slate-400">Scale seamlessly as your project and team grow.</p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900 p-1.5">
            <button
              onClick={() => setAnnualBilling(false)}
              className={\`rounded-full px-4 py-1.5 text-xs font-semibold transition \${!annualBilling ? "bg-indigo-600 text-white" : "text-slate-400"}\`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={\`rounded-full px-4 py-1.5 text-xs font-semibold transition \${annualBilling ? "bg-indigo-600 text-white" : "text-slate-400"}\`}
            >
              Annual (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Starter</h3>
              <p className="text-xs text-slate-400 mt-1">For hobbyists and solo builders.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-white">\${annualBilling ? "15" : "19"}</span>
                <span className="text-slate-400 text-sm"> / month</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li>✓ 50 AI generations / mo</li>
                <li>✓ Standard component library</li>
                <li>✓ GitHub repository export</li>
                <li>✓ Community Discord support</li>
              </ul>
            </div>
            <button className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition">
              Get Starter
            </button>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border-2 border-indigo-500 bg-gradient-to-b from-indigo-950/40 to-slate-900 p-8 flex flex-col justify-between shadow-2xl shadow-indigo-500/10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
              Most Popular
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">Pro Developer</h3>
              <p className="text-xs text-slate-400 mt-1">For professional creators & startups.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-white">\${annualBilling ? "39" : "49"}</span>
                <span className="text-slate-400 text-sm"> / month</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li>✓ Unlimited AI generations</li>
                <li>✓ 1-Click Vercel & GitHub deployment</li>
                <li>✓ Conversational Lead Generation</li>
                <li>✓ Custom Theme Tokens & Style Patching</li>
                <li>✓ Priority processing</li>
              </ul>
            </div>
            <button className="mt-8 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition">
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Enterprise */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Enterprise</h3>
              <p className="text-xs text-slate-400 mt-1">For agencies & high-scale teams.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-white">Custom</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li>✓ Everything in Pro</li>
                <li>✓ Dedicated Claude & OpenAI infrastructure</li>
                <li>✓ Custom SSR & API route integrations</li>
                <li>✓ SLA & dedicated account manager</li>
              </ul>
            </div>
            <button className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">DF</div>
            <span className="text-sm font-bold text-white">DevForge AI Inc.</span>
          </div>

          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md w-full">
            <input
              type="email"
              placeholder="Subscribe to product updates..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
              {subscribed ? "Subscribed!" : "Subscribe"}
            </button>
          </form>

          <p className="text-xs text-slate-500">© 2026 DevForge AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
`,
  },

  portfolio: {
    prompt: "Developer Portfolio with Interactive Project Grid, Skills and Contact Form",
    code: `import React, { useState } from "react";

const PROJECTS = [
  { id: 1, title: "FinTech Cloud Dashboard", category: "Web App", tags: ["Next.js", "TypeScript", "Tailwind"], stars: 142, desc: "Real-time analytics dashboard monitoring cryptocurrency trades and fiat cashflows." },
  { id: 2, title: "AI Code Assistant Extension", category: "AI Tools", tags: ["React", "Python", "Claude API"], stars: 389, desc: "VS Code sidecar plugin auto-generating inline unit tests and documentation." },
  { id: 3, title: "DeCentralized Storage SDK", category: "Infrastructure", tags: ["Rust", "Wasm", "IPFS"], stars: 215, desc: "High-throughput encrypted file upload SDK built for Web3 browser dApps." },
  { id: 4, title: "E-Commerce Design System", category: "UI/UX", tags: ["Figma", "Tailwind", "Radix UI"], stars: 98, desc: "Accessible component library featuring 40+ dark-mode ready design tokens." },
];

export default function App() {
  const [filter, setFilter] = useState("All");
  const [contactMsg, setContactMsg] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const categories = ["All", "Web App", "AI Tools", "Infrastructure", "UI/UX"];

  const filteredProjects = filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactMsg.name && contactMsg.email) {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-extrabold text-white tracking-tight">alex.dev</span>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <a href="#about" className="hover:text-emerald-400 transition">About</a>
            <a href="#projects" className="hover:text-emerald-400 transition">Projects</a>
            <a href="#contact" className="hover:text-emerald-400 transition">Contact</a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="about" className="mx-auto max-w-5xl px-6 py-20">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-700 p-1 flex-shrink-0 shadow-xl shadow-emerald-500/10">
            <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-4xl">
              👨‍💻
            </div>
          </div>
          <div>
            <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 mb-3">
              Senior Full-Stack & AI Engineer
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Hi, I'm Alex Vance.
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed max-w-2xl">
              I build scalable distributed systems, modern React frontends, and intelligent AI tools. Passionate about open-source developer tooling and polished UX.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["TypeScript", "React / Next.js", "Node.js", "Python", "TailwindCSS", "PostgreSQL", "GraphQL"].map((skill) => (
                <span key={skill} className="rounded-md border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="mx-auto max-w-5xl px-6 py-16 border-t border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Work</h2>
            <p className="text-xs text-slate-400">Selected open-source and commercial projects.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={\`rounded-lg px-3 py-1.5 text-xs font-semibold transition \${
                  filter === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }\`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{p.category}</span>
                  <span className="text-xs text-slate-400 font-medium">★ {p.stars}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-2">{p.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.desc}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-1.5 border-t border-slate-800/80 pt-4">
                {p.tags.map((tag) => (
                  <span key={tag} className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-5xl px-6 py-16 border-t border-slate-800">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white">Let's Connect</h2>
          <p className="text-xs text-slate-400 mt-1">Have a project or opportunity in mind? Send me a message!</p>

          {sent ? (
            <div className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-400">
              ✓ Thanks! Your message has been received. I'll get back to you shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Sarah Connor"
                  value={contactMsg.name}
                  onChange={(e) => setContactMsg({ ...contactMsg, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sarah@example.com"
                  value={contactMsg.email}
                  onChange={(e) => setContactMsg({ ...contactMsg, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell me about your project..."
                  value={contactMsg.message}
                  onChange={(e) => setContactMsg({ ...contactMsg, message: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © 2026 Alex Vance. Built with DevForge AI.
      </footer>
    </div>
  );
}
`,
  },

  dashboard: {
    prompt: "Admin Analytics Dashboard with KPI Stat Cards and Orders Data Table",
    code: `import React, { useState } from "react";

const ORDERS = [
  { id: "ORD-9481", customer: "Acme Corp", plan: "Enterprise Pro", amount: "$1,250.00", status: "Completed", date: "2026-09-02" },
  { id: "ORD-9480", customer: "Starlight Labs", plan: "Pro Monthly", amount: "$49.00", status: "Completed", date: "2026-09-02" },
  { id: "ORD-9479", customer: "HyperScale Inc", plan: "Enterprise Custom", amount: "$3,400.00", status: "Pending", date: "2026-09-01" },
  { id: "ORD-9478", customer: "Nexus AI", plan: "Pro Annual", amount: "$468.00", status: "Completed", date: "2026-09-01" },
  { id: "ORD-9477", customer: "CloudPulse", plan: "Starter Monthly", amount: "$19.00", status: "Failed", date: "2026-08-31" },
  { id: "ORD-9476", customer: "Vortex Data", plan: "Pro Monthly", amount: "$49.00", status: "Completed", date: "2026-08-31" },
];

export default function App() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredOrders = ORDERS.filter((o) => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base">
              📊
            </div>
            <span className="text-base font-bold text-white">DevForge Console</span>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            <a href="#" className="flex items-center gap-3 rounded-lg bg-blue-600/10 border border-blue-500/20 px-3.5 py-2.5 text-blue-400 font-semibold">
              <span>📈 Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white transition">
              <span>📦 Orders & Subscriptions</span>
            </a>
            <a href="#" className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white transition">
              <span>👥 Customer Leads</span>
            </a>
            <a href="#" className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white transition">
              <span>⚙️ System Settings</span>
            </a>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs">
            ADMIN
          </div>
          <div>
            <p className="text-xs font-semibold text-white">System Admin</p>
            <p className="text-[10px] text-slate-400">admin@devforge.ai</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4 backdrop-blur-md">
          <h1 className="text-xl font-bold text-white">Executive Overview</h1>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live Metrics
            </span>
            <button className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-500 transition">
              + Export Report
            </button>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <span className="text-xs font-semibold uppercase text-slate-400">Total Monthly Revenue</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">$42,850.00</span>
                <span className="text-xs font-bold text-emerald-400">+14.2%</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <span className="text-xs font-semibold uppercase text-slate-400">Active Subscribers</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">1,429</span>
                <span className="text-xs font-bold text-emerald-400">+8.5%</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <span className="text-xs font-semibold uppercase text-slate-400">Lead Conversion Rate</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">4.85%</span>
                <span className="text-xs font-bold text-blue-400">+1.1%</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <span className="text-xs font-semibold uppercase text-slate-400">Deploy Success Rate</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">99.4%</span>
                <span className="text-xs font-bold text-emerald-400">Stable</span>
              </div>
            </div>
          </div>

          {/* Orders Table Container */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 p-4 gap-3">
              <h2 className="text-base font-bold text-white">Recent Transactions</h2>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Filter customer or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:outline-none w-full sm:w-48"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-mono font-bold text-blue-400">{o.id}</td>
                      <td className="px-4 py-3 font-medium text-white">{o.customer}</td>
                      <td className="px-4 py-3 text-slate-300">{o.plan}</td>
                      <td className="px-4 py-3 font-bold text-white">{o.amount}</td>
                      <td className="px-4 py-3">
                        <span
                          className={\`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold \${
                            o.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : o.status === "Pending"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }\`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
`,
  },

  blank: {
    prompt: "Blank Starter Canvas",
    code: `export default function App() {
  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", color: "#F3F4F6", backgroundColor: "#0F172A", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold" }}>Welcome to DevForge AI</h1>
      <p style={{ marginTop: 8, color: "#9CA3AF" }}>Describe a component or page above to start generating code.</p>
    </div>
  );
}
`,
  },
};
