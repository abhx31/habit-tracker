import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import ReactTooltip from 'react-tooltip';
import { subYears, format } from 'date-fns';
import { useHabits } from '../context/HabitContext';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

type HeatmapValue = {
  date: string;
  count: number;
} | null;

export const CombinedHeatmap: React.FC = () => {
  const { getCombinedHeatmapData } = useHabits();
  const [heatmapData, setHeatmapData] = useState<HeatmapValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const data = await getCombinedHeatmapData();
        setHeatmapData(data);
      } catch (error) {
        console.error('Error fetching combined heatmap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, [getCombinedHeatmapData]);

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
    <div className="mt-4 p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">All Habits Activity</h2>
      <CalendarHeatmap
        startDate={startDate}
        endDate={new Date()}
        values={heatmapData}
        classForValue={(value: HeatmapValue) => {
          if (!value) {
            return 'color-empty';
          }
          // Adjust the thresholds based on your data
          const level = Math.min(Math.ceil(value.count / 2), 4);
          return `color-github-${level}`;
        }}
        tooltipDataAttrs={(value: HeatmapValue) => {
          if (!value || !value.date) {
            return { 'data-tip': '' };
          }
          return {
            'data-tip': `${format(new Date(value.date), 'MMM d, yyyy')}: ${
              value.count
            } habit${value.count !== 1 ? 's' : ''} completed`,
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