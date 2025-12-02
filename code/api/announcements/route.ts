import { NextRequest, NextResponse } from 'next/server';
import { createAnnouncement, getAllAnnouncements, deleteAnnouncement } from '@/lib/database';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { adminId, category, priority, title, content, eventDate } = body;

    if (!adminId || !category || !priority || !title || !content) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    const announcement = await createAnnouncement({
      adminId,
      category,
      priority,
      title,
      content,
      eventDate,
    });

    return NextResponse.json({
      success: true,
      message: 'Announcement created successfully',
      announcement,
    });
  } catch (error: unknown) {
    console.error('Create announcement error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const announcements = await getAllAnnouncements();

    return NextResponse.json({
      success: true,
      announcements,
    });
  } catch (error: unknown) {
    console.error('Get announcements error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    await deleteAnnouncement(id);

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Delete announcement error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete announcement';
    const status = message === 'Announcement not found' ? 404 : 500;
    return NextResponse.json(
      { success: false, message },
      { status }
    );
  }
}
