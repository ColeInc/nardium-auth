// Remember my "type" variable below may be hardcoded... comment it all out for final prod version.

// FETCH NEW ACCESS_TOKEN WITH REFRESH_TOKEN
function doGet(request) {
    // ONLY 1 OF THESE 3 SHOULD BE UNCOMMENTED:
    const type = request.parameter.type;
    // const type = "authenticateUser"
    // const type = "renewAccessToken"

    console.log(type);

    // @ ------------------------------------------------------------------------------------------
    if (type === "authenticateUser") {
        console.log(request.parameter.code);
        const code = request.parameter.code;
        // const code = "4/0AZEOvhXtgoMQSf15KMK6M7RaOHhRYS1dYYk5Bh3jd0qfHnItt-9bizCOnzPF3V3ZO1q9IA"

        const url = "https://www.googleapis.com/oauth2/v4/token";
        const { client_id, client_secret, redirect_uri } = getConstants();
        const grant_type = "authorization_code";

        // TODO: If having problems with extension always asking you to accept permissions every single time you log in, remove the "&access_type=offline" parameter from the end of this payload:
        const payload = {
            method: "POST",
            contentType: "application/x-www-form-urlencoded",
            payload: `code=${encodeURIComponent(code)}&client_id=${encodeURIComponent(
                client_id
            )}&client_secret=${encodeURIComponent(client_secret)}&redirect_uri=${encodeURIComponent(
                redirect_uri
            )}&grant_type=${encodeURIComponent(grant_type)}&access_type=offline`,
        };

        try {
            const response = UrlFetchApp.fetch(url, payload);
            const rawResp = response.getContentText();
            const responseData = JSON.parse(rawResp);
            console.log("oauth response:");
            console.log(responseData);

            // const { access_token, expires_in, refresh_token, scope, token_type, id_token } = responseData;
            if (responseData.refresh_token) {
                const encryptedRefreshToken = encrypt(responseData.refresh_token);
                responseData.refresh_token = encryptedRefreshToken;
            }
            console.log("oauth response UPDATED W/ ENCRYPTED REFRESH:");
            console.log(responseData);

            // return ContentService.createTextOutput(access_token);
            return ContentService.createTextOutput(JSON.stringify(responseData));
        } catch (error) {
            console.log("OAuth API Call Error:");
            console.log(error);
            return ContentService.createTextOutput("Failed to authenticate user. Failed at stage2 :(");
        }

        // @ ------------------------------------------------------------------------------------------
    } else if (type === "renewAccessToken") {
        try {
            console.log("parameters");
            console.log(request.parameter);
            const refresh_token = request.parameter.refreshToken;
            // const refresh_token = "t97gpchJxiP4upsQrVtqV/nnqitgNWd7vwbyFJmBWdsBXFjfjiEiWat+PwgWtYooRcuOn7CKqVICC+wyEJSWRXOThOC7JzsqtF8qqvTOpss1bnT2VFSkpPQSu27WW4218axdC3Aqi9QxPTUn+mzgEvA=="

            const url = "https://oauth2.googleapis.com/token";
            const { client_id, client_secret } = getConstants();
            const grant_type = "refresh_token";
            const decryptedRefreshToken = decrypt(refresh_token);
            if (!decryptedRefreshToken) {
                new Error("failed to decrypt refresh_token");
            }
            console.log("decrypted");
            console.log(decryptedRefreshToken);

            const payload = {
                method: "POST",
                contentType: "application/x-www-form-urlencoded",
                payload: `client_id=${encodeURIComponent(client_id)}&client_secret=${encodeURIComponent(
                    client_secret
                )}&grant_type=${encodeURIComponent(grant_type)}&refresh_token=${encodeURIComponent(
                    decryptedRefreshToken
                )}`,
            };

            const response = UrlFetchApp.fetch(url, payload);
            const rawResp = response.getContentText();
            console.log("refreshToken swap RAW:");
            console.log(rawResp);
            const responseData = JSON.parse(rawResp);
            // console.log("refreshToken swap response:");
            // console.log(responseData);

            // const { access_token, expires_in, refresh_token, scope, token_type, id_token } = responseData;
            // return ContentService.createTextOutput(access_token);
            return ContentService.createTextOutput(rawResp);
        } catch (error) {
            console.log("OAuth API Call Error:");
            console.log(error);
            return ContentService.createTextOutput("Failed to renew access token with provided refresh_token." + error);
        }

        // @ ------------------------------------------------------------------------------------------
    } else {
        return ContentService.createTextOutput(
            "Invalid request to NardiumAuth middleware. Please fix format of request!"
        );
    }
}
