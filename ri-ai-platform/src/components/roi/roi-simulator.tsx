"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Clock, DollarSign, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { formatCurrency, formatNumber } from "@/lib/utils";

// Planning assumptions surfaced transparently in the UI.
const MIN_PER_REQUEST = 7; // avg minutes of staff time per automatable interaction
const WEEKLY_ADMIN_HOURS = 5; // hours/week per employee on automatable admin work
const ADOPTION_RAMP = [0.55, 0.85, 1]; // 3-year adoption curve

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step, format, onChange }: SliderRowProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="rounded-md bg-muted px-2 py-0.5 text-sm font-semibold text-primary">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

export function RoiSimulator() {
  const [employees, setEmployees] = useState(500);
  const [requests, setRequests] = useState(800_000);
  const [automation, setAutomation] = useState(30);
  const [hourlyCost, setHourlyCost] = useState(48);

  const model = useMemo(() => {
    const rate = automation / 100;
    const hoursFromRequests = (requests * rate * MIN_PER_REQUEST) / 60;
    const hoursFromStaff = employees * WEEKLY_ADMIN_HOURS * 52 * rate * 0.5;
    const annualHours = Math.round(hoursFromRequests + hoursFromStaff);
    const annualSavings = Math.round(annualHours * hourlyCost);
    const capacity = employees * 2080;
    const productivityGain = capacity > 0 ? (annualHours / capacity) * 100 : 0;

    const projection = ADOPTION_RAMP.map((adopt, i) => {
      const yearSavings = Math.round(annualSavings * adopt);
      return {
        year: `Year ${i + 1}`,
        savings: yearSavings,
        adopt,
      };
    });
    let running = 0;
    const projectionWithCum = projection.map((p) => {
      running += p.savings;
      return { ...p, cumulative: running };
    });

    return {
      annualHours,
      annualSavings,
      productivityGain,
      threeYearValue: running,
      projection: projectionWithCum,
    };
  }, [employees, requests, automation, hourlyCost]);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Inputs */}
      <div className="lg:col-span-5">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="text-base font-semibold tracking-tight">
                Model your agency
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Adjust the inputs to project potential value.
              </p>
            </div>
            <SliderRow
              label="Agency size (employees)"
              value={employees}
              min={50}
              max={2000}
              step={10}
              format={(n) => formatNumber(n)}
              onChange={setEmployees}
            />
            <SliderRow
              label="Annual requests / interactions"
              value={requests}
              min={50_000}
              max={3_000_000}
              step={50_000}
              format={(n) => formatNumber(n)}
              onChange={setRequests}
            />
            <SliderRow
              label="Automation rate"
              value={automation}
              min={5}
              max={60}
              step={1}
              format={(n) => `${n}%`}
              onChange={setAutomation}
            />
            <SliderRow
              label="Loaded hourly cost"
              value={hourlyCost}
              min={30}
              max={90}
              step={1}
              format={(n) => `$${n}/hr`}
              onChange={setHourlyCost}
            />

            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              Assumes ~{MIN_PER_REQUEST} min of staff time per automatable
              interaction and ~{WEEKLY_ADMIN_HOURS} hrs/week per employee on
              automatable admin work. Planning estimates only.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outputs */}
      <div className="space-y-6 lg:col-span-7">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ResultTile
            icon={<Clock className="h-4 w-4" />}
            label="Hours saved / yr"
            value={model.annualHours}
            format={(n) => formatNumber(n)}
          />
          <ResultTile
            icon={<DollarSign className="h-4 w-4" />}
            label="Annual savings"
            value={model.annualSavings}
            format={(n) => formatCurrency(n)}
          />
          <ResultTile
            icon={<TrendingUp className="h-4 w-4" />}
            label="Productivity gain"
            value={model.productivityGain}
            format={(n) => `${n.toFixed(1)}%`}
          />
          <ResultTile
            icon={<Wallet className="h-4 w-4" />}
            label="3-year value"
            value={model.threeYearValue}
            format={(n) => formatCurrency(n)}
          />
        </div>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold tracking-tight">
              Projected value over three years
            </h3>
            <p className="mb-4 mt-0.5 text-sm text-muted-foreground">
              Annual savings (bars) and cumulative value (line), adjusted for an
              adoption ramp.
            </p>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={model.projection}
                  margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(Number(v))}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    width={64}
                  />
                  <Tooltip
                    formatter={(v, name) => [
                      formatCurrency(Number(v)),
                      name === "savings" ? "Annual savings" : "Cumulative",
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 12px 32px -12px rgb(16 24 40 / 0.2)",
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="savings" radius={[6, 6, 0, 0]} maxBarSize={64}>
                    {model.projection.map((_, i) => (
                      <Cell key={i} fill="#002868" fillOpacity={0.85} />
                    ))}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#2563eb" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResultTile({
  icon,
  label,
  value,
  format,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  format: (n: number) => string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <CountUp
        value={value}
        format={format}
        duration={0.6}
        className="mt-1.5 block text-xl font-semibold tracking-tight text-foreground"
      />
    </Card>
  );
}
