import { useMediaQuery } from '@react-hookz/web';

export default function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
