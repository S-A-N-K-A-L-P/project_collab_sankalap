"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogActions, Box, Stack, Typography, TextField,
  Button, Stepper, Step, StepLabel, Switch, FormControlLabel, MenuItem,
  Select, Alert, CircularProgress, IconButton, Divider, FormControl, InputLabel,
} from "@mui/material";
import {
  CloseRounded, CheckCircleRounded as DoneIcon,
  RocketLaunchRounded as ShipIcon,
  DescriptionRounded   as DocIcon,
  StorefrontRounded    as ShopIcon,
} from "@mui/icons-material";
import { isUploadEnabled } from "@/lib/cloudinary";

interface DocEntry {
  kind: "business" | "how-to-use";
  externalUrl: string;
}

interface MarkCompleteWizardProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  githubRepo?: string;
  defaultEmail?: string;
  onSuccess?: () => void;
}

const STEPS = ["Review", "Release", "Documentation", "Showcase"];

export default function MarkCompleteWizard({
  open, onClose, projectId, projectTitle, githubRepo, defaultEmail, onSuccess,
}: MarkCompleteWizardProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── State ───────────────────────────────────────────────
  const [version, setVersion]           = useState("v1.0.0");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [liveUrl, setLiveUrl]           = useState("");
  const [demoVideoUrl, setDemoVideoUrl] = useState("");
  const [coverImage, setCoverImage]     = useState("");

  const [businessDoc, setBusinessDoc] = useState("");
  const [howToDoc, setHowToDoc]       = useState("");

  const [isPublic, setIsPublic]             = useState(true);
  const [caseStudyOptIn, setCaseStudyOptIn] = useState(false);

  const [forSale, setForSale]           = useState(false);
  const [licenseType, setLicenseType]   = useState("one-time");
  const [priceINR, setPriceINR]         = useState<number>(0);
  const [contactEmail, setContactEmail] = useState(defaultEmail || "");

  const uploadEnabled = isUploadEnabled();

  // ── Validation ──────────────────────────────────────────
  const validVersion = /^v?\d+\.\d+\.\d+/.test(version);
  const validEmail   = !forSale || /\S+@\S+\.\S+/.test(contactEmail);
  const canSubmit    = validVersion && validEmail && !submitting;

  // ── Submit ──────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true); setError(null);
    try {
      const docs: any[] = [];
      if (businessDoc.trim()) docs.push({ kind: "business",   format: "external-url", externalUrl: businessDoc.trim(),  title: "Business Overview" });
      if (howToDoc.trim())    docs.push({ kind: "how-to-use", format: "external-url", externalUrl: howToDoc.trim(),    title: "How to Use" });

      const res = await fetch(`/api/projects/${projectId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version, releaseNotes, liveUrl, demoVideoUrl, coverImage,
          docs,
          showcase: { isPublic, caseStudyOptIn },
          marketplace: forSale
            ? { forSale: true, licenseType, priceINR, contactEmail }
            : { forSale: false },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to mark complete");

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step renderers ──────────────────────────────────────
  const renderReview = () => (
    <Stack gap={2}>
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        You're about to mark <strong>{projectTitle}</strong> as complete.
        This action moves the project to your <strong>Showcase</strong> and
        cannot be undone without admin assistance.
      </Alert>
      <Box sx={{ p: 2.5, bgcolor: "background.default", borderRadius: 2, border: 1, borderColor: "divider" }}>
        <Stack gap={1.5}>
          <Stack direction="row" gap={1} alignItems="center">
            <DoneIcon sx={{ fontSize: 18, color: "success.main" }} />
            <Typography variant="body2">Any open tasks will be auto-completed</Typography>
          </Stack>
          <Stack direction="row" gap={1} alignItems="center">
            <DoneIcon sx={{ fontSize: 18, color: "success.main" }} />
            <Typography variant="body2">Project status will become <strong>completed</strong> & progress set to 100%</Typography>
          </Stack>
          <Stack direction="row" gap={1} alignItems="center">
            <DoneIcon sx={{ fontSize: 18, color: "success.main" }} />
            <Typography variant="body2">A v1 release entry will be added to the project history</Typography>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );

  const renderRelease = () => (
    <Stack gap={2.5}>
      <TextField
        label="Version" value={version} onChange={e => setVersion(e.target.value)}
        helperText={validVersion ? "Semver format (v1.0.0)" : "Use format like v1.0.0"}
        error={!validVersion} required size="small" fullWidth
      />
      <TextField
        label="Live / deployed URL" value={liveUrl} onChange={e => setLiveUrl(e.target.value)}
        placeholder="https://your-app.com" size="small" fullWidth
      />
      <TextField
        label="Demo video URL (optional)" value={demoVideoUrl} onChange={e => setDemoVideoUrl(e.target.value)}
        placeholder="https://loom.com/..." size="small" fullWidth
      />
      <TextField
        label="Cover image URL"
        value={coverImage} onChange={e => setCoverImage(e.target.value)}
        placeholder="https://...jpg or png"
        helperText={uploadEnabled ? "Or upload below" : "File uploads not configured — paste an image URL (Imgur, GitHub raw, etc.)"}
        size="small" fullWidth
      />
      <TextField
        label="Release notes (markdown supported)"
        value={releaseNotes} onChange={e => setReleaseNotes(e.target.value)}
        multiline minRows={4} fullWidth
        placeholder="What's in this release?"
      />
      {githubRepo && (
        <Typography variant="caption" color="text.secondary">
          GitHub repo: <a href={githubRepo} target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>{githubRepo}</a>
        </Typography>
      )}
    </Stack>
  );

  const renderDocs = () => (
    <Stack gap={2.5}>
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Paste links to your documentation (Notion, Google Docs, GitHub README, etc.).
        File uploads will be enabled when storage is configured.
      </Alert>
      <TextField
        label="Business / pitch doc URL"
        value={businessDoc} onChange={e => setBusinessDoc(e.target.value)}
        placeholder="https://notion.so/..." size="small" fullWidth
        helperText="What problem does this solve? Who is it for?"
      />
      <TextField
        label="How-to-use doc URL"
        value={howToDoc} onChange={e => setHowToDoc(e.target.value)}
        placeholder="https://docs.com/..." size="small" fullWidth
        helperText="Setup & usage guide for end users"
      />
    </Stack>
  );

  const renderShowcase = () => (
    <Stack gap={2}>
      {/* Showcase */}
      <Box sx={{ p: 2.5, bgcolor: "background.default", borderRadius: 2, border: 1, borderColor: "divider" }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Showcase</Typography>
        <FormControlLabel
          control={<Switch checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />}
          label={<><strong>List in public showcase</strong><Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Anyone can discover your completed project</Typography></>}
        />
        <FormControlLabel
          sx={{ mt: 1 }}
          control={<Switch checked={caseStudyOptIn} onChange={e => setCaseStudyOptIn(e.target.checked)} />}
          label={<><strong>Allow case study</strong><Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>The platform may feature your project in marketing</Typography></>}
        />
      </Box>

      {/* Marketplace */}
      <Box sx={{ p: 2.5, bgcolor: "background.default", borderRadius: 2, border: 1, borderColor: "divider" }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Marketplace</Typography>
        <FormControlLabel
          control={<Switch checked={forSale} onChange={e => setForSale(e.target.checked)} />}
          label={<><strong>Available for sale / licensing</strong><Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Receive inquiries from interested buyers</Typography></>}
        />
        {forSale && (
          <Stack gap={2} sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <FormControl size="small" fullWidth>
              <InputLabel>License type</InputLabel>
              <Select value={licenseType} onChange={e => setLicenseType(e.target.value)} label="License type">
                <MenuItem value="one-time">One-time purchase</MenuItem>
                <MenuItem value="subscription">Subscription</MenuItem>
                <MenuItem value="open-source">Open-source / donation</MenuItem>
                <MenuItem value="custom">Custom (contact)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Price (INR)" type="number" value={priceINR}
              onChange={e => setPriceINR(Number(e.target.value) || 0)}
              size="small" fullWidth
              helperText="Leave 0 to negotiate"
            />
            <TextField
              label="Contact email" type="email" value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              error={!validEmail} required size="small" fullWidth
              helperText={validEmail ? "Inquiries will be sent here" : "Valid email required"}
            />
          </Stack>
        )}
      </Box>
    </Stack>
  );

  const stepIcons: Record<number, React.ReactNode> = {
    0: <DoneIcon  fontSize="small" />,
    1: <ShipIcon fontSize="small" />,
    2: <DocIcon  fontSize="small" />,
    3: <ShopIcon fontSize="small" />,
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, pt: 2.5, pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Mark Project Complete</Typography>
        <IconButton onClick={onClose} size="small"><CloseRounded /></IconButton>
      </Box>

      <Box sx={{ px: 3, pb: 1 }}>
        <Stepper activeStep={step} alternativeLabel>
          {STEPS.map((label, i) => (
            <Step key={label}>
              <StepLabel icon={stepIcons[i]}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {step === 0 && renderReview()}
        {step === 1 && renderRelease()}
        {step === 2 && renderDocs()}
        {step === 3 && renderShowcase()}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ mr: "auto" }}>Cancel</Button>
        {step > 0 && (
          <Button onClick={() => setStep(s => s - 1)} disabled={submitting}>Back</Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            variant="contained" onClick={() => setStep(s => s + 1)}
            disabled={step === 1 && !validVersion}
          >Next</Button>
        ) : (
          <Button
            variant="contained" color="primary"
            onClick={handleSubmit} disabled={!canSubmit}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <DoneIcon />}
          >
            {submitting ? "Completing…" : "Mark Complete"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
