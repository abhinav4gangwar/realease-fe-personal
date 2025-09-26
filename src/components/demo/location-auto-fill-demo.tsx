'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LocationInput } from '@/components/ui/location-input'
import { useState } from 'react'

/**
 * Demo component to test the location auto-fill functionality
 */
export function LocationAutoFillDemo() {
  const [country, setCountry] = useState('')
  const [zipcode, setZipcode] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  const handleReset = () => {
    setCountry('')
    setZipcode('')
    setCity('')
    setState('')
  }

  const testCases = [
    { country: 'United States', zipcode: '90210', expectedCity: 'Beverly Hills', expectedState: 'California' },
    { country: 'United States', zipcode: '10001', expectedCity: 'New York', expectedState: 'New York' },
    { country: 'Canada', zipcode: 'M5V 3L9', expectedCity: 'Toronto', expectedState: 'Ontario' },
    { country: 'Germany', zipcode: '10115', expectedCity: 'Berlin', expectedState: 'Berlin' },
  ]

  const handleTestCase = (testCase: typeof testCases[0]) => {
    setCountry(testCase.country)
    setZipcode(testCase.zipcode)
    setCity('')
    setState('')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Location Auto-Fill Demo</CardTitle>
          <CardDescription>
            Test the automatic city and state filling based on country and zipcode.
            Try entering a country and zipcode to see the magic happen!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LocationInput
            country={country}
            zipcode={zipcode}
            city={city}
            state={state}
            onCountryChange={setCountry}
            onZipcodeChange={setZipcode}
            onCityChange={setCity}
            onStateChange={setState}
            autoFill={true}
            showValidation={true}
          />

          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline">
              Reset Form
            </Button>
          </div>

          {/* Test Cases */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Cases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testCases.map((testCase, index) => (
                <Card key={index} className="cursor-pointer hover:bg-gray-50" onClick={() => handleTestCase(testCase)}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="font-medium">{testCase.country}</div>
                      <div className="text-sm text-gray-600">
                        Zipcode: <span className="font-mono">{testCase.zipcode}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Expected: {testCase.expectedCity}, {testCase.expectedState}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Current Values Display */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Values</h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-700">Country</div>
                <div className="text-sm text-gray-900">{country || 'Not set'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Zipcode</div>
                <div className="text-sm text-gray-900">{zipcode || 'Not set'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">City</div>
                <div className="text-sm text-gray-900">{city || 'Not set'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">State</div>
                <div className="text-sm text-gray-900">{state || 'Not set'}</div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">How to Test</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. <strong>Manual Testing:</strong> Enter a country name (e.g., "United States") and then a valid zipcode (e.g., "90210")</p>
              <p>2. <strong>Quick Testing:</strong> Click on any test case card above to auto-fill the country and zipcode</p>
              <p>3. <strong>Watch the Magic:</strong> After entering a valid zipcode, wait a moment and see the city and state auto-fill</p>
              <p>4. <strong>Validation:</strong> Try invalid zipcodes to see validation messages</p>
            </div>
          </div>

          {/* Supported Countries */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Supported Countries</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Primary Support:</strong> United States, Canada, Germany, France, Italy, Spain, Portugal, Netherlands, Belgium, Austria, Switzerland, Luxembourg</p>
              <p><strong>Limited Support:</strong> India (via PostalPincode API)</p>
              <p><strong>Note:</strong> The system will attempt to lookup any country, but results may vary based on API coverage.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
