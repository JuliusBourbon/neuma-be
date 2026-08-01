import 'dotenv/config';
import { userService } from './src/services/user.service.js';

async function run() {
    try {
        const profile = await userService.getProfile('c66de95f-1bcc-4755-9d1a-4c34ab290dc3');
        console.log("Success:", JSON.stringify(profile, null, 2));
    } catch (err: any) {
        console.error("Error:", err.message);
    }
    process.exit(0);
}
run();
