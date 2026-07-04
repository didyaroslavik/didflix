import client from './client';
import type { Entry } from '../types';

export interface PublicProfile {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  memberSince: string;
}

export interface PublicStats {
  totalWatched: number;
  moviesWatched: number;
  tvShowsWatched: number;
  averageRating: number | null;
  totalInCollection: number;
}

export interface UserSearchResult {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  shareToken: string;
  _count: { entries: number };
}

export const publicApi = {
  getProfile: async (token: string) => {
    const res = await client.get<{
      profile: PublicProfile;
      stats: PublicStats;
      entries: Entry[];
    }>(`/public/u/${token}`);
    return res.data;
  },

  searchUsers: async (query: string) => {
    const res = await client.get<{ users: UserSearchResult[] }>(
      '/public/search',
      { params: { q: query } }
    );
    return res.data.users;
  },
};