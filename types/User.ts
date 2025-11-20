export interface IUser {
    _id: string;
    name: string;
    username: string;
    email: string;
    bio?: string;
    avatarUrl?: string;
    stars: number;
    followers: string[];
    following: string[];
    categories: string[];
    isPremium: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }