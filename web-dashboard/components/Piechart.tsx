import { ChartPieLabel } from "@/components/ui/shadcn-io/pie-chart-03";

interface Transaction {
  id: number;
  trans_num: string;
  amount: number;
  merchant: string;
  category: string;
  customer: string;
  city: string;
  state: string;
  is_fraud: boolean;
  timestamp: string;
}

interface PieChart03Props {
  transactions: Transaction[];
}

const PieChart03 = ({ transactions }: PieChart03Props) => {
  // Calculate fraud vs non-fraud counts
  const fraudCount = transactions.filter((t) => t.is_fraud).length;
  const validCount = transactions.length - fraudCount;

  return <ChartPieLabel fraudCount={fraudCount} validCount={validCount} />;
};

export default PieChart03;
