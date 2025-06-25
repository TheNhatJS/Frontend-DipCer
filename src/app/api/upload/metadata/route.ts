import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const jwt = process.env.JWT!

export async function POST(req: NextRequest) {
  try {
    const metadata = await req.json()

    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return NextResponse.json({
      success: true,
      pinataURL: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`,
    })
  } catch (error) {
    console.error('Metadata upload error:', error)
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 })
  }
}
