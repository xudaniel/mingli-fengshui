/** True-solar-time correction: converts a civil clock reading into the
 * apparent solar time at a given longitude, which is what BaZi hour-pillar
 * boundaries are traditionally reckoned against. */

export interface CivilMoment {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

/** Equation of time in minutes (Spencer 1971 approximation). Positive means
 * the sundial runs ahead of the clock. */
function equationOfTimeMinutes(dayOfYear: number, daysInYear: number): number {
  const b = (2 * Math.PI * (dayOfYear - 1)) / daysInYear;
  return (
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(b) -
      0.032077 * Math.sin(b) -
      0.014615 * Math.cos(2 * b) -
      0.04089 * Math.sin(2 * b))
  );
}

function dayOfYear(year: number, month: number, day: number): number {
  return Math.floor(
    (Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / 86400000,
  ) + 1;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export interface SolarTimeOptions {
  /** Birthplace longitude in degrees, east positive. */
  longitude: number;
  /** UTC offset in hours that applied to the civil clock at that place/time (e.g. 8 for China). */
  utcOffsetHours: number;
  /** Whether to also apply the equation-of-time correction (true apparent solar time). */
  applyEquationOfTime: boolean;
}

export interface SolarTimeResult {
  corrected: CivilMoment;
  longitudeCorrectionMinutes: number;
  equationOfTimeMinutes: number;
  totalCorrectionMinutes: number;
}

/** Applies the longitude + (optional) equation-of-time correction to a civil moment. */
export function toTrueSolarTime(
  civil: CivilMoment,
  opts: SolarTimeOptions,
): SolarTimeResult {
  const standardMeridian = opts.utcOffsetHours * 15;
  const longitudeCorrectionMinutes = 4 * (opts.longitude - standardMeridian);

  const doy = dayOfYear(civil.year, civil.month, civil.day);
  const daysInYear = isLeapYear(civil.year) ? 366 : 365;
  const eotMinutes = opts.applyEquationOfTime
    ? equationOfTimeMinutes(doy, daysInYear)
    : 0;

  const totalCorrectionMinutes = longitudeCorrectionMinutes + eotMinutes;

  const base = new Date(
    Date.UTC(civil.year, civil.month - 1, civil.day, civil.hour, civil.minute),
  );
  const corrected = new Date(base.getTime() + totalCorrectionMinutes * 60000);

  return {
    corrected: {
      year: corrected.getUTCFullYear(),
      month: corrected.getUTCMonth() + 1,
      day: corrected.getUTCDate(),
      hour: corrected.getUTCHours(),
      minute: corrected.getUTCMinutes(),
    },
    longitudeCorrectionMinutes,
    equationOfTimeMinutes: eotMinutes,
    totalCorrectionMinutes,
  };
}
