export default function getIpfsUrlFromPinata(pinataUrl: string): string {
    try {
        // Lấy phần sau `/ipfs/`
        const ipfsHash = pinataUrl.split("/ipfs/")[1]?.split("?")[0];

        if (!ipfsHash) {
            console.error("Invalid Pinata URL: IPFS hash not found");
            return "";
        }

        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        return ipfsUrl;
    } catch (error) {
        console.error("Error parsing Pinata URL:", error);
        return "";
    }
}
