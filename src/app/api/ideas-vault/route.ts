import { NextRequest, NextResponse } from 'next/server'
import { ideasVaultAPI } from '@/lib/supabase'

export async function GET() {
  try {
    const ideas = await ideasVaultAPI.getAll()
    return NextResponse.json({ success: true, data: ideas })
  } catch (error) {
    console.error('Error fetching ideas:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch ideas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const idea = await ideasVaultAPI.create(body)
    return NextResponse.json({ success: true, data: idea })
  } catch (error) {
    console.error('Error creating idea:', error)
    return NextResponse.json({ success: false, error: 'Failed to create idea' }, { status: 500 })
  }
}