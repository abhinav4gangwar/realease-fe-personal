import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const RecentACtivityWidget = () => {
  const recentActivities = [
    {
      user: 'User 1',
      action: 'added a document',
      item: 'Lorem Ipsum',
      link: true,
    },
    {
      user: 'User 3',
      action: 'commented on report',
      item: 'Lorem Ipsum',
      link: true,
    },
    { user: 'User 1', action: 'added a property', item: '', link: false },
    {
      user: 'User 2',
      action: 'updated property details',
      item: 'Property ABC',
      link: true,
    },
    {
      user: 'User 4',
      action: 'uploaded document',
      item: 'Contract.pdf',
      link: true,
    },
    {
      user: 'User 1',
      action: 'created new report',
      item: 'Monthly Report',
      link: true,
    },
    {
      user: 'User 5',
      action: 'added a comment',
      item: 'Review needed',
      link: false,
    },
    {
      user: 'User 3',
      action: 'deleted document',
      item: 'Old Contract',
      link: false,
    },
    {
      user: 'User 2',
      action: 'modified property',
      item: 'Property XYZ',
      link: true,
    },
    {
      user: 'User 6',
      action: 'shared report',
      item: 'Analytics Report',
      link: true,
    },
    {
      user: 'User 1',
      action: 'archived property',
      item: 'Property 123',
      link: true,
    },
    {
      user: 'User 4',
      action: 'added new tenant',
      item: 'John Doe',
      link: true,
    },
  ]

  return (
    <Card className="w-full border-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold h-2 text-secondary">
          Recent Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="h-24 space-y-1 overflow-y-auto">
        {recentActivities.map((activity, index) => (
          <div key={index} className="py-1 text-sm text-gray-600">
            <span className="font-medium">{activity.user}</span>
            <span> {activity.action} </span>
            {activity.link ? (
              <span className="cursor-pointer text-[#5C9FAD] hover:text-blue-800 font-semibold pl-1">
                {activity.item}
              </span>
            ) : (
              <span>{activity.item}</span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default RecentACtivityWidget
