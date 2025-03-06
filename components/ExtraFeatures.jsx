"use client"

import clsx from "clsx"
import {
  ArrowTrendingUpIcon,
  ArrowUpOnSquareIcon,
  ArrowsPointingInIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  CommandLineIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  QueueListIcon,
  FunnelIcon
} from "@heroicons/react/24/outline"

import { SectionWrapper, SectionBadge, SectionHeadingHighlighted, SectionTitleSmall } from "./Section"
import { ScrollReveal } from "./ScrollReveal"

export function ExtraFeatures() {
  const features = [
    {
      title: "Field of interest filtering",
      description: "Filter through the noise and find what matters most for you.",
      icon: FunnelIcon,
    },
    {
      title: "Intelligent simplification",
      description: "Rapidly encapsulate main ideas and key points of paper's abstracts, and make them more digestible",
      icon: ArrowsPointingInIcon,
    },
    {
      title: "Keyword search",
      description: "Interact directly filter your feed based on keywords",
      icon: QueueListIcon,
    },
    {
      title: "Focus a find",
      description: "Get a distraction-free view of the paper that caught your eye, and read full abstract and details",
      icon: MagnifyingGlassIcon,
    }
  ]

  return (
    <div id="features" className="scroll-mt-8 py-8 lg:py-16">
      <ScrollReveal once={true} trigger="middle" className="[--duration:500ms]">
        {(isActive) => (
          <SectionWrapper>
            <SectionHeadingHighlighted>
              <SectionBadge>Features</SectionBadge>

              <SectionTitleSmall>
                
              </SectionTitleSmall>
            </SectionHeadingHighlighted>

            <div className="mt-8 lg:mt-16">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-y-16">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    style={{ "--delay": `${index * 150}ms` }}
                    className={clsx(
                      "transition-all delay-[--delay] duration-[--duration]",
                      !isActive ? "translate-y-8 opacity-0" : "",
                    )}>
                    <div className="flex items-center">
                      <div className="rounded border border-white/5 bg-white/5 p-1">
                        <feature.icon className="h-5 w-5 fill-white/10 text-white" />
                      </div>

                      <div className="ml-4 text-lg">{feature.title}</div>
                    </div>

                    <div className="ml-11 mt-2 pl-0.5 text-sm font-light leading-relaxed text-white/75">
                      {feature.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionWrapper>
        )}
      </ScrollReveal>
    </div>
  )
}
