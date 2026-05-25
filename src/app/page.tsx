import { chapters, questions } from "@/data/questions"

export default function HomePage() {
  const progress = 78
  const accuracy = 91
  const wrongQuestions = 12

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b14] px-6 py-10 text-white">
      {/* background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center">
        {/* top badge */}
        <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 backdrop-blur-md">
          Python Quiz Pro
        </div>

        {/* hero */}
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* left */}
          <div>
            <h1 className="max-w-4xl text-6xl font-bold leading-[0.95] tracking-tight md:text-7xl">
              Python
              <span className="block text-white/35">Quiz Pro</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/50 md:text-xl">
              Practice Python questions by chapter, track your progress,
              review wrong answers, and prepare smarter.
            </p>

            {/* buttons */}
            <div className="mt-12 flex flex-wrap gap-4">
              <a
                href="/quiz"
                className="rounded-2xl bg-white px-8 py-4 text-base font-semibold text-black transition hover:scale-[1.02]"
              >
                Start Quiz
              </a>

              <a
                href="/bank"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-white/80 backdrop-blur-md transition hover:bg-white/10"
              >
                Chapters
              </a>

              <a
                href="/wrong"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-white/80 backdrop-blur-md transition hover:bg-white/10"
              >
                Wrong Review
              </a>
            </div>
          </div>

          {/* right stats card */}
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white/40">
                  Learning Progress
                </div>

                <div className="mt-3 text-5xl font-bold">
                  {progress}%
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-emerald-300">
                +12% this week
              </div>
            </div>

            {/* progress bar */}
            <div className="mt-8 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* mini stats */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm text-white/40">
                  Accuracy
                </div>

                <div className="mt-2 text-3xl font-semibold">
                  {accuracy}%
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm text-white/40">
                  Wrong Questions
                </div>

                <div className="mt-2 text-3xl font-semibold">
                  {wrongQuestions}
                </div>
              </div>
            </div>

            {/* bottom info */}
            <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6 text-sm text-white/40">
              <div>{chapters.length} Chapters</div>
              <div>{questions.length} Questions</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}