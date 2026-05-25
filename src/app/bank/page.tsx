"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { chapters, questions } from "@/data/questions"

const WRONG_KEY = "python-quiz-pro-wrong-v5"
const EVENT_NAME = "quiz-data-updated"

function readWrongIds() {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(WRONG_KEY)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

export default function BankPage() {
  const [wrongIds, setWrongIds] = useState<number[]>([])

  useEffect(() => {
    const sync = () => setWrongIds(readWrongIds())
    sync()

    window.addEventListener(EVENT_NAME, sync)
    window.addEventListener("storage", sync)

    return () => {
      window.removeEventListener(EVENT_NAME, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const wrongSet = useMemo(() => new Set(wrongIds), [wrongIds])

  return (
    <main className="min-h-screen bg-[#080b14] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-white/40">
              Quiz Bank
            </div>
            <h1 className="mt-2 text-4xl font-semibold">Chapter Bank</h1>
            <p className="mt-2 text-white/45">
              Open a chapter and start a dedicated quiz session.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:bg-white/10"
            >
              Home
            </Link>
            <Link
              href="/wrong"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:bg-white/10"
            >
              Wrong Review
            </Link>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {chapters.map((chapter) => {
            const chapterQuestions = questions.filter((q) => q.chapter === chapter)
            const knowledgePoints = Array.from(
              new Set(chapterQuestions.map((q) => q.knowledgePoint))
            )
            const wrongCount = chapterQuestions.filter((q) => wrongSet.has(q.id)).length

            return (
              <div
                key={chapter}
                className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
              >
                <h2 className="text-2xl font-semibold leading-tight">{chapter}</h2>

                <div className="mt-4 flex gap-3 text-sm text-white/45">
                  <span>{chapterQuestions.length} questions</span>
                  <span>•</span>
                  <span>{knowledgePoints.length} topics</span>
                  <span>•</span>
                  <span>{wrongCount} wrong</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {knowledgePoints.map((kp) => (
                    <span
                      key={kp}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/65"
                    >
                      {kp}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <Link
                    href={`/quiz?chapter=${encodeURIComponent(chapter)}`}
                    className="flex-1 rounded-2xl bg-white px-4 py-3 text-center text-sm font-medium text-black transition hover:scale-[1.01]"
                  >
                    Open
                  </Link>
                  <Link
                    href={`/quiz?chapter=${encodeURIComponent(chapter)}&mode=wrong`}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white/80 transition hover:bg-white/10"
                  >
                    Wrong
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}