/**
 * Fetch with automatic retry on failure
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param retries - Number of retry attempts (default: 1)
 * @param backoff - Backoff multiplier in ms (default: 300)
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries: number = 1,
  backoff: number = 300
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
}

/**
 * Debounce function
 * @param func - Function to debounce
 * @param wait - Wait time in ms
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param func - Function to throttle
 * @param limit - Time limit in ms
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Image with fallback
 */
export const FALLBACK_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23141414' width='400' height='400'/%3E%3Ctext fill='%233D3D3D' font-family='sans-serif' font-size='72' text-anchor='middle' x='200' y='220'%3E📦%3C/text%3E%3Ctext fill='%23666' font-family='sans-serif' font-size='16' text-anchor='middle' x='200' y='260'%3EImage not available%3C/text%3E%3C/svg%3E`;
