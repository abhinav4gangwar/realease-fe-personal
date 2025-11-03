"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"
import { PropertySection } from "../_components/notification-control-components/property-section"

import { apiClient } from "@/utils/api"
import { toast } from "sonner"

const NotificationControlsPage = () => {
  const [initialData, setInitialData] = useState<any>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const [allNotification, setAllNotification] = useState(false)
  const [scheduleSummary, setScheduleSummary] = useState(false)
  const [scheduleFrequency, setScheduleFrequency] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  const [propertyLifecycleEvents, setPropertyLifecycleEvents] = useState(false)
  const [propertyAdded, setPropertyAdded] = useState(false)
  const [propertyAddedOwnerEnabled, setPropertyAddedOwnerEnabled] = useState(false)
  const [propertyAddedLocationEnabled, setPropertyAddedLocationEnabled] = useState(false)
  const [propertyAddedOwners, setPropertyAddedOwners] = useState<string[]>([])
  const [propertyAddedLocations, setPropertyAddedLocations] = useState<string[]>([])

  const [propertyDeleted, setPropertyDeleted] = useState(false)
  const [propertyDeletedOwnerEnabled, setPropertyDeletedOwnerEnabled] = useState(false)
  const [propertyDeletedLocationEnabled, setPropertyDeletedLocationEnabled] = useState(false)
  const [propertyDeletedOwners, setPropertyDeletedOwners] = useState<string[]>([])
  const [propertyDeletedLocations, setPropertyDeletedLocations] = useState<string[]>([])

  const [propertyArchived, setPropertyArchived] = useState(false)
  const [propertyArchivedOwnerEnabled, setPropertyArchivedOwnerEnabled] = useState(false)
  const [propertyArchivedLocationEnabled, setPropertyArchivedLocationEnabled] = useState(false)
  const [propertyArchivedOwners, setPropertyArchivedOwners] = useState<string[]>([])
  const [propertyArchivedLocations, setPropertyArchivedLocations] = useState<string[]>([])

  const [collaborationComments, setCollaborationComments] = useState(false)
  const [assetLevelComment, setAssetLevelComment] = useState(false)
  const [documentLevelComment, setDocumentLevelComment] = useState(false)
  const [mentionNotifications, setMentionNotifications] = useState(false)

  const [legalStatusCompliance, setLegalStatusCompliance] = useState(false)
  const [legalStatusChange, setLegalStatusChange] = useState(false)
  const [caseStatusChange, setCaseStatusChange] = useState(false)
  const [hearingNotifyDays, setHearingNotifyDays] = useState('')

  // Fetch notification settings from API
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get('/notifications/settings')

        if (response.data.success && response.data.data) {
          loadData(response.data.data)
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('Failed to fetch notification settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotificationSettings()
  }, [])

  const loadData = (data: any) => {
    setAllNotification(data.allNotification)
    setScheduleSummary(data.scheduleSummary.enabled)
    setScheduleFrequency(data.scheduleSummary.frequency)
    setScheduleTime(data.scheduleSummary.time)

    setPropertyLifecycleEvents(data.propertyLifecycleEvents.enabled)
    setPropertyAdded(data.propertyLifecycleEvents.propertyAdded.enabled)
    setPropertyAddedOwnerEnabled(data.propertyLifecycleEvents.propertyAdded.ownerEnabled)
    setPropertyAddedLocationEnabled(data.propertyLifecycleEvents.propertyAdded.locationEnabled)
    setPropertyAddedOwners(data.propertyLifecycleEvents.propertyAdded.ownerExclusions || [])
    setPropertyAddedLocations(data.propertyLifecycleEvents.propertyAdded.locationExclusions || [])

    setPropertyDeleted(data.propertyLifecycleEvents.propertyDeleted.enabled)
    setPropertyDeletedOwnerEnabled(data.propertyLifecycleEvents.propertyDeleted.ownerEnabled)
    setPropertyDeletedLocationEnabled(data.propertyLifecycleEvents.propertyDeleted.locationEnabled)
    setPropertyDeletedOwners(data.propertyLifecycleEvents.propertyDeleted.ownerExclusions || [])
    setPropertyDeletedLocations(data.propertyLifecycleEvents.propertyDeleted.locationExclusions || [])

    setPropertyArchived(data.propertyLifecycleEvents.propertyArchived.enabled)
    setPropertyArchivedOwnerEnabled(data.propertyLifecycleEvents.propertyArchived.ownerEnabled)
    setPropertyArchivedLocationEnabled(data.propertyLifecycleEvents.propertyArchived.locationEnabled)
    setPropertyArchivedOwners(data.propertyLifecycleEvents.propertyArchived.ownerExclusions || [])
    setPropertyArchivedLocations(data.propertyLifecycleEvents.propertyArchived.locationExclusions || [])

    setLegalStatusCompliance(data.legalStatusCompliance.enabled)
    setLegalStatusChange(data.legalStatusCompliance.legalStatusChange)
    setCaseStatusChange(data.legalStatusCompliance.caseStatusChange)
    setHearingNotifyDays(data.legalStatusCompliance.hearingNotifyDays)

    setCollaborationComments(data.collaborationComments.enabled)
    setAssetLevelComment(data.collaborationComments.assetLevelComment)
    setDocumentLevelComment(data.collaborationComments.documentLevelComment)
    setMentionNotifications(data.collaborationComments.mentionNotifications)

    setInitialData(data)
  }

  // Check for changes - only after initial data is loaded
  useEffect(() => {
    if (!initialData || !isInitialized) return

    const currentData = {
      allNotification,
      scheduleSummary: {
        enabled: scheduleSummary,
        frequency: scheduleFrequency,
        time: scheduleTime
      },
      propertyLifecycleEvents: {
        enabled: propertyLifecycleEvents,
        propertyAdded: {
          enabled: propertyAdded,
          ownerEnabled: propertyAddedOwnerEnabled,
          ownerExclusions: propertyAddedOwners,
          locationEnabled: propertyAddedLocationEnabled,
          locationExclusions: propertyAddedLocations
        },
        propertyDeleted: {
          enabled: propertyDeleted,
          ownerEnabled: propertyDeletedOwnerEnabled,
          ownerExclusions: propertyDeletedOwners,
          locationEnabled: propertyDeletedLocationEnabled,
          locationExclusions: propertyDeletedLocations
        },
        propertyArchived: {
          enabled: propertyArchived,
          ownerEnabled: propertyArchivedOwnerEnabled,
          ownerExclusions: propertyArchivedOwners,
          locationEnabled: propertyArchivedLocationEnabled,
          locationExclusions: propertyArchivedLocations
        }
      },
      legalStatusCompliance: {
        enabled: legalStatusCompliance,
        legalStatusChange,
        caseStatusChange,
        hearingNotifyDays
      },
      collaborationComments: {
        enabled: collaborationComments,
        assetLevelComment,
        documentLevelComment,
        mentionNotifications
      }
    }

    const changed = JSON.stringify(currentData) !== JSON.stringify(initialData)
    setHasChanges(changed)
  }, [
    allNotification,
    scheduleSummary,
    scheduleFrequency,
    scheduleTime,
    propertyLifecycleEvents,
    propertyAdded,
    propertyAddedOwnerEnabled,
    propertyAddedLocationEnabled,
    propertyAddedOwners,
    propertyAddedLocations,
    propertyDeleted,
    propertyDeletedOwnerEnabled,
    propertyDeletedLocationEnabled,
    propertyDeletedOwners,
    propertyDeletedLocations,
    propertyArchived,
    propertyArchivedOwnerEnabled,
    propertyArchivedLocationEnabled,
    propertyArchivedOwners,
    propertyArchivedLocations,
    legalStatusCompliance,
    legalStatusChange,
    caseStatusChange,
    hearingNotifyDays,
    collaborationComments,
    assetLevelComment,
    documentLevelComment,
    mentionNotifications,
    initialData,
    isInitialized
  ])

  // All Notifications toggle effect
  useEffect(() => {
    if (!isInitialized) return

    if (allNotification) {
      setScheduleSummary(true)
      setPropertyLifecycleEvents(true)
      setCollaborationComments(true)
      setLegalStatusCompliance(true)
      setPropertyAdded(true)
      setPropertyDeleted(true)
      setPropertyArchived(true)
      setAssetLevelComment(true)
      setDocumentLevelComment(true)
      setMentionNotifications(true)
      setLegalStatusChange(true)
      setCaseStatusChange(true)
    } else {
      setScheduleSummary(false)
      setPropertyLifecycleEvents(false)
      setCollaborationComments(false)
      setLegalStatusCompliance(false)
      setPropertyAdded(false)
      setPropertyDeleted(false)
      setPropertyArchived(false)
      setAssetLevelComment(false)
      setDocumentLevelComment(false)
      setMentionNotifications(false)
      setLegalStatusChange(false)
      setCaseStatusChange(false)
    }
  }, [allNotification, isInitialized])

  const handleSave = async () => {
    const updatedData = {
      allNotification,
      scheduleSummary: {
        enabled: scheduleSummary,
        frequency: scheduleFrequency,
        time: scheduleTime
      },
      propertyLifecycleEvents: {
        enabled: propertyLifecycleEvents,
        propertyAdded: {
          enabled: propertyAdded,
          ownerEnabled: propertyAddedOwnerEnabled,
          ownerExclusions: propertyAddedOwners,
          locationEnabled: propertyAddedLocationEnabled,
          locationExclusions: propertyAddedLocations
        },
        propertyDeleted: {
          enabled: propertyDeleted,
          ownerEnabled: propertyDeletedOwnerEnabled,
          ownerExclusions: propertyDeletedOwners,
          locationEnabled: propertyDeletedLocationEnabled,
          locationExclusions: propertyDeletedLocations
        },
        propertyArchived: {
          enabled: propertyArchived,
          ownerEnabled: propertyArchivedOwnerEnabled,
          ownerExclusions: propertyArchivedOwners,
          locationEnabled: propertyArchivedLocationEnabled,
          locationExclusions: propertyArchivedLocations
        }
      },
      legalStatusCompliance: {
        enabled: legalStatusCompliance,
        legalStatusChange,
        caseStatusChange,
        hearingNotifyDays
      },
      collaborationComments: {
        enabled: collaborationComments,
        assetLevelComment,
        documentLevelComment,
        mentionNotifications
      }
    }

    try {
      const response = await apiClient.put('/notifications/settings', updatedData)
      
      if (response.data.success) {
        toast.success('Notification settings updated successfully')
        setInitialData(updatedData)
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error)
      toast.error('Failed to update notification settings')
    }
  }

  const handleCancel = () => {
    if (initialData) {
      loadData(initialData)
      setHasChanges(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading notification settings...</p>
      </div>
    )
  }

  return (
    <div>
      <div>
        {/* Save/Cancel Bar */}
        {hasChanges && (
          <div className="mb-6 flex items-center justify-between rounded-lg bg-white p-4 shadow-md">
            <p className="text-sm text-gray-600">You have unsaved changes</p>
            <div className="flex gap-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="rounded-md border-gray-300 px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="rounded-md bg-[#f16969] px-6 text-white hover:bg-[#e05555]"
              >
                Save
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-5 text-[#4E4F54]">
          {/* All Notifications */}
          <div className="flex items-center justify-between rounded-full border border-gray-300 bg-white p-5 shadow-md">
            <h1 className="text-lg">All Notifications</h1>
            <Switch
              checked={allNotification}
              onCheckedChange={setAllNotification}
              className="cursor-pointer"
            />
          </div>

          {/* Schedule Summary */}
          <div
            className={`${scheduleSummary ? 'rounded-xl' : 'rounded-full'} border border-gray-300 bg-white p-5 shadow-md`}
          >
            <div className="flex items-center justify-between pb-2">
              <h1 className="text-lg">Schedule Summary</h1>
              <Switch
                checked={scheduleSummary}
                onCheckedChange={setScheduleSummary}
                className="cursor-pointer"
              />
            </div>

            {scheduleSummary && (
              <div className="flex items-center justify-between border-t border-gray-300 py-6">
                <p>Select Frequency</p>
                <div className="flex gap-4">
                  <select
                    value={scheduleFrequency}
                    onChange={(e) => setScheduleFrequency(e.target.value)}
                    className="h-12 w-40 rounded-md border border-gray-300 px-3 text-[#4E4F54]"
                  >
                    <option value="">Select Frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <Input
                    className="h-12 w-40 rounded-md border border-gray-300 px-3 text-[#4E4F54]"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Property Lifecycle Events */}
          <div
            className={`${propertyLifecycleEvents ? 'rounded-xl' : 'rounded-full'} border border-gray-300 bg-white p-5 shadow-md`}
          >
            <div className="flex items-center justify-between pb-2">
              <h1 className="text-lg">Property Lifecycle Events</h1>
              <Switch
                checked={propertyLifecycleEvents}
                onCheckedChange={setPropertyLifecycleEvents}
                className="cursor-pointer"
              />
            </div>

            {propertyLifecycleEvents && (
              <div className="flex flex-col gap-8 border-t border-gray-300 py-6">
                <PropertySection
                  title="Property Added"
                  enabled={propertyAdded}
                  onToggle={setPropertyAdded}
                  ownerEnabled={propertyAddedOwnerEnabled}
                  onOwnerToggle={setPropertyAddedOwnerEnabled}
                  locationEnabled={propertyAddedLocationEnabled}
                  onLocationToggle={setPropertyAddedLocationEnabled}
                  ownerTags={propertyAddedOwners}
                  onOwnerTagsChange={setPropertyAddedOwners}
                  locationTags={propertyAddedLocations}
                  onLocationTagsChange={setPropertyAddedLocations}
                />
                <PropertySection
                  title="Property Deleted"
                  enabled={propertyDeleted}
                  onToggle={setPropertyDeleted}
                  ownerEnabled={propertyDeletedOwnerEnabled}
                  onOwnerToggle={setPropertyDeletedOwnerEnabled}
                  locationEnabled={propertyDeletedLocationEnabled}
                  onLocationToggle={setPropertyDeletedLocationEnabled}
                  ownerTags={propertyDeletedOwners}
                  onOwnerTagsChange={setPropertyDeletedOwners}
                  locationTags={propertyDeletedLocations}
                  onLocationTagsChange={setPropertyDeletedLocations}
                />
                <PropertySection
                  title="Property Archived"
                  enabled={propertyArchived}
                  onToggle={setPropertyArchived}
                  ownerEnabled={propertyArchivedOwnerEnabled}
                  onOwnerToggle={setPropertyArchivedOwnerEnabled}
                  locationEnabled={propertyArchivedLocationEnabled}
                  onLocationToggle={setPropertyArchivedLocationEnabled}
                  ownerTags={propertyArchivedOwners}
                  onOwnerTagsChange={setPropertyArchivedOwners}
                  locationTags={propertyArchivedLocations}
                  onLocationTagsChange={setPropertyArchivedLocations}
                />
              </div>
            )}
          </div>

          {/* Legal Status & Compliance */}
          <div
            className={`${legalStatusCompliance ? 'rounded-xl' : 'rounded-full'} border border-gray-300 bg-white p-5 shadow-md`}
          >
            <div className="flex items-center justify-between pb-2">
              <h1 className="text-lg">Legal Status & Compliance</h1>
              <Switch
                checked={legalStatusCompliance}
                onCheckedChange={setLegalStatusCompliance}
                className="cursor-pointer"
              />
            </div>

            {legalStatusCompliance && (
              <div className="flex flex-col gap-8 border-t border-gray-300 py-6">
                <div className="flex items-center justify-between">
                  <h1>Legal Status Change</h1>
                  <Switch
                    checked={legalStatusChange}
                    onCheckedChange={setLegalStatusChange}
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <h1>Case Status Change</h1>
                  <Switch
                    checked={caseStatusChange}
                    onCheckedChange={setCaseStatusChange}
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <h1>Hearing Date Approaching</h1>
                  <div className="flex items-center gap-3">
                    <label className="text-sm">Notify in</label>
                    <select
                      value={hearingNotifyDays}
                      onChange={(e) => setHearingNotifyDays(e.target.value)}
                      className="h-10 w-32 rounded-md border border-gray-300 px-3 text-sm text-[#4E4F54]"
                    >
                      <option value="1">1 day</option>
                      <option value="3">3 days</option>
                      <option value="5">5 days</option>
                      <option value="7">7 days</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Collaboration & Comments */}
          <div
            className={`${collaborationComments ? 'rounded-xl' : 'rounded-full'} border border-gray-300 bg-white p-5 shadow-md`}
          >
            <div className="flex items-center justify-between pb-2">
              <h1 className="text-lg">Collaboration & Comments</h1>
              <Switch
                checked={collaborationComments}
                onCheckedChange={setCollaborationComments}
                className="cursor-pointer"
              />
            </div>

            {collaborationComments && (
              <div className="flex flex-col gap-8 border-t border-gray-300 py-6">
                <div className="flex items-center justify-between">
                  <h1>Asset Level Comment</h1>
                  <Switch
                    checked={assetLevelComment}
                    onCheckedChange={setAssetLevelComment}
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <h1>Document Level Comment</h1>
                  <Switch
                    checked={documentLevelComment}
                    onCheckedChange={setDocumentLevelComment}
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <h1>Mention Notifications</h1>
                  <Switch
                    checked={mentionNotifications}
                    onCheckedChange={setMentionNotifications}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationControlsPage