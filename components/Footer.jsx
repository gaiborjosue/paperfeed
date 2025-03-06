import { SectionWrapper } from "./Section"
import { Logo } from "./Logo"
import { YouTubeIcon, XIcon, TikTokIcon } from "./Icons"

const sections = [
  {
    title: "",
    items: [
      
    ],
  },
  {
    title: "",
    items: [
      
    ],
  },
  {
    title: "",
    items: [
      {
        title: "Paper Feed",
        url: "/papers",
      },
    ],
  },
]

const icons = [
  // {
  //   component: YouTubeIcon,
  //   name: "YouTube",
  //   url: "#",
  // },
  // {
  //   component: XIcon,
  //   name: "X / Twitter",
  //   url: "#",
  // },
  // {
  //   component: TikTokIcon,
  //   name: "TikTok",
  //   url: "#",
  // },
]

export function Footer() {
  return (
    <div className="pt-8 lg:pt-16">
      <div className="relative bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/5%),transparent)] py-16 lg:px-24 lg:py-16">
        <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

        <div className="flex justify-center items-center py-8">
          <p className="text-white">
            Made by <a href="https://edwardgaibor.me" className="text-gray-500 hover:underline">Edward Gaibor</a>
          </p>
        </div>
      </div>
    </div>
  )
}
