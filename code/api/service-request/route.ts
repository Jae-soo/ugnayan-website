import { NextRequest, NextResponse } from 'next/server';
import {
  createServiceRequest,
  getServiceRequests,
  updateServiceRequest,
  deleteServiceRequest
} from '@/lib/database';

// GET - Fetch all service requests or filter by query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const email = searchParams.get('email');
    
    const filters: Record<string, string> = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (email) filters.email = email;

    const requests = await getServiceRequests(filters);
    
    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service requests' },
      { status: 500 }
    );
  }
}

// POST - Create a new service request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      description, 
      residentName, 
      residentEmail, 
      residentPhone, 
      residentAddress,
      documentType,
      purpose,
      complaintType,
      additionalInfo
    } = body;

    // Validate required fields
    if (!type || !description || !residentName || !residentEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const serviceRequest = await createServiceRequest({
      type,
      description,
      residentName,
      residentEmail,
      residentPhone,
      residentAddress,
      documentType,
      purpose,
      complaintType,
      additionalInfo,
    });

    return NextResponse.json(
      { 
        message: 'Service request created successfully',
        request: serviceRequest 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating service request:', error);
    return NextResponse.json(
      { error: 'Failed to create service request' },
      { status: 500 }
    );
  }
}

// PATCH - Update a service request
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const updatedRequest = await updateServiceRequest(id, {
      status,
      adminNotes,
    });

    return NextResponse.json(
      { 
        message: 'Service request updated successfully',
        request: updatedRequest 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating service request:', error);
    const message = error instanceof Error ? error.message : 'Failed to update service request';
    const status = message === 'Service request not found' ? 404 : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}

// DELETE - Delete a service request
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    await deleteServiceRequest(id);

    return NextResponse.json(
      { message: 'Service request deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting service request:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete service request';
    const status = message === 'Service request not found' ? 404 : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
