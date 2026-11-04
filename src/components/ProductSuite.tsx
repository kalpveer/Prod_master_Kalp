import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import './product-suite.css';

const products = [
  {
    id: 'productica-one',
    title: 'Productica One',
    eyebrow: 'Operating workspace',
    body:
      'The day-to-day home for founders who are already in build mode — plans, modules, credits, and billing in one place instead of scattered tools.',
    highlights: [
      'Run modules and workflows from a single dashboard',
      'Buy and track credits with transparent billing',
      'Built for teams that need structure, not more noise',
    ],
    meta: 'app.productica.in',
    cta: 'Open Productica One',
    href: 'https://app.productica.in',
    image: '/products/one.jpg',
    external: true,
  },
  {
    id: 'venture-labs',
    title: 'VentureLab',
    eyebrow: 'Validation & grants',
    body:
      'Start here when the idea is still forming. VentureLab helps you pressure-test the concept, see what to fix, and find funding paths that actually fit.',
    highlights: [
      'Structured idea validation before you spend time or capital',
      'Clear reports you can share with mentors and investors',
      'Grant matching aligned to your sector and stage',
    ],
    meta: 'Idea validation & grants · on this site',
    cta: 'Open VentureLab',
    href: '/idea',
    image: '/products/venturelab.jpg',
    external: false,
  },
  {
    id: 'agents',
    title: 'Productica Team',
    eyebrow: 'Productica Teams',
    body:
      'A synchronized team of AI agents for the messy middle of venture building — from first validation through GTM, pitch prep, and operational planning.',
    highlights: [
      'Co-founder, marketing, and planning agents that work together',
      'Credit-based runs tuned to real founder outcomes',
      'Same intelligence layer that powers Productica reports',
    ],
    meta: 'agents.productica.in',
    cta: 'Open Productica Team',
    href: 'https://agents.productica.in/',
    image: '/products/agents.jpg',
    external: true,
  },
] as const;

const N = products.length;
const slides = [products[N - 1], ...products, ...products.slice(0, N - 1)];

function wrap(n: number) {
  return ((n % N) + N) % N;
}

function SlideCard({ product }: { product: (typeof products)[number] }) {
  return (
    <article className="ps-slide">
      <div className="flex h-full min-h-[28rem] flex-col gap-6 p-6 sm:flex-row sm:gap-8 sm:p-8 lg:p-10">
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-400">
              {product.eyebrow}
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.7rem]">
              {product.title}
            </h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600 sm:text-[15px]">
              {product.body}
            </p>
            <ul className="mt-5 grid gap-2 text-sm text-neutral-700">
              {product.highlights.map((line) => (
                <li key={line} className="flex gap-2.5 leading-snug">
                  <span className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-neutral-400" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium text-neutral-500">{product.meta}</p>
            <a
              href={product.href}
              {...(product.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              {product.cta}
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
        <div className="relative h-48 shrink-0 overflow-hidden rounded-2xl sm:h-auto sm:w-[42%] lg:w-[46%]">
          <img
            src={product.image}
            alt=""
            width={520}
            height={640}
            decoding="async"
            draggable={false}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      </div>
    </article>
  );
}

export default function ProductSuite() {
  const [pos, setPos] = useState(1);
  const [smooth, setSmooth] = useState(true);
  const [hover, setHover] = useState(false);
  const [inView, setInView] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const posRef = useRef(1);
  const busy = useRef(false);
  const goal = useRef<number | null>(null);
  const queued = useRef<null | 'fwd' | 'back' | number>(null);
  const tick = useRef<() => void>(() => {});
  const failsafe = useRef(0);

  const real = wrap(pos - 1);
  const prev = products[wrap(real - 1)];
  const next = products[wrap(real + 1)];
  const active = products[real];
  const reduce =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const flushQueue = useCallback(() => {
    const next = queued.current;
    queued.current = null;
    if (next === 'fwd') {
      goal.current = wrap(wrap(posRef.current - 1) + 1);
      tick.current();
    } else if (next === 'back') {
      goBackRef.current();
    } else if (typeof next === 'number') {
      goal.current = next;
      tick.current();
    }
  }, []);

  const goBackRef = useRef<() => void>(() => {});

  const finishMove = useCallback(() => {
    window.clearTimeout(failsafe.current);
    const p = posRef.current;
    if (p === 0 || p > N) {
      const snapped = p === 0 ? N : p - N;
      setSmooth(false);
      posRef.current = snapped;
      setPos(snapped);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSmooth(true);
          busy.current = false;
          flushQueue();
        });
      });
      return;
    }
    busy.current = false;
    flushQueue();
  }, [flushQueue]);

  tick.current = () => {
    if (busy.current) return;
    const current = wrap(posRef.current - 1);
    const target = goal.current;
    if (target === null || target === current) {
      goal.current = null;
      return;
    }
    const dist = wrap(target - current);
    busy.current = true;
    goal.current = null;
    posRef.current += dist;
    setSmooth(true);
    setPos(posRef.current);
    window.clearTimeout(failsafe.current);
    failsafe.current = window.setTimeout(finishMove, reduce ? 40 : 1120);
    if (reduce) requestAnimationFrame(finishMove);
  };

  const goForward = useCallback(() => {
    if (busy.current) {
      queued.current = 'fwd';
      return;
    }
    goal.current = wrap(wrap(posRef.current - 1) + 1);
    tick.current();
  }, []);

  const goBack = useCallback(() => {
    if (busy.current) {
      queued.current = 'back';
      return;
    }
    goal.current = null;
    busy.current = true;
    posRef.current -= 1;
    setSmooth(true);
    setPos(posRef.current);
    window.clearTimeout(failsafe.current);
    failsafe.current = window.setTimeout(finishMove, reduce ? 40 : 1120);
    if (reduce) requestAnimationFrame(finishMove);
  }, [finishMove, reduce]);

  goBackRef.current = goBack;

  const goTo = useCallback((target: number) => {
    if (target === wrap(posRef.current - 1)) return;
    if (busy.current) {
      queued.current = target;
      return;
    }
    goal.current = target;
    tick.current();
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.28 });
    io.observe(node);
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe.current);
    };
  }, []);


  useEffect(() => {
    if (hover || !inView || reduce) return;
    const id = window.setTimeout(goForward, 4200);
    return () => window.clearTimeout(id);
  }, [goForward, hover, inView, pos, reduce]);

  return (
    <section ref={sectionRef} id="products" className="bg-[#f4f2eb] py-20 text-neutral-950 md:py-28">
      <div className="mx-auto mb-10 max-w-2xl px-6 text-center md:mb-14">
        <h2 className="text-4xl font-light tracking-tight md:text-6xl">Our Products</h2>
      </div>

      <div
        className="mx-auto flex max-w-[1180px] items-center gap-0 px-4 md:px-8"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <button
          type="button"
          className="ps-rail hidden shrink-0 md:block"
          onClick={goBack}
          aria-label={`Show ${prev.title}`}
        >
          {products.map((product) => (
            <img
              key={product.id}
              src={product.image}
              alt=""
              width={88}
              height={320}
              decoding="async"
              draggable={false}
              className={product.id === prev.id ? 'is-on' : undefined}
            />
          ))}
        </button>

        <div className="ps-stage min-w-0 flex-1">
          <div
            className={`ps-track${smooth && !reduce ? '' : ' is-instant'}`}
            style={{ transform: `translate3d(${-pos * 100}%, 0, 0)` }}
            onTransitionEnd={(event) => {
              if (event.target !== event.currentTarget) return;
              finishMove();
            }}
          >
            {slides.map((product, i) => (
              <SlideCard key={`${product.id}-${i}`} product={product} />
            ))}
          </div>
        </div>

        <button
          type="button"
          className="ps-rail hidden shrink-0 md:block"
          onClick={goForward}
          aria-label={`Show ${next.title}`}
        >
          {products.map((product) => (
            <img
              key={product.id}
              src={product.image}
              alt=""
              width={88}
              height={320}
              decoding="async"
              draggable={false}
              className={product.id === next.id ? 'is-on' : undefined}
            />
          ))}
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={goBack}
          className="flex size-10 items-center justify-center rounded-full border border-black/10 text-neutral-700 hover:bg-white"
          aria-label="Previous product"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2" role="tablist" aria-label="Products">
          {products.map((product, i) => (
            <button
              key={product.id}
              type="button"
              role="tab"
              aria-selected={i === real}
              aria-label={product.title}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-[width,background-color] duration-500 ease-out ${
                i === real ? 'w-10 bg-neutral-950' : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={goForward}
          className="flex size-10 items-center justify-center rounded-full border border-black/10 text-neutral-700 hover:bg-white"
          aria-label="Next product"
        >
          <ArrowRight size={16} />
        </button>
      </div>

      <p className="mt-4 text-center text-xs font-medium text-neutral-400">{active.title}</p>
    </section>
  );
}
