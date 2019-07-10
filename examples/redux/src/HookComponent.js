import { useSelector } from 'react-redux';

export function HookComponent() {
  const notifications = useSelector(() => true);

  return null;
}
