// This file contains ONLY the fixes for helper functions with bugs
// Import and use these instead of the originals

import moment from "moment";

/**
 * FIX: wodPct array index bug
 *
 * Original used dates[-1] which is undefined in JavaScript.
 * Now correctly uses dates[dates.length - 1]
 */
export const wodPct = (startDate: Date, achievements: string[]) => {
  const wordDatesFromAchievements = (achievements: string[]) => {
    const datelist = achievements
      .filter((ach) => ach.startsWith("wordoftheday_"))
      .map((ach) => ach.split("_")[1]);
    const dates = datelist.map((date) => moment(date, "M/DD/YYYY").toDate());
    return dates.filter((date) => !isNaN(date.getTime()));
  };

  const dates = wordDatesFromAchievements(achievements);
  if (dates.length === 0) {
    return 0;
  }

  // FIX: Correct array indexing
  const latestDate = dates[dates.length - 1];  // ← FIXED: Was dates[-1]
  const currDate = new Date();
  const todayInclude = moment(currDate).isSame(latestDate, "day");

  let totalDays = moment(currDate).diff(startDate, "days");
  if (todayInclude) {
    totalDays++;
  }

  if (totalDays <= 0) {
    return 0;
  }

  console.log(`📊 [wodPct] Total days: ${totalDays}, WOD completions: ${dates.length}`);
  return 100 * (dates.length / totalDays);
};
