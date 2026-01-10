import { NextRequest, NextResponse } from "next/server";
import { financeService } from "@/lib/services/finance/FinanceService";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const tickersParam = searchParams.get("tickers");

    if (!tickersParam) {
        return NextResponse.json({ error: "Missing 'tickers' parameter" }, { status: 400 });
    }

    const tickers = tickersParam.split(",");
    const quotes = await financeService.getQuotes(tickers);

    return NextResponse.json({
        data: quotes,
        meta: {
            count: quotes.length,
            requested: tickers
        }
    });
}
