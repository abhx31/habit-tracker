import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { API_URL } from "../config"
import { Loader2, Trophy} from "lucide-react"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { toast } from "sonner"
import axios from 'axios'
import { FaCrown, FaMedal, FaTrophy } from 'react-icons/fa'
import * as Avatar from '@radix-ui/react-avatar'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

interface UserStats {
    userId: string
    userName: string
    totalHabits: number
    totalCompletions: number
    earnedBadges: Array<{
        habitId: string
        badge: string
        dateEarned: string
    }>
    mostConsistentHabit: {
        habitId: string
        habitName: string
        badge: string | null
        completionRate: string
    } | null
    longestStreakHabit: {
        habitId: string
        habitName: string
        badge: string | null
        maxStreak: number
    } | null
}

interface LeaderboardResponse {
    users: UserStats[]
    total: number
    page: number
    totalPages: number
}

const getBadgeImage = (badge: string) => {
    const badgeMap: { [key: string]: string } = {
        "Bronze": "/src/assets/badges/bronze.png",
        "Silver": "/src/assets/badges/silver.png",
        "Gold": "/src/assets/badges/gold.png",
        "Diamond": "/src/assets/badges/diamond.png",
        "Ace": "/src/assets/badges/ace.png",
        "Overachiever": "/src/assets/badges/over-achiever.png"
    }
    return badgeMap[badge] || ""
}

export default function LeaderBoard() {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null)
    const [userRank, setUserRank] = useState<number | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        
        const token = localStorage.getItem("token")
        if (!token) {
            setError("Authentication required")
            setLoading(false)
            return
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        try {
            const [leaderboardRes, rankRes] = await Promise.all([
                axios.get(`${API_URL}/track/leaderboard?page=${currentPage}`, config),
                axios.get(`${API_URL}/track/user-rank`, config)
            ])

            setLeaderboardData(leaderboardRes.data)
            setUserRank(rankRes.data.rank)
        } catch (err) {
            console.error("Error fetching data:", err)
            const message = err instanceof Error ? err.message : "Failed to fetch data"
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [currentPage])


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 className="h-8 w-8 text-violet-500" />
                </motion.div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="text-red-500 text-xl mb-4">{error}</div>
                <Button 
                    onClick={fetchData}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container mx-auto px-4 py-8 max-w-7xl"
        >

            {/* Your Rank Card */}
            {userRank && (
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8"
                >
                    <Card className="p-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Trophy className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-white/80">Your Current Rank</p>
                                    <h2 className="text-3xl font-bold">#{userRank}</h2>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white/80">Keep going!</p>
                                <p className="text-sm text-white/60">
                                    {userRank === 1 
                                        ? "You're at the top!" 
                                        : `${userRank - 1} more rank${userRank - 1 > 1 ? 's' : ''} to reach the top`}
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Top 3 Podium */}
            {leaderboardData && leaderboardData.users.length > 0 && currentPage === 1 && (
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-12"
                >
                    <Card className="p-8 border-0 shadow-lg bg-gradient-to-b from-white to-gray-50">
                        <h3 className="text-lg font-semibold mb-6 text-center">Top Performers</h3>
                        <div className="flex justify-center items-end space-x-4 md:space-x-8">
                            {/* Second Place */}
                            {leaderboardData.users[1] && (
                                <motion.div
                                    initial={{ y: 20 }}
                                    animate={{ y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="w-24 md:w-32 text-center"
                                >
                                    <motion.div 
                                        whileHover={{ y: -5 }}
                                        className="relative"
                                    >
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <FaMedal size="2em" color="#9CA3AF" />
                                        </div>
                                        <div className="pt-8">
                                            <Avatar.Root className="mx-auto mb-2">
                                                <Avatar.Image
                                                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${leaderboardData.users[1].userName}`}
                                                    alt="Avatar"
                                                    className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-200"
                                                />
                                                <Avatar.Fallback className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    {leaderboardData.users[1].userName.charAt(0)}
                                                </Avatar.Fallback>
                                            </Avatar.Root>
                                            <div className="font-semibold truncate">{leaderboardData.users[1].userName}</div>
                                            <div className="text-sm text-gray-500">{leaderboardData.users[1].totalCompletions} completions</div>
                                        </div>
                                        <div className="h-24 bg-gradient-to-t from-gray-200 to-white rounded-t-lg mt-2" />
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* First Place */}
                            {leaderboardData.users[0] && (
                                <motion.div
                                    initial={{ y: 20 }}
                                    animate={{ y: 0 }}
                                    className="w-28 md:w-36 text-center z-10"
                                >
                                    <motion.div 
                                        whileHover={{ y: -5 }}
                                        className="relative"
                                    >
                                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                                            <FaCrown size="2.5em" color="#FCD34D" />
                                        </div>
                                        <div className="pt-8">
                                            <Avatar.Root className="mx-auto mb-2">
                                                <Avatar.Image
                                                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${leaderboardData.users[0].userName}`}
                                                    alt="Avatar"
                                                    className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-yellow-400 shadow-lg"
                                                />
                                                <Avatar.Fallback className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                                    {leaderboardData.users[0].userName.charAt(0)}
                                                </Avatar.Fallback>
                                            </Avatar.Root>
                                            <div className="font-bold text-lg truncate">{leaderboardData.users[0].userName}</div>
                                            <div className="text-sm text-gray-500">{leaderboardData.users[0].totalCompletions} completions</div>
                                        </div>
                                        <div className="h-32 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-lg mt-2" />
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* Third Place */}
                            {leaderboardData.users[2] && (
                                <motion.div
                                    initial={{ y: 20 }}
                                    animate={{ y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="w-24 md:w-32 text-center"
                                >
                                    <motion.div 
                                        whileHover={{ y: -5 }}
                                        className="relative"
                                    >
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <FaTrophy size="2em" color="#B45309" />
                                        </div>
                                        <div className="pt-8">
                                            <Avatar.Root className="mx-auto mb-2">
                                                <Avatar.Image
                                                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${leaderboardData.users[2].userName}`}
                                                    alt="Avatar"
                                                    className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-amber-700"
                                                />
                                                <Avatar.Fallback className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                                                    {leaderboardData.users[2].userName.charAt(0)}
                                                </Avatar.Fallback>
                                            </Avatar.Root>
                                            <div className="font-semibold truncate">{leaderboardData.users[2].userName}</div>
                                            <div className="text-sm text-gray-500">{leaderboardData.users[2].totalCompletions} completions</div>
                                        </div>
                                        <div className="h-20 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg mt-2" />
                                    </motion.div>
                                </motion.div>
                            )}
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Leaderboard Table */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="overflow-hidden bg-white shadow-xl border-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badges</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Best Streak</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {leaderboardData?.users.map((user, index) => (
                                    <motion.tr
                                        key={user.userId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`hover:bg-gray-50/50 backdrop-blur-sm transition-colors ${
                                            user.userId === user?.userId ? "bg-violet-50/50" : ""
                                        }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                                    {((currentPage - 1) * 10) + index + 1}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Avatar.Root>
                                                    <Avatar.Image
                                                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.userName}`}
                                                        alt="Avatar"
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <Avatar.Fallback className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                                                        {user.userName.charAt(0)}
                                                    </Avatar.Fallback>
                                                </Avatar.Root>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">{user.totalCompletions} completions</div>
                                                <div className="text-gray-500">{user.totalHabits} habits</div>
                                                {user.mostConsistentHabit && (
                                                    <div className="text-xs text-violet-600">
                                                        Best: {user.mostConsistentHabit.habitName}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <motion.div 
                                                className="flex space-x-2"
                                                initial="hidden"
                                                animate="visible"
                                                variants={{
                                                    visible: {
                                                        transition: {
                                                            staggerChildren: 0.1
                                                        }
                                                    }
                                                }}
                                            >
                                                {user.earnedBadges.map((badge, i) => (
                                                    <TooltipPrimitive.Provider key={i}>
                                                        <TooltipPrimitive.Root>
                                                            <TooltipPrimitive.Trigger asChild>
                                                                <motion.img
                                                                    src={getBadgeImage(badge.badge)}
                                                                    alt={badge.badge}
                                                                    className="w-8 h-8 hover:scale-125 transition-transform cursor-help"
                                                                    variants={{
                                                                        hidden: { scale: 0, opacity: 0 },
                                                                        visible: { scale: 1, opacity: 1 }
                                                                    }}
                                                                />
                                                            </TooltipPrimitive.Trigger>
                                                            <TooltipPrimitive.Portal>
                                                                <TooltipPrimitive.Content
                                                                    className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm"
                                                                    sideOffset={5}
                                                                >
                                                                    {badge.badge}
                                                                    <TooltipPrimitive.Arrow className="fill-gray-900" />
                                                                </TooltipPrimitive.Content>
                                                            </TooltipPrimitive.Portal>
                                                        </TooltipPrimitive.Root>
                                                    </TooltipPrimitive.Provider>
                                                ))}
                                            </motion.div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.longestStreakHabit && (
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">{user.longestStreakHabit.maxStreak} days</div>
                                                    <div className="text-gray-500">{user.longestStreakHabit.habitName}</div>
                                                </div>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>

            {/* Pagination */}
            {leaderboardData && leaderboardData.totalPages > 1 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 flex justify-center space-x-2"
                >
                    <Button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        className="hover:bg-violet-50"
                    >
                        Previous
                    </Button>
                    <span className="px-4 py-2 text-gray-700">
                        Page {currentPage} of {leaderboardData.totalPages}
                    </span>
                    <Button
                        onClick={() => setCurrentPage(prev => Math.min(leaderboardData.totalPages, prev + 1))}
                        disabled={currentPage === leaderboardData.totalPages}
                        variant="outline"
                        className="hover:bg-violet-50"
                    >
                        Next
                    </Button>
                </motion.div>
            )}
        </motion.div>
    )
}