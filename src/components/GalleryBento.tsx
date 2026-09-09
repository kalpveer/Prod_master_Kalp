/* eslint-disable */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, ZoomIn } from 'lucide-react';

const galleryItems = [
  {
    type: 'image',
    src: '/gallery/IMG_4899.jpg',
    span: 'col-span-2 row-span-2 md:col-span-2 md:row-span-2',
    alt: 'NUVenture',
  },
  {
    type: 'image',
    src: '/gallery/IMG_5058.jpg',
    span: 'col-span-2 row-span-1 md:col-span-2 md:row-span-1',
    alt: 'Ideas in Motion',
  },
  {
    type: 'image',
    src: '/gallery/booth-team.jpg',
    span: 'col-span-1 row-span-2 md:col-span-1 md:row-span-2',
    alt: 'Productica booth team',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.16.06 PM (1).jpeg',
    span: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
    alt: "Productica's First Office",
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.16.06 PM (2).jpeg',
    span: 'col-span-1 row-span-2 md:col-span-1 md:row-span-2',
    alt: 'Productica Discussion Session',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.16.07 PM.jpeg',
    span: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
    alt: 'Builder workspace',
  },
  {
    type: 'video',
    src: '/gallery/WhatsApp Video 2026-06-22 at 3.16.12 PM.mp4',
    span: 'col-span-2 row-span-2 md:col-span-2 md:row-span-2',
    alt: 'TiECon Highlights',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.16.13 PM.jpeg',
    span: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
    alt: 'TiECon Vadodara Participation',
  },
  {
    type: 'image',
    src: '/gallery/booth-engagement.jpg',
    span: 'col-span-2 row-span-1 md:col-span-2 md:row-span-1',
    alt: 'Live booth engagement',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.16.24 PM (1).jpeg',
    span: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
    alt: 'Productica @ DMC GESIA',
  },
  {
    type: 'video',
    src: '/gallery/WhatsApp Video 2026-06-22 at 3.16.24 PM.mp4',
    span: 'col-span-2 row-span-2 md:col-span-2 md:row-span-2',
    alt: 'Interview with Media Agencies',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.16.25 PM (1).jpeg',
    span: 'col-span-1 row-span-2 md:col-span-1 md:row-span-2',
    alt: 'Mumbai Journey Start',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.16.25 PM.jpeg',
    span: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
    alt: "Productica's Mumbai Pitstop",
  },
  {
    type: 'image',
    src: '/gallery/content-shoot-outdoor.jpg',
    span: 'col-span-1 row-span-2 md:col-span-1 md:row-span-2',
    alt: 'Content shoot outdoors',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.17.24 PM.jpeg',
    span: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
    alt: 'Live product demo',
  },
  {
    type: 'image',
    src: '/gallery/booth-word-quest.jpg',
    span: 'col-span-2 row-span-1 md:col-span-2 md:row-span-1',
    alt: 'Booth Word Quest',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.18.28 PM.jpeg',
    span: 'col-span-2 row-span-2 md:col-span-2 md:row-span-2',
    alt: 'Building From Mumbai',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.18.29 PM (1).jpeg',
    span: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
    alt: 'On stage at Navrachana',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.18.29 PM.jpeg',
    span: 'col-span-2 row-span-1 md:col-span-2 md:row-span-1',
    alt: 'Mumbai Team',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.18.30 PM (1).jpeg',
    span: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
    alt: 'Startup Street booth',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.18.30 PM.jpeg',
    span: 'col-span-1 row-span-2 md:col-span-1 md:row-span-2',
    alt: 'Founders on stage',
  },
  {
    type: 'image',
    src: '/gallery/tetrathon-2026.jpg',
    span: 'col-span-2 row-span-2 md:col-span-2 md:row-span-2',
    alt: 'Tetrathon 2026 — Indo-French AI Innovation Sprint',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.18.31 PM (1).jpeg',
    span: 'col-span-2 row-span-2 md:col-span-2 md:row-span-2',
    alt: 'HackBaroda',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.18.31 PM.jpeg',
    span: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
    alt: 'Behind the Build',
  },
  {
    type: 'image',
    src: '/gallery/build-what-people-want.jpg',
    span: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
    alt: 'Build what people want',
  },
  {
    type: 'image',
    src: '/gallery/beta-night-skyline.jpg',
    span: 'col-span-1 row-span-2 md:col-span-1 md:row-span-2',
    alt: 'Shipping beta by night',
  },
  {
    type: 'image',
    src: '/gallery/hardware-build-desk.jpg',
    span: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
    alt: 'Hardware & build desk',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.19.41 PM.jpeg',
    span: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
    alt: 'E-Chai Vadodara',
  },
  {
    type: 'image',
    src: '/gallery/WhatsApp Image 2026-06-22 at 3.20.20 PM.jpeg',
    span: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
    alt: 'MOU Signing',
  },
];

export default function GalleryBento() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeIdx !== null) {
      setActiveIdx((activeIdx + 1) % galleryItems.length);
    }
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeIdx !== null) {
      setActiveIdx((activeIdx - 1 + galleryItems.length) % galleryItems.length);
    }
  };

  return (
    <>
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-24 bg-black overflow-visible">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-16 text-left border-b border-white/5 pb-8">
        <span className="text-zinc-500 font-mono text-[10px] tracking-[0.4em] uppercase">
          [ Ecosystem Gallery ]
        </span>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-white">
          Moments <span className="text-zinc-400 font-semibold italic">& Highlights.</span>
        </h2>
        <p className="text-zinc-400 font-light text-base md:text-lg max-w-2xl leading-relaxed">
          Real moments from booths, summits, shoots, and builds — click any photo to open it full screen.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="max-md:grid max-md:grid-cols-2 max-md:gap-4 max-md:auto-rows-[150px] md:columns-3 lg:columns-4 md:gap-6">
        {galleryItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.02 }}
            onClick={() => setActiveIdx(index)}
            className={`group border border-white/10 rounded-2xl bg-zinc-950/40 hover:bg-zinc-950/80 hover:border-white/20 transition-all duration-500 relative overflow-hidden cursor-pointer flex flex-col justify-end max-md:!mb-0 md:mb-6 break-inside-avoid ${item.span || ''}`}
          >
            {/* Media rendering */}
            <div className="max-md:absolute max-md:inset-0 z-0">
              {item.type === 'video' ? (
                <div className="w-full max-md:h-full md:h-auto relative">
                  <video
                    src={item.src}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="w-full max-md:h-full md:h-auto object-cover grayscale opacity-55 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-[1.01] block"
                  />
                  <div className="absolute inset-0 bg-black/35 z-10 group-hover:opacity-0 transition-opacity duration-500" />
                </div>
              ) : (
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full max-md:h-full md:h-auto object-cover grayscale opacity-55 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-[1.01] group-hover:scale-105 block"
                />
              )}
            </div>

            {/* Hover details */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex flex-col justify-end p-6">
              <span className="text-[10px] font-mono text-zinc-500 tracking-wider mb-1 uppercase">
                {item.type === 'video' ? 'Video Highlight' : 'Action Capture'}
              </span>
              <h3 className="text-white text-base font-medium tracking-tight mb-2 leading-tight">
                {item.alt}
              </h3>
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                {item.type === 'video' ? <Play size={12} className="fill-current" /> : <ZoomIn size={12} />}
                <span className="font-mono text-[10px] tracking-wider uppercase">Open Preview</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIdx(null)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 md:p-12 cursor-zoom-out"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center z-10 cursor-default"
            >
              {/* Media rendering */}
              <div className="w-full h-full flex items-center justify-center rounded-2xl overflow-hidden bg-zinc-950/50 border border-white/5 relative p-4">
                {galleryItems[activeIdx].type === 'video' ? (
                  <video
                    src={galleryItems[activeIdx].src}
                    controls
                    autoPlay
                    playsInline
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <img
                    src={galleryItems[activeIdx].src}
                    alt={galleryItems[activeIdx].alt}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
                  />
                )}
              </div>

              {/* Bottom text */}
              <div className="text-center mt-6 max-w-2xl px-4">
                <span className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase">
                  ({activeIdx + 1} / {galleryItems.length})
                </span>
                <p className="text-white text-lg font-light tracking-tight mt-1 leading-normal">
                  {galleryItems[activeIdx].alt}
                </p>
              </div>

              {/* Left Navigation Arrow */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 group"
              >
                <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>

              {/* Right Navigation Arrow */}
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 group"
              >
                <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setActiveIdx(null)}
                className="absolute top-4 right-4 w-12 h-12 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
