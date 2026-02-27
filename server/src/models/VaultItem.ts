import mongoose, { Document, Schema } from 'mongoose';

export interface IVaultItem extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    username: string;
    encryptedPassword: string;   // JSON string: { iv: base64, ciphertext: base64 }
    url?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const vaultItemSchema = new Schema<IVaultItem>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        username: {
            type: String,
            trim: true,
            maxlength: [200, 'Username cannot exceed 200 characters'],
            default: '',
        },
        encryptedPassword: {
            type: String,
            required: [true, 'Encrypted password is required'],
        },
        url: {
            type: String,
            trim: true,
            maxlength: [500, 'URL cannot exceed 500 characters'],
            default: '',
        },
        notes: {
            type: String,
            maxlength: [2000, 'Notes cannot exceed 2000 characters'],
            default: '',
        },
    },
    { timestamps: true }
);

export default mongoose.model<IVaultItem>('VaultItem', vaultItemSchema);
