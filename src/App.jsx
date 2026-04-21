import { useState, useMemo } from "react";

const DEFAULTS = {
  budget: 150,
  adsterraCPM: 0.50,
  cleverCPM: 0.80,
  adsterraFee: 5,
  discrepancy: 18,
  hostingCost: 10,
  gstReverseCharge: 18,
};

function fmt(n) {
  return n < 0
    ? `-$${Math.abs(n).toFixed(2)}`
    : `$${n.toFixed(2)}`;
}

function fmtInt(n) {
  return n.toLocaleString("en-IN");
}

function SliderInput({ label, value, onChange, min, max, step, unit, sublabel }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>
          {label}
        </label>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>
          {unit === "$" ? `$${value}` : `${value}${unit}`}
        </span>
      </div>
      {sublabel && (
        <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>{sublabel}</div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#3b82f6", height: 4, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#475569", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
        <span>{unit === "$" ? `$${min}` : `${min}${unit}`}</span>
        <span>{unit === "$" ? `$${max}` : `${max}${unit}`}</span>
      </div>
    </div>
  );
}

function ResultRow({ label, value, color, bold, indent }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      padding: "6px 0",
      borderBottom: "1px solid rgba(148,163,184,0.08)",
      marginLeft: indent ? 12 : 0,
    }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        color: indent ? "#64748b" : "#94a3b8",
        fontWeight: bold ? 700 : 400,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: bold ? 15 : 12,
        fontWeight: bold ? 800 : 600,
        color: color || "#e2e8f0",
      }}>
        {value}
      </span>
    </div>
  );
}

function ScenarioTable({ adsterraCPM, cleverCPM, adsterraFee, hostingCost, gstRate }) {
  const discrepancies = [10, 15, 18, 20, 25, 30];
  const budgets = [150, 300, 500, 1000];

  return (
    <div style={{ overflowX: "auto", marginTop: 16 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px 6px", color: "#64748b", borderBottom: "1px solid #1e293b", fontSize: 9 }}>
              BUDGET →<br/>DISC. ↓
            </th>
            {budgets.map(b => (
              <th key={b} style={{ textAlign: "right", padding: "8px 6px", color: "#94a3b8", borderBottom: "1px solid #1e293b", fontSize: 10 }}>
                ${b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {discrepancies.map(disc => (
            <tr key={disc}>
              <td style={{ padding: "6px", color: "#94a3b8", borderBottom: "1px solid rgba(30,41,59,0.5)" }}>
                {disc}%
              </td>
              {budgets.map(budget => {
                const effectiveBudget = budget * (1 - adsterraFee / 100);
                const impressionsBought = (effectiveBudget / adsterraCPM) * 1000;
                const impressionsCounted = impressionsBought * (1 - disc / 100);
                const grossRevenue = (impressionsCounted / 1000) * cleverCPM;
                const gstOnImport = effectiveBudget * (gstRate / 100);
                const netProfit = grossRevenue - budget - hostingCost;
                const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
                const isProfit = netProfit > 0;
                return (
                  <td key={budget} style={{
                    textAlign: "right",
                    padding: "6px",
                    borderBottom: "1px solid rgba(30,41,59,0.5)",
                    color: isProfit ? "#4ade80" : "#f87171",
                    fontWeight: 600,
                  }}>
                    {fmt(netProfit)}
                    <div style={{ fontSize: 8, color: isProfit ? "#22c55e80" : "#ef444480", fontWeight: 400 }}>
                      {margin.toFixed(0)}% margin
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 9, color: "#475569", marginTop: 8, fontFamily: "'JetBrains Mono', monospace" }}>
        Net profit = Clever revenue − budget deployed − ${hostingCost} hosting. GST reverse charge on imports ({gstRate}%) is cost-neutral if you claim ITC.
      </div>
    </div>
  );
}

export default function App() {
  const [budget, setBudget] = useState(DEFAULTS.budget);
  const [adsterraCPM, setAdsterraCPM] = useState(DEFAULTS.adsterraCPM);
  const [cleverCPM, setCleverCPM] = useState(DEFAULTS.cleverCPM);
  const [adsterraFee, setAdsterraFee] = useState(DEFAULTS.adsterraFee);
  const [discrepancy, setDiscrepancy] = useState(DEFAULTS.discrepancy);
  const [hostingCost, setHostingCost] = useState(DEFAULTS.hostingCost);

  const calc = useMemo(() => {
    const effectiveBudget = budget * (1 - adsterraFee / 100);
    const impressionsBought = (effectiveBudget / adsterraCPM) * 1000;
    const impressionsCounted = impressionsBought * (1 - discrepancy / 100);
    const grossRevenue = (impressionsCounted / 1000) * cleverCPM;
    const gstOnImport = effectiveBudget * 0.18;
    const netProfit = grossRevenue - budget - hostingCost;
    const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
    const breakEvenDisc = ((1 - ((budget + hostingCost) / ((effectiveBudget / adsterraCPM) * 1000 * cleverCPM / 1000))) * 100);

    return {
      effectiveBudget,
      impressionsBought,
      impressionsCounted,
      grossRevenue,
      gstOnImport,
      netProfit,
      margin,
      breakEvenDisc: Math.max(0, breakEvenDisc),
    };
  }, [budget, adsterraCPM, cleverCPM, adsterraFee, discrepancy, hostingCost]);

  const isProfit = calc.netProfit > 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "#e2e8f0",
      padding: "24px 16px",
      fontFamily: "'JetBrains Mono', -apple-system, monospace",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 16, fontWeight: 800, color: "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
            TRAFFIC ARBITRAGE P&L MODEL
          </h1>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 4, letterSpacing: "0.04em" }}>
            CLEVER ADVERTISING × ADSTERRA × BET7K
          </div>
        </div>

        {/* INPUTS */}
        <div style={{
          background: "#1e293b",
          borderRadius: 8,
          padding: 20,
          marginBottom: 16,
          border: "1px solid #334155",
        }}>
          <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16, fontWeight: 700 }}>
            PARAMETERS
          </div>
          <SliderInput label="Ad Budget Deployed" value={budget} onChange={setBudget} min={50} max={2000} step={50} unit="$" />
          <SliderInput label="Adsterra CPM Cost" value={adsterraCPM} onChange={setAdsterraCPM} min={0.20} max={1.50} step={0.05} unit="$" sublabel="Cost per 1,000 impressions you buy" />
          <SliderInput label="Clever CPM Payout" value={cleverCPM} onChange={setCleverCPM} min={0.40} max={2.00} step={0.05} unit="$" sublabel="Revenue per 1,000 impressions they count" />
          <SliderInput label="Adsterra Deposit Fee" value={adsterraFee} onChange={setAdsterraFee} min={0} max={10} step={0.5} unit="%" />
          <SliderInput label="Impression Discrepancy" value={discrepancy} onChange={setDiscrepancy} min={0} max={40} step={1} unit="%" sublabel="% of impressions bought but not counted by Clever" />
          <SliderInput label="Monthly Hosting Cost" value={hostingCost} onChange={setHostingCost} min={0} max={50} step={5} unit="$" />
        </div>

        {/* RESULTS */}
        <div style={{
          background: "#1e293b",
          borderRadius: 8,
          padding: 20,
          marginBottom: 16,
          border: `1px solid ${isProfit ? "#166534" : "#991b1b"}`,
        }}>
          <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, fontWeight: 700 }}>
            UNIT ECONOMICS
          </div>

          <ResultRow label="Budget deployed" value={fmt(budget)} />
          <ResultRow label="Adsterra fee (5%)" value={`-${fmt(budget * adsterraFee / 100)}`} indent color="#f87171" />
          <ResultRow label="Effective ad spend" value={fmt(calc.effectiveBudget)} />
          <ResultRow label="Impressions bought" value={fmtInt(Math.round(calc.impressionsBought))} />
          <ResultRow label={`Discrepancy loss (${discrepancy}%)`} value={`-${fmtInt(Math.round(calc.impressionsBought - calc.impressionsCounted))}`} indent color="#f87171" />
          <ResultRow label="Impressions counted by Clever" value={fmtInt(Math.round(calc.impressionsCounted))} />
          <div style={{ height: 8 }} />
          <ResultRow label="Gross revenue from Clever" value={fmt(calc.grossRevenue)} color="#60a5fa" />
          <ResultRow label="Less: Budget deployed" value={`-${fmt(budget)}`} indent color="#f87171" />
          <ResultRow label="Less: Hosting" value={`-${fmt(hostingCost)}`} indent color="#f87171" />
          <div style={{ height: 4, borderTop: "1px solid #334155", marginTop: 8 }} />
          <ResultRow
            label="NET PROFIT / (LOSS)"
            value={fmt(calc.netProfit)}
            color={isProfit ? "#4ade80" : "#f87171"}
            bold
          />
          <ResultRow
            label="Margin on revenue"
            value={`${calc.margin.toFixed(1)}%`}
            color={isProfit ? "#4ade80" : "#f87171"}
          />
          <ResultRow
            label="Break-even max discrepancy"
            value={`${calc.breakEvenDisc.toFixed(1)}%`}
            color="#fbbf24"
          />

          <div style={{
            marginTop: 16,
            padding: 12,
            background: isProfit ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
            borderRadius: 6,
            border: `1px solid ${isProfit ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}>
            <div style={{ fontSize: 10, color: isProfit ? "#4ade80" : "#f87171", fontWeight: 700, marginBottom: 4 }}>
              {isProfit ? "PROFITABLE" : "LOSS-MAKING"} AT THESE PARAMETERS
            </div>
            <div style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.5 }}>
              {isProfit
                ? `If discrepancy exceeds ${calc.breakEvenDisc.toFixed(0)}%, this turns into a loss. You have ${(calc.breakEvenDisc - discrepancy).toFixed(1)} percentage points of safety margin.`
                : `You need to either reduce Adsterra CPM, increase Clever CPM, or the discrepancy must fall below ${calc.breakEvenDisc.toFixed(0)}% to break even.`
              }
            </div>
          </div>
        </div>

        {/* GST NOTE */}
        <div style={{
          background: "#1e293b",
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
          border: "1px solid #334155",
        }}>
          <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8, fontWeight: 700 }}>
            GST & TAX NOTES
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.6 }}>
            <div style={{ marginBottom: 6 }}>
              <strong style={{ color: "#e2e8f0" }}>Export to Clever (with LUT):</strong> Zero-rated. No IGST payable. File LUT under Rule 96A.
            </div>
            <div style={{ marginBottom: 6 }}>
              <strong style={{ color: "#e2e8f0" }}>Import from Adsterra (RCM):</strong> 18% IGST self-assessed = {fmt(calc.gstOnImport)}. Claimable as ITC — net cash impact nil if you have output liability or claim refund.
            </div>
            <div style={{ marginBottom: 6 }}>
              <strong style={{ color: "#e2e8f0" }}>Income Tax (Presumptive 44AD):</strong> If total turnover ≤ ₹3Cr and receipts via banking, declare 6% of gross receipts as income. Tax at slab rates.
            </div>
            <div>
              <strong style={{ color: "#e2e8f0" }}>Effective tax on profit:</strong> Depends on your total income slab. At 30% slab + 4% cess, effective rate is 31.2% on the taxable portion.
            </div>
          </div>
        </div>

        {/* SCENARIO TABLE */}
        <div style={{
          background: "#1e293b",
          borderRadius: 8,
          padding: 16,
          border: "1px solid #334155",
        }}>
          <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4, fontWeight: 700 }}>
            SCENARIO MATRIX
          </div>
          <div style={{ fontSize: 9, color: "#475569", marginBottom: 8 }}>
            Net profit at Adsterra CPM ${adsterraCPM} → Clever CPM ${cleverCPM}
          </div>
          <ScenarioTable
            adsterraCPM={adsterraCPM}
            cleverCPM={cleverCPM}
            adsterraFee={adsterraFee}
            hostingCost={hostingCost}
            gstRate={18}
          />
        </div>

        <div style={{ fontSize: 8, color: "#334155", textAlign: "center", marginTop: 20, fontFamily: "'JetBrains Mono', monospace" }}>
          MODEL ONLY — VERIFY ALL RATES BEFORE DEPLOYING CAPITAL
        </div>
      </div>
    </div>
  );
}