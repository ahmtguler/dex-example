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
import Connect from "@/components/connect"
import { useAccount } from 'wagmi'
import { ROUTER, ROUTER_ADDRESS } from "@/contracts/router"
import { TVER, THB } from "@/contracts/mintable-token"
import { POOL } from "@/contracts/pool";
import { useEthersSigner, useEthersProvider } from "@/utils/ethers";
import { toast } from "sonner";
import { parseEther, parseUnits, Contract, MaxUint256 } from "ethers";


export default function Liquidity() {
    const { isConnected, address } = useAccount()
    const provider = useEthersProvider()
    const signer = useEthersSigner()

    const [balanceTVER, setBalanceTVER] = React.useState('')
    const [balanceTHB, setBalanceTHB] = React.useState('')
    const [allowanceTVER, setAllowanceTVER] = React.useState('')
    const [allowanceTHB, setAllowanceTHB] = React.useState('')
    const [balanceLP, setBalanceLP] = React.useState('')
    const [allowanceLP, setAllowanceLP] = React.useState('')
    const [fetchTrigger, setFetchTrigger] = React.useState(0)

    const [addTVER, setAddTVER] = React.useState('')
    const [addTHB, setAddTHB] = React.useState('')
    const [removeAmount, setRemoveAmount] = React.useState('')
    const [removePercent, setRemovePercent] = React.useState(0)

    React.useEffect(() => {
        if (balanceLP === '' || balanceLP === '0') {
            setRemoveAmount('')
            return
        }
        const balanceAdjusted = parseUnits(balanceLP, 0) / parseEther("1")
        setRemoveAmount((Number(balanceAdjusted) * removePercent / 100).toString())
    }, [removePercent, balanceLP])

    React.useEffect(() => {
        if (balanceLP === '' || balanceLP === '0' || removeAmount === '') {
            setRemovePercent(0)
            return
        }
        const percent = 100n * (parseUnits(removeAmount, 0) / parseUnits(balanceLP, 0))
        setRemovePercent(Number(percent))
    } , [removeAmount, balanceLP])

    React.useEffect(() => {
        const fetchBalancesAndAllowances = async () => {
            if (!address) return
            if (!provider) return
            const tver = TVER.connect(provider) as Contract
            const thb = THB.connect(provider) as Contract
            const pool = POOL.connect(provider) as Contract

            try {
                const balanceTVER = await tver.balanceOf(address)
                setBalanceTVER(balanceTVER.toString())
            } catch (e) {
                console.log(e)
            }

            try {
                const balanceTHB = await thb.balanceOf(address)
                setBalanceTHB(balanceTHB.toString())
            } catch (e) {
                console.log(e)
            }

            try {
                const allowanceTVER = await tver.allowance(address, ROUTER_ADDRESS)
                setAllowanceTVER(allowanceTVER.toString())
            } catch (e) {
                console.log(e)
            }

            try {
                const allowanceTHB = await thb.allowance(address, ROUTER_ADDRESS)
                setAllowanceTHB(allowanceTHB.toString())
            } catch (e) {
                console.log(e)
            }

            try {
                const balanceLP = await pool.balanceOf(address)
                setBalanceLP(balanceLP.toString())
            } catch (e) {
                console.log(e)
            }

            try {
                const allowanceLP = await pool.allowance(address, ROUTER_ADDRESS)
                setAllowanceLP(allowanceLP.toString())
            } catch (e) {
                console.log(e)
            }
        }
        fetchBalancesAndAllowances().catch(console.error)
    }, [address, provider])

    const addLiquidity = async () => {
        if (!signer) {
            toast.error('Please connect wallet')
            return
        }
        if (!address) {
            toast.error('Please connect wallet')
            return
        }
        if (!addTVER) {
            toast.error('Please enter TVER amount')
            return
        }
        if (!addTHB) {
            toast.error('Please enter THB amount')
            return
        }
        const ADD_TVER = parseEther(addTVER)
        if (ADD_TVER > parseUnits(balanceTVER, 0)) {
            toast.error('Insufficient TVER balance')
            return
        }
        const ADD_THB = parseEther(addTHB)
        if (ADD_THB > parseUnits(balanceTHB, 0)) {
            toast.error('Insufficient THB balance')
            return
        }

        if (allowanceTVER < addTVER) {
            try {
                const tver = TVER.connect(signer) as Contract
                const tx = await tver.approve(ROUTER_ADDRESS, MaxUint256)
                toast.promise(tx.wait(), {
                    loading: 'Approving TVER',
                    success: 'TVER approved',
                    error: 'Failed to approve TVER'
                })
                setFetchTrigger(fetchTrigger + 1)
                // await tx.wait()
            } catch (e) {
                console.log(e)
            }
        }

        if (allowanceTHB < addTHB) {
            try {
                const thb = THB.connect(signer) as Contract
                const tx = await thb.approve(ROUTER_ADDRESS, MaxUint256)
                toast.promise(tx.wait(), {
                    loading: 'Approving THB',
                    success: 'THB approved',
                    error: 'Failed to approve THB'
                })
                setFetchTrigger(fetchTrigger + 1)
                // await tx.wait()
            } catch (e) {
                console.log(e)
            }
        }

        try {
            const router = ROUTER.connect(signer) as Contract
            const tx = await router.addTVERTHBLiquidity(
                ADD_TVER,
                ADD_THB,
                0n,
                0n,
                address,
                ((Date.now() / 1000) + (60 * 20)).toFixed(0)
            )
            toast.promise(tx.wait(), {
                loading: 'Adding liquidity',
                success: 'Liquidity added',
                error: 'Failed to add liquidity'
            })
            setFetchTrigger(fetchTrigger + 1)
            // await tx.wait()
        } catch (e) {
            console.log(e)
        }
    }

    const removeLiquidity = async () => {
        if (!signer) {
            toast.error('Please connect wallet')
            return
        }
        if (!address) {
            toast.error('Please connect wallet')
            return
        }
        if (!removeAmount) {
            toast.error('Please enter amount')
            return
        }
        const REMOVE_AMOUNT = parseEther(removeAmount)
        if (balanceLP === '' || balanceLP === '0') {
            toast.error('No LP balance')
            return
        }
        if (REMOVE_AMOUNT > parseUnits(balanceLP, 0)) {
            toast.error('Insufficient LP balance')
            return
        }

        if (allowanceLP < removeAmount) {
            try {
                const pool = POOL.connect(signer) as Contract
                const tx = await pool.approve(ROUTER_ADDRESS, MaxUint256)
                toast.promise(tx.wait(), {
                    loading: 'Approving LP',
                    success: 'LP approved',
                    error: 'Failed to approve LP'
                })
                setFetchTrigger(fetchTrigger + 1)
                // await tx.wait()
            } catch (e) {
                console.log(e)
            }
        }

        try {
            const router = ROUTER.connect(signer) as Contract
            const tx = await router.removeLiquidity(
                REMOVE_AMOUNT,
                0n,
                0n,
                address,
                ((Date.now() / 1000) + (60 * 20)).toFixed(0)
            )
            toast.promise(tx.wait(), {
                loading: 'Removing liquidity',
                success: 'Liquidity removed',
                error: 'Failed to remove liquidity'
            })
            setFetchTrigger(fetchTrigger + 1)
            // await tx.wait()
        } catch (e) {
            console.log(e)
            toast.error('Failed to remove liquidity')
        }
    }

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
                                <Input
                                    id="amountTVER"
                                    placeholder="Enter amount"
                                    value={addTVER}
                                    onChange={(e) => setAddTVER(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="amountTHB">Amount THB</Label>
                                <Input
                                    id="amountTHB"
                                    placeholder="Enter amount"
                                    value={addTHB}
                                    onChange={(e) => setAddTHB(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            {(isConnected) ? (
                                <Button
                                    onClick={addLiquidity}
                                >Add Liquidity</Button>
                            ) : (
                                <Connect />
                            )}
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
                                defaultValue={[removePercent]}
                                max={100}
                                step={1}
                                className="w-full"
                                onValueChange={(value) => setRemovePercent(value[0])}
                            />
                            <div className="space-y-1">
                                <Label htmlFor="lpAmount">Liquidty Amount</Label>
                                <Input
                                    id="lpAmount"
                                    placeholder="Enter amount"
                                    value={removeAmount}
                                    onChange={(e) => setRemoveAmount(e.target.value)}
                                />
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-center">
                            {(isConnected) ? (
                                <Button
                                    onClick={removeLiquidity}
                                >Remove Liquidity</Button>
                            ) : (
                                <Connect />
                            )}
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

    )
}

