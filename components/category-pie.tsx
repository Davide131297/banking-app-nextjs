import { Pie, PieChart, LabelList } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { categories } from "@/utils/categories";

type Tx = {
  amount: number;
  category: string | null;
};

function getCategoryPieData(transactions: Tx[]) {
  const sums: Record<string, number> = {};
  for (const tx of transactions) {
    const cat = tx.category ?? "UNKNOWN";
    sums[cat] = (sums[cat] || 0) + Math.abs(Number(tx.amount) || 0);
  }
  return Object.entries(sums).map(([cat, value]) => {
    const catObj =
      cat === "UNKNOWN"
        ? { label: "Unbekannt", color: "#a3a3a3" }
        : categories.find((c) => c.value === cat) ?? {
            label: cat,
            color: "#a3a3a3",
          };
    return {
      category: catObj.label,
      value,
      fill: catObj.color,
    };
  });
}

export default function CategoryPieChart({
  transactions,
}: {
  transactions: Tx[];
}) {
  const data = getCategoryPieData(transactions);

  return (
    <Card className="flex flex-col h-[350px]">
      <CardHeader className="items-center pb-0">
        <CardTitle>Ausgaben nach Kategorie</CardTitle>
        <CardDescription>Deine Ausgabenverteilung</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={{}}
          className="mx-auto w-full h-full [&_.recharts-text]:fill-background"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="category" />}
            />
            <Pie data={data} dataKey="value" nameKey="category">
              <LabelList
                dataKey="category"
                className="fill-background"
                stroke="none"
                fontSize={12}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
