// Profile Completion Validation Utilities
// Users with complete profiles get special badges and appear first in listings

export interface LeaderProfile {
    name: string;
    bio?: string;
    photo_url?: string;
    location?: string;
    tags?: string[];
    activeCausesCount?: number;
}

export interface EntrepreneurProfile {
    store_name: string;
    bio?: string;
    photo_url?: string;
    location?: string;
    activeProductsCount?: number;
}

export interface ConautaProfile {
    name: string;
    bio?: string;
    photo_url?: string;
}

// Minimum requirements for a complete profile
const MIN_BIO_LENGTH_LEADER = 50;
const MIN_BIO_LENGTH_ENTREPRENEUR = 50;
const MIN_BIO_LENGTH_CONAUTA = 20;
const MIN_TAGS_LEADER = 1;
const MIN_CAUSES_LEADER = 1;
const MIN_PRODUCTS_ENTREPRENEUR = 1;

/**
 * Check if a leader has a complete profile
 * Requirements:
 * - Name (always required)
 * - Bio (min 50 chars)
 * - Photo
 * - Location
 * - At least 1 tag
 * - At least 1 active cause
 */
export function isLeaderProfileComplete(profile: LeaderProfile): boolean {
    if (!profile.name) return false;
    if (!profile.bio || profile.bio.length < MIN_BIO_LENGTH_LEADER) return false;
    if (!profile.photo_url) return false;
    if (!profile.location) return false;
    if (!profile.tags || profile.tags.length < MIN_TAGS_LEADER) return false;
    if ((profile.activeCausesCount || 0) < MIN_CAUSES_LEADER) return false;
    return true;
}

/**
 * Get leader profile completion percentage
 */
export function getLeaderCompletionPercentage(profile: LeaderProfile): number {
    let score = 0;
    const totalPoints = 6;

    if (profile.name) score += 1;
    if (profile.bio && profile.bio.length >= MIN_BIO_LENGTH_LEADER) score += 1;
    if (profile.photo_url) score += 1;
    if (profile.location) score += 1;
    if (profile.tags && profile.tags.length >= MIN_TAGS_LEADER) score += 1;
    if ((profile.activeCausesCount || 0) >= MIN_CAUSES_LEADER) score += 1;

    return Math.round((score / totalPoints) * 100);
}

/**
 * Get missing fields for leader profile
 */
export function getLeaderMissingFields(profile: LeaderProfile): string[] {
    const missing: string[] = [];

    if (!profile.name) missing.push('Nombre');
    if (!profile.bio || profile.bio.length < MIN_BIO_LENGTH_LEADER) {
        missing.push(`Biografia (min ${MIN_BIO_LENGTH_LEADER} caracteres)`);
    }
    if (!profile.photo_url) missing.push('Foto de perfil');
    if (!profile.location) missing.push('Ubicacion');
    if (!profile.tags || profile.tags.length < MIN_TAGS_LEADER) {
        missing.push(`Etiquetas (min ${MIN_TAGS_LEADER})`);
    }
    if ((profile.activeCausesCount || 0) < MIN_CAUSES_LEADER) {
        missing.push(`Causa activa (min ${MIN_CAUSES_LEADER})`);
    }

    return missing;
}

/**
 * Check if an entrepreneur has a complete profile
 * Requirements:
 * - Store name (always required)
 * - Bio (min 50 chars)
 * - Photo
 * - Location
 * - At least 1 active product
 */
export function isEntrepreneurProfileComplete(profile: EntrepreneurProfile): boolean {
    if (!profile.store_name) return false;
    if (!profile.bio || profile.bio.length < MIN_BIO_LENGTH_ENTREPRENEUR) return false;
    if (!profile.photo_url) return false;
    if (!profile.location) return false;
    if ((profile.activeProductsCount || 0) < MIN_PRODUCTS_ENTREPRENEUR) return false;
    return true;
}

/**
 * Get entrepreneur profile completion percentage
 */
export function getEntrepreneurCompletionPercentage(profile: EntrepreneurProfile): number {
    let score = 0;
    const totalPoints = 5;

    if (profile.store_name) score += 1;
    if (profile.bio && profile.bio.length >= MIN_BIO_LENGTH_ENTREPRENEUR) score += 1;
    if (profile.photo_url) score += 1;
    if (profile.location) score += 1;
    if ((profile.activeProductsCount || 0) >= MIN_PRODUCTS_ENTREPRENEUR) score += 1;

    return Math.round((score / totalPoints) * 100);
}

/**
 * Get missing fields for entrepreneur profile
 */
export function getEntrepreneurMissingFields(profile: EntrepreneurProfile): string[] {
    const missing: string[] = [];

    if (!profile.store_name) missing.push('Nombre de tienda');
    if (!profile.bio || profile.bio.length < MIN_BIO_LENGTH_ENTREPRENEUR) {
        missing.push(`Biografia (min ${MIN_BIO_LENGTH_ENTREPRENEUR} caracteres)`);
    }
    if (!profile.photo_url) missing.push('Foto de perfil');
    if (!profile.location) missing.push('Ubicacion');
    if ((profile.activeProductsCount || 0) < MIN_PRODUCTS_ENTREPRENEUR) {
        missing.push(`Producto activo (min ${MIN_PRODUCTS_ENTREPRENEUR})`);
    }

    return missing;
}

/**
 * Check if a conauta has a complete profile
 * Requirements:
 * - Name (always required)
 * - Bio (min 20 chars)
 * - Photo
 */
export function isConautaProfileComplete(profile: ConautaProfile): boolean {
    if (!profile.name) return false;
    if (!profile.bio || profile.bio.length < MIN_BIO_LENGTH_CONAUTA) return false;
    if (!profile.photo_url) return false;
    return true;
}

/**
 * Get conauta profile completion percentage
 */
export function getConautaCompletionPercentage(profile: ConautaProfile): number {
    let score = 0;
    const totalPoints = 3;

    if (profile.name) score += 1;
    if (profile.bio && profile.bio.length >= MIN_BIO_LENGTH_CONAUTA) score += 1;
    if (profile.photo_url) score += 1;

    return Math.round((score / totalPoints) * 100);
}

/**
 * Sort profiles by completeness (complete profiles first)
 */
export function sortByProfileCompletion<T>(
    profiles: T[],
    isComplete: (profile: T) => boolean
): T[] {
    return [...profiles].sort((a, b) => {
        const aComplete = isComplete(a);
        const bComplete = isComplete(b);

        if (aComplete && !bComplete) return -1;
        if (!aComplete && bComplete) return 1;
        return 0;
    });
}
