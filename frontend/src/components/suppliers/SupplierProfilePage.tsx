import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 1. Import Axios
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const SupplierProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    gst: "",
    pan: "",
    udyam: "",
    location: "",
    state: "",
    msme_status: "Micro",
    sector: "",
  });

  // Load existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 2. Axios GET request
        const response = await axios.get(`${API_URL}/suppliers/profile`, {
          withCredentials: true,
        });

        // Your backend returns { supplier: {...} }
        if (response.data?.supplier) {
          const s = response.data.supplier;
          setFormData({
            gst: s.gst || "",
            pan: s.pan || "",
            udyam: s.udyam || "",
            location: s.location || "",
            state: s.state || "",
            msme_status: s.msme_status || "Micro",
            sector: s.sector || "",
          });
        }
      } catch (err: any) {
        // We ignore 404s here as it just means the profile hasn't been created yet
        if (err.response?.status !== 404) {
          console.error("Error fetching profile:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 3. Axios POST request
      const response = await axios.post(
        `${API_URL}/suppliers/profile`,
        formData,
        { withCredentials: true },
      );

      if (response.data.success) {
        toast.success(response.data.message || "Profile saved successfully!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to save profile";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="shadow-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl font-display">
            Organizational Profile
          </CardTitle>
          <CardDescription>
            Update your company details to enable compliance tracking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="gst">GST Number</Label>
                <Input
                  id="gst"
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.gst}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gst: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pan">PAN Number</Label>
                <Input
                  id="pan"
                  placeholder="ABCDE1234F"
                  value={formData.pan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pan: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="udyam">Udyam Registration</Label>
                <Input
                  id="udyam"
                  placeholder="UDYAM-XX-00-0000000"
                  value={formData.udyam}
                  onChange={(e) =>
                    setFormData({ ...formData, udyam: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="msme">MSME Status</Label>
                <Select
                  value={formData.msme_status}
                  onValueChange={(val) =>
                    setFormData({ ...formData, msme_status: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Micro">Micro Enterprise</SelectItem>
                    <SelectItem value="Small">Small Enterprise</SelectItem>
                    <SelectItem value="Medium">Medium Enterprise</SelectItem>
                    <SelectItem value="Large">Large Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Industrial Sector</Label>
                <Input
                  id="sector"
                  placeholder="Manufacturing"
                  value={formData.sector}
                  onChange={(e) =>
                    setFormData({ ...formData, sector: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">City / Location</Label>
                <Input
                  id="location"
                  placeholder="Kolkata"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="West Bengal"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Profile Details
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierProfilePage;
