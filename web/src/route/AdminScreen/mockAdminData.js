/** Mock analytics/keywords — same shape as mobile MockAPI (fallback when API unavailable). */
export const MOCK_ANALYTICS = {
  newsStats: { real: 156, fake: 43, underReview: 28 },
  weeklyData: [
    { day: 'Mon', real: 18, fake: 5, underReview: 3 },
    { day: 'Tue', real: 22, fake: 7, underReview: 4 },
    { day: 'Wed', real: 25, fake: 6, underReview: 5 },
    { day: 'Thu', real: 20, fake: 8, underReview: 4 },
    { day: 'Fri', real: 28, fake: 6, underReview: 5 },
    { day: 'Sat', real: 23, fake: 6, underReview: 4 },
    { day: 'Sun', real: 20, fake: 5, underReview: 3 },
  ],
  monthlyTrend: [
    { month: 'Jan', real: 120, fake: 35, underReview: 22 },
    { month: 'Feb', real: 135, fake: 38, underReview: 24 },
    { month: 'Mar', real: 156, fake: 43, underReview: 28 },
  ],
};

export const MOCK_KEYWORDS = [
  { id: 1, word: 'Coffee', searches: 195, trend: 'up' },
  { id: 2, word: 'Sports', searches: 90, trend: 'down' },
  { id: 3, word: 'News', searches: 330, trend: 'up' },
  { id: 4, word: 'Tea', searches: 56, trend: 'stable' },
  { id: 5, word: 'Burger', searches: 35, trend: 'up' },
];

export const MOCK_USER_TREND = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values: [1.8, 2.2, 2.8, 3.4, 4.8, 6.2, 7.8],
};

export const CHART_LEGEND_NEWS = [
  { label: 'Real', color: '#4CAF50' },
  { label: 'Fake', color: '#f44336' },
  { label: 'Under Review', color: '#FF9800' },
];

export const CHART_LINES_NEWS = [
  { dataKey: 'real', color: '#4CAF50', strokeWidth: 2 },
  { dataKey: 'fake', color: '#f44336', strokeWidth: 2 },
  { dataKey: 'underReview', color: '#FF9800', strokeWidth: 2 },
];

export function toUserTrendChartData() {
  return MOCK_USER_TREND.labels.map((name, i) => ({
    name,
    value: MOCK_USER_TREND.values[i],
  }));
}

export function toWeeklyChartData(weeklyData) {
  return (weeklyData || []).map((d) => ({
    name: d.day,
    real: d.real,
    fake: d.fake,
    underReview: d.underReview,
  }));
}

export function toMonthlyChartData(monthlyTrend) {
  return (monthlyTrend || []).map((d) => ({
    name: d.month,
    real: d.real,
    fake: d.fake,
    underReview: d.underReview,
  }));
}
