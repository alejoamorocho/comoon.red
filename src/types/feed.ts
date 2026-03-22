// Feed Types for Comoon Unified Feed

// Base interface for all feed items
interface BaseFeedItem {
  id: number;
  type: 'product' | 'cause' | 'cause_update' | 'post';
  created_at: string;
}

// Product feed item
export interface ProductFeedItem extends BaseFeedItem {
  type: 'product';
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  contribution_text: string | null;
  contribution_amount: number | null;
  contribution_type: 'percentage' | 'fixed';
  entrepreneur: {
    id: number;
    store_name: string;
    photo_url: string | null;
    city: string | null;
    department: string | null;
  } | null;
  seller: {
    name: string;
    photo_url: string | null;
    city: string | null;
    department: string | null;
    type: 'leader' | 'entrepreneur';
  };
  cause: {
    id: number;
    title: string;
  };
  leader: {
    id: number;
    name: string;
  };
}

// Post feed item (free-form publication)
export interface PostFeedItem extends BaseFeedItem {
  type: 'post';
  content: string;
  photo_url: string | null;
  author: {
    user_id: number;
    name: string;
    photo_url: string | null;
    role: string;
    city: string | null;
    department: string | null;
  };
}

// Cause feed item
export interface CauseFeedItem extends BaseFeedItem {
  type: 'cause';
  title: string;
  description: string | null;
  photo_url: string | null;
  target_goal: number | null;
  current_amount: number;
  status: 'pending' | 'active' | 'completed' | 'archived' | 'rejected';
  leader: {
    id: number;
    name: string;
    photo_url: string | null;
    city: string | null;
    department: string | null;
    tags: string[] | null;
  };
}

// Cause Update feed item (progress updates for causes)
export interface CauseUpdateFeedItem extends BaseFeedItem {
  type: 'cause_update';
  title: string;
  content: string;
  photo_url: string | null;
  photos: string[] | null;
  update_type: 'progress' | 'milestone' | 'gratitude' | 'closing';
  is_closing: boolean;
  leader: {
    id: number;
    name: string;
    photo_url: string | null;
    city: string | null;
    department: string | null;
  };
  cause: {
    id: number;
    title: string;
    status: string;
  };
}

// Union type for feed items
export type FeedItem = ProductFeedItem | CauseFeedItem | CauseUpdateFeedItem | PostFeedItem;

// Filter types
export interface FeedFilters {
  types?: ('product' | 'cause' | 'cause_update' | 'post')[];
  department?: string;
  city?: string;
  categories?: string[];
}

// Cursor-based pagination
export interface FeedCursor {
  timestamp: string;
  id: number;
}

// API Response
export interface FeedResponse {
  items: FeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Query parameters for API
export interface FeedQueryParams {
  cursor?: string;
  limit?: number;
  types?: string;
  department?: string;
  city?: string;
  categories?: string;
}

// Cause Update creation payload
export interface CreateCauseUpdatePayload {
  leader_id: number;
  cause_id: number;
  title: string;
  content: string;
  photo_url?: string;
  photos?: string[];
  update_type: 'progress' | 'milestone' | 'gratitude' | 'closing';
  is_closing?: boolean;
}

// Cause Update response from API
export interface CauseUpdateResponse {
  id: number;
  leader_id: number;
  cause_id: number;
  title: string;
  content: string;
  photo_url: string | null;
  photos: string[] | null;
  update_type: 'progress' | 'milestone' | 'gratitude' | 'closing';
  is_closing: boolean;
  created_at: string;
  leader?: {
    id: number;
    name: string;
    photo_url: string | null;
  };
  cause?: {
    id: number;
    title: string;
    status: string;
  };
}

// Helper type for cause update types with labels
export const CAUSE_UPDATE_TYPES = {
  progress: { label: 'Actualización', icon: 'Newspaper', color: 'blue' },
  milestone: { label: 'Logro', icon: 'Trophy', color: 'yellow' },
  gratitude: { label: 'Agradecimiento', icon: 'Heart', color: 'pink' },
  closing: { label: 'Cierre de Causa', icon: 'CheckCircle', color: 'green' },
} as const;

// Shared UPDATE_TYPE_CONFIG used by CauseUpdateFeedCard and causes/[id]
import { Newspaper, Trophy, Heart, CheckCircle } from '@phosphor-icons/react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

export const UPDATE_TYPE_CONFIG: Record<
  string,
  {
    label: string;
    Icon: PhosphorIcon;
    bgClass: string;
    textClass: string;
    borderClass: string;
  }
> = {
  progress: {
    label: 'Actualizacion',
    Icon: Newspaper,
    bgClass: 'bg-dracula-cyan/20',
    textClass: 'text-dracula-cyan',
    borderClass: 'border-dracula-cyan/30',
  },
  milestone: {
    label: 'Logro',
    Icon: Trophy,
    bgClass: 'bg-dracula-yellow/20',
    textClass: 'text-dracula-yellow',
    borderClass: 'border-dracula-yellow/30',
  },
  gratitude: {
    label: 'Agradecimiento',
    Icon: Heart,
    bgClass: 'bg-dracula-pink/20',
    textClass: 'text-dracula-pink',
    borderClass: 'border-dracula-pink/30',
  },
  closing: {
    label: 'Causa Completada',
    Icon: CheckCircle,
    bgClass: 'bg-dracula-green/20',
    textClass: 'text-dracula-green',
    borderClass: 'border-dracula-green/30',
  },
};

// Colombian departments for filtering
export const COLOMBIAN_DEPARTMENTS = [
  'Amazonas',
  'Antioquia',
  'Arauca',
  'Atlántico',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Caquetá',
  'Casanare',
  'Cauca',
  'Cesar',
  'Chocó',
  'Córdoba',
  'Cundinamarca',
  'Guainía',
  'Guaviare',
  'Huila',
  'La Guajira',
  'Magdalena',
  'Meta',
  'Nariño',
  'Norte de Santander',
  'Putumayo',
  'Quindío',
  'Risaralda',
  'San Andrés',
  'Santander',
  'Sucre',
  'Tolima',
  'Valle del Cauca',
  'Vaupés',
  'Vichada',
] as const;
