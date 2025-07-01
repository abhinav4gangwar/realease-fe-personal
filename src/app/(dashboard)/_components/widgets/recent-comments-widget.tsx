import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const recentComment = [
  {
    user: 'User 1',
    action: 'commented on document',
    item: 'Lorem ipsum',
    comment: 'Lorem ipsum dolor sit amet.',
  },
  {
    user: 'User 2',
    action: 'commented on report',
    item: 'Lorem ipsum',
    comment: 'Lorem ipsum dolor sit amet.',
  },
  {
    user: 'User 3',
    action: 'commented on document',
    item: 'Lorem ipsum',
    comment: 'Lorem ipsum dolor sit amet.',
  },
  {
    user: 'User 4',
    action: 'commented on report',
    item: 'Lorem ipsum',
    comment: 'Lorem ipsum dolor sit amet.',
  },
  {
    user: 'User 5',
    action: 'commented on document',
    item: 'Lorem ipsum',
    comment: 'Lorem ipsum dolor sit amet.',
  },
  {
    user: 'User 6',
    action: 'commented on report',
    item: 'Lorem ipsum',
    comment: 'Lorem ipsum dolor sit amet.',
  },
  {
    user: 'User 7',
    action: 'commented on document',
    item: 'Lorem ipsum',
    comment: 'Lorem ipsum dolor sit amet.',
  },
  {
    user: 'User 8',
    action: 'commented on report',
    item: 'Lorem ipsum',
    comment: 'Lorem ipsum dolor sit amet.',
  },
  {
    user: 'User 9',
    action: 'commented on document',
    item: 'Lorem ipsum',
    comment: 'Lorem ipsum dolor sit amet.',
  },
  {
    user: 'User 10',
    action: 'commented on report',
    item: 'Lorem ipsum',
    comment: 'Lorem ipsum dolor sit amet.',
  },
]

export const RecentCommentWidget = () => {
  return (
    <Card className="w-full border-none">
      <CardHeader>
        <CardTitle className="text-secondary h-2 text-lg font-semibold">
          Recent Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="h-24 space-y-1 overflow-y-auto">
        {recentComment.map((activity, index) => (
          <div key={index} className="py-1 text-sm text-gray-600">
            <span className="font-medium">{activity.user}</span>
            <span> {activity.action} </span>
            {activity.item ? (
              <span>
                <span className="cursor-pointer pl-1 font-semibold text-[#5C9FAD] hover:text-blue-800">
                  {activity.item}
                </span>
                <span className="text-primary cursor-pointer pl-1 font-semibold">
                  {activity.comment}
                </span>
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

export const PreviewRecentCommentWidget = () => {
  return (
    <Card className="w-full border-gray-300">
      <CardHeader>
        <CardTitle className="text-secondary h-2 text-sm font-semibold">
          Recent Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="h-20 space-y-1 overflow-y-auto">
        {recentComment.map((activity, index) => (
          <div key={index} className=" text-[12px] text-gray-600">
            <span className="font-medium">{activity.user}</span>
            <span> {activity.action} </span>
            {activity.item ? (
              <span>
                <span className="cursor-pointer pl-1 font-semibold text-[#5C9FAD] hover:text-blue-800">
                  {activity.item}
                </span>
                <span className="text-primary cursor-pointer pl-1 font-semibold">
                  {activity.comment}
                </span>
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
