"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { questions } from "@/data/questions"

const WRONG_KEY = "python-quiz-pro-wrong-v5"
const EVENT_NAME = "quiz-data-updated"

function readWrongIds(): number[] {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem(WRONG_KEY)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

export default function WrongPage() {
  const [wrongIds, setWrongIds] = useState<number[]>([])

  useEffect(() => {
    setWrongIds(readWrongIds())

    function refresh() {
      setWrongIds(readWrongIds())
    }

    window.addEventListener(EVENT_NAME, refresh)
    window.addEventListener("storage", refresh)

    return () => {
      window.removeEventListener(EVENT_NAME, refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  const wrongQuestions = useMemo(() => {
    const wrongSet = new Set(wrongIds)

    return questions.filter((q) => wrongSet.has(q.id))
  }, [wrongIds])

  function clearWrong() {
    localStorage.setItem(WRONG_KEY, JSON.stringify([]))
    setWrongIds([])

    window.dispatchEvent(new Event(EVENT_NAME))
  }

  return (
    <main className="min-h-screen bg-[#080b14] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm tracking-[0.3em] text-white/35">
                WRONG REVIEW
              </div>

              <h1 className="mt-3 text-4xl font-semibold">
                错题回顾
              </h1>

              <p className="mt-3 text-white/50">
                这里会保存你做错的题，方便你集中复习。
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearWrong}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:bg-white/10"
              >
                清空错题
              </button>

              <Link
                href="/quiz?mode=wrong"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-[1.02]"
              >
                返回刷题
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {wrongQuestions.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-white/50 backdrop-blur-md">
              现在还没有错题。
            </div>
          ) : (
            wrongQuestions.map((q) => {
              const correctAnswer =
                q.type === "blank"
                  ? q.answers?.[0] ?? ""
                  : q.options?.[q.answerIndex ?? 0] ?? ""

              return (
                <div
                  key={q.id}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-white/35">
                        Question #{q.id} · {q.knowledgePoint}
                      </div>

                      <h2 className="mt-3 text-2xl font-semibold leading-tight">
                        {q.question}
                      </h2>
                    </div>

                    <Link
                      href={`/quiz?chapter=${encodeURIComponent(
                        q.chapter
                      )}&mode=wrong`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
                    >
                      去重做
                    </Link>
                  </div>

                  <div className="mt-5 text-sm text-white/60">
                    正确答案：
                    <span className="ml-2 text-white">
                      {correctAnswer}
                    </span>
                  </div>

                  {q.explanation && (
                    <p className="mt-3 text-sm leading-7 text-white/45">
                      {q.explanation}
                    </p>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}