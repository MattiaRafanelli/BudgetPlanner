import { useEffect, useState } from 'react';

interface CategoryData {
  id: string;
  name: string;
  type: string;
}

/**
 * Hook to fetch and cache backend categories
 * Provides lookup by frontend category slug to get backend UUID
 */
export function useCategoryLookup() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const session = sessionStorage.getItem('userSession');
        let token = '';
        if (session) {
          try {
            const parsed = JSON.parse(session);
            token = parsed.token;
          } catch {
            return;
          }
        }

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Frontend category slug to name mapping
        const slugToName: Record<string, string> = {
          'food': 'Food & Dining',
          'housing': 'Housing',
          'transport': 'Transport',
          'healthcare': 'Healthcare',
          'entertainment': 'Entertainment',
          'shopping': 'Shopping',
          'education': 'Education',
          'utilities': 'Utilities',
          'subscriptions': 'Subscriptions',
          'personal': 'Personal Care',
          'other_expense': 'Other',
          'salary': 'Salary',
          'freelance': 'Freelance',
          'investment': 'Investment',
          'gift': 'Gift',
          'other_income': 'Other Income',
        };

        const res = await fetch('/api/categories', { headers });
        if (res.ok) {
          const { data } = await res.json();
          setCategories(data);

          // Build map from frontend slug to backend UUID
          const map: Record<string, string> = {};
          for (const [slug, displayName] of Object.entries(slugToName)) {
            const cat = data.find((c: CategoryData) => 
              c.name.toLowerCase() === displayName.toLowerCase()
            );
            if (cat) {
              map[slug] = cat.id;
            }
          }
          setCategoryMap(map);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  /**
   * Get UUID for frontend category slug
   * Falls back to the slug itself if not found (for compatibility)
   */
  const getCategoryId = (slug: string): string => {
    return categoryMap[slug] || slug;
  };

  return { categories, categoryMap, loading, getCategoryId };
}
