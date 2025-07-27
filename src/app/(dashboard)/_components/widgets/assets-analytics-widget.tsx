import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

const assetData = [
  {
    city: 'Mumbai',
    percentage: 38,
    value: 380,
    color: '#A2CFE3',
  },
  {
    city: 'Bengaluru',
    percentage: 30,
    value: 300,
    color: '#F16F70',
  },
  {
    city: 'Hyderabad',
    percentage: 19,
    value: 190,
    color: '#C1B5E4',
  },
  {
    city: 'Delhi',
    percentage: 13,
    value: 130,
    color: '#5C9FAD',
  },
]
export const AssetsAnalyticsWidget = () => {
  return (
    <Card className="w-full border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-secondary mb-4 h-2 pb-3 text-lg font-semibold">
          Asset Location Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-10">
          {/* Donut Chart */}
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={287}>
              <PieChart>
                <Pie
                  data={assetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={140}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {assetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-4">
            <h3 className="text-md text-secondary mb-6 font-semibold">
              Assets by City
            </h3>
            <div className="space-y-4">
              {assetData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="h-4 w-8 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-col">
                    <span className="text-secondary">{item.city}</span>
                    <span className="text-sm text-gray-600">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const PreviewAssetsAnalyticsWidget = () => {
  return (
    <Card className="w-full border-gray-200 group relative">
      <div className="absolute inset-0 z-10 hidden items-center justify-center bg-[#5C9FAD]/25 text-[#5C9FAD] transition-opacity group-hover:flex">
        <Plus className="h-8 w-8 text-primary" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-secondary h-2 pb-3 text-sm
        font-semibold mb-4">
          Asset Location Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-10">
          {/* Donut Chart */}
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={assetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {assetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-4">
            <h3 className="text-sm text-secondary mb-6 font-semibold">
              Assets by City
            </h3>
            <div className="space-y-4">
              {assetData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="h-2 w-4 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-secondary text-sm">{item.city}</span>
                    <span className="text-sm text-gray-600">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
