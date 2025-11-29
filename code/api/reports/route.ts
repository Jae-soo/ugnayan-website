import { NextRequest, NextResponse } from 'next/server';
import {
  createReport,
  getReports,
  updateReport,
  deleteReport
} from '@/lib/database';

// GET - Fetch all reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const email = searchParams.get('email');
    
    const filters: Record<string, string> = {};
    if (status) filters.status = status;
    if (email) filters.email = email;

    const reports = await getReports(filters);
    
    return NextResponse.json({ reports }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST - Create a new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      category, 
      description, 
      location, 
      reporterName, 
      reporterEmail, 
      reporterPhone,
      priority 
    } = body;

    // Validate required fields
    if (!title || !category || !description || !reporterName || !reporterEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const report = await createReport({
      title,
      category,
      description,
      location,
      reporterName,
      reporterEmail,
      reporterPhone,
      priority,
    });

    return NextResponse.json(
      { 
        message: 'Report created successfully',
        report 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

// PATCH - Update a report
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, response } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const updatedReport = await updateReport(id, {
      status,
      response,
    });

    return NextResponse.json(
      { 
        message: 'Report updated successfully',
        report: updatedReport 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating report:', error);
    const message = error instanceof Error ? error.message : 'Failed to update report';
    const status = message === 'Report not found' ? 404 : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}

// DELETE - Delete a report
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    await deleteReport(id);

    return NextResponse.json(
      { message: 'Report deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting report:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete report';
    const status = message === 'Report not found' ? 404 : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
