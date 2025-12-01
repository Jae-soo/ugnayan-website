import { NextRequest, NextResponse } from 'next/server'
import {
  createDocumentRequest,
  getDocumentRequests,
  updateDocumentRequest,
  deleteDocumentRequest
} from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const email = searchParams.get('email')
    const documentType = searchParams.get('documentType')
    const filters: Record<string, string> = {}
    if (status) filters.status = status
    if (email) filters.email = email
    if (documentType) filters.documentType = documentType
    const requests = await getDocumentRequests(filters)
    return NextResponse.json({ requests }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch document requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { residentName, residentEmail, residentPhone, residentAddress, documentType, purpose } = body
    if (!residentName || !residentEmail || !residentPhone || !documentType || !purpose) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const documentRequest = await createDocumentRequest({ residentName, residentEmail, residentPhone, residentAddress, documentType, purpose })
    return NextResponse.json({ message: 'Document request submitted successfully', request: documentRequest }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create document request'
    const status = message === 'Invalid document type' ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, adminNotes, attachmentUrl, claimedAt } = body
    if (!id) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }
    const updatedRequest = await updateDocumentRequest(id, { status, adminNotes, attachmentUrl, claimedAt })
    return NextResponse.json({ message: 'Document request updated successfully', request: updatedRequest }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update document request'
    let status = 500
    if (message === 'Document request not found') status = 404
    if (message === 'Invalid status') status = 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }
    await deleteDocumentRequest(id)
    return NextResponse.json({ message: 'Document request deleted successfully' }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete document request'
    const status = message === 'Document request not found' ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
