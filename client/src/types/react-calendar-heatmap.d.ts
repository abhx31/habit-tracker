declare module 'react-calendar-heatmap' {
  import { ComponentType } from 'react';

  export interface CalendarHeatmapProps {
    values: Array<{ date: string; count: number } | null>;
    startDate: Date;
    endDate: Date;
    classForValue?: (value: { date: string; count: number } | null) => string;
    tooltipDataAttrs?: (value: { date: string; count: number } | null) => { [key: string]: string };
  }

  const CalendarHeatmap: ComponentType<CalendarHeatmapProps>;
  export default CalendarHeatmap;
} 