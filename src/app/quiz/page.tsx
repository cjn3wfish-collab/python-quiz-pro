"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { questions } from "@/data/questions"

type AnswerState = "idle" | "correct" | "wrong"

const PROGRESS_KEY = "python-quiz-pro-progress-v5"
const WRONG_KEY = "python-quiz-pro-wrong-v5"
const EVENT_NAME = "quiz-data-updated"

type SavedState = {
  activeChapter: string
  currentIndex: number
  reviewWrongOnly: boolean
  wrongIds: number[]
  answeredIds: number[]
}

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, "")
}

function loadSavedState(): SavedState | null {
  if (typeof window === "undefined") return null

  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function readWrongIds() {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem(WRONG_KEY)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

export default function QuizPage() {
  const searchParams = useSearchParams()

  const urlChapter = searchParams.get("chapter")
  const urlMode = searchParams.get("mode")

  const [activeChapter, setActiveChapter] = useState("")
  const [reviewWrongOnly, setReviewWrongOnly] = useState(false)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const [textAnswer, setTextAnswer] = useState("")
  const [answerState, setAnswerState] = useState<AnswerState>("idle")

  const [wrongIds, setWrongIds] = useState<number[]>([])
  const [answeredIds, setAnsweredIds] = useState<number[]>([])

  useEffect(() => {
    const saved = loadSavedState()

    if (saved) {
      if (saved.activeChapter) setActiveChapter(saved.activeChapter)

      if (typeof saved.reviewWrongOnly === "boolean") {
        setReviewWrongOnly(saved.reviewWrongOnly)
      }

      if (Array.isArray(saved.wrongIds)) {
        setWrongIds(saved.wrongIds)
      }

      if (Array.isArray(saved.answeredIds)) {
        setAnsweredIds(saved.answeredIds)
      }

      if (typeof saved.currentIndex === "number") {
        setCurrentIndex(saved.currentIndex)
      }
    } else {
      setWrongIds(readWrongIds())
    }

    if (urlChapter) {
      setActiveChapter(urlChapter)
    }

    if (urlMode === "wrong") {
      setReviewWrongOnly(true)
    }
  }, [urlChapter, urlMode])

  useEffect(() => {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({
        activeChapter,
        currentIndex,
        reviewWrongOnly,
        wrongIds,
        answeredIds,
      })
    )

    localStorage.setItem(WRONG_KEY, JSON.stringify(wrongIds))
    window.dispatchEvent(new Event(EVENT_NAME))
  }, [activeChapter, currentIndex, reviewWrongOnly, wrongIds, answeredIds])

  const chapterQuestions = useMemo(() => {
    if (!activeChapter) return questions
    return questions.filter((q) => q.chapter === activeChapter)
  }, [activeChapter])

  const scopeQuestions = useMemo(() => {
    let list = chapterQuestions

    if (reviewWrongOnly) {
      const wrongSet = new Set(wrongIds)
      const wrongList = list.filter((q) => wrongSet.has(q.id))
      return wrongList.length > 0 ? wrongList : list
    }

    return list
  }, [chapterQuestions, reviewWrongOnly, wrongIds])

  const currentQuestion = scopeQuestions[currentIndex]
  const wrongCount = wrongIds.length

  const accuracy =
    answeredIds.length > 0
      ? Math.round(
          ((answeredIds.length - wrongIds.length) / answeredIds.length) * 100
        )
      : 0

  function resetQuestionState() {
    setCurrentIndex(0)
    setSelectedIndex(null)
    setTextAnswer("")
    setAnswerState("idle")
  }

  function markAnswered(id: number) {
    setAnsweredIds((prev) => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }

  function addWrong(id: number) {
    setWrongIds((prev) => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }

  function chooseOption(index: number) {
    if (!currentQuestion) return
    if (currentQuestion.type === "blank") return
    if (answerState !== "idle") return

    setSelectedIndex(index)
    markAnswered(currentQuestion.id)

    const correct = index === currentQuestion.answerIndex

    if (correct) {
      setWrongIds((prev) => prev.filter((id) => id !== currentQuestion.id))
    }

    setAnswerState(correct ? "correct" : "wrong")

    if (!correct) {
      addWrong(currentQuestion.id)
    }
  }

  function submitBlank() {
    if (!currentQuestion) return
    if (currentQuestion.type !== "blank") return
    if (answerState !== "idle") return

    const user = normalize(textAnswer)
    const accepted = (currentQuestion.answers ?? []).some(
      (item) => normalize(item) === user
    )

    markAnswered(currentQuestion.id)

    if (accepted) {
      setWrongIds((prev) => prev.filter((id) => id !== currentQuestion.id))
    }

    setAnswerState(accepted ? "correct" : "wrong")

    if (!accepted) {
      addWrong(currentQuestion.id)
    }
  }

  function nextQuestion() {
    if (answerState === "idle") return

    if (currentIndex < scopeQuestions.length - 1) {
      setCurrentIndex((v) => v + 1)
      setSelectedIndex(null)
      setTextAnswer("")
      setAnswerState("idle")
    } else {
      alert(`🎉 Quiz Completed\n\nAccuracy: ${accuracy}%`)
    }
  }

  function prevQuestion() {
    if (currentIndex === 0) return

    setCurrentIndex((v) => v - 1)
    setSelectedIndex(null)
    setTextAnswer("")
    setAnswerState("idle")
  }

  function clearWrong() {
    setWrongIds([])
    setAnsweredIds([])
    window.dispatchEvent(new Event(EVENT_NAME))
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null

      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable

      if (isTyping) {
        if (e.key === "Enter" && currentQuestion?.type === "blank") {
          e.preventDefault()
          submitBlank()
        }
        return
      }

      if (!currentQuestion) return

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        prevQuestion()
        return
      }

      if (e.key === "ArrowRight") {
        e.preventDefault()
        nextQuestion()
        return
      }

      if (e.key === "Enter") {
        e.preventDefault()

        if (currentQuestion.type === "blank" && answerState === "idle") {
          submitBlank()
        } else {
          nextQuestion()
        }

        return
      }

      if (answerState !== "idle") return

      const n = Number(e.key)

      if (n >= 1 && n <= 4 && currentQuestion.type !== "blank") {
        e.preventDefault()
        chooseOption(n - 1)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [answerState, currentQuestion, currentIndex, textAnswer])

  if (!activeChapter) {
    return (
      <main className="min-h-screen bg-[#080b14] px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <h1 className="text-3xl font-semibold">Choose a chapter first</h1>

          <p className="mt-3 text-white/50">
            Go to the chapter bank, then open a chapter.
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/bank"
              className="rounded-2xl bg-white px-5 py-3 text-black"
            >
              Chapter Bank
            </Link>

            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white"
            >
              Home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!currentQuestion) {
    return (
      <main className="min-h-screen bg-[#080b14] px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <h1 className="text-3xl font-semibold">No question in this scope</h1>

          <p className="mt-3 text-white/50">
            Try changing chapter or turning off wrong-review mode.
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/bank"
              className="rounded-2xl bg-white px-5 py-3 text-black"
            >
              Chapter Bank
            </Link>

            <Link
              href="/wrong"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white"
            >
              Wrong Review
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const progress = scopeQuestions.length
    ? ((currentIndex + 1) / scopeQuestions.length) * 100
    : 0

  const correctAnswerText =
    currentQuestion.type === "blank"
      ? currentQuestion.answers?.[0] ?? ""
      : currentQuestion.options?.[currentQuestion.answerIndex ?? 0] ?? ""

  return (
    <main className="relative min-h-screen bg-[#080b14] px-4 py-5 text-white md:px-6 md:py-8">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              Home
            </Link>

            <Link
              href="/bank"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              Bank
            </Link>

            <Link
              href="/wrong"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              Wrong Review
            </Link>
          </div>

          <div className="text-sm text-white/45">
            {reviewWrongOnly ? "Wrong Mode" : "Normal Mode"} · Wrong {wrongCount}
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/45">
              {activeChapter}
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Python Quiz Pro
            </h1>

            <p className="mt-2 text-sm text-white/45">
              1-4 select · Enter submit / next · ← → switch
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-center">
              <div className="text-[11px] text-white/35">Progress</div>
              <div className="mt-1 text-lg font-semibold">
                {currentIndex + 1}/{scopeQuestions.length}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-center">
              <div className="text-[11px] text-white/35">Accuracy</div>
              <div className="mt-1 text-lg font-semibold">{accuracy}%</div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-center">
              <div className="text-[11px] text-white/35">Wrong</div>
              <div className="mt-1 text-lg font-semibold">{wrongCount}</div>
            </div>
          </div>
        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <section className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl md:p-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/45">
              Question #{currentQuestion.id}
            </div>

            <div className="text-xs text-white/35">
              {currentQuestion.knowledgePoint}
            </div>
          </div>

          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            {currentQuestion.question}
          </h2>

          {currentQuestion.type === "blank" ? (
            <div className="mt-7">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <input
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      submitBlank()
                    }
                  }}
                  placeholder="Type your answer"
                  className="w-full bg-transparent text-lg outline-none placeholder:text-white/25"
                />
              </div>

              <div className="mt-4 flex flex-col gap-3 md:flex-row">
                <button
                  onClick={submitBlank}
                  disabled={!textAnswer.trim() || answerState !== "idle"}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Submit
                </button>

                <button
                  onClick={prevQuestion}
                  disabled={currentIndex === 0}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Prev
                </button>

                <button
                  onClick={nextQuestion}
                  disabled={answerState === "idle"}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-7 grid gap-4">
              {(currentQuestion.options ?? []).map((option, idx) => {
                const state:
                  | "default"
                  | "selected"
                  | "correct"
                  | "wrong" =
                  answerState === "idle"
                    ? selectedIndex === idx
                      ? "selected"
                      : "default"
                    : idx === currentQuestion.answerIndex
                      ? "correct"
                      : selectedIndex === idx
                        ? "wrong"
                        : "default"

                return (
                  <button
                    key={idx}
                    onClick={() => chooseOption(idx)}
                    className={`group rounded-[26px] border p-5 text-left transition-all duration-200 ${
                      state === "correct"
                        ? "border-emerald-400/40 bg-emerald-500/15"
                        : state === "wrong"
                          ? "border-red-400/40 bg-red-500/15"
                          : state === "selected"
                            ? "border-white/30 bg-white/10"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                          state === "correct"
                            ? "bg-emerald-400 text-black"
                            : state === "wrong"
                              ? "bg-red-400 text-black"
                              : "bg-white/10 text-white/80"
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="flex-1">
                        <div className="text-lg leading-relaxed text-white/90">
                          {option}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {answerState !== "idle" && (
            <div
              className={`mt-6 rounded-3xl border p-5 ${
                answerState === "correct"
                  ? "border-emerald-400/30 bg-emerald-500/10"
                  : "border-red-400/30 bg-red-500/10"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-white/45">
                    {answerState === "correct" ? "Correct Answer" : "Your Answer Is Wrong"}
                  </div>

                  <div className="mt-2 text-xl font-semibold">{correctAnswerText}</div>

                  {currentQuestion.explanation && (
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
                      {currentQuestion.explanation}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={prevQuestion}
                    disabled={currentIndex === 0}
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Prev
                  </button>

                  <button
                    onClick={nextQuestion}
                    disabled={currentIndex >= scopeQuestions.length - 1}
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => {
              setReviewWrongOnly((v) => !v)
              resetQuestionState()
            }}
            className={`rounded-2xl px-5 py-3 text-sm transition ${
              reviewWrongOnly
                ? "bg-red-500 text-white"
                : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
            }`}
          >
            {reviewWrongOnly ? "Exit Wrong Mode" : "Review Wrong Only"}
          </button>

          <button
            onClick={clearWrong}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:bg-white/10"
          >
            Clear Wrong Questions
          </button>
        </div>
      </div>
    </main>
  )
}