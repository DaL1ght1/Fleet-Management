import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

const DEFAULT_DELAY_MS = 300;

export function debounced<T>(source: Signal<T>, delayMs = DEFAULT_DELAY_MS): Signal<T> {
  return toSignal(toObservable(source).pipe(debounceTime(delayMs), distinctUntilChanged()), {
    initialValue: source(),
  });
}
