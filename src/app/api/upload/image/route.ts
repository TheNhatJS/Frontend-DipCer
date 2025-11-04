"use server";

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const jwt = process.env.JWT;

// Hàm tiện ích để upload file lên Pinata với retry logic
const uploadFileToIPFS = async (data: FormData): Promise<
    { success: true; pinataURL: string } | { success: false; message: string }
> => {
    const file = data.get("file") as File | null;
    if (!file) {
        return {
            success: false,
            message: "File not found in FormData",
        };
    }

    const pinataMetadata = JSON.stringify({
        name: file.name,
    });
    data.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
        cidVersion: 0,
    });
    data.append("pinataOptions", pinataOptions);

    // Retry logic
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`📤 Upload attempt ${attempt}/${maxRetries} for file: ${file.name}`);

            const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                timeout: 120000, // 2 minutes timeout
                headers: {
                    "Content-Type": `multipart/form-data`,
                    Authorization: `Bearer ${jwt}`,
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / (progressEvent.total || 1)
                    );
                    console.log(`Upload progress: ${percentCompleted}%`);
                },
            });

            console.log(`✅ Upload successful! IPFS Hash: ${res.data.IpfsHash}`);

            return {
                success: true,
                pinataURL: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash,
            };
        } catch (error: any) {
            lastError = error;
            console.error(`❌ Upload attempt ${attempt} failed:`, error.message);

            // Nếu chưa hết retry, chờ trước khi thử lại
            if (attempt < maxRetries) {
                const waitTime = attempt * 2000; // 2s, 4s, 6s
                console.log(`⏳ Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    // Tất cả retry đều fail
    return {
        success: false,
        message: `Upload failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    };
};

// API route handler cho phương thức POST
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const result = await uploadFileToIPFS(formData);

        if (result.success) {
            return NextResponse.json({ success: true, pinataURL: result.pinataURL });
        } else {
            return NextResponse.json({ success: false, message: result.message }, { status: 400 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}