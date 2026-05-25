type Props = {
  text: string
  onClick: () => void
  disabled: boolean
  correct?: boolean
  wrong?: boolean
}

export default function AnswerButton({
  text,
  onClick,
  disabled,
  correct,
  wrong,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full
        rounded-2xl
        border
        px-6
        py-5
        text-left
        text-xl
        font-medium
        transition
        duration-200

        ${
          !correct &&
          !wrong &&
          `
          border-white/10
          bg-white/[0.03]
          hover:bg-white/[0.06]
          hover:border-white/20
          `
        }

        ${correct && `
          border-emerald-400/40
          bg-emerald-400/10
        `}

        ${wrong && `
          border-red-400/40
          bg-red-400/10
        `}
      `}
    >
      <span className="text-white/90">
        {text}
      </span>
    </button>
  )
}