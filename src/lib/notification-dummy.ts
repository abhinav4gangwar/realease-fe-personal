export const NOTIFICATION_DUMMY_API_RESPONSE = {
  allNotification: false,
  scheduleSummary: {
    enabled: true,
    frequency: 'daily',
    time: '10:30:00'
  },
  propertyLifecycleEvents: {
    enabled: true,
    propertyAdded: {
      enabled: true,
      ownerEnabled: true,
      owners: ['John Doe', 'Jane Smith'],
      locationEnabled: false,
      locations: []
    },
    propertyDeleted: {
      enabled: false,
      ownerEnabled: false,
      owners: [],
      locationEnabled: false,
      locations: []
    },
    propertyArchived: {
      enabled: true,
      ownerEnabled: false,
      owners: [],
      locationEnabled: true,
      locations: ['New York', 'Los Angeles']
    }
  },
  legalStatusCompliance: {
    enabled: true,
    legalStatusChange: true,
    caseStatusChange: false,
    hearingNotifyDays: '7'
  },
  collaborationComments: {
    enabled: false,
    assetLevelComment: false,
    documentLevelComment: false
  },
  systemDataIntegrity: {
    enabled: true
  }
}