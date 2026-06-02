export type SubscriptionTier = 'free' | 'pro' | 'business';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  credits: number;
  subscriptionTier: SubscriptionTier;
  imagesProcessed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessedImage {
  id: string;
  userId: string;
  originalName: string;
  processedName: string;
  mimeType: string;
  originalSize: number;
  processedSize: number;
  exifStripped: boolean;
  pixelJitter: boolean;
  grainApplied: boolean;
  compressionRate: number;
  downloadUrl: string;
  createdAt: Date;
}

export interface UsageLog {
  id: string;
  userId: string;
  action: string;
  creditsDeducted: number;
  createdAt: Date;
}

export interface ProcessingOptions {
  exifStripped: boolean;
  pixelJitter: boolean;
  grainApplied: boolean;
  grainIntensity: number; // 0 to 100
  compressionRate: number; // 1 to 100 (quality level)
  outputFormat: 'image/jpeg' | 'image/png';
}

export interface PlanDetails {
  id: SubscriptionTier;
  name: string;
  price: string;
  priceId?: string;
  credits: string;
  description: string;
  features: string[];
}
