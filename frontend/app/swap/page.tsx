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
import { ArrowDown, ArrowUpDown } from "lucide-react"

export default function Swap() {
    const [amountTVER, setAmountTVER] = React.useState('');
    const [amountTHB, setAmountTHB] = React.useState('');
    const [direction, setDirection] = React.useState("tver-to-thb");
    return (
        <div className="flex flex-col items-center justify-center mt-32">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Swap</CardTitle>
                    <CardDescription>Swap between TVER and THB tokens</CardDescription>
                </CardHeader>
                <CardContent>
                    {(direction === "tver-to-thb") ? (
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label htmlFor="amountTVER">Amount TVER</Label>
                                <Button variant='ghost' size='sm' className="-mt-3">Mint</Button>
                            </div>
                            <Input
                                id="amountTVER"
                                type="number"
                                value={amountTVER}
                                onChange={(e) => setAmountTVER(e.target.value)}
                            />

                            <div className="flex justify-center">
                                {/* Swap icon when hover on */}
                                <Button className="group/icon" variant="outline" size='icon' onClick={() => setDirection("thb-to-tver")}>
                                    <ArrowDown className="group-hover/icon:hidden" />
                                    <ArrowUpDown className="hidden group-hover/icon:block" />
                                </Button>
                            </div>
                            <div className="flex justify-between">
                                <Label htmlFor="amountTHB">Amount THB</Label>
                                <Button variant='ghost' size='sm' className="-mt-3">Mint</Button>
                            </div>
                            <Input
                                id="amountTHB"
                                type="number"
                                value={amountTHB}
                                onChange={(e) => setAmountTHB(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label htmlFor="amountTHB">Amount THB</Label>
                                <Button variant='ghost' size='sm' className="-mt-3">Mint</Button>
                            </div>
                            <Input
                                id="amountTHB"
                                type="number"
                                value={amountTHB}
                                onChange={(e) => setAmountTHB(e.target.value)}
                            />

                            <div className="flex justify-center">
                                <Button className="group/icon" variant="outline" size='icon' onClick={() => setDirection("tver-to-thb")}>
                                    <ArrowDown className="group-hover/icon:hidden" />
                                    <ArrowUpDown className="hidden group-hover/icon:block" />
                                </Button>
                            </div>
                            <div className="flex justify-between">
                                <Label htmlFor="amountTVER">Amount TVER</Label>
                                <Button variant='ghost' size='sm' className="-mt-3">Mint</Button>
                            </div>
                            <Input
                                id="amountTVER"
                                type="number"
                                value={amountTVER}
                                onChange={(e) => setAmountTVER(e.target.value)}
                            />
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                    >Swap</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
