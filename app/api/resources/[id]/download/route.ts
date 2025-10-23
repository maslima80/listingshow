import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { resources, resourceDownloads } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

// POST /api/resources/[id]/download - Public endpoint for downloading resources
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { leadName, leadEmail, leadPhone } = body

    // Validate required fields
    if (!leadName || !leadEmail) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!leadEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Get resource
    const resource = await db.query.resources.findFirst({
      where: eq(resources.id, params.id),
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Check if resource is active
    if (!resource.isActive) {
      return NextResponse.json(
        { error: 'This resource is no longer available' },
        { status: 403 }
      )
    }

    // Get IP address (hash it for privacy)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16)

    // Record download
    await db.insert(resourceDownloads).values({
      resourceId: params.id,
      leadName,
      leadEmail,
      leadPhone: leadPhone || null,
      ipAddress: ipHash,
    })

    // Increment download count
    await db
      .update(resources)
      .set({
        downloadCount: resource.downloadCount + 1,
      })
      .where(eq(resources.id, params.id))

    // Return download URL
    return NextResponse.json({
      success: true,
      downloadUrl: resource.fileUrl,
      fileName: resource.title,
    })
  } catch (error) {
    console.error('Error processing download:', error)
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    )
  }
}
