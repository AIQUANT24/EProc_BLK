import { useMockData } from "@/contexts/MockDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Link2, Blocks } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import type { LedgerEntry } from "@/lib/blockchain-sim";

const AuditLogs = () => {
  const { ledger } = useMockData();
  const { t, language } = useLanguage();

  const columns: Column<LedgerEntry>[] = [
    { key: "blockNumber", label: language === "hi" ? "ब्लॉक #" : "Block #", sortable: true, render: r => <span className="font-mono text-xs font-bold">#{r.blockNumber}</span> },
    { key: "event", label: language === "hi" ? "घटना" : "Event", sortable: true, render: r => <Badge variant="outline">{r.event}</Badge> },
    { key: "entity", label: language === "hi" ? "इकाई" : "Entity", render: r => <span className="font-mono text-xs">{r.entity}</span> },
    { key: "user", label: language === "hi" ? "उपयोगकर्ता/सिस्टम" : "User/System", sortable: true },
    { key: "txHash", label: "Tx Hash", render: r => <span className="font-mono text-xs flex items-center gap-1"><Link2 className="h-3 w-3 text-primary" />{r.txHash}</span> },
    { key: "dataHash", label: "Data Hash", render: r => <span className="font-mono text-xs text-muted-foreground">{r.dataHash}</span> },
    { key: "previousHash", label: "Prev Hash", render: r => <span className="font-mono text-xs text-muted-foreground">{r.previousHash}</span> },
    { key: "timestamp", label: language === "hi" ? "समय" : "Timestamp", sortable: true, render: r => <span className="text-xs text-muted-foreground">{new Date(r.timestamp).toLocaleString()}</span> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title={t("auditTitle")} description={t("auditDesc")} />

      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <StatCard title={language === "hi" ? "कुल प्रविष्टियां" : "Total Entries"} value={ledger.length} icon={<Blocks className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "अद्वितीय इकाइयां" : "Unique Entities"} value={new Set(ledger.map(l => l.entity)).size} icon={<Blocks className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "नवीनतम ब्लॉक" : "Latest Block"} value={`#${ledger[0]?.blockNumber || 0}`} icon={<Blocks className="h-6 w-6" />} />
        <StatCard title={language === "hi" ? "नेटवर्क" : "Network"} value="Hyperledger" subtitle={language === "hi" ? "5 पीयर नोड · Raft सर्वसम्मति" : "5 peer nodes · Raft consensus"} icon={<Blocks className="h-6 w-6" />} />
      </div>

      <Card>
        <CardContent className="p-6">
          <DataTable data={ledger} columns={columns} searchKeys={["event", "entity", "user", "txHash"]} exportFilename="nmicov-audit-ledger" pageSize={15} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
