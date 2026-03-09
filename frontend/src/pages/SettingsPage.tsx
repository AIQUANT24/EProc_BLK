import PageHeader from "@/components/shared/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const SettingsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in">
      <PageHeader title={t("settingsTitle")} description={t("settingsDesc")} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="font-display">{t("settingsDVA")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label>{t("settingsClass1")}</Label><Input className="w-24 text-right" defaultValue="50" /></div>
            <div className="flex items-center justify-between"><Label>{t("settingsClass2")}</Label><Input className="w-24 text-right" defaultValue="20" /></div>
            <Button className="gradient-primary text-primary-foreground">{t("settingsSaveThresholds")}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display">{t("settingsNotifications")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label>{t("settingsEmailAlerts")}</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>{t("settingsRiskAlerts")}</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>{t("settingsVerifyAlerts")}</Label><Switch /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display">{t("settingsAPI")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>{t("settingsAPIUrl")}</Label><Input defaultValue="https://api.nmicov.gov.in/v1" /></div>
            <div className="space-y-2"><Label>{t("settingsBlockchain")}</Label><Input defaultValue="peer0.nmicov.gov.in:7051" /></div>
            <Button className="gradient-primary text-primary-foreground">{t("settingsUpdateConfig")}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display">{t("settingsIntegration")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label>{t("settingsGeM")}</Label><span className="text-xs text-success font-medium">{t("settingsConnected")}</span></div>
            <div className="flex items-center justify-between"><Label>{t("settingsGSTN")}</Label><span className="text-xs text-success font-medium">{t("settingsConnected")}</span></div>
            <div className="flex items-center justify-between"><Label>{t("settingsDGFT")}</Label><span className="text-xs text-warning font-medium">{t("statusPending")}</span></div>
            <div className="flex items-center justify-between"><Label>{t("settingsICEGATE")}</Label><span className="text-xs text-muted-foreground font-medium">{t("settingsNotConnected")}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
