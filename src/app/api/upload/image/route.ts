"use server";

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const jwt = process.env.JWT;

// Hàm tiện ích để upload file lên Pinata
const uploadFileToIPFS = async (data: FormData): Promise<
    { success: true; pinataURL: string } | { success: false; message: string }
> => {
    const file = data.get("file") as File | null;
    if (file) {
        const pinataMetadata = JSON.stringify({
            name: file.name,
        });
        data.append("pinataMetadata", pinataMetadata);

        const pinataOptions = JSON.stringify({
            cidVersion: 0,
        });
        data.append("pinataOptions", pinataOptions);

        try {
            const boundary = (data as unknown as { _boundary: string })._boundary;

            const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
                maxBodyLength: Infinity,
                headers: {
                    "Content-Type": `multipart/form-data; boundary=${boundary}`,
                    Authorization: `Bearer ${jwt}`,
                },
            });

            return {
                success: true,
                pinataURL: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash,
            };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: (error as Error).message,
            };
        }
    } else {
        return {
            success: false,
            message: "File not found in FormData",
        };
    }
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