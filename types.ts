
export interface Resort {
  id: string;
  name: string;
  location: string;
  category: 'Sun' | 'Sea' | 'Snow' | 'International';
  description: string;
  imageUrl: string;
}

export interface PlannerResult {
  destinationType: string;
  recommendation: string;
  suggestedActivities: string[];
}
