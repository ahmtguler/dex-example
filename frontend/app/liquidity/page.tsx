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
import { parseEther, parseUnits, MaxUint256 } from "ethers";
import { History } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { baseUrl } from "@/utils/baseUrl";
import { readableAmount } from "@/utils/readableAmount";

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
    const [removeAmount, setRemoveAmount] = React.useState(0n)
    const [removeAmountDisplay, setRemoveAmountDisplay] = React.useState('')
    const [removePercent, setRemovePercent] = React.useState(0)

    interface Mint {
        recipient: string;
        amountTVER: string;
        amountTHB: string;
        timestamp: number;
    }

    interface Burn {
        recipient: string;
        amountTVER: string;
        amountTHB: string;
        timestamp: number;
    }

    interface Unified {
        recipient: string;
        amountTVER: string;
        amountTHB: string;
        timestamp: number;
        type: string;
    }

    const [mintData, setMintData] = React.useState<Mint[]>([])
    const [burnData, setBurnData] = React.useState<Burn[]>([])
    const [unifiedData, setUnifiedData] = React.useState<Unified[]>([])

    React.useEffect(() => {
        if (balanceLP === '' || balanceLP === '0') {
            setRemoveAmount(0n)
            return
        }
        const balanceAdjusted = parseUnits(balanceLP, 0) / parseUnits('1', 16)
        setRemoveAmountDisplay((Number(balanceAdjusted) * removePercent / 10000).toFixed(4))
        setRemoveAmount(parseUnits(balanceLP, 0) * BigInt(removePercent) / 100n)
    }, [removePercent, balanceLP])


    React.useEffect(() => {
        const fetchBalancesAndAllowances = async () => {
            if (!address) return
            if (!provider) return
            const tver = TVER.connect(provider);
            const thb = THB.connect(provider);
            const pool = POOL.connect(provider);

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
    }, [address, provider, fetchTrigger])

    React.useEffect(() => {
        const fetchMints = async () => {
            if (!address) return
            const res = await fetch(baseUrl + '/mint/' + address)
            const data = await res.json()
            setMintData(data)
        }

        const fetchBurns = async () => {
            if (!address) return
            const res = await fetch(baseUrl + '/burn/' + address)
            const data = await res.json()
            setBurnData(data)
        }

        const interval = setInterval(() => {
            fetchMints().catch(console.error)
            fetchBurns().catch(console.error)
        }, 3_000);
        return () => clearInterval(interval);
    }, [])

    React.useEffect(() => {
        let unified: Unified[] = []
        mintData.forEach((mint) => {
            unified.push({
                recipient: mint.recipient,
                amountTVER: mint.amountTVER,
                amountTHB: mint.amountTHB,
                timestamp: mint.timestamp,
                type: 'mint'
            })
        })
        burnData.forEach((burn) => {
            unified.push({
                recipient: burn.recipient,
                amountTVER: burn.amountTVER,
                amountTHB: burn.amountTHB,
                timestamp: burn.timestamp,
                type: 'burn'
            })
        })
        unified.sort((a, b) => b.timestamp - a.timestamp)
        setUnifiedData(unified)
    } , [mintData, burnData])

    const mint = async (token: string) => {
        if (!signer) {
            toast.error('Please connect wallet')
            return
        }
        if (!address) {
            toast.error('Please connect wallet')
            return
        }
        const TokenContract = token === 'TVER' ? TVER : THB
        try {
            const ctr = TokenContract.connect(signer);
            const tx = await ctr.mint(
                address,
                parseEther("10000")
            )
            toast.promise(tx.wait(), {
                loading: 'Minting...',
                success: 'Minted 10,000 tokens successfully',
                error: 'Failed to mint',
            })
            setFetchTrigger(fetchTrigger + 1)
            // await tx.wait()
            // toast.success('Minted successfully')
        } catch (e) {
            console.log(e)
            toast.error('Failed to mint')
        }
    }

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
                const tver = TVER.connect(signer);
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
                const thb = THB.connect(signer);
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
            const router = ROUTER.connect(signer);
            const tx = await router.addLiquidity(
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

        if (balanceLP === '' || balanceLP === '0') {
            toast.error('No LP balance')
            return
        }
        if (removeAmount > parseUnits(balanceLP, 0)) {
            toast.error('Insufficient LP balance')
            return
        }

        if (parseUnits(allowanceLP, 0) < removeAmount) {
            try {
                const pool = POOL.connect(signer);
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
            const router = ROUTER.connect(signer);
            const tx = await router.removeLiquidity(
                removeAmount,
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
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label htmlFor="amountTVER">Amount TVER</Label>
                                <Button
                                        variant='ghost'
                                        size='sm'
                                        className="-mt-3"
                                        onClick={() => mint('TVER')}
                                    >Mint</Button>
                            </div>
                                <Input
                                    id="amountTVER"
                                    placeholder="Enter amount"
                                    value={addTVER}
                                    onChange={(e) => setAddTVER(e.target.value)}
                                />
                            </div>
                            <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label htmlFor="amountTHB">Amount THB</Label>
                                <Button
                                        variant='ghost'
                                        size='sm'
                                        className="-mt-3"
                                        onClick={() => mint('TVER')}
                                    >Mint</Button>
                            </div>
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
                                <div className="flex flex-row items-center justify-center space-x-4">

                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline">
                                            <History className="icon" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent>
                                        <SheetHeader>
                                            <SheetTitle>User Liquidity History</SheetTitle>
                                            <SheetDescription>
                                                A list of your liquidity transactions
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="grid gap-4 py-4">
                                            {unifiedData.map((data, index) => (
                                                <div key={index} className="flex flex-row items-center justify-between space-x-4">
                                                    <div>
                                                        {data.type === 'mint' ? (
                                                            <span className="text-green-500">Add LP</span>
                                                        ) : (
                                                            <span className="text-red-500">Remove LP</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        {readableAmount(data.amountTVER,2)} TVER
                                                    </div>
                                                    <div>
                                                        {readableAmount(data.amountTHB,2)} THB
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </SheetContent>
                                </Sheet>
                                <Button
                                    onClick={addLiquidity}
                                >Add Liquidity</Button>
                                </div>
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
                                    value={removeAmountDisplay}
                                    disabled={true}
                                    onChange={(e) => setRemoveAmountDisplay(e.target.value)}
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

