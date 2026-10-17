import ApiCall from './services';

export interface ReelComment {
  commentID: string;
  reelID: string;
  userID: string;
  userName: string;
  userImage?: string;
  comment: string;
  commentCreated: string;
  likes?: string[];
  replies?: any[];
}

export interface ReelItem {
  reelID: string;
  userID: string;
  userName: string;
  userImage?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  tags?: string[];
  audioTitle?: string;
  duration?: number;
  views?: number;
  shares?: number;
  likes?: string[];
  likesCount: number;
  comments?: ReelComment[];
  commentsCount: number;
  isLiked?: boolean;
  createdAt?: string;
}

export interface CreateReelPayload {
  userID: string;
  userName: string;
  userImage?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  tags?: string[];
  audioTitle?: string;
  duration?: number;
}

/**
 * Fetch paginated reels from API
 */
export const getReelsApi = async (page = 1, limit = 10, currentUserId = '') => {
  try {
    const query = `api/reels?page=${page}&limit=${limit}${
      currentUserId ? `&currentUserId=${encodeURIComponent(currentUserId)}` : ''
    }`;
    const response = await ApiCall('get', query, '');
    return response;
  } catch (error: any) {
    console.error('Error fetching reels:', error);
    return { success: false, data: [], message: error?.message };
  }
};

/**
 * Create a new reel
 */
export const createReelApi = async (payload: CreateReelPayload) => {
  try {
    const response = await ApiCall('post', 'api/reels', payload);
    return response;
  } catch (error: any) {
    console.error('Error creating reel:', error);
    return { success: false, message: error?.message };
  }
};

/**
 * Like / unlike a reel
 */
export const toggleLikeReelApi = async (reelID: string, userID: string) => {
  try {
    const response = await ApiCall('post', `api/reels/${reelID}/like`, {
      userID,
    });
    return response;
  } catch (error: any) {
    console.error('Error liking reel:', error);
    return { success: false, message: error?.message };
  }
};

/**
 * Increment view count
 */
export const incrementReelViewApi = async (reelID: string) => {
  try {
    const response = await ApiCall('post', `api/reels/${reelID}/view`, {});
    return response;
  } catch (error: any) {
    console.error('Error updating reel view:', error);
    return { success: false };
  }
};

/**
 * Fetch comments for a reel
 */
export const getReelCommentsApi = async (reelID: string) => {
  try {
    const response = await ApiCall('get', `api/reels/${reelID}/comments`, {});
    return response;
  } catch (error: any) {
    console.error('Error fetching reel comments:', error);
    return { success: false, data: [], message: error?.message };
  }
};

/**
 * Add a comment to a reel
 */
export const addReelCommentApi = async (
  reelID: string,
  payload: {
    comment: string;
    userID: string;
    userName: string;
    userImage?: string;
  }
) => {
  try {
    const response = await ApiCall(
      'post',
      `api/reels/${reelID}/comments`,
      payload
    );
    return response;
  } catch (error: any) {
    console.error('Error adding reel comment:', error);
    return { success: false, message: error?.message };
  }
};

/**
 * Delete a comment from a reel
 */
export const deleteReelCommentApi = async (
  reelID: string,
  commentID: string,
  userID: string
) => {
  try {
    const response = await ApiCall(
      'delete',
      `api/reels/${reelID}/comments/${commentID}`,
      { userID }
    );
    return response;
  } catch (error: any) {
    console.error('Error deleting reel comment:', error);
    return { success: false, message: error?.message };
  }
};
