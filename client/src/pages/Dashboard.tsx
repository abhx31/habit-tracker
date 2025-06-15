"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import { useHabits } from "../context/HabitContext";
import { HabitCard } from "../components/HabitCard";
import { HabitFormDialog } from "../components/HabitFormDialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { API_URL } from "../config";
import { CombinedHeatmap } from "../components/CombinedHeatmap";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
};

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning! ☀️";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon! 🌤️";
  } else if (hour >= 17 && hour < 21) {
    return "Good evening! 🌅";
  } else {
    return "Good night! 🌙";
  }
};

export default function Dashboard() {
  const { habits, isLoading, trackHabit } = useHabits();
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [completedToday, setCompletedToday] = useState<Record<string, boolean>>(
    {}
  );
  const [isTracking, setIsTracking] = useState<Record<string, boolean>>({});

  // Fetch today's completed habits on mount
  useEffect(() => {
    const fetchCompletedHabits = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("User not logged in, skipping habits fetch.");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/track/today`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 404) {
          console.warn("No completions found for today.");
          return;
        }

        if (!res.ok) {
          throw new Error(`Unexpected API error: ${res.status}`);
        }

        const data = await res.json();
        const logs = Array.isArray(data) ? data : data.logs ?? [];

        const completionMap: Record<string, boolean> = {};
        logs.forEach((log: { habitId: string }) => {
          completionMap[log.habitId] = true;
        });

        setCompletedToday(completionMap);
      } catch (error) {
        console.error("Error fetching today's completions:", error);
        toast.error("Server error while loading completions.");
      }
    };

    fetchCompletedHabits();
  }, []);

  // Handle completing a habit
  const handleToggleComplete = async (habitId: string) => {
    if (!habitId) {
      toast.error("Invalid habit ID");
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const newCompletedStatus = !completedToday[habitId];

      setIsTracking((prev) => ({ ...prev, [habitId]: true }));

      await trackHabit(habitId, today, newCompletedStatus);

      setCompletedToday((prev) => ({
        ...prev,
        [habitId]: newCompletedStatus,
      }));

      toast.success(
        newCompletedStatus ? "Habit completed!" : "Habit uncompleted",
        {
          icon: <CheckCircle2 className="text-green-400" />,
        }
      );
    } catch (error) {
      console.error("Error updating habit:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update habit"
      );
    } finally {
      setIsTracking((prev) => ({ ...prev, [habitId]: false }));
    }
  };

  const filteredHabits = (habits ?? []).filter((habit) =>
    habit
      ? [habit.name, habit.description || "", habit.category || ""].some(
          (field) => field.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : false
  );

  const categorizeHabits = (type: string) =>
    filteredHabits.filter((habit) => habit?.frequency?.type === type);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            {getGreeting()}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {/* Search Box */}
        <motion.div variants={itemVariants} className="w-full md:w-[400px]">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Search Your Habits
          </h2>
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              placeholder="Search habits..."
              className="pl-12 h-14 text-lg bg-white shadow-lg focus:shadow-xl transition-all duration-200 focus:ring-2 focus:ring-violet-500 rounded-xl border border-gray-200 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2">
              Showing results for "{searchQuery}"
            </p>
          )}
        </motion.div>
      </motion.div>

      {/* Combined Heatmap Section */}
      <motion.div variants={itemVariants}>
        <CombinedHeatmap />
      </motion.div>

      {/* Main Habits */}
      {isLoading ? (
        <motion.div
          variants={itemVariants}
          className="flex justify-center py-16"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <Loader2 className="h-10 w-10 text-violet-500" />
          </motion.div>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-white/80 backdrop-blur-sm shadow-lg border-0 p-1 h-12">
              <TabsTrigger
                value="all"
                className="text-sm font-semibold px-6 py-2 text-gray-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                All ({filteredHabits.length})
              </TabsTrigger>
              <TabsTrigger
                value="daily"
                className="text-sm font-semibold px-6 py-2 text-gray-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                Daily
              </TabsTrigger>
              <TabsTrigger
                value="weekly"
                className="text-sm font-semibold px-6 py-2 text-gray-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                Weekly
              </TabsTrigger>
              <TabsTrigger
                value="monthly"
                className="text-sm font-semibold px-6 py-2 text-gray-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                Monthly
              </TabsTrigger>
            </TabsList>

            {["all", "daily", "weekly", "monthly"].map((type) => (
              <TabsContent key={type} value={type}>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {(type === "all"
                    ? filteredHabits
                    : categorizeHabits(type)
                  ).map((habit) => (
                    <motion.div key={habit._id} variants={itemVariants}>
                      <HabitCard
                        habit={habit}
                        completed={!!completedToday[habit._id]}
                        onToggleComplete={() => handleToggleComplete(habit._id)}
                        isLoading={!!isTracking[habit._id]}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      )}

      {/* Habit Form Modal */}
      {showHabitForm && (
        <HabitFormDialog open={showHabitForm} onOpenChange={setShowHabitForm} />
      )}
    </motion.div>
  );
}
