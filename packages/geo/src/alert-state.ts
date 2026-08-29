export type AlertState = 'pending' | 'acknowledged' | 'cleared' | 'expired';

export type AlertEvent =
  | { type: 'triggered'; at: string }
  | { type: 'acknowledged'; at: string }
  | { type: 'cleared'; at: string }
  | { type: 'expired'; at: string };

export function transitionAlert(state: AlertState, event: AlertEvent): AlertState {
  if (event.type === 'triggered') return state;
  if (event.type === 'acknowledged') return state === 'pending' ? 'acknowledged' : state;
  if (event.type === 'cleared') return state === 'pending' || state === 'acknowledged' ? 'cleared' : state;
  if (event.type === 'expired') return state === 'pending' || state === 'acknowledged' ? 'expired' : state;
  return state;
}

export function canAcknowledge(state: AlertState) {
  return state === 'pending';
}

export function canClear(state: AlertState) {
  return state === 'pending' || state === 'acknowledged';
}
