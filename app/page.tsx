'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Heart,
  Menu,
  Pencil,
  Plus,
  Settings2,
  Sparkles,
  Target,
  Utensils,
  X,
} from 'lucide-react'

const meals = {
  breakfast: { label: '조식', time: '07:30', items: ['현미밥', '소고기미역국', '계란말이', '김구이', '배추김치'] },
  lunch: { label: '중식', time: '12:40', items: ['현미밥', '마라탕', '꿔바로우', '팽이버섯 무침', '요구르트'] },
  dinner: { label: '석식', time: '18:10', items: ['보리밥', '닭곰탕', '두부조림', '시금치나물', '깍두기'] },
}

const quotes = ['오늘 흘린 땀은 내일의 결실이 될 거야!', '작은 습관이 큰 실력을 만들어.', '지금의 너는 어제보다 한 걸음 더 나아갔어.']

function getExamDate() {
  const year = new Date().getFullYear()
  const november = new Date(year, 10, 1)
  const firstThursday = 1 + ((4 - november.getDay() + 7) % 7)
  return new Date(year, 10, firstThursday + 14, 8, 40)
}

export default function Page() {
  const [now, setNow] = useState(new Date())
  const [activeMeal, setActiveMeal] = useState<keyof typeof meals>('lunch')
  const [liked, setLiked] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    const quoteTimer = window.setInterval(() => setQuoteIndex((index) => (index + 1) % quotes.length), 6000)
    return () => { window.clearInterval(timer); window.clearInterval(quoteTimer) }
  }, [])

  const examDate = useMemo(getExamDate, [])
  const difference = Math.max(0, examDate.getTime() - now.getTime())
  const days = Math.floor(difference / 86400000)
  const hours = Math.floor((difference / 3600000) % 24)
  const minutes = Math.floor((difference / 60000) % 60)
  const seconds = Math.floor((difference / 1000) % 60)
  const currentMeal = meals[activeMeal]
  const formattedDate = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(now)

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8fc] text-[#25243a]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#6258d8] text-white shadow-[0_8px_20px_rgba(98,88,216,0.25)]"><Sparkles /></div>
            <div><p className="text-[17px] font-bold tracking-[-0.03em]">하루한칸</p><p className="text-xs text-[#9291a7]">나의 학교생활 대시보드</p></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button aria-label="알림" className="rounded-full p-2.5 text-[#77768b] transition hover:bg-white"><Bell size={19} /></button>
            <div className="hidden items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-sm sm:flex"><div className="flex size-8 items-center justify-center rounded-full bg-[#ffd9e4] text-sm font-bold text-[#ae5470]">지</div><span className="text-sm font-medium">지우님</span></div>
            <button aria-label="메뉴" className="rounded-full bg-white p-2.5 text-[#77768b] shadow-sm sm:hidden"><Menu size={19} /></button>
          </div>
        </header>

        <section className="mt-7 grid gap-5 lg:grid-cols-[1.45fr_1fr]">
          <div className="relative overflow-hidden rounded-[28px] bg-[#6560d9] p-7 text-white shadow-[0_20px_45px_rgba(101,96,217,0.22)] sm:p-10">
            <div className="absolute -right-14 -top-20 size-64 rounded-full bg-white/10" /><div className="absolute -bottom-28 right-24 size-72 rounded-full border-[28px] border-white/5" />
            <div className="relative"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-medium text-white/75"><Target size={18} /> 2027학년도 수능까지</div><button aria-label="목표 설정" className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20"><Settings2 size={18} /></button></div>
              <div className="mt-7 flex items-end gap-3"><span className="text-7xl font-bold tracking-[-0.09em] sm:text-8xl">D-{days}</span><span className="mb-3 rounded-full bg-[#ffcfdf] px-3 py-1 text-xs font-bold text-[#a34b70]">힘내자!</span></div>
              <div className="mt-3 flex items-center gap-2 text-sm text-white/75"><Clock3 size={16} /> {String(hours).padStart(2, '0')}시간 {String(minutes).padStart(2, '0')}분 {String(seconds).padStart(2, '0')}초 남음</div>
              <div className="mt-9 border-t border-white/15 pt-5 text-[15px] font-medium text-white/90">“{quotes[quoteIndex]}”</div>
            </div>
          </div>
          <div className="rounded-[28px] border border-white/80 bg-white/75 p-7 shadow-[0_12px_35px_rgba(44,43,83,0.06)] backdrop-blur-xl sm:p-8"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-[#9795aa]">오늘의 한마디</p><h2 className="mt-1 text-xl font-bold">잘하고 있어요, 지우님!</h2></div><div className="flex size-12 items-center justify-center rounded-2xl bg-[#fff0f4] text-[#ed86a7]"><Heart fill="currentColor" /></div></div><p className="mt-9 text-[19px] font-semibold leading-relaxed tracking-[-0.03em] text-[#403f58]">“완벽하지 않아도 괜찮아.<br />꾸준함이 너를 빛나게 할 거야.”</p><div className="mt-7 flex items-center gap-2 text-xs text-[#a09eb0]"><span className="size-1.5 rounded-full bg-[#ed86a7]" /> 매일 새로운 응원을 준비할게요</div></div>
        </section>

        <section className="mt-9 flex items-end justify-between"><div><p className="text-sm font-semibold text-[#a09eb0]">TODAY&apos;S MEAL</p><h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">오늘의 급식</h2></div><button onClick={() => setShowEditor(true)} className="flex items-center gap-1.5 rounded-full border border-[#e9e8f1] bg-white px-4 py-2.5 text-sm font-semibold text-[#6258d8] shadow-sm transition hover:bg-[#f5f3ff]"><Plus size={16} /> 급식 입력</button></section>

        <section className="mt-4 grid gap-5 pb-8 lg:grid-cols-[1fr_0.82fr]">
          <div className="rounded-[28px] border border-white/80 bg-white/80 p-6 shadow-[0_12px_35px_rgba(44,43,83,0.06)] backdrop-blur-xl sm:p-8"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-2xl bg-[#fff0cd] text-[#dc9c27]"><Utensils /></div><div><h3 className="font-bold">{formattedDate} 급식</h3><p className="mt-0.5 text-xs text-[#aaa8b8]">우리 학교 오늘의 메뉴</p></div></div><button onClick={() => setShowEditor(true)} aria-label="급식 수정" className="rounded-xl p-2 text-[#aaa8b8] hover:bg-[#f4f3f9]"><Pencil size={17} /></button></div>
            <div className="mt-6 flex rounded-2xl bg-[#f7f6fb] p-1">{(Object.keys(meals) as Array<keyof typeof meals>).map((key) => <button key={key} onClick={() => setActiveMeal(key)} className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${activeMeal === key ? 'bg-white text-[#6258d8] shadow-sm' : 'text-[#aaa8b8]'}`}>{meals[key].label}<span className="ml-1 text-[11px] font-normal">{meals[key].time}</span></button>)}</div>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">{currentMeal.items.map((item, index) => <li key={item} className="flex items-center justify-between rounded-xl bg-[#fbfbfd] px-4 py-3 text-sm font-medium"><span className="flex items-center gap-3"><span className="flex size-6 items-center justify-center rounded-full bg-[#eeedff] text-[11px] font-bold text-[#6258d8]">{index + 1}</span>{item}</span>{item === '마라탕' && <span className="rounded-full bg-[#fff0f0] px-2 py-1 text-[10px] font-bold text-[#e47777]">매운맛</span>}</li>)}</ul>
            <div className="mt-6 flex items-center justify-between border-t border-[#f0eff5] pt-5"><button onClick={() => setLiked(!liked)} className={`flex items-center gap-2 text-sm font-semibold transition ${liked ? 'text-[#eb7197]' : 'text-[#aaa8b8]'}`}><Heart size={18} fill={liked ? 'currentColor' : 'none'} /> {liked ? '129' : '128'}명이 좋아해요</button><span className="flex items-center gap-1.5 text-xs text-[#aaa8b8]"><span className="size-2 rounded-full bg-[#84d5b3]" /> NEIS 자동 연동됨</span></div>
          </div>
          <div className="rounded-[28px] border border-white/80 bg-[#eeedff]/70 p-7 shadow-[0_12px_35px_rgba(44,43,83,0.04)]"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-[#8e8ad2]">MY ROUTINE</p><h3 className="mt-1 text-xl font-bold">오늘의 루틴</h3></div><CalendarDays className="text-[#8e8ad2]" size={22} /></div><div className="mt-6 flex flex-col gap-3"><Routine label="영어 단어 30개" done /><Routine label="수학 문제집 2단원" done /><Routine label="국어 비문학 1지문" /><Routine label="가벼운 스트레칭" /></div><button className="mt-6 flex w-full items-center justify-center gap-1 rounded-xl border border-[#dcdaf5] bg-white/60 py-3 text-sm font-semibold text-[#7672bb] hover:bg-white">루틴 관리하기 <ChevronRight size={16} /></button></div>
        </section>
      </div>
      {showEditor && <div className="fixed inset-0 z-10 flex items-end justify-center bg-[#25243a]/20 p-4 backdrop-blur-sm sm:items-center"><div className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">오늘의 급식 입력</h2><button onClick={() => setShowEditor(false)} aria-label="닫기" className="rounded-full p-2 text-[#aaa8b8] hover:bg-[#f6f5fa]"><X /></button></div><p className="mt-2 text-sm text-[#aaa8b8]">직접 메뉴를 추가하거나 NEIS 연동을 관리하세요.</p><textarea className="mt-6 min-h-32 w-full rounded-2xl border border-[#e9e8f1] bg-[#fbfbfd] p-4 text-sm outline-none focus:border-[#8a84e8]" defaultValue={currentMeal.items.join('\n')} aria-label="급식 메뉴" /><button onClick={() => setShowEditor(false)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6560d9] py-3.5 text-sm font-bold text-white hover:bg-[#514bc5]"><Check size={17} /> 저장하기</button></div></div>}
    </main>
  )
}

function Routine({ label, done = false }: { label: string; done?: boolean }) { return <div className="flex items-center gap-3 rounded-2xl bg-white/65 px-4 py-3"><div className={`flex size-6 items-center justify-center rounded-full border-2 ${done ? 'border-[#8d88dd] bg-[#8d88dd] text-white' : 'border-[#c9c6ee]'}`}>{done && <Check size={14} strokeWidth={3} />}</div><span className={`text-sm font-medium ${done ? 'text-[#9290a5] line-through' : 'text-[#4e4c68]'}`}>{label}</span></div> }
