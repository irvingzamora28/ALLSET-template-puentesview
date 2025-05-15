import { NextResponse } from 'next/server'
import db from '@/lib/db'

// For static export, we need to handle this differently
export const dynamic = 'error'

export async function GET() {
  try {
    const stmt = db.prepare('SELECT id, email, created_at FROM emails ORDER BY created_at DESC')
    const emails = stmt.all()
    return NextResponse.json({ emails })
  } catch (error) {
    return NextResponse.json({ emails: [], error: 'Failed to fetch emails' }, { status: 500 })
  }
}
