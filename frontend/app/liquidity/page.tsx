"use client";

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

export default function Liquidity() {
    return (
        <div className="flex flex-col items-center justify-center mt-32">
            <Tabs defaultValue="account" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Add</TabsTrigger>
                    <TabsTrigger value="password">Remove</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Liquidity</CardTitle>
                            <CardDescription>
                                Add liquidity to the pool and earn fees
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="amountTVER">Amount TVER</Label>
                                <Input id="amountTVER" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="amountTHB">Amount THB</Label>
                                <Input id="amountTHB" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="password">
                    <Card>
                        <CardHeader>
                            <CardTitle>Remove Liquidity</CardTitle>
                            <CardDescription>
                                Remove liquidity from the pool
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Slider
                                defaultValue={[50]}
                                max={100}
                                step={1}
                                className="w-full"
                            />
                            <div className="space-y-1">
                                <Label htmlFor="lpAmount">Liquidty Amount</Label>
                                <Input id="lpAmount" />
                            </div>

                        </CardContent>
                        <CardFooter>
                            <Button>Save password</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

    )
}

