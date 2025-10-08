"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { NOTIFICATION_DUMMY_API_RESPONSE } from "@/lib/notification-dummy"
import { useEffect, useState } from "react"
import { PropertySection } from "../_components/notification-control-components/property-section"

const NotificationControlsPage = () => {
  const [initialData, setInitialData] = useState(NOTIFICATION_DUMMY_API_RESPONSE)
  const [hasChanges, setHasChanges] = useState(false)

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

  const [systemDataIntegrity, setSystemDataIntegrity] = useState(false)

  const [legalStatusCompliance, setLegalStatusCompliance] = useState(false)
  const [legalStatusChange, setLegalStatusChange] = useState(false)
  const [caseStatusChange, setCaseStatusChange] = useState(false)
  const [hearingNotifyDays, setHearingNotifyDays] = useState('')

  // Load initial data
  useEffect(() => {
    loadData(NOTIFICATION_DUMMY_API_RESPONSE)
  }, [])

  const loadData = (data: typeof NOTIFICATION_DUMMY_API_RESPONSE) => {
    setAllNotification(data.allNotification)
    setScheduleSummary(data.scheduleSummary.enabled)
    setScheduleFrequency(data.scheduleSummary.frequency)
    setScheduleTime(data.scheduleSummary.time)

    setPropertyLifecycleEvents(data.propertyLifecycleEvents.enabled)
    setPropertyAdded(data.propertyLifecycleEvents.propertyAdded.enabled)
    setPropertyAddedOwnerEnabled(data.propertyLifecycleEvents.propertyAdded.ownerEnabled)
    setPropertyAddedLocationEnabled(data.propertyLifecycleEvents.propertyAdded.locationEnabled)
    setPropertyAddedOwners(data.propertyLifecycleEvents.propertyAdded.owners)
    setPropertyAddedLocations(data.propertyLifecycleEvents.propertyAdded.locations)

    setPropertyDeleted(data.propertyLifecycleEvents.propertyDeleted.enabled)
    setPropertyDeletedOwnerEnabled(data.propertyLifecycleEvents.propertyDeleted.ownerEnabled)
    setPropertyDeletedLocationEnabled(data.propertyLifecycleEvents.propertyDeleted.locationEnabled)
    setPropertyDeletedOwners(data.propertyLifecycleEvents.propertyDeleted.owners)
    setPropertyDeletedLocations(data.propertyLifecycleEvents.propertyDeleted.locations)

    setPropertyArchived(data.propertyLifecycleEvents.propertyArchived.enabled)
    setPropertyArchivedOwnerEnabled(data.propertyLifecycleEvents.propertyArchived.ownerEnabled)
    setPropertyArchivedLocationEnabled(data.propertyLifecycleEvents.propertyArchived.locationEnabled)
    setPropertyArchivedOwners(data.propertyLifecycleEvents.propertyArchived.owners)
    setPropertyArchivedLocations(data.propertyLifecycleEvents.propertyArchived.locations)

    setLegalStatusCompliance(data.legalStatusCompliance.enabled)
    setLegalStatusChange(data.legalStatusCompliance.legalStatusChange)
    setCaseStatusChange(data.legalStatusCompliance.caseStatusChange)
    setHearingNotifyDays(data.legalStatusCompliance.hearingNotifyDays)

    setCollaborationComments(data.collaborationComments.enabled)
    setAssetLevelComment(data.collaborationComments.assetLevelComment)
    setDocumentLevelComment(data.collaborationComments.documentLevelComment)

    setSystemDataIntegrity(data.systemDataIntegrity.enabled)
    setInitialData(data)
  }

  // Check for changes
  useEffect(() => {
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
          owners: propertyAddedOwners,
          locationEnabled: propertyAddedLocationEnabled,
          locations: propertyAddedLocations
        },
        propertyDeleted: {
          enabled: propertyDeleted,
          ownerEnabled: propertyDeletedOwnerEnabled,
          owners: propertyDeletedOwners,
          locationEnabled: propertyDeletedLocationEnabled,
          locations: propertyDeletedLocations
        },
        propertyArchived: {
          enabled: propertyArchived,
          ownerEnabled: propertyArchivedOwnerEnabled,
          owners: propertyArchivedOwners,
          locationEnabled: propertyArchivedLocationEnabled,
          locations: propertyArchivedLocations
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
        documentLevelComment
      },
      systemDataIntegrity: {
        enabled: systemDataIntegrity
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
    systemDataIntegrity,
    initialData
  ])

  // All Notifications toggle effect
  useEffect(() => {
    if (allNotification) {
      setScheduleSummary(true)
      setPropertyLifecycleEvents(true)
      setCollaborationComments(true)
      setSystemDataIntegrity(true)
      setLegalStatusCompliance(true)
      setPropertyAdded(true)
      setPropertyDeleted(true)
      setPropertyArchived(true)
      setAssetLevelComment(true)
      setDocumentLevelComment(true)
      setLegalStatusChange(true)
      setCaseStatusChange(true)
    }
  }, [allNotification])

  const handleSave = () => {
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
          owners: propertyAddedOwners,
          locationEnabled: propertyAddedLocationEnabled,
          locations: propertyAddedLocations
        },
        propertyDeleted: {
          enabled: propertyDeleted,
          ownerEnabled: propertyDeletedOwnerEnabled,
          owners: propertyDeletedOwners,
          locationEnabled: propertyDeletedLocationEnabled,
          locations: propertyDeletedLocations
        },
        propertyArchived: {
          enabled: propertyArchived,
          ownerEnabled: propertyArchivedOwnerEnabled,
          owners: propertyArchivedOwners,
          locationEnabled: propertyArchivedLocationEnabled,
          locations: propertyArchivedLocations
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
        documentLevelComment
      },
      systemDataIntegrity: {
        enabled: systemDataIntegrity
      }
    }

    console.log('PUT Request - Updated Notification Settings:', updatedData)
    setInitialData(updatedData)
    setHasChanges(false)
  }

  const handleCancel = () => {
    loadData(initialData)
    setHasChanges(false)
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
              </div>
            )}
          </div>

          {/* System Data & Integrity */}
          <div
            className={`${systemDataIntegrity ? 'rounded-xl' : 'rounded-full'} border border-gray-300 bg-white p-5 shadow-md`}
          >
            <div className="flex items-center justify-between pb-2">
              <h1 className="text-lg">System Data & Integrity</h1>
              <Switch
                checked={systemDataIntegrity}
                onCheckedChange={setSystemDataIntegrity}
                className="cursor-pointer"
              />
            </div>

            {systemDataIntegrity && (
              <div className="border-t border-gray-300 py-6">
                <h1>Bulk Upload Complete/Failed</h1>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationControlsPage