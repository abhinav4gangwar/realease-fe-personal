import { NextRequest, NextResponse } from 'next/server'
import { chromium } from 'playwright'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max

export async function POST(request: NextRequest) {
  console.log('[eCourt API] ========================================')
  console.log('[eCourt API] Starting eCourt automation process...')
  console.log('[eCourt API] ========================================')

  let browser = null

  try {
    // Launch browser in headed mode so user can see and interact
    console.log('[eCourt API] Step 1: Launching Chromium browser...')
    browser = await chromium.launch({
      headless: false, // Show the browser window
      slowMo: 500, // Slow down operations by 500ms for visibility
    })
    console.log('[eCourt API] ✓ Browser launched successfully')

    // Create a new page
    console.log('[eCourt API] Step 2: Creating new browser page...')
    const page = await browser.newPage()
    console.log('[eCourt API] ✓ Page created')

    // Navigate to eCourt website
    console.log('[eCourt API] Step 3: Navigating to eCourt website...')
    console.log(
      '[eCourt API] URL: https://services.ecourts.gov.in/ecourtindia_v6/'
    )
    await page.goto('https://services.ecourts.gov.in/ecourtindia_v6/', {
      waitUntil: 'networkidle',
      timeout: 60000,
    })
    console.log('[eCourt API] ✓ Page loaded successfully')

    // Wait a bit for page to fully render
    console.log(
      '[eCourt API] Step 4: Waiting for page to fully render (2 seconds)...'
    )
    await page.waitForTimeout(2000)
    console.log('[eCourt API] ✓ Page rendered')

    // Step 1: Click the left pane menu with id 'leftPaneMenuCS' with robust handling
    console.log(
      '[eCourt API] Step 5: Looking for left pane menu button (id: leftPaneMenuCS)...'
    )
    try {
      const leftPaneMenu = page.locator('#leftPaneMenuCS')
      const isLeftPaneVisible = await leftPaneMenu.isVisible({ timeout: 5000 }).catch(() => false)

      if (isLeftPaneVisible) {
        console.log('[eCourt API] ✓ Found left pane menu button')
        console.log('[eCourt API] Step 6: Clicking left pane menu button...')
        await leftPaneMenu.click({ force: true })
        console.log('[eCourt API] ✓ Left pane menu clicked')

        // Wait for popup to appear
        console.log(
          '[eCourt API] Step 7: Waiting for popup to appear (2 seconds)...'
        )
        await page.waitForTimeout(2000)
        console.log('[eCourt API] ✓ Popup should be visible now')
      } else {
        console.log('[eCourt API] ⚠ Left pane menu button not visible, trying scroll and click...')
        // Try scrolling into view and clicking
        await leftPaneMenu.scrollIntoViewIfNeeded().catch(() => {})
        await page.waitForTimeout(500)
        await leftPaneMenu.click({ force: true }).catch(() => {
          console.log('[eCourt API] ⚠ Could not click left pane menu')
        })
      }
    } catch (error) {
      console.log('[eCourt API] ⚠ Error with left pane menu, continuing...')
    }

    // Step 2: Close the first popup - try multiple approaches for robustness
    console.log('[eCourt API] Step 8: Looking for close button...')
    try {
      // Wait a moment for modal to be fully visible
      await page.waitForTimeout(500)
      
      // Try different selectors for the close button
      const closeSelectors = [
        '#validateError button.btn-close',
        '.modal.show button.btn-close',
        'button.btn-close[data-bs-dismiss="modal"]',
        '.modal-dialog button.btn-close',
        '#validateError .btn-close'
      ]
      
      let closeButtonClicked = false
      
      for (const selector of closeSelectors) {
        try {
          const closeButton = page.locator(selector)
          const isVisible = await closeButton.isVisible({ timeout: 1000 }).catch(() => false)
          
          if (isVisible) {
            console.log(`[eCourt API] ✓ Found close button with selector: ${selector}`)
            console.log('[eCourt API] Step 9: Clicking close button...')
            await closeButton.click({ force: true, timeout: 2000 })
            console.log('[eCourt API] ✓ First popup closed')
            closeButtonClicked = true
            break
          }
        } catch {
          // Continue to next selector
        }
      }
      
      // If no close button found, try pressing Escape key to close modal
      if (!closeButtonClicked) {
        console.log('[eCourt API] ⚠ Close button not visible, trying Escape key...')
        await page.keyboard.press('Escape')
        console.log('[eCourt API] ✓ Pressed Escape key')
      }
    } catch (error) {
      console.log('[eCourt API] ⚠ Could not close popup, continuing anyway...')
    }

    // Wait after closing
    console.log(
      '[eCourt API] Step 10: Waiting after closing popup (1 second)...'
    )
    await page.waitForTimeout(1000)

    // Step 3: Click the case number tab menu with robust handling
    console.log(
      '[eCourt API] Step 11: Looking for case number tab (id: casenumber-tabMenu)...'
    )
    try {
      const caseNumberTab = page.locator('#casenumber-tabMenu')
      const isTabVisible = await caseNumberTab.isVisible({ timeout: 3000 }).catch(() => false)

      if (isTabVisible) {
        console.log('[eCourt API] ✓ Found case number tab')
        console.log('[eCourt API] Step 12: Clicking case number tab...')
        await caseNumberTab.click({ force: true })
        console.log('[eCourt API] ✓ Case number tab clicked')

        // Wait for page to load after clicking tab
        console.log(
          '[eCourt API] Step 13: Waiting for page to load (2 seconds)...'
        )
        await page.waitForTimeout(2000)
        
        // Try to close any popup that appears after clicking the tab
        console.log('[eCourt API] Step 14: Checking for any popup after tab click...')
        await page.waitForTimeout(500)
        
        // Try to close any modal that might have appeared
        try {
          const modalCloseSelectors = [
            '.modal.show button.btn-close',
            '.modal.show .btn-secondary',
            '.modal.show button:has-text("OK")',
            '.modal.show button:has-text("Close")'
          ]
          
          for (const selector of modalCloseSelectors) {
            const modalClose = page.locator(selector).first()
            const isModalVisible = await modalClose.isVisible({ timeout: 500 }).catch(() => false)
            
            if (isModalVisible) {
              console.log(`[eCourt API] ✓ Found modal close with selector: ${selector}`)
              await modalClose.click({ force: true, timeout: 2000 })
              console.log('[eCourt API] ✓ Modal closed')
              break
            }
          }
        } catch {
          // No modal to close, continue
        }
      } else {
        console.log('[eCourt API] ⚠ Case number tab not visible')
      }
    } catch (error) {
      console.log('[eCourt API] ⚠ Error with case number tab, continuing...')
    }

    console.log('[eCourt API] ========================================')
    console.log('[eCourt API] ✓ Automated actions completed!')
    console.log('[eCourt API] User can now manually fill the form')
    console.log('[eCourt API] Monitoring for CNR number...')
    console.log('[eCourt API] ========================================')

    // Monitor for CNR number and case details
    let cnrNumber: string | null = null
    let caseType: string | null = null
    let legalStatus: string | null = null
    let nextHearing: string | null = null
    let attempts = 0
    const maxAttempts = 300 // 5 minutes (300 * 1 second)

    console.log('[eCourt API] Step 17: Starting CNR monitoring loop...')

    while (!cnrNumber && attempts < maxAttempts) {
      attempts++

      if (attempts % 10 === 0) {
        console.log(
          `[eCourt API] Monitoring... (attempt ${attempts}/${maxAttempts})`
        )
      }

      // Look for CNR number
      const cnrLabel = await page.locator('label:has-text("CNR Number")')
      const cnrLabelExists = (await cnrLabel.count()) > 0

      if (cnrLabelExists) {
        console.log('[eCourt API] ✓ Found CNR Number label!')

        // Find the parent row and get the CNR value
        const cnrRow = cnrLabel.locator('xpath=ancestor::tr')
        const cnrSpan = await cnrRow.locator('.text-danger').first()
        const cnrSpanExists = (await cnrSpan.count()) > 0

        if (cnrSpanExists) {
          cnrNumber = await cnrSpan.textContent()
          cnrNumber = cnrNumber?.trim() || null

          if (cnrNumber) {
            console.log('[eCourt API] ========================================')
            console.log('[eCourt API] ✓✓✓ CNR NUMBER EXTRACTED! ✓✓✓')
            console.log(`[eCourt API] CNR: ${cnrNumber}`)
            console.log('[eCourt API] ========================================')

            // Extract additional case details from the tables
            console.log('[eCourt API] Extracting additional case details...')

            // Extract Case Type from case_details_table
            try {
              const caseDetailsTable = page.locator('table.case_details_table')
              const caseTypeRow = caseDetailsTable.locator(
                'tr:has(td:has-text("Case Type"))'
              )
              const caseTypeExists = (await caseTypeRow.count()) > 0

              if (caseTypeExists) {
                const caseTypeCell = await caseTypeRow
                  .locator('td.fw-bold.text-uppercase')
                  .first()
                const caseTypeText = await caseTypeCell.textContent()
                caseType = caseTypeText?.trim() || null
                console.log(`[eCourt API] ✓ Case Type: ${caseType}`)
              }
            } catch (error) {
              console.log('[eCourt API] ⚠ Could not extract Case Type')
            }

            // Extract Case Status and Next Hearing from case_status_table
            try {
              const caseStatusTable = page.locator('table.case_status_table')

              // Extract Case Status
              const caseStatusRow = caseStatusTable.locator(
                'tr:has(td:has(label:has-text("Case Status")))'
              )
              const caseStatusExists = (await caseStatusRow.count()) > 0

              if (caseStatusExists) {
                const caseStatusCell = await caseStatusRow
                  .locator('td strong')
                  .last()
                const caseStatusText = await caseStatusCell.textContent()
                legalStatus = caseStatusText?.trim() || null
                console.log(`[eCourt API] ✓ Legal Status: ${legalStatus}`)
              }

              // Extract First Hearing Date (Next Hearing)
              const firstHearingRow = caseStatusTable.locator(
                'tr:has(td:has(label:has-text("First Hearing Date")))'
              )
              const firstHearingExists = (await firstHearingRow.count()) > 0

              if (firstHearingExists) {
                const firstHearingCell = await firstHearingRow
                  .locator('td')
                  .nth(1)
                const firstHearingText = await firstHearingCell.textContent()
                const hearingDate = firstHearingText?.trim()
                if (hearingDate && hearingDate !== '') {
                  nextHearing = hearingDate
                  console.log(`[eCourt API] ✓ Next Hearing: ${nextHearing}`)
                } else {
                  console.log(
                    '[eCourt API] ⚠ First Hearing Date is empty, checking Decision Date...'
                  )

                  // If First Hearing is empty, try Decision Date
                  const decisionDateRow = caseStatusTable.locator(
                    'tr:has(td:has(label:has-text("Decision Date")))'
                  )
                  const decisionDateExists = (await decisionDateRow.count()) > 0

                  if (decisionDateExists) {
                    const decisionDateCell = await decisionDateRow
                      .locator('td strong')
                      .last()
                    const decisionDateText = await decisionDateCell.textContent()
                    nextHearing = decisionDateText?.trim() || null
                    console.log(
                      `[eCourt API] ✓ Decision Date (as Next Hearing): ${nextHearing}`
                    )
                  }
                }
              }
            } catch (error) {
              console.log(
                '[eCourt API] ⚠ Could not extract Case Status or Next Hearing'
              )
            }

            console.log('[eCourt API] ========================================')
            console.log('[eCourt API] ✓ All case details extracted!')
            console.log(`[eCourt API] CNR: ${cnrNumber}`)
            console.log(`[eCourt API] Case Type: ${caseType || 'N/A'}`)
            console.log(`[eCourt API] Legal Status: ${legalStatus || 'N/A'}`)
            console.log(`[eCourt API] Next Hearing: ${nextHearing || 'N/A'}`)
            console.log('[eCourt API] ========================================')

            // Close the browser after extracting all details
            console.log('[eCourt API] Closing browser...')
            await browser.close()
            console.log('[eCourt API] ✓ Browser closed')

            break
          }
        }
      }

      // Wait 1 second before next check
      await page.waitForTimeout(1000)
    }

    if (!cnrNumber) {
      console.log('[eCourt API] ⚠ Timeout: CNR number not found after 5 minutes')
      console.log('[eCourt API] Closing browser...')
      if (browser) {
        await browser.close()
      }
    }

    return NextResponse.json({
      success: true,
      cnrNumber,
      caseType,
      legalStatus,
      nextHearing,
      message: cnrNumber
        ? 'Case details extracted successfully'
        : 'Timeout: CNR number not found. Please try again.',
    })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('[eCourt API] ========================================')
    console.error('[eCourt API] ✗ ERROR OCCURRED:')
    console.error('[eCourt API]', errorMessage)
    console.error('[eCourt API] ========================================')

    // Close browser on error
    if (browser) {
      try {
        await browser.close()
      } catch {
        // Ignore close errors
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: 'An error occurred during automation',
      },
      { status: 500 }
    )
  }
}

