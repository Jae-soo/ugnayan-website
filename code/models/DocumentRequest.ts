import mongoose, { Schema, type Document } from 'mongoose';

export interface IDocumentRequest extends Document {
  _id: mongoose.Types.ObjectId;
  residentName: string;
  residentEmail: string;
  residentPhone: string;
  residentAddress?: string;
  documentType: 'barangay_clearance' | 'certificate_of_residency' | 'certificate_of_indigency' | 'business_permit' | 'others';
  purpose: string;
  status: 'pending' | 'processing' | 'ready' | 'released' | 'rejected';
  adminNotes?: string;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentRequestSchema: Schema = new Schema(
  {
    residentName: {
      type: String,
      required: true,
      trim: true,
    },
    residentEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    residentPhone: {
      type: String,
      required: true,
      trim: true,
    },
    residentAddress: {
      type: String,
      required: false,
      trim: true,
    },
    documentType: {
      type: String,
      enum: ['barangay_clearance', 'certificate_of_residency', 'certificate_of_indigency', 'business_permit', 'others'],
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'released', 'rejected'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      required: false,
    },
    claimedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for faster email queries
DocumentRequestSchema.index({ residentEmail: 1 });
DocumentRequestSchema.index({ status: 1 });
DocumentRequestSchema.index({ createdAt: -1 });

export default mongoose.models.DocumentRequest || mongoose.model<IDocumentRequest>('DocumentRequest', DocumentRequestSchema);
