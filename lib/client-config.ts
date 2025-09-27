'use client'

export const clientConfig = {
  platform: {
    baseUrl: process.env.NEXT_PUBLIC_NODE_ENV === "production" ? "https://mi23aibddp.eu-central-1.awsapprunner.com" : "http://localhost:3000",

  }
}