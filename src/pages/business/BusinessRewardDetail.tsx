import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Eye, ImagePlus, Trash2, Gift, Plus, X, Upload, Download, Copy, Check, Ticket, User, CheckCircle, Share2, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import ThumbnailUploadModal from '@/components/business/ThumbnailUploadModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RewardData {
  id: string;
  title: string;
  brand_name: string;
  brand_logo_url: string | null;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean | null;
  status: string | null;
  created_at: string;
  guidelines: string[] | null;
  category: string | null;
  reward_description: string;
  views_required: number;
  coupon_codes: string[] | null;
}

interface RewardSubmission {
  id: string;
  creator_id: string;
  tiktok_video_url: string;
  tiktok_video_id: string | null;
  status: string;
  current_views: number;
  current_likes: number;
  coupon_code: string | null;
  created_at: string;
  creator_name?: string;
  creator_avatar?: string | null;
}

const BusinessRewardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reward, setReward] = useState<RewardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [thumbModalOpen, setThumbModalOpen] = useState(false);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false); // kept for potential future use
  const [newCouponCode, setNewCouponCode] = useState('');
  const [savingCodes, setSavingCodes] = useState(false);
  const [copied, setCopied] = useState<string | false>(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [submissions, setSubmissions] = useState<RewardSubmission[]>([]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [rewardRes, subsRes] = await Promise.all([
        supabase.from('reward_ads').select('*').eq('id', id).maybeSingle(),
        supabase.from('reward_submissions').select('*').eq('reward_ad_id', id).order('created_at', { ascending: false }),
      ]);
      if (rewardRes.data) setReward(rewardRes.data as RewardData);

      const subs = subsRes.data || [];
      if (subs.length > 0) {
        const creatorIds = [...new Set(subs.map(s => s.creator_id))];
        const { data: profiles } = await supabase.from('profiles').select('user_id, username, full_name, avatar_url').in('user_id', creatorIds);
        const profileMap: Record<string, any> = {};
        (profiles || []).forEach(p => { profileMap[p.user_id] = p; });
        setSubmissions(subs.map(s => ({
          ...s,
          current_views: s.current_views || 0,
          current_likes: s.current_likes || 0,
          creator_name: profileMap[s.creator_id]?.username || profileMap[s.creator_id]?.full_name || 'Unknown',
          creator_avatar: profileMap[s.creator_id]?.avatar_url || null,
        })));
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleThumbnailCropSave = async (blob: Blob) => {
    if (!id) return;
    setUploading(true);
    const path = `thumbnails/reward-${id}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('campaign-assets')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('campaign-assets').getPublicUrl(path);
    const ts = Date.now();
    const freshUrl = `${urlData.publicUrl}?t=${ts}`;
    const { error: updateError } = await supabase
      .from('reward_ads')
      .update({ cover_image_url: freshUrl })
      .eq('id', id);
    if (updateError) {
      toast({ title: 'Error', description: updateError.message, variant: 'destructive' });
    } else {
      setReward(prev => prev ? { ...prev, cover_image_url: freshUrl } : prev);
      toast({ title: 'Thumbnail updated' });
      setThumbModalOpen(false);
    }
    setUploading(false);
  };

  const looksLikeCode = (s: string) => {
    if (s.length < 3 || s.length > 50) return false;
    if (/\s{2,}/.test(s)) return false;
    if (/^[a-z]+\s[a-z]+$/i.test(s)) return false;
    if (/^[a-z\s]+$/i.test(s) && s.includes(' ')) return false;
    return /[A-Z0-9]/.test(s);
  };

  const addCouponCode = async () => {
    const code = newCouponCode.trim();
    if (!code || !reward) return;
    const existing = reward.coupon_codes || [];
    if (existing.includes(code)) return;
    const updated = [...existing, code];
    setSavingCodes(true);
    const { error } = await supabase.from('reward_ads').update({ coupon_codes: updated }).eq('id', reward.id);
    if (!error) {
      setReward({ ...reward, coupon_codes: updated });
      setNewCouponCode('');
    }
    setSavingCodes(false);
  };

  const handleBulkPaste = async (text: string) => {
    if (!reward) return;
    const raw = text.split(/[\n,;]+/).map(c => c.trim()).filter(Boolean);
    const codes = raw.filter(looksLikeCode);
    const existing = reward.coupon_codes || [];
    const unique = codes.filter(c => !existing.includes(c));
    if (unique.length === 0) return;
    const updated = [...existing, ...unique];
    setSavingCodes(true);
    const { error } = await supabase.from('reward_ads').update({ coupon_codes: updated }).eq('id', reward.id);
    if (!error) {
      setReward({ ...reward, coupon_codes: updated });
      sonnerToast.success(`Added ${unique.length} codes`);
    }
    setSavingCodes(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      const { read, utils } = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const wb = read(buffer);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: string[][] = utils.sheet_to_json(ws, { header: 1 });
      const codes = rows.flat().map(c => String(c).trim()).filter(Boolean).filter(looksLikeCode);
      const existing = reward?.coupon_codes || [];
      const unique = codes.filter(c => !existing.includes(c));
      if (unique.length > 0 && reward) {
        const updated = [...existing, ...unique];
        setSavingCodes(true);
        const { error } = await supabase.from('reward_ads').update({ coupon_codes: updated }).eq('id', reward.id);
        if (!error) {
          setReward({ ...reward, coupon_codes: updated });
          sonnerToast.success(`Added ${unique.length} codes`);
        }
        setSavingCodes(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        handleBulkPaste(text);
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const removeCouponCode = async (index: number) => {
    if (!reward) return;
    const updated = (reward.coupon_codes || []).filter((_, i) => i !== index);
    const { error } = await supabase.from('reward_ads').update({ coupon_codes: updated }).eq('id', reward.id);
    if (!error) setReward({ ...reward, coupon_codes: updated });
  };

  const exportCouponCodes = () => {
    if (!reward?.coupon_codes) return;
    const csv = reward.coupon_codes.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coupon-codes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!reward) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Reward ad not found</p>
        <Button variant="outline" onClick={() => navigate('/business')}>Go back</Button>
      </div>
    );
  }

  const codesCount = reward.coupon_codes?.length || 0;
  const claimedCoupons = submissions.filter(s => s.coupon_code);

  const cardStyle = {
    background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
    border: '1px solid hsl(var(--border))',
    boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6)',
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-14 w-14 rounded-full bg-muted shrink-0 overflow-hidden">
          {reward.brand_logo_url ? (
            <img src={reward.brand_logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-lg font-bold text-muted-foreground/40 font-montserrat">
                {reward.brand_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-xl font-bold text-foreground font-montserrat">{reward.title}</h1>
          <Badge variant="outline" className={reward.is_active ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground'}>
            {reward.status === 'pending' ? 'Under Review' : reward.is_active ? 'Active' : 'Ended'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* Share button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Share ad"
            >
              <Share2 className="h-5 w-5 text-muted-foreground" />
            </button>
            {showShareMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-80 rounded-2xl p-4 z-50"
                style={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                }}
              >
                <p className="text-xs font-semibold text-foreground font-montserrat mb-3">Share this ad</p>
                <div className="mb-3">
                  <label className="text-[11px] text-muted-foreground font-jakarta mb-1 block">Public link</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={`${window.location.origin}/ad/${reward.id}`}
                      className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs text-foreground border border-border font-mono"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/ad/${reward.id}`);
                        setCopied('link');
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
                    >
                      {copied === 'link' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied === 'link' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground font-jakarta mb-1 block">Embed code</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={`<iframe src="${window.location.origin}/embed/ad/${reward.id}" width="420" height="160" frameborder="0" style="border:none;border-radius:20px;"></iframe>`}
                      className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs text-foreground border border-border font-mono truncate"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`<iframe src="${window.location.origin}/embed/ad/${reward.id}" width="420" height="160" frameborder="0" style="border:none;border-radius:20px;"></iframe>`);
                        setCopied('embed');
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-3 py-2 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-muted/80 transition-colors border border-border flex items-center gap-1"
                    >
                      {copied === 'embed' ? <Check className="h-3 w-3" /> : <Code className="h-3 w-3" />}
                      {copied === 'embed' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={async () => {
              if (!confirm('Are you sure you want to delete this reward ad? This cannot be undone.')) return;
              const { error } = await supabase.from('reward_ads').delete().eq('id', reward.id);
              if (error) {
                sonnerToast.error('Failed to delete reward ad');
                return;
              }
              sonnerToast.success('Reward ad deleted');
              navigate('/business');
            }}
            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors group"
            title="Delete reward ad"
          >
            <Trash2 className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-[28px] p-5" style={cardStyle}>
          <div className="mb-2">
            <span className="text-xs text-muted-foreground">Reward</span>
          </div>
          <p className="text-base font-bold text-foreground">{reward.reward_description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {reward.views_required === 0 ? 'Just by posting' : `${reward.views_required.toLocaleString()} views required`}
          </p>
        </div>
        <div className="rounded-[28px] p-5" style={{
          background: 'linear-gradient(135deg, hsla(270, 60%, 55%, 0.12) 0%, hsla(270, 60%, 45%, 0.06) 100%)',
          border: '1px solid hsla(270, 60%, 55%, 0.25)',
          boxShadow: 'inset 0 1px 0 hsla(270, 80%, 80%, 0.2), 0 2px 8px hsla(270, 60%, 30%, 0.08)',
          backdropFilter: 'blur(8px)',
        }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs" style={{ color: 'hsl(270, 50%, 50%)' }}>Coupon Codes</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'hsl(270, 60%, 35%)' }}>
            {codesCount}
            <span className="text-sm font-normal ml-1" style={{ color: 'hsl(270, 40%, 50%)' }}>available</span>
          </p>
          <p className="text-xs mt-1" style={{ color: 'hsl(270, 40%, 55%)' }}>
            {claimedCoupons.length} claimed
          </p>
        </div>
      </div>

      {/* Coupon Manager — Full Section */}
      <div className="rounded-[28px] p-6 mb-8" style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-foreground font-montserrat flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Coupon Manager
          </h3>
          <span className="text-xs text-muted-foreground">{codesCount} available · {claimedCoupons.length} claimed</span>
        </div>

        {/* Add codes */}
        <div className="flex gap-2 mb-4">
          <Input
            value={newCouponCode}
            onChange={(e) => setNewCouponCode(e.target.value)}
            placeholder="Enter coupon code..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addCouponCode()}
            onPaste={(e) => {
              const text = e.clipboardData.getData('text');
              if (text.includes('\n') || text.includes(',') || text.includes(';')) {
                e.preventDefault();
                handleBulkPaste(text);
              }
            }}
          />
          <Button size="sm" onClick={addCouponCode} disabled={savingCodes}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        {/* File upload + export */}
        <div className="flex items-center gap-2 mb-4">
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted border border-border text-xs font-medium cursor-pointer hover:bg-muted/80 transition-colors">
            <Upload className="h-3.5 w-3.5" />
            Import file
            <input type="file" className="hidden" accept=".csv,.txt,.xlsx,.xls" onChange={handleFileUpload} />
          </label>
          {codesCount > 0 && (
            <button
              onClick={exportCouponCodes}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted border border-border text-xs font-medium hover:bg-muted/80 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          )}
        </div>

        {/* Claimed coupons section */}
        {claimedCoupons.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Claimed ({claimedCoupons.length})
            </h4>
            <div className="rounded-xl border border-border overflow-hidden">
              {claimedCoupons.map((sub, i) => (
                <div key={sub.id} className={`flex items-center justify-between px-4 py-2.5 ${i < claimedCoupons.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {sub.creator_avatar ? (
                        <img src={sub.creator_avatar} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-sm text-foreground truncate">@{sub.creator_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-semibold text-foreground bg-muted px-2.5 py-1 rounded-lg">{sub.coupon_code}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(sub.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available codes list */}
        {codesCount > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Available ({codesCount})</h4>
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-border p-3">
              {(reward?.coupon_codes || []).map((code, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <Ticket className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-mono text-foreground truncate">{code}</span>
                  </div>
                  <button onClick={() => removeCouponCode(i)} className="shrink-0 p-1 hover:bg-destructive/10 rounded transition-colors">
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ad Details node — description + thumbnail */}
      <div className="rounded-[28px] p-6 flex gap-5" style={cardStyle}>
        {/* Left: text content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground font-montserrat mb-3">{reward.title}</h3>

          {reward.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{reward.description}</p>
          )}

          {reward.guidelines && reward.guidelines.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-foreground mb-2">Guidelines</h4>
              <ul className="space-y-1.5">
                {reward.guidelines.map((g, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-foreground/40 mt-0.5">•</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-24">Reward</span>
              <span className="text-sm font-semibold text-foreground">{reward.reward_description}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-24">Views needed</span>
              <span className="text-sm font-semibold text-foreground">
                {reward.views_required === 0 ? 'Just by posting' : reward.views_required.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right: thumbnail */}
        <div className="shrink-0 w-[182px]">
          <button
            onClick={() => setThumbModalOpen(true)}
            className="w-full aspect-[9/14] rounded-[28px] overflow-hidden relative group cursor-pointer"
            style={{ border: '1px solid hsl(var(--border))' }}
          >
            {reward.cover_image_url ? (
              <img src={reward.cover_image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                className="h-full w-full flex flex-col items-center justify-center gap-2"
                style={{ background: 'linear-gradient(180deg, hsl(var(--muted)) 0%, hsl(var(--border)) 100%)' }}
              >
                <ImagePlus className="h-6 w-6 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/50 font-medium">Add thumbnail</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[28px]">
              <ImagePlus className="h-5 w-5 text-white" />
            </div>
          </button>
        </div>
      </div>

      {/* Thumbnail upload/crop modal */}
      <ThumbnailUploadModal
        open={thumbModalOpen}
        onClose={() => setThumbModalOpen(false)}
        onSave={handleThumbnailCropSave}
        saving={uploading}
      />

      {/* In Action — Submissions */}
      {submissions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-base font-bold text-foreground font-montserrat mb-4">In Action</h3>
          <div className="space-y-3">
            {submissions.map(sub => {
              const statusColor = sub.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : sub.status === 'denied' ? 'bg-red-500/10 text-red-600 border-red-500/20'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20';
              const statusLabel = sub.status === 'approved' ? 'Approved'
                : sub.status === 'denied' ? 'Denied'
                : 'Under Review';
              return (
                <div key={sub.id} className="rounded-[20px] p-4 flex items-center gap-4 cursor-pointer hover:ring-1 hover:ring-foreground/10 transition-all" style={cardStyle} onClick={() => navigate(`/business/rewards/${id}/submissions/${sub.id}`)}>
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {sub.creator_avatar ? (
                      <img src={sub.creator_avatar} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">@{sub.creator_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {sub.current_views.toLocaleString()} views · {new Date(sub.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {sub.coupon_code && (
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded-lg text-foreground">{sub.coupon_code}</span>
                  )}
                  <Badge variant="outline" className={statusColor}>{statusLabel}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessRewardDetail;
