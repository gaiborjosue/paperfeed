import {
  SectionWrapper,
  SectionBadge,
  SectionHeading,
  SectionTitle,
  SectionTitleFade,
  SectionDescription,
} from "./Section"

import { SpotlightCard, BaseSpotlightCard } from "./SpotlightCard"

function FeatureList({ features }) {
  return features.map((feature, index) => (
    <div key={index} className="py-2">
      {feature}
    </div>
  ))
}

function StarterPlan() {
  const features = ["Real-time chat", "Dynamic suggestions", "Detailed analysis", "Chat history"]

  return (
    <div className="lg:flex lg:items-end lg:pb-5">
      <BaseSpotlightCard
        from="rgba(255,255,255,0.2)"
        className="relative w-full rounded-[--radius] p-8 [--radius:theme(borderRadius.2xl)] lg:rounded-l-[--radius] lg:rounded-r-none lg:[--radius:theme(borderRadius.3xl)]">
        <div className="lg:rounded-tb-none absolute inset-x-0 bottom-[--radius] top-0 rounded-[--radius] bg-gradient-to-b from-white/15 to-transparent lg:rounded-r-none lg:rounded-tl-[--radius]"></div>

        <div className="absolute inset-px rounded-[calc(var(--radius)-1px)] bg-gradient-to-b from-zinc-950/75 to-zinc-950 lg:right-0 lg:rounded-r-none"></div>

        <div className="relative">
          <div className="font-mono text-white">Starter</div>

          <div className="mt-4 flex items-end">
            <div className="font-lead text-4xl font-bold text-white">$29</div>

            <span className="ml-1 text-sm text-white/50">/ month</span>
          </div>

          <div className="mt-8 divide-y divide-white/10 text-sm font-medium text-white/75">
            <FeatureList features={features} />
          </div>

          <div className="mt-12">
            <a
              href="#"
              className="inline-block w-full rounded-lg bg-white/5 px-4 py-2 text-center font-medium text-white transition duration-300 hover:bg-white/10">
              Get started
            </a>
          </div>
        </div>
      </BaseSpotlightCard>
    </div>
  )
}

function BasicPlan() {
  const features = [
    "Real-time chat",
    "Dynamic suggestions",
    "Detailed analysis",
    "Chat history",
    "Intelligent summarization",
    "Key metric identification",
  ]

  return (
    <SpotlightCard className="p-8">
      <div className="font-mono text-white">Basic</div>

      <div className="mt-4 flex items-end">
        <div className="font-lead text-4xl font-bold text-white">$49</div>

        <span className="ml-1 text-sm text-white/50">/ month</span>
      </div>

      <div className="mt-8 divide-y divide-white/10 text-sm font-medium text-white/75">
        <FeatureList features={features} />
      </div>

      <div className="mt-12">
        <a
          href="#"
          className="inline-block w-full rounded-lg bg-white px-4 py-2 text-center font-medium text-zinc-950 transition duration-300 hover:bg-white/80">
          Get started for free
        </a>
      </div>
    </SpotlightCard>
  )
}

function EnterprisePlan() {
  const features = [
    "Dynamic suggestions",
    "Detailed analysis",
    "Intelligent summarization",
    "Key metric identification",
  ]

  return (
    <div className="flex items-end pb-5">
      <BaseSpotlightCard
        from="rgba(255,255,255,0.2)"
        className="relative w-full rounded-[--radius] p-8 [--radius:theme(borderRadius.2xl)] lg:rounded-l-none lg:rounded-r-[--radius] lg:[--radius:theme(borderRadius.3xl)]">
        <div className="absolute inset-x-0 bottom-[--radius] top-0 rounded-[--radius] bg-gradient-to-b from-white/15 to-transparent lg:rounded-l-none lg:rounded-tr-[--radius]"></div>

        <div className="absolute inset-px rounded-[calc(var(--radius)-1px)] bg-gradient-to-b from-zinc-950/75 to-zinc-950 lg:left-0 lg:rounded-l-none lg:rounded-r-[calc(var(--radius)-1px)]"></div>

        <div className="relative">
          <div className="font-mono text-white">Enterprise</div>

          <div className="mt-4 flex items-end">
            <div className="font-lead text-4xl font-bold text-white">$490</div>

            <span className="ml-1 text-sm text-white/50">/ month</span>
          </div>

          <div className="mt-8 divide-y divide-white/10 text-sm font-medium text-white/75">
            <FeatureList features={features} />
          </div>

          <div className="mt-12">
            <a
              href="#"
              className="inline-block w-full rounded-lg bg-white/5 px-4 py-2 text-center font-medium text-white transition duration-300 hover:bg-white/10">
              Get started
            </a>
          </div>
        </div>
      </BaseSpotlightCard>
    </div>
  )
}

export function Pricing() {
  return (
    <div id="pricing" className="scroll-mt-8 py-8 lg:py-16">
      <SectionWrapper>
        <SectionHeading>
          <SectionBadge>Pricing</SectionBadge>

          <SectionTitle>
            Choose the plan
            <br />
            <span>that </span>
            <SectionTitleFade>fits you best</SectionTitleFade>
          </SectionTitle>

          <SectionDescription>
            Get started for free and upgrade once you feel like it. There&apos;s a plan for everyone, from individual
            users to large teams.
          </SectionDescription>
        </SectionHeading>

        <div className="mt-8 lg:mt-16">
          <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-3 lg:gap-0">
            <StarterPlan />
            <BasicPlan />
            <EnterprisePlan />
          </div>
        </div>
      </SectionWrapper>
    </div>
  )
}
