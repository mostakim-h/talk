import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {format, isToday, isYesterday,} from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getChatRoomId = (currentUserId: string, selectedUserId: string) => {
  return [currentUserId, selectedUserId].sort().join('_');
};

export function shortLastSeen(isoTime: Date): string {
  const date = new Date(isoTime);
  const diff = Date.now() - date.getTime();

  if (diff < 10 * 1000) return 'now';

  if (diff < 60 * 1000) {
    return `${Math.floor(diff / 1000)}s ago`;
  }

  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}m ago`;
  }

  if (diff < 24 * 60 * 60 * 1000 && isToday(date)) {
    return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
  }

  if (isYesterday(date)) return 'yesterday';

  return format(date, 'MMM d');
}

export const cropImage = (url: string) => {

  if (!url || !url.includes('/upload/')) {
    return url;
  }

  return url.replace(
    '/upload/',
    '/upload/f_auto,q_auto,c_crop,g_face:auto,h_300,w_300,r_max,x_0,y_0/'
  )
}