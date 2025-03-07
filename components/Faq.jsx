"use client"

import clsx from "clsx"
import { XMarkIcon } from "@heroicons/react/24/outline"

import {
  SectionWrapperRounded,
  SectionBadge,
  SectionHeading,
  SectionTitle,
  SectionTitleFade,
  SectionDescription,
} from "./Section"

import { Details } from "./Details"

export function Faq() {
  const questions = [
    {
      title: "What is PaperFeed?",
      content:
        "PaperFeed is a centralized platform for discovering and simplifying scientific papers from arXiv. It allows users to search for recently published papers across various academic fields and categories, then offers AI-powered simplification to make complex research more accessible.",
    },
    {
      title: "How does the simplification feature work?",
      content:
        "Select any paper and click 'Simplify' to get an AI-generated version written in clear, accessible language while preserving the key scientific insights.",
    },
    {
      title: "Is there a limit to how many papers I can simplify?",
      content:
        "Free accounts receive 5 simplification credits. Use them wisely to transform complex research into easily understandable content.",
    },
    {
      title: "Can I search for specific research topics?",
      content:
        "Yes! Filter papers by scientific category and use keywords to find exactly the research you're interested in from arXiv's vast collection.",
    },
  ]

  return (
    <SectionWrapperRounded id="faq" className="scroll-mt-8">
      <SectionHeading>
        <SectionBadge>Questions?</SectionBadge>

        <SectionTitle>
          <span>Not so frequently </span>
          <SectionTitleFade>
            asked
            <br />
            questions
          </SectionTitleFade>
        </SectionTitle>

        <SectionDescription>
          Usually, these are made up as we have no users yet to ask any.
          <br className="hidden lg:block" />
          Anyway, you might learn something important here.
        </SectionDescription>
      </SectionHeading>

      <div className="mt-8 lg:mt-16">
        <Details className="mx-auto max-w-3xl">
          {questions.map((question, index) => (
            <Details.Item key={index} className="group border-b border-white/10">
              {(isActive, toggle) => (
                <>
                  <div onClick={toggle} className="flex cursor-pointer items-center py-6">
                    <div className="text-white/75 transition hover:text-white">{question.title}</div>

                    <div className="relative ml-auto">
                      <XMarkIcon
                        className={clsx(
                          "h-6 w-6 text-white/50 transition-transform duration-500",
                          isActive ? "rotate-180" : "rotate-45",
                        )}
                      />
                    </div>
                  </div>

                  <Details.Content className="overflow-hidden transition-all duration-500 will-change-[height]">
                    <div className="pb-6 font-light text-white/75">{question.content}</div>
                  </Details.Content>
                </>
              )}
            </Details.Item>
          ))}
        </Details>
      </div>
    </SectionWrapperRounded>
  )
}
