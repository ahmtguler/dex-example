import { JsonRpcProvider, parseEther, parseUnits } from "ethers";
import { Pool__factory } from "./types/Pool__factory";
import dotenv from "dotenv";
import {addBlock, getLastBlock, dropBlocks} from "../services/blockService";
import {addSwap} from "../services/swapService";
import {addVolume} from "../services/volumeService";
import { addMint } from "../services/mintService";
import { addBurn } from "../services/burnService";
import { addReserves } from "../services/syncService";
import {addPrice} from "../services/priceService";


dotenv.config();

export async function drop() {
    await dropBlocks();
}

export async function init() {
    const provider = new JsonRpcProvider(process.env.RPC_URL);
    const lastestBlock = await provider.getBlockNumber();
    await addBlock(lastestBlock, Date.now() / 1000);
}

export async function index() {
    const provider = new JsonRpcProvider(process.env.RPC_URL);
    const poolAddress = process.env.POOL_ADDRESS as string;
    const pool = Pool__factory.connect(poolAddress, provider);

    while (true) {
        const lastestBlock = await provider.getBlock('latest');
        if (!lastestBlock) {
            await sleep(5);
            continue;
        }
        let timestamp = lastestBlock.timestamp;
        const lastBlock = await getLastBlock();
        if (!lastBlock) return;
        const fromBlock = lastBlock.lastIndexedBlockNumber + 1;
        let toBlock = lastestBlock.number;
        if (fromBlock > toBlock) {
            await sleep(5);
            continue;
        }
        if (toBlock - fromBlock > 499) {
            toBlock = fromBlock + 499;
            const block = await provider.getBlock(toBlock);
            if (!block) {
                await sleep(5);
                continue;
            }
            timestamp = block.timestamp;
        }

        const swapEvents = await pool.queryFilter(pool.filters.Swap(), fromBlock, toBlock);
        const mintEvents = await pool.queryFilter(pool.filters.Mint(), fromBlock, toBlock);
        const burnEvents = await pool.queryFilter(pool.filters.Burn(), fromBlock, toBlock);
        const syncEvents = await pool.queryFilter(pool.filters.Sync(), fromBlock, toBlock);

        const swaps: any[] = [];
        const volumes: any[] = [];
        const mints: any[] = [];
        const burns: any[] = [];
        const syncs: any[] = [];

        if (swapEvents.length > 0) {
            for (const event of swapEvents) {
                const recipient = event.args[0];
                const amountTVERIn = event.args.amountTVERIn;
                const amountTHBIn = event.args.amountTHBIn;
                const amountTVEROut = event.args.amountTVEROut;
                const amountTHBOut = event.args.amountTHBOut;
                const block = await event.getBlock();
                if (!block) continue;
                const timestamp = block.timestamp;

                const tokenIn = amountTVERIn > 0 ? 'TVER' : 'THB';
                const tokenOut = tokenIn === 'TVER' ? 'THB' : 'TVER';
                const amountIn = tokenIn === 'TVER' ? amountTVERIn : amountTHBIn;
                const amountOut = tokenOut === 'TVER' ? amountTVEROut : amountTHBOut;
                swaps.push({
                    recipient,
                    tokenIn,
                    amountIn,
                    tokenOut,
                    amountOut,
                    timestamp
                });
                const thbAmount = tokenIn === 'THB' ? amountIn : amountOut;
                volumes.push({
                    thbAmount,
                    timestamp
                });
            }
        }

        if (mintEvents.length > 0) {
            for (const event of mintEvents) {
                const recipient = event.args.recipient;
                const amountTVER = event.args.amountTVER;
                const amountTHB = event.args.amountTHB;
                const block = await event.getBlock();
                if (!block) continue;
                const timestamp = block.timestamp;
                mints.push({
                    recipient,
                    amountTVER,
                    amountTHB,
                    timestamp
                });
            }
        }

        if (burnEvents.length > 0) {
            for (const event of burnEvents) {
                const recipient = event.args.recipient;
                const amountTVER = event.args.amountTVER;
                const amountTHB = event.args.amountTHB;
                const block = await event.getBlock();
                if (!block) continue;
                const timestamp = block.timestamp;
                burns.push({
                    recipient,
                    amountTVER,
                    amountTHB,
                    timestamp
                });
            }
        }

        if (syncEvents.length > 0) {
            for (const event of syncEvents) {
                const reserveTVER = event.args.reserveTVER;
                const reserveTHB = event.args.reserveTHB;
                const block = await event.getBlock();
                if (!block) continue;
                const timestamp = block.timestamp;
                syncs.push({
                    reserveTVER,
                    reserveTHB,
                    timestamp
                });
            }
        }
        
        if (swaps.length > 0) {
            for (const swap of swaps) {
                await addSwap(swap.recipient, swap.tokenIn, swap.amountIn, swap.tokenOut, swap.amountOut, swap.timestamp);
            }
        }

        if (volumes.length > 0) {
            for (const volume of volumes) {
                await addVolume(volume.thbAmount, volume.timestamp);
            }
        }

        if (mints.length > 0) {
            for (const mint of mints) {
                await addMint(mint.recipient, mint.amountTVER, mint.amountTHB, mint.timestamp);
            }
        }

        if (burns.length > 0) {
            for (const burn of burns) {
                await addBurn(burn.recipient, burn.amountTVER, burn.amountTHB, burn.timestamp);
            }
        }

        if (syncs.length > 0) {
            for (const sync of syncs) {
                await addReserves(sync.reserveTVER, sync.reserveTHB, sync.timestamp);
                await addPrice(calculatePrice(sync.reserveTVER, sync.reserveTHB), sync.timestamp);
            }
        }

        await addBlock(toBlock, timestamp);

        await sleep(5);
    }
}

function calculatePrice(reserveTVER: bigint, reserveTHB: bigint) {
    const oneTVER = parseEther('1');
    // const reserveTVER_BN = parseUnits(reserveTVER, 0);
    // const reserveTHB_BN = parseUnits(reserveTHB, 0);
    if (reserveTVER == 0n || reserveTHB == 0n) return '0';
    const price = (oneTVER * reserveTHB / reserveTVER) / parseUnits('1', 12);
    return price.toString();
}
    


async function sleep(s: number) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}