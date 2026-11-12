import { fromDateTimeInput, toDateTimeInput } from './date-input';

describe('date inputs', () => {
  it('round-trips an instant through a datetime-local value', () => {
    const iso = '2030-03-01T08:30:00.000Z';

    expect(fromDateTimeInput(toDateTimeInput(iso))).toBe(iso);
  });

  it('renders empty values as an empty input', () => {
    expect(toDateTimeInput(null)).toBe('');
  });
});
