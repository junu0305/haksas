'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bell, CalendarDays, Check, ChevronRight, Clock3, Heart, Menu, Pencil, Plus, Settings2, Sparkles, Target, Trash2, Utensils, X } from 'lucide-react'

type MealKey = 'breakfast' | 'lunch' | 'dinner'
type Meal = { label: string; time: string; items: string[] }
type RoutineItem = { id: string; label: string; done: boolean }
type Settings = { userName: string; goal: string; examDate: string } // "YYYY-MM-DD"
type Stored = {
  settings: Settings
  meals: Record<MealKey, Meal>
  routine: RoutineItem[]
  routineDate: string
  liked: boolean
}
type Panel = 'editor' | 'goal' | 'routine' | null

const STORAGE_KEY = 'haru-han-kan:v1'
const BASE_LIKES = 128

const defaultMeals: Record<MealKey, Meal> = {
  breakfast: { label: '조식', time: '07:30', items: ['현미밥', '소고기미역국', '계란말이', '김구이', '배추김치'] },
  lunch: { label: '중식', time: '12:40', items: ['현미밥', '마라탕', '꿔바로우', '팽이버섯 무침', '요구르트'] },
  dinner: { label: '석식', time: '18:10', items: ['보리밥', '닭곰탕', '두부조림', '시금치나물', '깍두기'] },
}
const quotes = ['오늘 흘린 땀은 내일의 결실이 될 거야!', '작은 습관이 큰 실력을 만들어.', '지금의 너는 어제보다 한 걸음 더 나아갔어.']
const defaultRoutine: RoutineItem[] = [
  { id: 'r1', label: '영어 단어 30개', done: false },
  { id: 'r2', label: '수학 문제집 2단원', done: false },
  { id: 'r3', label: '국어 비문학 1지문', done: false },
  { id: 'r4', label: '가벼운 스트레칭', done: false },
]
const defaultSettings: Settings = { userName: '지우', goal: '2027학년도 수능', examDate: '2026-11-19' }

function toDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 수능 1교시 시작 시각(08:40)을 기준으로 잡는다.
function parseExamDate(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  if (!y || !m || !d) return new Date(2026, 10, 19, 8, 40)
  return new Date(y, m - 1, d, 8, 40)
}

function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

export default function Page() {
  const [now, setNow] = useState<Date | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [meals, setMeals] = useState<Record<MealKey, Meal>>(defaultMeals)
  const [activeMeal, setActiveMeal] = useState<MealKey>('lunch')
  const [liked, setLiked] = useState(false)
  const [routine, setRoutine] = useState<RoutineItem[]>(defaultRoutine)
  const [routineDate, setRoutineDate] = useState('')
  const [quoteIndex, setQuoteIndex] = useState(0)

  const [panel, setPanel] = useState<Panel>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [draftMenu, setDraftMenu] = useState('')
  const [draftSettings, setDraftSettings] = useState<Settings>(defaultSettings)
  const [newRoutine, setNewRoutine] = useState('')

  // 저장된 데이터 불러오기 (클라이언트에서만 실행 -> 하이드레이션 안전)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Stored>
        if (saved.settings) setSettings({ ...defaultSettings, ...saved.settings })
        if (saved.meals) setMeals({ ...defaultMeals, ...saved.meals })
        if (Array.isArray(saved.routine)) setRoutine(saved.routine)
        if (typeof saved.routineDate === 'string') setRoutineDate(saved.routineDate)
        if (typeof saved.liked === 'boolean') setLiked(saved.liked)
      }
    } catch {
      // 저장 데이터가 손상되었으면 기본값을 그대로 사용
    }
    setLoaded(true)
  }, [])

  // 시계 & 명언 롤링
  useEffect(() => {
    setNow(new Date())
    const clock = window.setInterval(() => setNow(new Date()), 1000)
    const quoteTimer = window.setInterval(() => setQuoteIndex((i) => (i + 1) % quotes.length), 6000)
    return () => {
      window.clearInterval(clock)
      window.clearInterval(quoteTimer)
    }
  }, [])

  const todayKey = now ? toDateKey(now) : ''

  // 날짜가 바뀌면 루틴 체크를 초기화
  useEffect(() => {
    if (!loaded || !todayKey || routineDate === todayKey) return
    setRoutine((items) => items.map((item) => ({ ...item, done: false })))
    setRoutineDate(todayKey)
  }, [loaded, todayKey, routineDate])

  // 변경사항 저장
  useEffect(() => {
    if (!loaded) return
    const payload: Stored = { settings, meals, routine, routineDate, liked }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // 저장 용량 초과 등은 무시
    }
  }, [loaded, settings, meals, routine, routineDate, liked])

  // D-day 계산
  const examAt = useMemo(() => parseExamDate(settings.examDate), [settings.examDate])
  const diff = now ? examAt.getTime() - now.getTime() : 0
  const isOver = now !== null && diff <= 0
  const remainMs = Math.max(0, diff)
  const days = Math.floor(remainMs / 86400000)
  const hours = Math.floor((remainMs / 3600000) % 24)
  const minutes = Math.floor((remainMs / 60000) % 60)
  const seconds = Math.floor((remainMs / 1000) % 60)

  const currentMeal = meals[activeMeal]
  const formattedDate = now ? new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(now) : ''
  const remainingRoutine = routine.filter((item) => !item.done).length
  const likeCount = BASE_LIKES + (liked ? 1 : 0)

  const notices = [
    remainingRoutine > 0 ? `오늘 루틴이 ${remainingRoutine}개 남았어요.` : '오늘 루틴을 모두 끝냈어요!',
    `${currentMeal.label} 메뉴: ${currentMeal.items.slice(0, 2).join(', ')} 외`,
  ]

  const openEditor = () => {
    setDraftMenu(currentMeal.items.join('\n'))
    setPanel('editor')
    setShowMenu(false)
  }
  const saveMenu = () => {
    const items = draftMenu.split('\n').map((item) => item.trim()).filter(Boolean)
    if (items.length === 0) return
    setMeals((prev) => ({ ...prev, [activeMeal]: { ...prev[activeMeal], items } }))
    setPanel(null)
  }

  const openGoal = () => {
    setDraftSettings(settings)
    setPanel('goal')
    setShowMenu(false)
  }
  const saveGoal = () => {
    const goal = draftSettings.goal.trim()
    const examDate = draftSettings.examDate
    if (!goal || !examDate) return
    setSettings({
      userName: draftSettings.userName.trim() || defaultSettings.userName,
      goal,
      examDate,
    })
    setPanel(null)
  }

  const toggleRoutine = (id: string) =>
    setRoutine((items) => items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  const addRoutine = () => {
    const label = newRoutine.trim()
    if (!label) return
    setRoutine((items) => [...items, { id: newId(), label, done: false }])
    setNewRoutine('')
  }
  const deleteRoutine = (id: string) => setRoutine((items) => items.filter((item) => item.id !== id))

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8fc] text-[#25243a]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#6258d8] text-white shadow-[0_8px_20px_rgba(98,88,216,0.25)]">
              <Sparkles />
            </div>
            <div>
              <p className="text-[17px] font-bold">하루한칸</p>
              <p className="text-xs text-[#9291a7]">나의 학교생활 대시보드</p>
            </div>
          </div>

          <div className="relative flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => { setShowNotifications((v) => !v); setShowMenu(false) }}
              aria-label="알림"
              className="relative rounded-full p-2.5 text-[#77768b] hover:bg-white"
            >
              <Bell size={19} />
              {!showNotifications && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#ed7199]" />}
            </button>

            <div className="hidden items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-sm sm:flex">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#ffd9e4] text-sm font-bold text-[#ae5470]">
                {settings.userName.charAt(0)}
              </div>
              <span className="text-sm font-medium">{settings.userName}님</span>
            </div>

            <button
              onClick={() => { setShowMenu((v) => !v); setShowNotifications(false) }}
              aria-label="메뉴"
              className="rounded-full bg-white p-2.5 text-[#77768b] shadow-sm sm:hidden"
            >
              <Menu size={19} />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 z-20 w-64 rounded-2xl bg-white p-4 text-sm shadow-xl">
                <p className="font-bold">새 알림</p>
                {notices.map((notice) => (
                  <p key={notice} className="mt-3 rounded-xl bg-[#f7f6ff] p-3 text-[#7672bb]">{notice}</p>
                ))}
              </div>
            )}

            {showMenu && (
              <div className="absolute right-0 top-12 z-20 w-40 rounded-2xl bg-white p-2 text-sm shadow-xl sm:hidden">
                <button onClick={openGoal} className="w-full rounded-xl p-3 text-left hover:bg-[#f7f6ff]">목표 설정</button>
                <button onClick={openEditor} className="w-full rounded-xl p-3 text-left hover:bg-[#f7f6ff]">급식 입력</button>
              </div>
            )}
          </div>
        </header>

        <section className="mt-7 grid gap-5 lg:grid-cols-[1.45fr_1fr]">
          <div className="relative overflow-hidden rounded-[28px] bg-[#6560d9] p-7 text-white shadow-[0_20px_45px_rgba(101,96,217,0.22)] sm:p-10">
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-white/75">
                  <Target size={18} /> {settings.goal}까지
                </div>
                <button onClick={openGoal} aria-label="목표 설정" className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20">
                  <Settings2 size={18} />
                </button>
              </div>

              {isOver ? (
                <>
                  <div className="mt-7 flex items-end gap-3">
                    <span className="text-6xl font-bold tracking-[-0.06em] sm:text-7xl">수고했어요!</span>
                  </div>
                  <p className="mt-3 text-sm text-white/75">목표 날짜가 지났어요. 새 목표를 설정해 보세요.</p>
                </>
              ) : (
                <>
                  <div className="mt-7 flex items-end gap-3">
                    <span className="text-7xl font-bold tracking-[-0.09em] sm:text-8xl">
                      {now ? `D-${days}` : 'D-'}
                    </span>
                    <span className="mb-3 rounded-full bg-[#ffcfdf] px-3 py-1 text-xs font-bold text-[#a34b70]">힘내자!</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-white/75">
                    <Clock3 size={16} />
                    {now
                      ? `${String(hours).padStart(2, '0')}시간 ${String(minutes).padStart(2, '0')}분 ${String(seconds).padStart(2, '0')}초 남음`
                      : '계산 중...'}
                  </div>
                </>
              )}

              <div className="mt-9 border-t border-white/15 pt-5 text-[15px] font-medium text-white/90">“{quotes[quoteIndex]}”</div>
            </div>
          </div>

          <div className="rounded-[28px] bg-white/75 p-7 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#9795aa]">오늘의 한마디</p>
                <h2 className="mt-1 text-xl font-bold">잘하고 있어요, {settings.userName}님!</h2>
              </div>
              <Heart className="text-[#ed86a7]" fill="currentColor" />
            </div>
            <p className="mt-9 text-[19px] font-semibold leading-relaxed text-[#403f58]">
              “완벽하지 않아도 괜찮아.<br />꾸준함이 너를 빛나게 할 거야.”
            </p>
          </div>
        </section>

        <section className="mt-9 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-[#a09eb0]">TODAY&apos;S MEAL</p>
            <h2 className="mt-1 text-2xl font-bold">오늘의 급식</h2>
          </div>
          <button
            onClick={openEditor}
            className="flex items-center gap-1.5 rounded-full border border-[#e9e8f1] bg-white px-4 py-2.5 text-sm font-semibold text-[#6258d8] shadow-sm hover:bg-[#f5f3ff]"
          >
            <Plus size={16} /> 급식 입력
          </button>
        </section>

        <section className="mt-4 grid gap-5 pb-8 lg:grid-cols-[1fr_0.82fr]">
          <div className="rounded-[28px] bg-white/80 p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#fff0cd] text-[#dc9c27]">
                  <Utensils />
                </div>
                <div>
                  <h3 className="font-bold">{formattedDate} 급식</h3>
                  <p className="text-xs text-[#aaa8b8]">우리 학교 오늘의 메뉴</p>
                </div>
              </div>
              <button onClick={openEditor} aria-label="급식 수정" className="rounded-xl p-2 text-[#aaa8b8] hover:bg-[#f4f3f9]">
                <Pencil size={17} />
              </button>
            </div>

            <div className="mt-6 flex rounded-2xl bg-[#f7f6fb] p-1">
              {(Object.keys(meals) as MealKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveMeal(key)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold ${activeMeal === key ? 'bg-white text-[#6258d8] shadow-sm' : 'text-[#aaa8b8]'}`}
                >
                  {meals[key].label}
                  <span className="ml-1 text-[11px] font-normal">{meals[key].time}</span>
                </button>
              ))}
            </div>

            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {currentMeal.items.map((item, index) => (
                <li key={`${item}-${index}`} className="flex items-center gap-3 rounded-xl bg-[#fbfbfd] px-4 py-3 text-sm font-medium">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#eeedff] text-[11px] font-bold text-[#6258d8]">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between border-t border-[#f0eff5] pt-5">
              <button
                onClick={() => setLiked((v) => !v)}
                className={`flex items-center gap-2 text-sm font-semibold ${liked ? 'text-[#eb7197]' : 'text-[#aaa8b8]'}`}
              >
                <Heart size={18} fill={liked ? 'currentColor' : 'none'} /> {likeCount}명이 좋아해요
              </button>
              <span className="text-xs text-[#aaa8b8]">직접 입력한 급식</span>
            </div>
          </div>

          <div className="rounded-[28px] bg-[#eeedff]/70 p-7 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#8e8ad2]">MY ROUTINE</p>
                <h3 className="mt-1 text-xl font-bold">오늘의 루틴</h3>
              </div>
              <CalendarDays className="text-[#8e8ad2]" size={22} />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {routine.length === 0 && <p className="text-sm text-[#9290a5]">등록된 루틴이 없어요. 루틴을 추가해 보세요.</p>}
              {routine.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleRoutine(item.id)}
                  className="flex items-center gap-3 rounded-2xl bg-white/65 px-4 py-3 text-left"
                >
                  <span
                    className={`flex size-6 items-center justify-center rounded-full border-2 ${item.done ? 'border-[#8d88dd] bg-[#8d88dd] text-white' : 'border-[#c9c6ee]'}`}
                  >
                    {item.done && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span className={`text-sm font-medium ${item.done ? 'text-[#9290a5] line-through' : 'text-[#4e4c68]'}`}>{item.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setPanel('routine')}
              className="mt-6 flex w-full items-center justify-center gap-1 rounded-xl border border-[#dcdaf5] bg-white/60 py-3 text-sm font-semibold text-[#7672bb] hover:bg-white"
            >
              루틴 관리하기 <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </div>

      {panel === 'editor' && (
        <Modal title={`${currentMeal.label} 급식 입력`} onClose={() => setPanel(null)}>
          <p className="text-sm text-[#aaa8b8]">메뉴를 한 줄에 하나씩 입력하세요.</p>
          <textarea
            value={draftMenu}
            onChange={(event) => setDraftMenu(event.target.value)}
            className="mt-6 min-h-32 w-full rounded-2xl border border-[#e9e8f1] bg-[#fbfbfd] p-4 text-sm outline-none focus:border-[#8a84e8]"
            aria-label="급식 메뉴"
          />
          <button
            onClick={saveMenu}
            disabled={draftMenu.trim().length === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6560d9] py-3.5 text-sm font-bold text-white disabled:opacity-50"
          >
            <Check size={17} /> 저장하기
          </button>
        </Modal>
      )}

      {panel === 'goal' && (
        <Modal title="목표 설정" onClose={() => setPanel(null)}>
          <div className="mt-2 flex flex-col gap-4">
            <label className="text-sm font-semibold">
              이름
              <input
                value={draftSettings.userName}
                onChange={(event) => setDraftSettings({ ...draftSettings, userName: event.target.value })}
                className="mt-2 w-full rounded-xl border border-[#e9e8f1] p-3 outline-none focus:border-[#8a84e8]"
              />
            </label>
            <label className="text-sm font-semibold">
              목표 이름
              <input
                value={draftSettings.goal}
                onChange={(event) => setDraftSettings({ ...draftSettings, goal: event.target.value })}
                className="mt-2 w-full rounded-xl border border-[#e9e8f1] p-3 outline-none focus:border-[#8a84e8]"
              />
            </label>
            <label className="text-sm font-semibold">
              날짜 (수능 1교시 기준 08:40)
              <input
                type="date"
                value={draftSettings.examDate}
                onChange={(event) => setDraftSettings({ ...draftSettings, examDate: event.target.value })}
                className="mt-2 w-full rounded-xl border border-[#e9e8f1] p-3 outline-none focus:border-[#8a84e8]"
              />
            </label>
          </div>
          <button
            onClick={saveGoal}
            disabled={!draftSettings.goal.trim() || !draftSettings.examDate}
            className="mt-6 w-full rounded-xl bg-[#6560d9] py-3.5 text-sm font-bold text-white disabled:opacity-50"
          >
            목표 저장하기
          </button>
        </Modal>
      )}

      {panel === 'routine' && (
        <Modal title="루틴 관리" onClose={() => setPanel(null)}>
          <div className="mt-2 flex flex-col gap-2">
            {routine.length === 0 && <p className="text-sm text-[#aaa8b8]">등록된 루틴이 없어요.</p>}
            {routine.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#fbfbfd] px-4 py-3 text-sm font-medium">
                <span>{item.label}</span>
                <button onClick={() => deleteRoutine(item.id)} aria-label={`${item.label} 삭제`} className="rounded-lg p-1.5 text-[#aaa8b8] hover:bg-white hover:text-[#d9466f]">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <form
            onSubmit={(event) => { event.preventDefault(); addRoutine() }}
            className="mt-5 flex gap-2"
          >
            <input
              value={newRoutine}
              onChange={(event) => setNewRoutine(event.target.value)}
              placeholder="새 루틴 입력"
              aria-label="새 루틴"
              className="flex-1 rounded-xl border border-[#e9e8f1] p-3 text-sm outline-none focus:border-[#8a84e8]"
            />
            <button type="submit" disabled={!newRoutine.trim()} className="rounded-xl bg-[#6560d9] px-4 text-sm font-bold text-white disabled:opacity-50">
              추가
            </button>
          </form>
        </Modal>
      )}
    </main>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-[#25243a]/20 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} aria-label="닫기" className="rounded-full p-2 text-[#aaa8b8] hover:bg-[#f6f5fa]">
            <X />
          </button>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  )
}
