import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX, X } from 'lucide-react'
import { REELS } from '@/data/catalog'

function ReelMedia({ reel, playing, className = '' }) {
  return (
    <img
      src={reel.poster}
      alt={reel.title}
      className={`h-full w-full object-cover ${playing ? 'animate-reel-ken' : ''} ${className}`.trim()}
    />
  )
}

export default function ReelSection() {
  const scroller = useRef(null)
  const [active, setActive] = useState(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    if (active === null) return undefined

    function onKey(e) {
      if (e.key === 'Escape') setActive(null)
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % REELS.length)
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + REELS.length) % REELS.length)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [active])

  useEffect(() => {
    if (active === null) return undefined
    const timer = window.setTimeout(() => {
      setActive((i) => (i + 1) % REELS.length)
    }, 7000)
    return () => window.clearTimeout(timer)
  }, [active])

  function scrollBy(dir) {
    scroller.current?.scrollBy({ left: dir * 240, behavior: 'smooth' })
  }

  const current = active !== null ? REELS[active] : null
  const shopTo = current
    ? current.productSlug === 'sample-kit' || current.productSlug === 'free-sample-kit'
      ? '/sample-kit'
      : `/products/${current.productSlug}`
    : '/'

  return (
    <div className="animate-fade-up col-span-12 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-emerald-600 uppercase">Watch</p>
          <h3 className="text-2xl font-bold">Packaging Reels</h3>
          <p className="text-sm text-slate-500">See pouches, boxes and labels in action</p>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Previous reels"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Next reels"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {REELS.map((reel, index) => (
          <button
            key={reel.id}
            type="button"
            onClick={() => setActive(index)}
            className="group relative w-[148px] shrink-0 snap-start overflow-hidden rounded-[1.4rem] bg-slate-900 text-left shadow-sm md:w-[168px]"
          >
            <div className="relative aspect-[9/16] overflow-hidden">
              <ReelMedia reel={reel} playing className="transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur-sm">
                Reel
              </span>
              <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                <Play className="h-3.5 w-3.5 fill-current" />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <p className="line-clamp-2 text-sm font-semibold leading-snug">{reel.title}</p>
                <p className="mt-1 text-[11px] text-white/70">{reel.views} views</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close reel"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setActive((i) => (i - 1 + REELS.length) % REELS.length)
            }}
            className="absolute left-3 hidden rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:block"
            aria-label="Previous reel"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setActive((i) => (i + 1) % REELS.length)
            }}
            className="absolute right-3 hidden rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:block md:right-16"
            aria-label="Next reel"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            className="relative w-full max-w-[360px] overflow-hidden rounded-[1.8rem] bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[9/16]">
              <ReelMedia reel={current} playing />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              <div className="absolute inset-x-3 top-3 flex gap-1">
                {REELS.map((reel, i) => (
                  <div key={reel.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25">
                    <div
                      key={`${current.id}-${i}`}
                      className={`h-full origin-left rounded-full bg-white ${
                        i < active ? 'w-full' : i === active ? 'animate-reel-progress' : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setMuted((v) => !v)}
                className="absolute right-3 top-8 z-20 rounded-full bg-black/30 p-2 text-white"
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                className="absolute inset-y-16 left-0 z-10 w-1/3"
                aria-label="Previous reel"
                onClick={() => setActive((i) => (i - 1 + REELS.length) % REELS.length)}
              />
              <button
                type="button"
                className="absolute inset-y-16 right-0 z-10 w-1/3"
                aria-label="Next reel"
                onClick={() => setActive((i) => (i + 1) % REELS.length)}
              />
              <div className="absolute inset-x-0 bottom-0 z-20 p-5 text-white">
                <p className="text-[11px] font-semibold tracking-widest text-emerald-200 uppercase">{current.views} views</p>
                <h4 className="mt-1 text-xl font-bold">{current.title}</h4>
                <p className="mt-1 text-sm text-white/80">{current.caption}</p>
                <Link
                  to={shopTo}
                  onClick={() => setActive(null)}
                  className="gradient-btn mt-4 inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold text-white"
                >
                  Shop this pack
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
