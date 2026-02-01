'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'

interface ReferralTrendsChartProps {
   data: Array<{
     month: string
     sent: number
   }>
   period?: 'monthly' | 'weekly' | 'yearly'
   onPeriodChange?: (period: 'monthly' | 'weekly' | 'yearly') => void
 }
 
 export function ReferralTrendsChart({
   data,
   period = 'monthly',
   onPeriodChange = () => {},
 }: ReferralTrendsChartProps) {
   const safeData = data || []
 
   return (
     <Card className="border-gray-200/60 hover:shadow-lg transition-all duration-200">
       <CardHeader className="flex flex-row items-center justify-between pb-4">
         <div>
           <CardTitle className="text-lg font-semibold text-gray-900">Referral Trends</CardTitle>
           <p className="text-sm text-neutral-400 mt-1">Sent over time</p>
         </div>
         <select
           value={period}
           onChange={(event) => onPeriodChange(event.target.value as 'monthly' | 'weekly' | 'yearly')}
           className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
         >
           <option value="monthly">Monthly</option>
           <option value="weekly">Weekly</option>
           <option value="yearly">Yearly</option>
         </select>
       </CardHeader>
       <CardContent className="pt-0">
         {safeData.length > 0 ? (
           <ResponsiveContainer width="100%" height={320} className="ml-[-20px]">
             <AreaChart data={safeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
               <defs>
                 <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                   <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" opacity={0.5} />
               <XAxis
                 dataKey="month"
                 tick={{ fontSize: 12, fill: '#6b7280' }}
                 stroke="#d1d5db"
                 axisLine={false}
                 tickLine={false}
               />
               <YAxis
                 tick={{ fontSize: 12, fill: '#6b7280' }}
                 stroke="#d1d5db"
                 axisLine={false}
                 tickLine={false}
               />
               <Tooltip
                 contentStyle={{
                   backgroundColor: '#ffffff',
                   border: '1px solid #e5e7eb',
                   borderRadius: '8px',
                   boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                   fontSize: '14px',
                 }}
               />
               <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="rect" />
               <Area
                 type="monotone"
                 dataKey="sent"
                 name="Sent"
                 stroke="#10b981"
                 strokeWidth={2.5}
                 fill="url(#colorSent)"
               />
             </AreaChart>
           </ResponsiveContainer>
         ) : (
           <div className="h-[320px] flex items-center justify-center text-sm text-neutral-400 border-2 border-dashed border-gray-200 rounded-lg">
             <div className="text-center">
               <div className="text-neutral-300 text-4xl mb-2">📊</div>
               <p>No trend data available</p>
             </div>
           </div>
         )}
       </CardContent>
     </Card>
   )
 }
 
