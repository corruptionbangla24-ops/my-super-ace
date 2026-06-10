const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// ✅ মেইন প্ল্যাটফর্ম এপিআই ডোমেইন লিঙ্ক গেটওয়ে লক
const MAIN_SITE_URL = "https://betlover247.onrender.com"; 

// 🃏 অরিজিনাল JILI Super Ace ১০টি অফিশিয়ালカード সিম্বল পুল
const jiliSuperAceSymbolsPool = [
    "JILI_WILD", "JILI_SCATTER",
    "GOLDEN_ACE", "GOLDEN_KING", "GOLDEN_QUEEN", "GOLDEN_JACK",
    "CARD_ACE", "CARD_KING", "CARD_QUEEN", "CARD_JACK",
    "SPADE_CLUB", "HEART_DIAMOND"
];

let playerBountyFreeSpinsMap = {};

// 🎯 JILI Super Ace অফিশিয়াল ৫টি কলাম এবং ৪টি ফিক্সড সারি গ্রিড কাঠামো লক ওস্তাদ!
const jiliGridColsCount = 5;
const jiliGridRowsCount = 4;

// 🔒 [🔒 ওরিজিনাল JILI ক্যাসকেড মাল্টিপ্লায়ার ল্যাডার চ্যাম লক 🔒]:
// নরমাল রাউন্ডে ১, ২, ৩, ৫ গুণিতক এবং ফ্রি স্পিনে ২, ৪, ৬, ১০ গুণিতকের কোর ম্যাথ ইনজেকশন!
const jiliNormalMultiplierLadder =[1,2,3,5];
const jiliFreeSpinMultiplierLadder =[2,4,6,10];

// হেল্পার ফাংশন: মেইন সাইটের এপিআই প্রসেসিং জ্যাম দূর করার জন্য কিলার আক্সিওস ক্লায়েন্ট প্রোটোকল
async function sendSecureApiRequestToMainPlatform(payload) {
    try {
        const res = await axios.post(`${MAIN_SITE_URL}/api_callback.php`, payload, {
            timeout: 30000, 
            headers: { 'Content-Type': 'application/json', 'Connection': 'keep-alive' }
        });
        return res.data;
    } catch (err) {
        return { status: "timeout_bypass_error", balance: 0 };
    }
}

// 💰 ১. লাইভ অ্যাকাউন্ট ব্যালেন্স ইন্টারসেপ্টর গেটওয়ে
app.get('/api/slot-balance', async (req, res) => {
    const { userId, wallet } = req.query;
    const targetWallet = wallet || "main";
    let finalUser = userId === "logged_in_player" || !userId || userId === "undefined" ? "guest" : userId;
    
    let responseData = await sendSecureApiRequestToMainPlatform({
        action: "balance", username: finalUser, amount: 0, wallet: targetWallet, game: "superace"
    });
    
    if (responseData && (responseData.status === "ok" || responseData.status === "timeout_bypass_error")) {
        let activeFreeSpinsLeft = playerBountyFreeSpinsMap[finalUser] || 0;
        return res.json({ success: true, balance: responseData.balance || 0, freeSpinsLeft: activeFreeSpinsLeft });
    }
    return res.json({ success: false, balance: 0, freeSpinsLeft: 0 });
});

// 🛫 ২. অরিজিনাল JILI Super Ace ডাইনামিক কম্বো এপিআই রাউট লক ওস্তাদ!
app.post('/api/slot-spin', async (req, res) => {
    const { userId, amount, wallet } = req.body; 
    const reqAmount = parseFloat(amount) || 2; // জিলি অফিশিয়াল মিনিমাম বেট ২৳ লক
    const finalGameName = "superace"; 
    const targetWallet = wallet || "main";

    let finalQueryUser = userId || "guest";
    if (finalQueryUser === "logged_in_player" || finalQueryUser === "undefined") finalQueryUser = "guest";

    if (reqAmount < 1 || reqAmount > 5000) {
        return res.json({ success: false, message: "🚨 Invalid Bet Parameter! Max 5000৳" });
    }

    let isCurrentSpinFree = false;
    if (playerBountyFreeSpinsMap[finalQueryUser] && playerBountyFreeSpinsMap[finalQueryUser] > 0) {
        playerBountyFreeSpinsMap[finalQueryUser]--; 
        isCurrentSpinFree = true;
    }

    let balResponseData = { status: "ok", balance: 0 };

    if (isCurrentSpinFree === false) {
        balResponseData = await sendSecureApiRequestToMainPlatform({
            action: "bet", username: finalQueryUser, amount: reqAmount, wallet: targetWallet, game: finalGameName
        });
        if (!balResponseData || (balResponseData.status !== "ok" && balResponseData.status !== "timeout_bypass_error")) {
            return res.json({ success: false, message: "❌ আপনার অ্যাকাউন্ট ব্যালেন্স অপ্রতুল!" });
        }
    } else {
        let checkBal = await sendSecureApiRequestToMainPlatform({
            action: "balance", username: finalQueryUser, amount: 0, wallet: targetWallet, game: finalGameName
        });
        if (checkBal && checkBal.status === "ok") balResponseData.balance = checkBal.balance;
    }

    let currentDbBalance = parseFloat(balResponseData.balance) || 0;
    let finalStatus = "lose";
    let totalWinAmount = 0;
    let winMultiplier = 0;

    let cascadeChainSteps = [];
    let isCascadeContinuing = true;
    let currentCascadeIndex = 0; 
    let initialMatrix = { 0:[], 1:[], 2:[], 3:[], 4:[] };

    let activeLadder = isCurrentSpinFree ? jiliFreeSpinMultiplierLadder : jiliNormalMultiplierLadder;

    while (isCascadeContinuing && currentCascadeIndex < activeLadder.length) {
        let currentStepMatrix = { 0:[], 1:[], 2:[], 3:[], 4:[] };
        
        for (let col = 0; col < jiliGridColsCount; col++) {
            for (let r = 0; r < jiliGridRowsCount; r++) {
                let randSym = jiliSuperAceSymbolsPool[Math.floor(Math.random() * jiliSuperAceSymbolsPool.length)];
                if ((col === 0 || col === 4) && randSym.startsWith("GOLDEN_")) {
                    randSym = randSym.replace("GOLDEN_", "CARD_");
                }
                currentStepMatrix[col].push(randSym);
            }
        }

        if (currentCascadeIndex === 0) initialMatrix = currentStepMatrix;

        let sym0 = currentStepMatrix[0] || [];
        let sym1 = currentStepMatrix[1] || [];
        let sym2 = currentStepMatrix[2] || [];
        let sym3 = currentStepMatrix[3] || [];
        let sym4 = currentStepMatrix[4] || [];
        
        let baseSym = "CARD_ACE";
        for(let r=0; r<sym0.length; r++) {
            if (sym0[r] !== "JILI_WILD" && sym0[r] !== "JILI_SCATTER") { baseSym = sym0[r]; break; }
        }

        let cleanBaseSym = baseSym.replace("GOLDEN_", "CARD_");

        if (cleanBaseSym !== undefined && cleanBaseSym !== "JILI_SCATTER") {
            let m1 = (sym0.includes(baseSym) || sym0.includes(baseSym.replace("CARD_", "GOLDEN_")) || sym0.includes("JILI_WILD"));
            let m2 = (sym1.includes(cleanBaseSym) || sym1.includes(cleanBaseSym.replace("CARD_", "GOLDEN_")) || sym1.includes("JILI_WILD"));
            let m3 = (sym2.includes(cleanBaseSym) || sym2.includes(cleanBaseSym.replace("CARD_", "GOLDEN_")) || sym2.includes("JILI_WILD"));
            let m4 = (sym3.includes(cleanBaseSym) || sym3.includes(cleanBaseSym.replace("CARD_", "GOLDEN_")) || sym3.includes("JILI_WILD"));
            let m5 = (sym4.includes(cleanBaseSym) || sym4.includes(cleanBaseSym.replace("CARD_", "GOLDEN_")) || sym4.includes("JILI_WILD"));

            let matchCount = 0;
            let rowPositions = []; 
            
            if (m1 && m2 && m3) {
                matchCount = 3;
                rowPositions.push(sym0.indexOf(baseSym) !== -1 ? sym0.indexOf(baseSym) : sym0.indexOf("JILI_WILD"));
                rowPositions.push(sym1.indexOf(cleanBaseSym) !== -1 ? sym1.indexOf(cleanBaseSym) : sym1.indexOf("JILI_WILD"));
                rowPositions.push(sym2.indexOf(cleanBaseSym) !== -1 ? sym2.indexOf(cleanBaseSym) : sym2.indexOf("JILI_WILD"));
                
                if (m4) {
                    matchCount = 4;
                    rowPositions.push(sym3.indexOf(cleanBaseSym) !== -1 ? sym3.indexOf(cleanBaseSym) : sym3.indexOf("JILI_WILD"));
                    if (m5) {
                        matchCount = 5;
                        rowPositions.push(sym4.indexOf(cleanBaseSym) !== -1 ? sym4.indexOf(cleanBaseSym) : sym4.indexOf("JILI_WILD"));
                    }
                }
            }

            let hitChancesRoll = Math.random();
            let forceWinThisStep = false;
            
            if (matchCount === 3) forceWinThisStep = (hitChancesRoll <= 0.88); 
            else if (matchCount === 4) forceWinThisStep = (hitChancesRoll <= 0.65); 
            else if (matchCount === 5) forceWinThisStep = (hitChancesRoll <= 0.45); 

            if (matchCount >= 3 && forceWinThisStep) {
                let stepBaseOdds = 0.40; 
                if (cleanBaseSym === "CARD_ACE" || cleanBaseSym === "GOLDEN_ACE") stepBaseOdds = 2.50; 
                else if (cleanBaseSym === "CARD_KING" || cleanBaseSym === "GOLDEN_KING") stepBaseOdds = 1.80;
                else if (cleanBaseSym === "CARD_QUEEN" || cleanBaseSym === "GOLDEN_QUEEN") stepBaseOdds = 1.20;
                else if (cleanBaseSym === "CARD_JACK" || cleanBaseSym === "GOLDEN_JACK") stepBaseOdds = 0.80;
                else if (cleanBaseSym === "SPADE_CLUB") stepBaseOdds = 0.50;

                let isPerfectHorizontalLine = true;
                for (let i = 1; i < rowPositions.length; i++) {
                    if (rowPositions[i] !== rowPositions) {
                        isPerfectHorizontalLine = false;
                        break;
                    }
                }
                if (isPerfectHorizontalLine) {
                    stepBaseOdds = stepBaseOdds * 4.0; 
                }

                        if (matchCount === 4) stepBaseOdds = stepBaseOdds * 1.5; 
        else if (matchCount === 5) stepBaseOdds = stepBaseOdds * 3.0;

        let currentActiveMultiplier = activeLadder[currentCascadeIndex]; 
        let stepFinalMultiplier = stepBaseOdds * currentActiveMultiplier;

        // ২৳ বাজিতে জ্যাকপট ফাটার মেগা কিলার ৫% চান্স!
        if (reqAmount === 2 && Math.random() <= 0.05) {
            stepFinalMultiplier = parseFloat((Math.random() * (800 - 200) + 200).toFixed(2));
        }

        if (stepFinalMultiplier > 0) {
            let stepWinCash = Math.round(reqAmount * stepFinalMultiplier);
            totalWinAmount += stepWinCash;
            winMultiplier += stepFinalMultiplier;
            finalStatus = "win";

            cascadeChainSteps.push({
                cascadeIndex: currentCascadeIndex,
                multiplierLabel: "X" + currentActiveMultiplier,
                matrix: currentStepMatrix,
                stepWin: stepWinCash
            });

            currentCascadeIndex++; 
        } else {
            isCascadeContinuing = false; 
        }
    } else {
        isCascadeContinuing = false; 
    }
} else {
    isCascadeContinuing = false; 
}
}

let totalScatterCountOnBoard = 0;
for (let c = 0; c < jiliGridColsCount; c++) {
    for (let r = 0; r < initialMatrix[c].length; r++) {
        if (initialMatrix[c][r] === "JILI_SCATTER") totalScatterCountOnBoard++;
    }
}
if (totalScatterCountOnBoard >= 3 && isCurrentSpinFree === false) {
    playerBountyFreeSpinsMap[finalQueryUser] = (playerBountyFreeSpinsMap[finalQueryUser] || 0) + 10;
    finalStatus = "free_spin_triggered";
}

let finalPayloadData = { 
    action: "win", username: finalQueryUser, amount: parseFloat(totalWinAmount), wallet: targetWallet, game: finalGameName 
};
finalPayloadData.status = finalStatus;
finalPayloadData.bet_amount = isCurrentSpinFree ? 0 : reqAmount;

let response = await sendSecureApiRequestToMainPlatform(finalPayloadData);

let clientDisplayBalance = response.balance !== undefined ? response.balance : (currentDbBalance - (isCurrentSpinFree ? 0 : reqAmount) + totalWinAmount);

io.emit("balanceUpdate", { username: finalQueryUser, balance: clientDisplayBalance });
return res.json({
    success: true,
    balance: clientDisplayBalance,
    gameData: {
        finalReelsResultMatrix: initialMatrix,
        winMultiplier: winMultiplier,
        status: finalPayloadData.status,
        winAmount: totalWinAmount,
        cascadeSteps: cascadeChainSteps, 
        freeSpinsLeft: playerBountyFreeSpinsMap[finalQueryUser] || 0,
        isFreeSpinRound: isCurrentSpinFree
    }
});
});

app.post('/api/slot-buy-feature', async (req, res) => {
    const { userId, amount, wallet } = req.body;
    const baseBet = parseFloat(amount) || 2;
    const buyFeatureCost = baseBet * 50; 
    const targetWallet = wallet || "main";
    let finalQueryUser = userId === "logged_in_player" || !userId || userId === "undefined" ? "guest" : userId;

    let balResponse = await sendSecureApiRequestToMainPlatform({
        action: "bet", username: finalQueryUser, amount: buyFeatureCost, wallet: targetWallet, game: "superace"
    });

    if (!balResponse || (balResponse.status !== "ok" && balResponse.status !== "timeout_bypass_error")) {
        return res.json({ success: false, message: "❌ ব্যালেন্স অপ্রতুল!" });
    }

    playerBountyFreeSpinsMap[finalQueryUser] = (playerBountyFreeSpinsMap[finalQueryUser] || 0) + 10;
    
    let currentWalletBal = balResponse.balance !== undefined ? balResponse.balance : (balance - buyFeatureCost);
    io.emit("balanceUpdate", { username: finalQueryUser, balance: currentWalletBal });

    return res.json({ success: true, balance: currentWalletBal, freeSpinsLeft: playerBountyFreeSpinsMap[finalQueryUser], message: "🎉 ১০টি অরিজিনাল JILI ফ্রি স্পিন সাকсеস ওস্তাদ!" });
});

app.get('/', (req, res) => { res.sendFile(path.resolve(__dirname, 'index.html')); });
io.on('connection', (socket) => {});

const PORT = process.env.PORT || 8888; 
server.listen(PORT, () => { console.log(`🃏 JILI Super Ace Official 1024-WAYS Cascade Active on port 8888`); });
