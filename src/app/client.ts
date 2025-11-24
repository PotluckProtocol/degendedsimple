// src/app/client.ts
// thirdweb client configuration for blockchain interactions
// This client is used throughout the app to interact with smart contracts
import { createThirdwebClient } from "thirdweb";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string,
});
