export function formatRupiah(amount) {
  const num = Number(amount) || 0;
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export function formatHour(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function formatHourRange(startHour, duration) {
  const start = Number(startHour) || 8;
  const dur = Math.max(1, Number(duration) || 1);
  return `${formatHour(start)} – ${formatHour(start + dur)}`;
}

export function isValidIndonesianPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleanPhone = phone.replace(/[\s\-]/g, '');
  return /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/.test(cleanPhone);
}

export function buildQuickDates(count = 7, baseDate = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);
    const dayNumber = d.getDate();
    const monthName = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(d);
    return {
      dateStr,
      label: i === 0 ? 'Hari Ini' : i === 1 ? 'Besok' : dayName,
      dateFormatted: `${dayNumber} ${monthName}`,
    };
  });
}

export function getDurationOptions(slots = [], startHour, maxHours = 5) {
  const options = [];
  const start = Number(startHour);
  if (Number.isNaN(start) || start < 8 || start > 21) return options;

  for (let d = 1; d <= maxHours; d++) {
    const endHour = start + d;
    if (endHour > 22) break;

    let conflictHour = null;
    for (let h = start; h < endHour; h++) {
      const slot = slots.find((s) => s.hour === h);
      if (slot && !slot.isAvailable) {
        conflictHour = h;
        break;
      }
    }

    options.push({
      duration: d,
      endHour,
      isAvailable: conflictHour === null,
      conflictHour,
      label: `${d} Jam (${formatHour(start)} – ${formatHour(endHour)})`,
    });
  }

  return options;
}

export function computePreviewPrice(scheduleData, serviceType, startHour, duration) {
  if (!scheduleData || !Array.isArray(scheduleData.slots)) {
    return { total: 0, perHour: 0, breakdown: [] };
  }

  const breakdown = [];
  let total = 0;

  for (let i = 0; i < duration; i++) {
    const h = startHour + i;
    if (h >= 22) break;
    const slot = scheduleData.slots.find((s) => s.hour === h);

    let rate = 0;
    let label = '';

    if (serviceType === 'serbaguna') {
      rate = slot ? slot.serbagunaPrice : 300000;
      label = 'Gedung Serbaguna';
    } else {
      rate = slot ? slot.futsalPrice : 100000;
      label = scheduleData.isWeekend
        ? 'Tarif Akhir Pekan'
        : scheduleData.holiday?.isHoliday
        ? `Tarif Libur (${scheduleData.holiday.name})`
        : h >= 17
        ? 'Tarif Malam'
        : 'Tarif Siang';
    }

    total += rate;
    breakdown.push({
      hour: h,
      time: `${formatHour(h)} – ${formatHour(h + 1)}`,
      rate,
      label,
    });
  }

  const perHour = duration > 0 ? Math.round(total / duration) : 0;
  return { total, perHour, breakdown };
}
