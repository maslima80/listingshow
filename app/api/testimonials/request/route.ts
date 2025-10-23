import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { testimonialRequests, teamMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

// POST /api/testimonials/request - Create a testimonial request and generate link
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's team
    const membership = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, session.user.id),
    })

    if (!membership) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }

    const body = await request.json()
    const { clientEmail } = body

    // Validate email
    if (!clientEmail || !clientEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex')

    // Create request
    const [newRequest] = await db
      .insert(testimonialRequests)
      .values({
        teamId: membership.teamId,
        clientEmail,
        token,
        submitted: false,
      })
      .returning()

    // Generate public submission URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const submissionUrl = `${baseUrl}/testimonial/${token}`

    // Generate mailto link for easy sharing
    const mailtoLink = `mailto:${clientEmail}?subject=Share Your Experience&body=Hi! I'd love to hear about your experience working with us. Please share your testimonial here: ${submissionUrl}`

    return NextResponse.json({
      ...newRequest,
      submissionUrl,
      mailtoLink,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating testimonial request:', error)
    return NextResponse.json(
      { error: 'Failed to create testimonial request' },
      { status: 500 }
    )
  }
}

// GET /api/testimonials/request - List all testimonial requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's team
    const membership = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, session.user.id),
    })

    if (!membership) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }

    // Get all requests for team
    const requests = await db
      .select()
      .from(testimonialRequests)
      .where(eq(testimonialRequests.teamId, membership.teamId))
      .orderBy(testimonialRequests.sentAt)

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching testimonial requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonial requests' },
      { status: 500 }
    )
  }
}
