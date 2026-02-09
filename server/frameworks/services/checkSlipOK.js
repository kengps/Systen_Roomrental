export const checkSlipOK = async (API_KEY, BRANCH_ID, attachments) => {
    try {
        const res = await fetch(`https://api.slipok.com/api/line/apikey/${BRANCH_ID}`, {
            method: "POST",
            headers: {
                "x-authorization": API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: attachments // ให้มีแค่ url เหมือนใน Postman
            }),
        });
   

        const data = await res.json();
    


        if (!res.ok) {
            throw new Error(`API Error ${res.status}: ${data.message || 'Unknown error'}`);
        }

        return data;
    } catch (error) {
        console.error("🚨 Error checkSlipOK:", error);
        throw error;
    }
};
