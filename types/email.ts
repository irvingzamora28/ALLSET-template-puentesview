export interface EmailTemplateData {
  [key: string]: string | number | boolean | undefined | null
  name?: string
  welcomeMessage?: string
  ctaUrl?: string
  ctaText?: string
  featuredImage?: string
  content?: string
  showUnsubscribe?: boolean
  ebookTitle?: string
  ebookDescription?: string
  ebookCover?: string
  downloadUrl?: string
  expiryNotice?: string
  additionalContent?: string
  siteName?: string
  currentYear?: number
  unsubscribeUrl?: string
  subject?: string
  title?: string
}

export interface EmailRecord {
  id: string
  email: string
  createdAt: string
  updatedAt?: string
  isSubscribed?: boolean
}

export interface EmailAttachment {
  filename: string
  path: string
  contentType?: string
}

export interface EmailOptions {
  to: string
  subject: string
  template: string
  data: EmailTemplateData
  attachments?: EmailAttachment[]
}
