// Profile Completion Validation Utilities
// Users with complete profiles get special badges and appear first in listings

export interface LeaderProfile {
  name: string;
  bio?: string;
  photo_url?: string;
  location?: string;
  tags?: string[];
  activeCausesCount?: number;
  // Enhanced fields
  who_we_are?: string;
  our_why?: string;
  how_to_help?: string;
  contact_info?: string; // JSON string with whatsapp etc.
  people_impacted?: number | null;
  achievements?: string; // JSON string
  testimonials?: string; // JSON string
}

export interface EntrepreneurProfile {
  store_name: string;
  bio?: string;
  photo_url?: string;
  location?: string;
  activeProductsCount?: number;
  // Enhanced fields
  store_story?: string;
  contact_info?: string;
}

// Minimum requirements for a complete profile
const MIN_BIO_LENGTH_LEADER = 50;
const MIN_BIO_LENGTH_ENTREPRENEUR = 50;
const MIN_TAGS_LEADER = 1;
const MIN_CAUSES_LEADER = 1;
const MIN_PRODUCTS_ENTREPRENEUR = 1;

/**
 * Check if a leader has a complete profile
 */
export function isLeaderProfileComplete(profile: LeaderProfile): boolean {
  return getLeaderCompletionPercentage(profile) >= 80;
}

/**
 * Get leader profile completion percentage (10 points total)
 *
 * 1. Nombre (1pt)
 * 2. Foto (1pt)
 * 3. Historia — who_we_are o bio con min 50 chars (1pt)
 * 4. Motivación — our_why (1pt)
 * 5. Cómo ayudar — how_to_help (1pt)
 * 6. Ubicación (1pt)
 * 7. Etiquetas (1pt)
 * 8. Causa activa (1pt)
 * 9. Contacto — al menos WhatsApp (1pt)
 * 10. Impacto — people_impacted o logros/testimonios (1pt)
 */
export function getLeaderCompletionPercentage(profile: LeaderProfile): number {
  let score = 0;
  const totalPoints = 10;

  // 1. Name
  if (profile.name) score += 1;

  // 2. Photo
  if (profile.photo_url) score += 1;

  // 3. Story (who_we_are or bio)
  const hasStory = profile.who_we_are && profile.who_we_are.length >= 20;
  const hasBio = profile.bio && profile.bio.length >= MIN_BIO_LENGTH_LEADER;
  if (hasStory || hasBio) score += 1;

  // 4. Motivation (our_why)
  if (profile.our_why && profile.our_why.length >= 20) score += 1;

  // 5. How to help
  if (profile.how_to_help && profile.how_to_help.length >= 10) score += 1;

  // 6. Location
  if (profile.location) score += 1;

  // 7. Tags
  if (profile.tags && profile.tags.length >= MIN_TAGS_LEADER) score += 1;

  // 8. Active cause
  if ((profile.activeCausesCount || 0) >= MIN_CAUSES_LEADER) score += 1;

  // 9. Contact info (at least whatsapp)
  if (profile.contact_info) {
    try {
      const contact =
        typeof profile.contact_info === 'string'
          ? JSON.parse(profile.contact_info)
          : profile.contact_info;
      if (contact.whatsapp || contact.instagram || contact.email) score += 1;
    } catch {
      // no contact info
    }
  }

  // 10. Impact (people_impacted or achievements/testimonials)
  const hasImpact = profile.people_impacted && profile.people_impacted > 0;
  let hasAchievementsOrTestimonials = false;
  try {
    const achievements = profile.achievements ? JSON.parse(profile.achievements) : [];
    const testimonials = profile.testimonials ? JSON.parse(profile.testimonials) : [];
    if (achievements.length > 0 || testimonials.length > 0) hasAchievementsOrTestimonials = true;
  } catch {
    // no achievements
  }
  if (hasImpact || hasAchievementsOrTestimonials) score += 1;

  return Math.round((score / totalPoints) * 100);
}

/**
 * Get missing fields for leader profile
 */
export function getLeaderMissingFields(profile: LeaderProfile): string[] {
  const missing: string[] = [];

  if (!profile.name) missing.push('Nombre');

  if (!profile.photo_url) missing.push('Foto de perfil');

  const hasStory = profile.who_we_are && profile.who_we_are.length >= 20;
  const hasBio = profile.bio && profile.bio.length >= MIN_BIO_LENGTH_LEADER;
  if (!hasStory && !hasBio) {
    missing.push('Cuenta quiénes son (sección Quiénes Somos)');
  }

  if (!profile.our_why || profile.our_why.length < 20) {
    missing.push('Comparte tu motivación (Por qué hacemos lo que hacemos)');
  }

  if (!profile.how_to_help || profile.how_to_help.length < 10) {
    missing.push('Dile a la gente cómo ayudar (Con qué nos puedes ayudar)');
  }

  if (!profile.location) missing.push('Ubicación');

  if (!profile.tags || profile.tags.length < MIN_TAGS_LEADER) {
    missing.push(`Etiquetas (mínimo ${MIN_TAGS_LEADER})`);
  }

  if ((profile.activeCausesCount || 0) < MIN_CAUSES_LEADER) {
    missing.push('Crear al menos una causa activa');
  }

  let hasContact = false;
  if (profile.contact_info) {
    try {
      const contact =
        typeof profile.contact_info === 'string'
          ? JSON.parse(profile.contact_info)
          : profile.contact_info;
      if (contact.whatsapp || contact.instagram || contact.email) hasContact = true;
    } catch {
      // no contact
    }
  }
  if (!hasContact) missing.push('Agrega al menos un medio de contacto');

  const hasImpact = profile.people_impacted && profile.people_impacted > 0;
  let hasAchievementsOrTestimonials = false;
  try {
    const achievements = profile.achievements ? JSON.parse(profile.achievements) : [];
    const testimonials = profile.testimonials ? JSON.parse(profile.testimonials) : [];
    if (achievements.length > 0 || testimonials.length > 0) hasAchievementsOrTestimonials = true;
  } catch {
    // no achievements
  }
  if (!hasImpact && !hasAchievementsOrTestimonials) {
    missing.push('Comparte tu impacto (personas beneficiadas, logros o testimonios)');
  }

  return missing;
}

/**
 * Check if an entrepreneur has a complete profile
 */
export function isEntrepreneurProfileComplete(profile: EntrepreneurProfile): boolean {
  return getEntrepreneurCompletionPercentage(profile) >= 80;
}

/**
 * Get entrepreneur profile completion percentage (7 points total)
 *
 * 1. Nombre de tienda (1pt)
 * 2. Foto (1pt)
 * 3. Descripción o historia (1pt)
 * 4. Ubicación (1pt)
 * 5. Producto activo (1pt)
 * 6. Contacto (1pt)
 * 7. Historia de tienda (1pt)
 */
export function getEntrepreneurCompletionPercentage(profile: EntrepreneurProfile): number {
  let score = 0;
  const totalPoints = 7;

  if (profile.store_name) score += 1;
  if (profile.photo_url) score += 1;
  if (profile.bio && profile.bio.length >= MIN_BIO_LENGTH_ENTREPRENEUR) score += 1;
  if (profile.location) score += 1;
  if ((profile.activeProductsCount || 0) >= MIN_PRODUCTS_ENTREPRENEUR) score += 1;

  // Contact info
  if (profile.contact_info) {
    try {
      const contact =
        typeof profile.contact_info === 'string'
          ? JSON.parse(profile.contact_info)
          : profile.contact_info;
      if (contact.whatsapp || contact.instagram || contact.email) score += 1;
    } catch {
      // no contact
    }
  }

  // Store story
  if (profile.store_story && profile.store_story.length >= 20) score += 1;

  return Math.round((score / totalPoints) * 100);
}

/**
 * Get missing fields for entrepreneur profile
 */
export function getEntrepreneurMissingFields(profile: EntrepreneurProfile): string[] {
  const missing: string[] = [];

  if (!profile.store_name) missing.push('Nombre de tienda');
  if (!profile.bio || profile.bio.length < MIN_BIO_LENGTH_ENTREPRENEUR) {
    missing.push(`Descripción (mínimo ${MIN_BIO_LENGTH_ENTREPRENEUR} caracteres)`);
  }
  if (!profile.photo_url) missing.push('Foto de perfil');
  if (!profile.location) missing.push('Ubicación');
  if ((profile.activeProductsCount || 0) < MIN_PRODUCTS_ENTREPRENEUR) {
    missing.push('Agregar al menos un producto');
  }

  let hasContact = false;
  if (profile.contact_info) {
    try {
      const contact =
        typeof profile.contact_info === 'string'
          ? JSON.parse(profile.contact_info)
          : profile.contact_info;
      if (contact.whatsapp || contact.instagram || contact.email) hasContact = true;
    } catch {
      // no contact
    }
  }
  if (!hasContact) missing.push('Agrega al menos un medio de contacto');

  if (!profile.store_story || profile.store_story.length < 20) {
    missing.push('Cuenta la historia de tu tienda');
  }

  return missing;
}

/**
 * Sort profiles by completeness (complete profiles first)
 */
export function sortByProfileCompletion<T>(
  profiles: T[],
  isComplete: (profile: T) => boolean,
): T[] {
  return [...profiles].sort((a, b) => {
    const aComplete = isComplete(a);
    const bComplete = isComplete(b);

    if (aComplete && !bComplete) return -1;
    if (!aComplete && bComplete) return 1;
    return 0;
  });
}
