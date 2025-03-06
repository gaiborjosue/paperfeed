import clsx from "clsx"

export function Logo({ className }) {
  return (
    <div className={clsx("whitespace-nowrap font-display", className)}>
      <span>re</span>
      <span className="text-accent-400">char</span>
      <span>ger</span>
    </div>
  )
}
