import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const hearingData = {
  hearings: [
    {
      date: "Friday, 30 May",
      sessions: [
        {
          time: "10:00 AM",
          title: "Hearing 1",
          description: "Lorem Ipsum",
        },
        {
          time: "02:00 PM",
          title: "Hearing 2",
          description: "Lorem Ipsum",
        },
      ],
    },
    {
      date: "Saturday, 21 June",
      sessions: [
        {
          time: "11:00 AM",
          title: "Hearing 3",
          description: "Lorem Ipsum",
        },
      ],
    },
    {
      date: "Monday, 23 June",
      sessions: [
        {
          time: "09:00 AM",
          title: "Hearing 4",
          description: "Lorem Ipsum",
        },
        {
          time: "01:00 PM",
          title: "Hearing 5",
          description: "Lorem Ipsum",
        },
        {
          time: "03:30 PM",
          title: "Hearing 6",
          description: "Lorem Ipsum",
        },
      ],
    },
    {
      date: "Tuesday, 24 June",
      sessions: [
        {
          time: "10:30 AM",
          title: "Hearing 7",
          description: "Lorem Ipsum",
        },
      ],
    },
  ],
}

export const HearingDateWidget = () => {
  return (
    <Card className="w-full border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
        <CardTitle className="text-secondary h-2 pb-3 text-lg font-semibold mb-2">Upcoming Hearing Dates</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80 px-6 pb-6">
          <div className="space-y-6">
            {hearingData.hearings.map((day, dayIndex) => (
              <div key={dayIndex} className="space-y-3">
                <h3 className="font-medium text-secondary text-sm">{day.date}</h3>
                <div className="space-y-2">
                  {day.sessions.map((session, sessionIndex) => (
                    <div key={sessionIndex} className="flex items-start gap-4 bg-gray-100 rounded-lg p-3">
                      <div className="text-sm font-medium min-w-[60px]">{session.time}</div>
                      <div className="flex-1">
                        <div className="font-medium text-secondary text-sm">{session.title}</div>
                        <div className="text-sm text-gray-600">{session.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}


export const PreviewHearingDateWidget = () => {
  return (
    <Card className="w-full border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
        <CardTitle className="text-secondary h-2 pb-3 text-lg font-semibold mb-2">Upcoming Hearing Dates</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80 px-6 pb-6">
          <div className="space-y-6">
            {hearingData.hearings.map((day, dayIndex) => (
              <div key={dayIndex} className="space-y-3">
                <h3 className="font-medium text-secondary text-sm">{day.date}</h3>
                <div className="space-y-2">
                  {day.sessions.map((session, sessionIndex) => (
                    <div key={sessionIndex} className="flex items-start gap-4 bg-gray-100 rounded-lg p-3">
                      <div className="text-sm font-medium min-w-[60px]">{session.time}</div>
                      <div className="flex-1">
                        <div className="font-medium text-secondary text-sm">{session.title}</div>
                        <div className="text-sm text-gray-600">{session.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}



