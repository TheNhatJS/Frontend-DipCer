"use server";

import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const jwt = process.env.JWT!

export async function POST(req: NextRequest) {
  try {
    const metadata = await req.json()

    // Retry logic for metadata upload
    const maxRetries = 3
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 Metadata upload attempt ${attempt}/${maxRetries}`)

        const res = await axios.post(
          'https://api.pinata.cloud/pinning/pinJSONToIPFS',
          metadata,
          {
            timeout: 60000, // 1 minute timeout
            headers: {
              Authorization: `Bearer ${jwt}`,
              'Content-Type': 'application/json',
            },
          }
        )

        console.log(`✅ Metadata uploaded! IPFS Hash: ${res.data.IpfsHash}`)

        return NextResponse.json({
          success: true,
          pinataURL: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`,
        })
      } catch (error: any) {
        lastError = error
        console.error(`❌ Metadata upload attempt ${attempt} failed:`, error.message)

        // Wait before retry
        if (attempt < maxRetries) {
          const waitTime = attempt * 1500 // 1.5s, 3s, 4.5s
          console.log(`⏳ Waiting ${waitTime}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }

    // All retries failed
    throw lastError

  } catch (error: any) {
    console.error('❌ Metadata upload error after all retries:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
