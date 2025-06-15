import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import ReactTooltip from 'react-tooltip';
import { subYears, format } from 'date-fns';
import { useHabits } from '../context/HabitContext';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeatmapProps {
  habitId: string;
}

type HeatmapValue = {
  date: string;
  count: number;
} | null;

export const HeatmapView: React.FC<HeatmapProps> = ({ habitId }) => {
  const { getHeatmapData } = useHabits();
  const [heatmapData, setHeatmapData] = useState<HeatmapValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const data = await getHeatmapData(habitId);
        setHeatmapData(data);
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, [habitId, getHeatmapData]);

  const startDate = subYears(new Date(), 1);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <Loader2 className="h-6 w-6 text-violet-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <CalendarHeatmap
        startDate={startDate}
        endDate={new Date()}
        values={heatmapData}
        classForValue={(value: HeatmapValue) => {
          if (!value) {
            return 'color-empty';
          }
          return `color-github-${Math.min(value.count, 4)}`;
        }}
        tooltipDataAttrs={(value: HeatmapValue) => {
          if (!value || !value.date) {
            return { 'data-tip': '' };
          }
          return {
            'data-tip': `${format(new Date(value.date), 'MMM d, yyyy')}: ${
              value.count
            } completion${value.count !== 1 ? 's' : ''}`,
          };
        }}
      />
      <ReactTooltip />
      <style>
        {`
          .react-calendar-heatmap {
            width: 100%;
          }
          .react-calendar-heatmap .color-empty {
            fill: #ebedf0;
          }
          .react-calendar-heatmap .color-github-1 {
            fill: #9be9a8;
          }
          .react-calendar-heatmap .color-github-2 {
            fill: #40c463;
          }
          .react-calendar-heatmap .color-github-3 {
            fill: #30a14e;
          }
          .react-calendar-heatmap .color-github-4 {
            fill: #216e39;
          }
        `}
      </style>
    </div>
  );
}; 