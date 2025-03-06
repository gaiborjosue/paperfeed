import clsx from "clsx"

export function SectionWrapper({ children, className }) {
  return <div className={clsx("relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>
}

export function SectionWrapperRounded({ children, className, ...props }) {
  return (
    <div className={clsx("py-8 lg:py-16", className)} {...props}>
      <div className="relative bg-white/2.5 py-16 md:rounded-3xl lg:rounded-[3rem] xl:px-24 xl:py-32">
        <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-950 p-1.5">
          <div className="h-1.5 w-8 rounded-lg bg-white"></div>
        </div>

        <div className="absolute inset-x-12 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full bg-zinc-950 p-1.5">
          <div className="h-1.5 w-8 rounded-lg bg-white"></div>
        </div>

        <SectionWrapper>{children}</SectionWrapper>
      </div>
    </div>
  )
}

export function SectionBadge({ children, className }) {
  return <span className={clsx("font-mono text-sm tracking-tight text-accent-300", className)}>{children}</span>
}

export function SectionDescription({ children, className }) {
  return (
    <p
      className={clsx(
        "mx-auto mt-4 text-left leading-relaxed text-white/50 md:max-w-2xl md:text-center lg:mt-8",
        className,
      )}>
      {children}
    </p>
  )
}

export function SectionHeading({ children, className }) {
  return <div className={clsx("flex flex-col md:items-center", className)}>{children}</div>
}

export function SectionHeadingHighlighted({ children, className }) {
  return (
    <div>
      <div
        className={clsx(
          "flex flex-col bg-[radial-gradient(35%_128px_at_50%_100%,theme(backgroundColor.white/5%),transparent)] pb-8 md:items-center lg:pb-16",
          className,
        )}>
        {children}
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </div>
  )
}

export function SectionTitle({ children, className }) {
  return (
    <h2
      className={clsx(
        "mt-4 text-left font-display text-2xl font-light leading-[1.125] text-white md:text-center md:text-4xl lg:text-5xl",
        className,
      )}>
      {children}
    </h2>
  )
}

export function SectionTitleSmall({ children, className }) {
  return (
    <h2
      className={clsx(
        "mt-4 max-w-xl text-left font-lead text-xl font-light leading-tight tracking-wide text-white md:text-center lg:text-3xl",
        className,
      )}>
      {children}
    </h2>
  )
}

export function SectionTitleFade({ children, className }) {
  return <span className={clsx("text-white/50", className)}>{children}</span>
}
