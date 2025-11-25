'use client'

/**
 * Create Market Form Component
 * 
 * Allows the contract owner to create new prediction markets.
 * Only the contract owner can create markets.
 */

import { useState } from "react";
import { useActiveAccount, useSendAndConfirmTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { contract } from "@/constants/contract";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";

export function CreateMarketForm() {
    const account = useActiveAccount();
    const { mutateAsync: sendTransaction } = useSendAndConfirmTransaction();
    const { toast } = useToast();
    
    // Initialize with default values
    const getDefaultDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const getDefaultTime = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 0, 0);
        return tomorrow.toTimeString().slice(0, 5);
    };

    const [question, setQuestion] = useState("");
    const [optionA, setOptionA] = useState("");
    const [optionB, setOptionB] = useState("");
    const [endDate, setEndDate] = useState(getDefaultDate());
    const [endTime, setEndTime] = useState(getDefaultTime());
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateMarket = async () => {
        // Get actual values (use state or defaults)
        const actualDate = endDate || getDefaultDate();
        const actualTime = endTime || getDefaultTime();
        
        if (!question || !optionA || !optionB || !actualDate || !actualTime) {
            toast({
                title: "Missing Information",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        // Combine date and time, convert to Unix timestamp
        const dateTimeString = `${actualDate}T${actualTime}`;
        const endTimestamp = Math.floor(new Date(dateTimeString).getTime() / 1000);
        
        // Validate the date is valid
        if (isNaN(endTimestamp) || endTimestamp === 0) {
            toast({
                title: "Invalid Date",
                description: "Please enter a valid date and time",
                variant: "destructive",
            });
            return;
        }
        
        if (endTimestamp <= Math.floor(Date.now() / 1000)) {
            toast({
                title: "Invalid Date",
                description: "End time must be in the future",
                variant: "destructive",
            });
            return;
        }

        setIsCreating(true);
        try {
            const tx = await prepareContractCall({
                contract,
                method: "function createMarket(string _question, string _optionA, string _optionB, uint256 _endTime)",
                params: [question, optionA, optionB, BigInt(endTimestamp)]
            });

            await sendTransaction(tx);
            
            toast({
                title: "Market Created!",
                description: "Your prediction market has been created successfully.",
                duration: 5000,
            });

            // Reset form (keep default date/time)
            setQuestion("");
            setOptionA("");
            setOptionB("");
            setEndDate(getDefaultDate());
            setEndTime(getDefaultTime());
        } catch (error: unknown) {
            console.error("Error creating market:", error);
            const errorMessage = error instanceof Error ? error.message : "An error occurred while creating the market. Make sure you're the contract owner.";
            toast({
                title: "Failed to Create Market",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    if (!account) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Create Market</CardTitle>
                    <CardDescription>Connect your wallet to create markets</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Create New Prediction Market</CardTitle>
                <CardDescription>
                    Only the contract owner can create markets. Make sure you&apos;re connected with the owner wallet.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="question" className="text-sm font-medium">
                        Market Question
                    </label>
                    <Input
                        id="question"
                        placeholder="e.g., Will Bitcoin hit $100k by end of year?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={isCreating}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="optionA" className="text-sm font-medium">
                            Option A
                        </label>
                        <Input
                            id="optionA"
                            placeholder="e.g., Yes"
                            value={optionA}
                            onChange={(e) => setOptionA(e.target.value)}
                            disabled={isCreating}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="optionB" className="text-sm font-medium">
                            Option B
                        </label>
                        <Input
                            id="optionB"
                            placeholder="e.g., No"
                            value={optionB}
                            onChange={(e) => setOptionB(e.target.value)}
                            disabled={isCreating}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="endDate" className="text-sm font-medium">
                            End Date
                        </label>
                        <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            disabled={isCreating}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="endTime" className="text-sm font-medium">
                            End Time
                        </label>
                        <Input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            disabled={isCreating}
                            required
                        />
                    </div>
                </div>

                <Button
                    onClick={handleCreateMarket}
                    disabled={isCreating || !question || !optionA || !optionB}
                    className="w-full"
                >
                    {isCreating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Market...
                        </>
                    ) : (
                        'Create Market'
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

