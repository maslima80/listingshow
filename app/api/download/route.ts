import { NextRequest, NextResponse } from 'next/server'

// Proxy download endpoint to force file downloads from external URLs
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')
    const filename = request.nextUrl.searchParams.get('filename')

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    // Fetch the file from the external URL
    const response = await fetch(url)
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: response.status })
    }

    // Get the file content
    const blob = await response.blob()
    const buffer = Buffer.from(await blob.arrayBuffer())

    // Determine content type
    const contentType = response.headers.get('content-type') || 'application/octet-stream'

    // Create response with proper headers to force download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename || 'download'}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Download proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
