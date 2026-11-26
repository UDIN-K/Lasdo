import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRupiah,
  formatHourRange,
  isValidIndonesianPhone,
  getDurationOptions,
  computePreviewPrice,
} from './bookingHelpers.js';

test('formatRupiah formats Indonesian currency cleanly', () => {
  assert.equal(formatRupiah(150000), 'Rp 150.000');
  assert.equal(formatRupiah(0), 'Rp 0');
});

test('formatHourRange formats start and end hours', () => {
  assert.equal(formatHourRange(8, 2), '08:00 – 10:00');
  assert.equal(formatHourRange(19, 3), '19:00 – 22:00');
});

test('isValidIndonesianPhone validates 08, 62, and +62 prefixes', () => {
  assert.equal(isValidIndonesianPhone('081234567890'), true);
  assert.equal(isValidIndonesianPhone('+62812-3456-7890'), true);
  assert.equal(isValidIndonesianPhone('12345'), false);
  assert.equal(isValidIndonesianPhone(''), false);
});

test('getDurationOptions detects intermediate booked slot collisions', () => {
  const mockSlots = [
    { hour: 16, isAvailable: true, futsalPrice: 100000, serbagunaPrice: 300000 },
    { hour: 17, isAvailable: true, futsalPrice: 150000, serbagunaPrice: 300000 },
    { hour: 18, isAvailable: false, futsalPrice: 150000, serbagunaPrice: 300000 },
    { hour: 19, isAvailable: true, futsalPrice: 150000, serbagunaPrice: 300000 },
  ];

  const options = getDurationOptions(mockSlots, 16, 4);
  assert.equal(options.length, 4);
  assert.equal(options[0].isAvailable, true); // 16-17
  assert.equal(options[1].isAvailable, true); // 16-18
  assert.equal(options[2].isAvailable, false); // 16-19 collides at 18
  assert.equal(options[2].conflictHour, 18);
});

test('computePreviewPrice calculates mixed day and night rates accurately', () => {
  const mockSchedule = {
    isWeekend: false,
    holiday: { isHoliday: false },
    slots: [
      { hour: 16, isAvailable: true, futsalPrice: 100000, serbagunaPrice: 300000 },
      { hour: 17, isAvailable: true, futsalPrice: 150000, serbagunaPrice: 300000 },
    ],
  };

  const futsal = computePreviewPrice(mockSchedule, 'futsal', 16, 2);
  assert.equal(futsal.total, 250000);
  assert.equal(futsal.perHour, 125000);
  assert.equal(futsal.breakdown.length, 2);

  const hall = computePreviewPrice(mockSchedule, 'serbaguna', 16, 2);
  assert.equal(hall.total, 600000);
});
