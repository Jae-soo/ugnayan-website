import mongoose, { Schema, type Document } from 'mongoose';

export interface IAnnouncement extends Document {
  _id: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  category: 'general' | 'event' | 'alert' | 'emergency';
  priority: 'low' | 'medium' | 'high';
  title: string;
  content: string;
  postedAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema: Schema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['general', 'event', 'alert', 'emergency'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
