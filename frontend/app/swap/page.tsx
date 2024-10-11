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
import Connect from "@/components/connect"
import { useAccount } from 'wagmi'
import { ROUTER, ROUTER_ADDRESS } from "@/contracts/router"
import { TVER, THB } from "@/contracts/mintable-token"
import { useEthersSigner, useEthersProvider } from "@/utils/ethers";
import { toast } from "sonner";
import { parseEther, parseUnits, MaxUint256 } from "ethers";
import { PriceChart } from "@/components/price-chart";
import { baseUrl } from "@/utils/baseUrl";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {readableAmount} from "@/utils/readableAmount";
import {Price, Volume } from "@/components/price-chart";

// function FetchSwaps() {
//     // const fetcher = (...args) => fetch(...args).then(res => res.json())
//     const { data, error, isLoading } = useSWR('http://localhost:8080/api/swap', fetch)
//     return {
//         swaps: data,
//         swapsIsLoading: isLoading,
//         swapsIsError: error
//     }
// }

export default function Swap() {
    const { isConnected, address } = useAccount()
    const provider = useEthersProvider()
    const signer = useEthersSigner()

    const [balanceTVER, setBalanceTVER] = React.useState('')
    const [balanceTHB, setBalanceTHB] = React.useState('')
    const [allowanceTVER, setAllowanceTVER] = React.useState('')
    const [allowanceTHB, setAllowanceTHB] = React.useState('')
    const [fetchTrigger, setFetchTrigger] = React.useState(0)

    const [amountTVER, setAmountTVER] = React.useState('');
    const [amountTHB, setAmountTHB] = React.useState('');
    const [direction, setDirection] = React.useState("tver-to-thb");

    interface SwapData {
        recipient: string;
        tokenIn: string;
        amountIn: string;
        tokenOut: string;
        amountOut: string;
        timestamp: string;
    }

    interface Reserves {
        reserveTVER: string;
        reserveTHB: string;
        timestamp: string;
    }

    const [swapData, setSwapData] = React.useState<SwapData[]>([])
    const [prices, setPrices] = React.useState<Price[]>([])
    const [volumes, setVolumes] = React.useState<Volume[]>([])
    const [reserves, setReserves] = React.useState<Reserves>()


    React.useEffect(() => {
        const fetchSwaps = async () => {
            const res = await fetch(baseUrl + '/swap')
            const data = await res.json()
            setSwapData(data)
        }
        const fetchPrices = async () => {
            const res = await fetch(baseUrl + `/price/hours/2`)
            const data = await res.json()
            setPrices(data)
        }
        const fetchVolumes = async () => {
            const res = await fetch(baseUrl + '/volume/hours/2')
            const data = await res.json()
            setVolumes(data)
        }
        const fetchReserves = async () => {
            const res = await fetch(baseUrl + '/sync/latestReserves')
            const data = await res.json()
            setReserves(data)
        }

        const interval = setInterval(() => {
            fetchSwaps().catch(console.error)
            fetchPrices().catch(console.error)
            fetchVolumes().catch(console.error)
            fetchReserves().catch(console.error)
        }, 3_000);
        return () => clearInterval(interval);
    }, [])

    // React.useEffect(() => {
    //     const fetchPrices = async () => {
    //         const res = await fetch(baseUrl + '/price')
    //         const data = await res.json()
    //         setPrices(data)
    //     }
    //     const interval = setInterval(() => {
    //         fetchPrices().catch(console.error)
    //     }, 10_000);
    //     return () => clearInterval(interval);
    // }, [])

    // React.useEffect(() => {
    //     const fetchVolumes = async () => {
    //         const res = await fetch(baseUrl + '/volume')
    //         const data = await res.json()
    //         setVolumes(data)
    //     }
    //     const interval = setInterval(() => {
    //         fetchVolumes().catch(console.error)
    //     }, 10_000);
    //     return () => clearInterval(interval);
    // }, [])

    // React.useEffect(() => {
    //     const fetchReserves = async () => {
    //         const res = await fetch(baseUrl + '/sync/reserves')
    //         const data = await res.json()
    //         setReserves(data)
    //     }
    //     const interval = setInterval(() => {
    //         fetchReserves().catch(console.error)
    //     }, 10_000);
    //     return () => clearInterval(interval);
    // }, [])

    console.log('prices', prices)
    console.log('volumes', volumes)
    console.log('reserves', reserves)

    console.log('swapData', swapData)


    // const [swaps, setSwaps] = React.useState([])
    // const [volumes, setVolumes] = React.useState([])
    // const [mints, setMints] = React.useState([])
    // const [burns, setBurns] = React.useState([])
    // const [reserves, setReserves] = React.useState([])
    // const [prices, setPrices] = React.useState([])

    React.useEffect(() => {
        const fetchBalancesAndAllowances = async () => {
            if (!address) return
            if (!provider) return
            const tver = TVER.connect(provider);
            const thb = THB.connect(provider);

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
        }
        fetchBalancesAndAllowances().catch(console.error)
    }, [address, provider, fetchTrigger])

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
                success: 'Minted successfully',
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

    const swap = async () => {
        if (!signer) {
            toast.error('Please connect wallet')
            return
        }
        if (!address) {
            toast.error('Please connect wallet')
            return
        }
        if (direction === 'tver-to-thb') {
            if (amountTVER === '' || amountTVER === '0') {
                toast.error('Please enter amount')
                return
            }
            if (parseEther(amountTVER) > parseUnits(balanceTVER, 0)) {
                toast.error('Insufficient balance')
                return
            }
            if (parseUnits(allowanceTVER, 0) < parseEther(amountTVER)) {
                const tver = TVER.connect(signer);
                const tx = await tver.approve(ROUTER_ADDRESS, MaxUint256)
                toast.promise(tx.wait(), {
                    loading: 'Approving TVER...',
                    success: 'Approved successfully',
                    error: 'Failed to approve',
                })
                setFetchTrigger(fetchTrigger + 1)
            }
        } else {
            if (amountTHB === '' || amountTHB === '0') {
                toast.error('Please enter amount')
                return
            }
            if (parseEther(amountTHB) > parseUnits(balanceTHB, 0)) {
                toast.error('Insufficient balance')
                return
            }
            if (parseUnits(allowanceTHB, 0) < parseEther(amountTHB)) {
                const thb = THB.connect(signer);
                const tx = await thb.approve(ROUTER_ADDRESS, MaxUint256)
                toast.promise(tx.wait(), {
                    loading: 'Approving THB...',
                    success: 'Approved successfully',
                    error: 'Failed to approve',
                })
                setFetchTrigger(fetchTrigger + 1)
            }
        }

        const _direction = direction === 'tver-to-thb' ? 0 : 1
        const amountIn = _direction === 0 ? parseEther(amountTVER) : parseEther(amountTHB)

        try {
            const router = ROUTER.connect(signer);
            const tx = await router.swapExactTokens(
                amountIn,
                0n,
                _direction,
                address,
                ((Date.now() / 1000) + (60 * 20)).toFixed(0)
            )
            toast.promise(tx.wait(), {
                loading: 'Swapping...',
                success: 'Swapped successfully',
                error: 'Failed to swap',
            })
            setFetchTrigger(fetchTrigger + 1)
        } catch (e) {
            console.log(e)
            toast.error('Failed to swap')
        }
    }


    return (
        <div className="flex flex-col items-center mt-32">
            <div className="flex flex-row items-center justify-center space-x-8">
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
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        className="-mt-3"
                                        onClick={() => mint('TVER')}
                                    >Mint</Button>
                                </div>
                                <Input
                                    id="amountTVER"
                                    type="number"
                                    value={amountTVER}
                                    placeholder="Enter amount"
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
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        className="-mt-3"
                                        onClick={() => mint('THB')}
                                    >Mint</Button>
                                </div>
                                <Input
                                    id="amountTHB"
                                    type="number"
                                    value={amountTHB}
                                    placeholder="Enter amount"
                                    onChange={(e) => setAmountTHB(e.target.value)}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Label htmlFor="amountTHB">Amount THB</Label>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        className="-mt-3"
                                        onClick={() => mint('THB')}
                                    >Mint</Button>
                                </div>
                                <Input
                                    id="amountTHB"
                                    type="number"
                                    value={amountTHB}
                                    placeholder="Enter amount"
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
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        className="-mt-3"
                                        onClick={() => mint('TVER')}
                                    >Mint</Button>
                                </div>
                                <Input
                                    id="amountTVER"
                                    type="number"
                                    value={amountTVER}
                                    placeholder="Enter amount"
                                    onChange={(e) => setAmountTVER(e.target.value)}
                                />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        {(isConnected) ? (

                            <Button
                                className="w-full"
                                onClick={swap}
                            >Swap</Button>
                        ) : (
                            <Connect />
                        )}
                    </CardFooter>
                </Card>
                <div className="w-[575px]">
                    <PriceChart prices={prices} volumes={volumes} />
                </div>
            </div>
            <div className="flex flex-row items-center justify-center mt-4 mb-6">
            <Table className="w-[678px]">
                <TableCaption>A list of recent swaps.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Recipient</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Sold</TableHead>
                        <TableHead>Bought</TableHead>
                        {/* <TableHead className="text-right">Amount</TableHead> */}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {swapData && (swapData.map((swap) => (
                        <TableRow key={swap.timestamp}>
                            <TableCell className="font-medium">{swap.recipient}</TableCell>
                            <TableCell>{swap.tokenIn}</TableCell>
                            <TableCell>{swap.tokenOut}</TableCell>
                            <TableCell>{readableAmount(swap.amountIn, 4)}</TableCell>
                            <TableCell>{readableAmount(swap.amountOut, 4)}</TableCell>
                            {/* <TableCell className="text-right">{invoice.totalAmount}</TableCell> */}
                        </TableRow>
                    )))}
                </TableBody>
                {/* <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">$2,500.00</TableCell>
                    </TableRow>
                </TableFooter> */}
            </Table>
            </div>
        </div>
    );
}
