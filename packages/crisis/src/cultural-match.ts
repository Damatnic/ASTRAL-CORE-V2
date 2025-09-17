import { CrisisProfile, VolunteerProfile } from './types';

export interface CulturalMatch {
  volunteerId: string;
  culturalCompatibilityScore: number;
  languageMatch: boolean;
}

export class CulturalMatcher {
  async matchCulturalCompatibility(
    crisis: CrisisProfile,
    volunteers: VolunteerProfile[]
  ): Promise<CulturalMatch[]> {
    return volunteers.map(volunteer => ({
      volunteerId: volunteer.id,
      culturalCompatibilityScore: 0.8,
      languageMatch: true
    }));
  }
}