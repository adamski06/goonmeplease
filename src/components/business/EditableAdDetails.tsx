import React, { useState, useEffect } from 'react';
import { Pencil, Plus, X, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  table: 'campaigns' | 'reward_ads' | 'deals';
  rowId: string;
  description: string | null;
  guidelines: string[] | null;
  onSaved: (data: { description: string | null; guidelines: string[] | null }) => void;
}

const EditableAdDetails: React.FC<Props> = ({ table, rowId, description, guidelines, onSaved }) => {
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(description ?? '');
  const [items, setItems] = useState<string[]>(guidelines ?? []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDesc(description ?? '');
    setItems(guidelines ?? []);
  }, [description, guidelines]);

  const save = async () => {
    setSaving(true);
    const cleaned = items.map(i => i.trim()).filter(Boolean);
    const payload = {
      description: desc.trim() || null,
      guidelines: cleaned.length ? cleaned : null,
    };
    const { error } = await supabase.from(table).update(payload).eq('id', rowId);
    setSaving(false);
    if (error) {
      toast.error('Failed to save');
      return;
    }
    toast.success('Saved');
    onSaved(payload);
    setEditing(false);
  };

  if (!editing) {
    return (
      <>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1" />
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
        )}
        {guidelines && guidelines.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-foreground mb-2">Guidelines</h4>
            <ul className="space-y-1.5">
              {guidelines.map((g, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-foreground/40 mt-0.5">•</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="mb-4 space-y-3">
      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">Description</label>
        <Textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          placeholder="Describe your ad…"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">Guidelines</label>
        <div className="space-y-2">
          {items.map((it, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-foreground/40">•</span>
              <Input
                value={it}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = e.target.value;
                  setItems(next);
                }}
                placeholder="Guideline…"
              />
              <button
                onClick={() => setItems(items.filter((_, i) => i !== idx))}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setItems([...items, ''])}
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            <Plus className="h-3 w-3" /> Add guideline
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" onClick={save} disabled={saving}>
          <Check className="h-3.5 w-3.5 mr-1" />
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setDesc(description ?? '');
            setItems(guidelines ?? []);
            setEditing(false);
          }}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EditableAdDetails;
