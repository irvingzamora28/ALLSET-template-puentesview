// Types for the landing content data structure

export interface CtaButton {
  text: string
  link: string
}

export interface MainFeature {
  id: number
  icon: string
  title: string
  description: string
  image: string
}

export interface Feature {
  title: string
  description: string
  icon: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface PricingPlan {
  name: string
  price: string
  description: string
  features: string[]
  cta: CtaButton
  highlighted?: boolean
}

export interface HeroSection {
  title: string
  description: string
  primaryCta: CtaButton
  secondaryCta: CtaButton
}

export interface CtaSection {
  title: string
  description: string
  button: CtaButton
  collectEmail?: boolean
}

export interface FaqsSection {
  title: string
  description: string
  questions: FaqItem[]
}

export interface PricingSection {
  title: string
  description: string
  plans: PricingPlan[]
}

export interface Testimonial {
  name: string
  quote: string
  image: string
  title?: string
}

export interface GalleryImage {
  src: string
  alt: string
  caption: string
}

export interface GallerySection {
  title: string
  description: string
  images: GalleryImage[]
}

export interface LandingContent {
  hero: HeroSection
  mainFeatures: MainFeature[]
  featureTitle: string
  featureDescription: string
  features: Feature[]
  cta: CtaSection
  gallery?: GallerySection
  faqs: FaqsSection
  pricing?: PricingSection
  testimonials?: Testimonial[]
}
