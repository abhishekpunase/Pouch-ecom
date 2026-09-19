import { useEffect, useState } from 'react'
import { Clock3, Eye, Flame, PackageX } from 'lucide-react'
import { formatCountdown, msUntilMidnightIst, productUrgency } from '@/utils/urgency'

export default function ProductUrgency({ product }) {
  const data = productUrgency(product)
  const [leftMs, setLeftMs] = useState(() => msUntilMidnightIst())

  useEffect(() => {
    const tick = () => setLeftMs(msUntilMidnightIst())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [product?.id])

  if (!data) return null

  const stockMax = 16
  const stockPct = Math.max(8, Math.round((data.left / stockMax) * 100))

  return (
    <div className="mt-5 space-y-3">
      <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-800 ring-1 ring-rose-100">
        <Flame className="h-4 w-4 shrink-0 text-rose-600" />
        {data.hot ? `${data.soldToday}+ packs sold today` : 'Selling fast with bulk brands'}
        <span className="font-normal text-rose-700/80">· order before stock resets</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-amber-800 uppercase">
            <Clock3 className="h-3.5 w-3.5" /> Today’s rate
          </p>
          <p className="mt-0.5 font-mono text-lg font-bold tabular-nums text-amber-950">{formatCountdown(leftMs)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <PackageX className="h-3.5 w-3.5" /> Packs left
          </p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">Only {data.left}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <Eye className="h-3.5 w-3.5" /> Viewing now
          </p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">
            <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {data.viewing}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-[11px] font-semibold">
          <span className={data.low ? 'text-rose-700' : 'text-slate-500'}>
            {data.low ? 'Low stock — dispatch today if you order now' : 'Stock moving quickly'}
          </span>
          <span className="text-slate-400">{data.left} / {stockMax}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${data.low ? 'bg-rose-500' : 'bg-amber-500'}`}
            style={{ width: `${stockPct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
