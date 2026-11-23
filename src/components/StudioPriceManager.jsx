import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  CreditCard,
  Droplet,
  FolderOpen,
  Frame,
  Heart,
  IdCard,
  Image,
  Layers,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import { studioRequest } from '../utils/studioApi';
import { useBusinessRules } from './BusinessRulesProvider';
import './StudioPriceManager.css';

const PANELS = [
  ['frames', 'Custom Frames', Layers],
  ['prints', 'Photo Prints', Printer],
  ['dua', 'Dua Posters', FolderOpen],
  ['pvc', 'PVC & ID Cards', IdCard],
  ['cards', 'Birthday Cards', Tag],
  ['gallery', 'Gallery Walls', Image],
  ['itra', 'Itra Perfumes', Droplet],
  ['islamic', 'Islamic Art', Sparkles],
  ['gifts', 'Cards & Gifts', Heart],
];

const FRAME_SUBTABS = [
  ['all', 'All Frame Rates'],
  ['frameSizes', 'Sizes'],
  ['framePrintAddons', 'Print Add-On'],
  ['frameFinishes', 'Mouldings'],
  ['glassOptions', 'Glass'],
  ['matOptions', 'Mounts'],
];

const SIZE_DIMENSIONS = {
  A5: '14.8 × 21.0 cm',
  A4: '21.0 × 29.7 cm',
  A3: '29.7 × 42.0 cm',
  A2: '42.0 × 59.4 cm',
  A1: '59.4 × 84.1 cm',
  '12x18': '30.5 × 45.7 cm',
  '13x19': '33.0 × 48.3 cm',
  '15x21': '38.1 × 53.3 cm',
  '16x22': '40.6 × 55.9 cm',
  '4x6': '10.2 × 15.2 cm',
  '5x7': '12.7 × 17.8 cm',
  '6x8': '15.2 × 20.3 cm',
  '8x10': '20.3 × 25.4 cm',
  A6: '10.5 × 14.8 cm',
};

function normalizeOverrides(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out = {};
  for (const [key, val] of Object.entries(input)) {
    if (val === '' || val === null || val === undefined) continue;
    if (typeof val === 'object' && !Array.isArray(val)) {
      const nested = normalizeOverrides(val);
      if (Object.keys(nested).length > 0) out[key] = nested;
    } else {
      const num = Number(val);
      if (Number.isFinite(num)) out[key] = Math.round(num);
    }
  }
  return out;
}

function flattenOverrideEntries(obj, prefix = '', map = new Map()) {
  if (!obj || typeof obj !== 'object') return map;
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      flattenOverrideEntries(val, path, map);
    } else if (val !== '' && val !== undefined && val !== null) {
      map.set(path, Number(val));
    }
  }
  return map;
}

function countChangedFields(current, baseline) {
  const a = flattenOverrideEntries(normalizeOverrides(current));
  const b = flattenOverrideEntries(normalizeOverrides(baseline));
  const keys = new Set([...a.keys(), ...b.keys()]);
  let changed = 0;
  for (const key of keys) {
    if (a.get(key) !== b.get(key)) changed++;
  }
  return changed;
}

function calcBulkPrice(currentVal, mode, amount, min, max) {
  const raw = mode === 'percent' ? currentVal * (1 + amount / 100) : currentVal + amount;
  return Math.max(min, Math.min(max, Math.round(raw)));
}

function formatDiff(diff) {
  if (!diff) return '';
  return diff > 0
    ? `+₹${diff.toLocaleString('en-IN')}`
    : `−₹${Math.abs(diff).toLocaleString('en-IN')}`;
}

function PriceInput({ value, defaultValue, onChange, min = 0, max = 1000000, step = 50, ariaLabel }) {
  const isCustom = value !== '' && value !== undefined && Number(value) !== defaultValue;
  const effective = isCustom ? Number(value) : defaultValue;
  const [draft, setDraft] = useState(null);

  const commitDraft = raw => {
    const trimmed = String(raw).trim();
    if (trimmed === '') {
      onChange('');
      return;
    }
    const num = Math.round(Number(trimmed));
    if (!Number.isFinite(num)) return;
    const clamped = Math.max(min, Math.min(max, num));
    onChange(clamped === defaultValue ? '' : clamped);
  };

  const handleStep = delta => {
    setDraft(null);
    const next = Math.max(min, Math.min(max, effective + delta));
    onChange(next === defaultValue ? '' : next);
  };

  return (
    <div className={`pm-stepper ${isCustom ? 'is-custom' : ''}`}>
      <button
        type="button"
        tabIndex={-1}
        className="pm-step-btn"
        onClick={() => handleStep(-step)}
        title={`Decrease by ₹${step}`}
        aria-label={`Decrease ${ariaLabel || 'price'} by ₹${step}`}
      >
        −{step}
      </button>
      <label className="pm-step-field">
        <span aria-hidden="true">₹</span>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          aria-label={ariaLabel}
          className="pm-step-input"
          value={draft !== null ? draft : effective}
          onFocus={event => {
            setDraft(String(effective));
            event.target.select();
          }}
          onChange={event => {
            const raw = event.target.value;
            setDraft(raw);
            if (raw === '') return;
            const num = Math.round(Number(raw));
            if (Number.isFinite(num) && num >= min && num <= max) {
              onChange(num === defaultValue ? '' : num);
            }
          }}
          onBlur={event => {
            commitDraft(event.target.value);
            setDraft(null);
          }}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              event.currentTarget.blur();
            } else if (event.key === 'Escape') {
              event.preventDefault();
              setDraft(null);
              event.currentTarget.blur();
            }
          }}
        />
      </label>
      <button
        type="button"
        tabIndex={-1}
        className="pm-step-btn"
        onClick={() => handleStep(step)}
        title={`Increase by ₹${step}`}
        aria-label={`Increase ${ariaLabel || 'price'} by ₹${step}`}
      >
        +{step}
      </button>
    </div>
  );
}

function PriceRow({ badge, title, note, value, defaultValue, onChange, min = 0, max = 1000000, step = 50 }) {
  const isCustom = value !== '' && value !== undefined && Number(value) !== defaultValue;
  const diff = isCustom ? Number(value) - defaultValue : 0;
  const formattedBadge = badge ? String(badge).replaceAll('x', '×') : '';
  const formattedNote = note ? String(note).replaceAll(' x ', ' × ') : '';

  return (
    <div className={`pm-row ${isCustom ? 'is-modified' : ''}`}>
      <div className="pm-row-id">
        {formattedBadge && (
          <span className={`pm-row-badge ${formattedBadge.length >= 4 ? 'is-wide' : ''}`}>
            {formattedBadge}
          </span>
        )}
        <div className="pm-row-text">
          <strong title={title}>{title}</strong>
          {formattedNote && <small title={formattedNote}>{formattedNote}</small>}
        </div>
      </div>

      <div className="pm-row-ref">
        <span className="pm-ref-label">Cat. ₹{Number(defaultValue).toLocaleString('en-IN')}</span>
        {isCustom && diff !== 0 && (
          <span className={`pm-diff-pill ${diff > 0 ? 'is-up' : 'is-down'}`}>
            {formatDiff(diff)}
          </span>
        )}
      </div>

      <PriceInput
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        ariaLabel={`${title} price`}
      />

      <div className="pm-row-revert-slot">
        {isCustom && (
          <button
            type="button"
            tabIndex={-1}
            className="pm-row-revert"
            onClick={() => onChange('')}
            title={`Revert to ₹${defaultValue}`}
            aria-label={`Revert ${title} to ₹${defaultValue}`}
          >
            <RotateCcw size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, unit, note, customCount, step = 50, onBulk, onReset, children }) {
  return (
    <section className="pm-card">
      <div className="pm-card-head">
        <div className="pm-card-head-left">
          <span className="pm-card-icon"><Icon size={17} /></span>
          <div className="pm-card-title-wrap">
            <h2>
              <span>{title}</span>
              <span className="pm-unit-pill">{unit}</span>
            </h2>
            {note && <p>{note}</p>}
          </div>
        </div>
        <div className="pm-card-tools">
          {onBulk && (
            <div className="pm-bulk-group" role="group" aria-label={`Bulk adjust ${title}`}>
              <button type="button" onClick={() => onBulk('percent', -10)}>−10%</button>
              <button type="button" onClick={() => onBulk('flat', -step)}>−₹{step}</button>
              <button type="button" onClick={() => onBulk('flat', step)}>+₹{step}</button>
              <button type="button" onClick={() => onBulk('percent', 10)}>+10%</button>
            </div>
          )}
          {customCount > 0 && onReset && (
            <button type="button" className="pm-section-reset" onClick={onReset}>
              <RotateCcw size={12} /> Reset ({customCount})
            </button>
          )}
        </div>
      </div>
      <div className="pm-rows">{children}</div>
    </section>
  );
}

export default function StudioPriceManager() {
  const { refresh } = useBusinessRules();
  const [prices, setPrices] = useState({});
  const [saved, setSaved] = useState({});
  const [defaults, setDefaults] = useState(null);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('frames');
  const [frameSubTab, setFrameSubTab] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const reload = useCallback(signal => {
    studioRequest('/studio/prices', { signal })
      .then(result => {
        if (signal?.aborted) return;
        const clean = normalizeOverrides(result.overrides || {});
        setPrices(clean);
        setSaved(clean);
        setDefaults(result.defaults || {});
        setPassword('');
      })
      .catch(cause => {
        if (!signal?.aborted) setError(cause.message);
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    reload(controller.signal);
    return () => controller.abort();
  }, [reload]);

  const countGroup = useCallback(key => Object.keys(prices?.[key] || {}).length, [prices]);
  const countNested = useCallback(
    key => Object.values(prices?.[key] || {}).reduce((sum, obj) => sum + Object.keys(obj || {}).length, 0),
    [prices],
  );

  const categoryCounts = useMemo(() => ({
    frames: countGroup('frameSizes') + countGroup('framePrintAddons') + countGroup('frameFinishes') + countGroup('glassOptions') + countGroup('matOptions'),
    prints: countGroup('printSizes'),
    dua: countGroup('duaPrices'),
    pvc: countGroup('pvcPrices'),
    cards: countGroup('cardSizes'),
    gallery: countGroup('galleryLayouts'),
    itra: countNested('itraPrices'),
    islamic: countNested('islamicArt'),
    gifts: countGroup('gifts'),
  }), [countGroup, countNested]);

  const totalCustomPrices = useMemo(
    () => PANELS.reduce((sum, [id]) => sum + (categoryCounts[id] || 0), 0),
    [categoryCounts],
  );

  const pendingChangeCount = useMemo(() => countChangedFields(prices, saved), [prices, saved]);
  const isDirty = pendingChangeCount > 0;

  const updatePrice = (group, key, val) => {
    setError('');
    setMessage('');
    setPrices(prev => {
      const next = { ...prev };
      const groupObj = { ...(next[group] || {}) };
      if (val === '' || val === undefined || val === null) {
        delete groupObj[key];
      } else {
        groupObj[key] = Math.round(Number(val));
      }
      if (Object.keys(groupObj).length === 0) {
        delete next[group];
      } else {
        next[group] = groupObj;
      }
      return next;
    });
  };

  const updateNestedPrice = (group, parentKey, childKey, val) => {
    setError('');
    setMessage('');
    setPrices(prev => {
      const next = { ...prev };
      const groupObj = { ...(next[group] || {}) };
      const parentObj = { ...(groupObj[parentKey] || {}) };
      if (val === '' || val === undefined || val === null) {
        delete parentObj[childKey];
      } else {
        parentObj[childKey] = Math.round(Number(val));
      }
      if (Object.keys(parentObj).length === 0) {
        delete groupObj[parentKey];
      } else {
        groupObj[parentKey] = parentObj;
      }
      if (Object.keys(groupObj).length === 0) {
        delete next[group];
      } else {
        next[group] = groupObj;
      }
      return next;
    });
  };

  const bulkAdjustSection = (section, mode, amount) => {
    setError('');
    setMessage('');
    if (section.kind === 'flat') {
      setPrices(prev => {
        const next = { ...prev };
        const groupObj = { ...(next[section.groupKey] || {}) };
        for (const item of section.items) {
          const current = groupObj[item.key] !== undefined ? Number(groupObj[item.key]) : item.defaultValue;
          const updated = calcBulkPrice(current, mode, amount, section.min, section.max);
          if (updated === item.defaultValue) delete groupObj[item.key];
          else groupObj[item.key] = updated;
        }
        if (Object.keys(groupObj).length === 0) delete next[section.groupKey];
        else next[section.groupKey] = groupObj;
        return next;
      });
      return;
    }

    setPrices(prev => {
      const next = { ...prev };
      const groupObj = { ...(next[section.groupKey] || {}) };
      for (const row of section.items) {
        const parentObj = { ...(groupObj[row.id] || {}) };
        for (const variant of row.variants) {
          const current = parentObj[variant.key] !== undefined ? Number(parentObj[variant.key]) : variant.defaultValue;
          const updated = calcBulkPrice(current, mode, amount, section.min, section.max);
          if (updated === variant.defaultValue) delete parentObj[variant.key];
          else parentObj[variant.key] = updated;
        }
        if (Object.keys(parentObj).length === 0) delete groupObj[row.id];
        else groupObj[row.id] = parentObj;
      }
      if (Object.keys(groupObj).length === 0) delete next[section.groupKey];
      else next[section.groupKey] = groupObj;
      return next;
    });
  };

  const resetSection = groupKeys => {
    setError('');
    setMessage('');
    setPrices(prev => {
      const next = { ...prev };
      for (const k of groupKeys) delete next[k];
      return next;
    });
  };

  const discardChanges = () => {
    setPrices(saved);
    setPassword('');
    setError('');
    setMessage('Unsaved changes discarded.');
  };

  const resetAllToDefaults = () => {
    if (totalCustomPrices === 0) return;
    if (window.confirm('Kya aap sabhi items ko catalogue default prices par reset karna chahte hain?')) {
      setPrices({});
      setError('');
      setMessage('Sabhi prices catalogue default par set ho gaye hain. Save karne ke liye niche password daal kar confirm karein.');
    }
  };

  const save = async event => {
    event.preventDefault();
    if (loading || submitting || !isDirty) return;
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const clean = normalizeOverrides(prices);
      const result = await studioRequest('/studio/prices', {
        method: 'PUT',
        body: { overrides: clean, password },
      });
      const persisted = normalizeOverrides(result.overrides || {});
      setPrices(persisted);
      setSaved(persisted);
      setPassword('');
      refresh();
      setMessage('Prices saved! Website ke sabhi builders aur checkout par naye rates turant apply ho gaye hain.');
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSubmitting(false);
    }
  };

  const sectionDefinitions = useMemo(() => {
    if (!defaults) return [];
    const sizeMap = Object.fromEntries((defaults.frameSizes || []).map(s => [s.id, s]));
    return [
      {
        id: 'frameSizes',
        tab: 'frames',
        kind: 'flat',
        groupKey: 'frameSizes',
        icon: Layers,
        title: 'Frame Size Base Rates',
        unit: 'Per Frame (₹)',
        note: 'Base empty frame rate. Auto-syncs across Custom Framing, Frame Catalogue, Gallery Walls, Dua Posters & Islamic Art.',
        min: 1,
        max: 100000,
        step: 50,
        items: (defaults.frameSizes || []).map(s => {
          const emptyRate = prices?.frameSizes?.[s.id] ?? s.basePrice;
          const addon = prices?.framePrintAddons?.[s.id] ?? s.printAddon ?? 0;
          return {
            key: s.id,
            badge: s.id,
            title: s.name,
            note: `${(s.dimensionsCm || '').replaceAll(' x ', ' × ')} · With Print ₹${(emptyRate + addon).toLocaleString('en-IN')} (+₹${addon})`,
            defaultValue: s.basePrice,
            searchText: `${s.id} ${s.name} ${s.dimensionsCm || ''}`,
          };
        }),
      },
      {
        id: 'framePrintAddons',
        tab: 'frames',
        kind: 'flat',
        groupKey: 'framePrintAddons',
        icon: Printer,
        title: 'Photo Print Inside Frame Add-On',
        unit: 'Print Add-On (₹)',
        note: 'Added to the empty frame base rate for Frame + Photo Print and Gallery Walls.',
        min: 0,
        max: 100000,
        step: 20,
        items: (defaults.frameSizes || []).map(s => {
          const emptyRate = prices?.frameSizes?.[s.id] ?? s.basePrice;
          const addon = prices?.framePrintAddons?.[s.id] ?? s.printAddon ?? 0;
          return {
            key: s.id,
            badge: s.id,
            title: `${s.name} Print Inside Frame`,
            note: `${(s.dimensionsCm || '').replaceAll(' x ', ' × ')} · Frame + Print total ₹${(emptyRate + addon).toLocaleString('en-IN')}`,
            defaultValue: s.printAddon ?? 0,
            searchText: `${s.id} ${s.name} print addon inside frame`,
          };
        }),
      },
      {
        id: 'frameFinishes',
        tab: 'frames',
        kind: 'flat',
        groupKey: 'frameFinishes',
        icon: Frame,
        title: 'Frame Moulding Extras',
        unit: 'Finish Add-On (₹)',
        note: 'Additional moulding charge above base frame rate across Custom Framing, Catalogue, Gallery Walls & Dua/Islamic Art.',
        min: 0,
        max: 100000,
        step: 25,
        items: (defaults.frameFinishes || []).map(f => ({
          key: f.id,
          badge: 'WOOD',
          title: f.name,
          note: f.finish,
          defaultValue: f.extraPrice,
          searchText: `${f.id} ${f.name} ${f.finish || ''}`,
        })),
      },
      {
        id: 'glassOptions',
        tab: 'frames',
        kind: 'flat',
        groupKey: 'glassOptions',
        icon: Sparkles,
        title: 'Glass & Glazing Options',
        unit: 'Glaze Add-On (₹)',
        note: 'Shatterproof acrylic & anti-glare glazing upgrades.',
        min: 0,
        max: 100000,
        step: 25,
        items: (defaults.glassOptions || []).map(g => ({
          key: g.id,
          badge: 'GLAZE',
          title: g.name,
          note: 'Glazing option',
          defaultValue: g.extra,
          searchText: `${g.id} ${g.name}`,
        })),
      },
      {
        id: 'matOptions',
        tab: 'frames',
        kind: 'flat',
        groupKey: 'matOptions',
        icon: CreditCard,
        title: 'Studio Mount & Mat Options',
        unit: 'Mount Add-On (₹)',
        note: 'Archival bevel-cut studio mounts and inner borders.',
        min: 0,
        max: 100000,
        step: 25,
        items: (defaults.matOptions || []).map(m => ({
          key: m.id,
          badge: 'MOUNT',
          title: m.name,
          note: 'Studio mount border',
          defaultValue: m.extra,
          searchText: `${m.id} ${m.name}`,
        })),
      },
      {
        id: 'printSizes',
        tab: 'prints',
        kind: 'flat',
        groupKey: 'printSizes',
        icon: Printer,
        title: 'Photo Prints',
        unit: 'Per Photo (₹)',
        note: 'Standard lab & large wall photo prints on lustre / gloss paper.',
        min: 1,
        max: 100000,
        step: 10,
        items: (defaults.printSizes || []).map(s => ({
          key: s.id,
          badge: s.id,
          title: `${s.name} Photo Print`,
          note: s.dimensions,
          defaultValue: s.price,
          searchText: `${s.id} ${s.name} ${s.dimensions || ''}`,
        })),
      },
      {
        id: 'duaPrices',
        tab: 'dua',
        kind: 'flat',
        groupKey: 'duaPrices',
        icon: FolderOpen,
        title: 'Dua Poster & Calligraphy Print Rates',
        unit: 'Print Only (₹)',
        note: 'Print-only baseline rates across all 9 sizes (Dua Posters, Quranic Verses & Names of Allah).',
        min: 1,
        max: 100000,
        step: 10,
        items: (defaults.duaPrices || []).map(d => ({
          key: d.id,
          badge: d.id,
          title: `${d.id} Dua Poster Print`,
          note: `${SIZE_DIMENSIONS[d.id] || ''} · 250 GSM paper`,
          defaultValue: d.price,
          searchText: `${d.id} ${d.name} ${SIZE_DIMENSIONS[d.id] || ''}`,
        })),
      },
      {
        id: 'pvcPrices',
        tab: 'pvc',
        kind: 'flat',
        groupKey: 'pvcPrices',
        icon: IdCard,
        title: 'PVC & ID Cards Pricing',
        unit: 'Per Card / Add-On (₹)',
        note: 'Base single/double-side PVC rates, accessories, and design fee (volume tiers auto-apply).',
        min: 0,
        max: 100000,
        step: 10,
        items: (defaults.pvcPrices || []).map(p => ({
          key: p.id,
          badge: 'PVC',
          title: p.name,
          note: '86 × 54 mm · 0.76 mm PVC',
          defaultValue: p.price,
          searchText: `${p.id} ${p.name}`,
        })),
      },
      {
        id: 'cardSizes',
        tab: 'cards',
        kind: 'flat',
        groupKey: 'cardSizes',
        icon: Tag,
        title: 'Birthday & Greeting Cards',
        unit: 'Per Card (₹)',
        note: 'Base per-card rate before quantity discounts.',
        min: 1,
        max: 100000,
        step: 20,
        items: (defaults.cardSizes || []).map(c => ({
          key: c.id,
          badge: c.id,
          title: `${c.name} — ${c.label}`,
          note: c.dimensionsCm,
          defaultValue: c.unitPrice,
          searchText: `${c.id} ${c.name} ${c.label} ${c.dimensionsCm || ''}`,
        })),
      },
      {
        id: 'galleryLayouts',
        tab: 'gallery',
        kind: 'flat',
        groupKey: 'galleryLayouts',
        icon: Image,
        title: 'Gallery Wall Multi-Frame Bundles',
        unit: 'Bundle Rate (₹)',
        note: 'Auto-synced from Frame + Print rates (standard finish). Edit below only if you want a custom bundle price override.',
        min: 1,
        max: 1000000,
        step: 250,
        items: (defaults.galleryLayouts || []).map(l => {
          const autoSetPrice = (l.slots || []).reduce((sum, sid) => {
            const sz = sizeMap[sid];
            const base = prices?.frameSizes?.[sid] ?? sz?.basePrice ?? 0;
            const addon = prices?.framePrintAddons?.[sid] ?? sz?.printAddon ?? 0;
            return sum + base + addon;
          }, 0) || l.startingPrice;
          return {
            key: l.id,
            badge: `${l.framesCount}F`,
            title: l.name,
            note: `${l.dimensions || `${l.framesCount} frames`} · Auto-synced from Frame + Print rates`,
            defaultValue: autoSetPrice,
            searchText: `${l.id} ${l.name} ${l.dimensions || ''} ${l.framesCount} frames`,
          };
        }),
      },
      {
        id: 'itraPrices',
        tab: 'itra',
        kind: 'matrix',
        groupKey: 'itraPrices',
        icon: Droplet,
        title: 'Artisanal Itra Perfumes',
        unit: 'Per Volume (₹)',
        note: 'Edit 3ml / 6ml / 12ml flacon prices side-by-side for each attar.',
        min: 1,
        max: 1000000,
        step: 50,
        items: (defaults.itraProducts || []).map(product => ({
          id: product.id,
          title: product.name,
          searchText: `${product.id} ${product.name} ${Object.keys(product.prices || {}).join(' ')}`,
          variants: Object.entries(product.prices || {}).map(([vol, defaultRate]) => ({
            key: vol,
            label: vol,
            defaultValue: defaultRate,
          })),
        })),
      },
      {
        id: 'islamicArt',
        tab: 'islamic',
        kind: 'matrix',
        groupKey: 'islamicArt',
        icon: Sparkles,
        title: 'Islamic Art & Calligraphy (A4 Baseline)',
        unit: 'Print & Framed (₹)',
        note: 'Adjust A4 unframed print and A4 framed rates side-by-side.',
        min: 1,
        max: 1000000,
        step: 50,
        items: (defaults.islamicArt || []).map(art => ({
          id: art.id,
          title: art.title,
          searchText: `${art.id} ${art.title} print framed a4`,
          variants: [
            { key: 'unframedPriceA4', label: 'Print (A4)', defaultValue: art.unframedPriceA4 },
            { key: 'framedPriceA4', label: 'Framed (A4)', defaultValue: art.framedPriceA4 },
          ],
        })),
      },
      {
        id: 'gifts',
        tab: 'gifts',
        kind: 'flat',
        groupKey: 'gifts',
        icon: Heart,
        title: 'Keepsakes & Bespoke Gifts',
        unit: 'Per Item (₹)',
        note: 'Handcrafted memory keepsake boxes, Nikah invites & bespoke cards.',
        min: 1,
        max: 1000000,
        step: 50,
        items: (defaults.gifts || []).map(g => ({
          key: g.id,
          badge: 'GIFT',
          title: g.title,
          note: 'Gift keepsake item',
          defaultValue: g.price,
          searchText: `${g.id} ${g.title}`,
        })),
      },
    ];
  }, [defaults, prices]);

  const q = search.trim().toLowerCase();
  const isGlobalView = Boolean(q) || filterMode === 'custom';

  const visibleSections = useMemo(() => {
    const out = [];
    for (const section of sectionDefinitions) {
      if (!isGlobalView) {
        if (section.tab !== activeTab) continue;
        if (activeTab === 'frames' && frameSubTab !== 'all' && section.id !== frameSubTab) continue;
      }

      const sectionTitleMatch = Boolean(q) && section.title.toLowerCase().includes(q);
      const filteredItems = section.items.filter(item => {
        const matchesQuery = !q || sectionTitleMatch || item.searchText.toLowerCase().includes(q);
        if (!matchesQuery) return false;
        if (filterMode === 'custom') {
          if (section.kind === 'flat') {
            return prices[section.groupKey]?.[item.key] !== undefined;
          }
          return item.variants.some(v => prices[section.groupKey]?.[item.id]?.[v.key] !== undefined);
        }
        return true;
      });

      if (filteredItems.length === 0) continue;

      const customCount = section.kind === 'flat'
        ? filteredItems.filter(item => prices[section.groupKey]?.[item.key] !== undefined).length
        : filteredItems.reduce(
            (sum, row) => sum + row.variants.filter(v => prices[section.groupKey]?.[row.id]?.[v.key] !== undefined).length,
            0,
          );

      out.push({
        ...section,
        items: filteredItems,
        customCount,
        totalCustomInGroup: section.kind === 'flat' ? countGroup(section.groupKey) : countNested(section.groupKey),
      });
    }
    return out;
  }, [sectionDefinitions, isGlobalView, activeTab, frameSubTab, q, filterMode, prices, countGroup, countNested]);

  const visibleMatchCount = useMemo(
    () => visibleSections.reduce((sum, s) => sum + s.items.length, 0),
    [visibleSections],
  );

  const renderSection = section => (
    <SectionCard
      key={section.id}
      icon={section.icon}
      title={section.title}
      unit={section.unit}
      note={section.note}
      customCount={section.totalCustomInGroup}
      step={section.step}
      onBulk={(mode, amount) => bulkAdjustSection(section, mode, amount)}
      onReset={() => resetSection([section.groupKey])}
    >
      {section.kind === 'flat' ? (
        section.items.map(item => (
          <PriceRow
            key={item.key}
            badge={item.badge}
            title={item.title}
            note={item.note}
            value={prices[section.groupKey]?.[item.key] ?? ''}
            defaultValue={item.defaultValue}
            onChange={v => updatePrice(section.groupKey, item.key, v)}
            min={section.min}
            max={section.max}
            step={section.step}
          />
        ))
      ) : (
        section.items.map(row => {
          const rowModified = row.variants.some(v => prices[section.groupKey]?.[row.id]?.[v.key] !== undefined);
          return (
            <div key={row.id} className={`pm-matrix-row ${rowModified ? 'is-modified' : ''}`}>
              <div className="pm-matrix-title">
                <strong>{row.title}</strong>
                {rowModified && <span className="pm-matrix-tag">Custom</span>}
              </div>
              <div className={`pm-matrix-cells ${section.id === 'islamicArt' ? 'is-pair' : ''}`}>
                {row.variants.map(variant => {
                  const val = prices[section.groupKey]?.[row.id]?.[variant.key] ?? '';
                  const isCustom = val !== '' && Number(val) !== variant.defaultValue;
                  const diff = isCustom ? Number(val) - variant.defaultValue : 0;
                  return (
                    <div key={variant.key} className={`pm-matrix-cell ${isCustom ? 'is-modified' : ''}`}>
                      <div className="pm-matrix-cell-head">
                        <span className="pm-matrix-var">{variant.label}</span>
                        <span className="pm-ref-label">Cat. ₹{Number(variant.defaultValue).toLocaleString('en-IN')}</span>
                        {isCustom && diff !== 0 && (
                          <span className={`pm-diff-pill ${diff > 0 ? 'is-up' : 'is-down'}`}>
                            {formatDiff(diff)}
                          </span>
                        )}
                        {isCustom && (
                          <button
                            type="button"
                            tabIndex={-1}
                            className="pm-row-revert"
                            onClick={() => updateNestedPrice(section.groupKey, row.id, variant.key, '')}
                            title={`Revert ${row.title} (${variant.label}) to ₹${variant.defaultValue}`}
                            aria-label={`Revert ${row.title} ${variant.label} to ₹${variant.defaultValue}`}
                          >
                            <RotateCcw size={12} />
                          </button>
                        )}
                      </div>
                      <PriceInput
                        value={val}
                        defaultValue={variant.defaultValue}
                        onChange={v => updateNestedPrice(section.groupKey, row.id, variant.key, v)}
                        min={section.min}
                        max={section.max}
                        step={section.step}
                        ariaLabel={`${row.title} ${variant.label} price`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </SectionCard>
  );

  return (
    <div className="pm-page">
      <header className="pm-hero">
        <div className="pm-hero-left">
          <span className="pm-hero-badge">PRICE CONTROL DESK</span>
          <h1>Studio Price Management</h1>
          <p>Rates seedha builders aur checkout par apply hote hain · Tab se next rate par jayein, Enter se confirm karein.</p>
        </div>

        <div className="pm-hero-right">
          <div className="pm-hero-pills">
            <button
              type="button"
              className={`pm-stat-pill ${filterMode === 'custom' ? 'is-active' : ''}`}
              onClick={() => setFilterMode(mode => (mode === 'custom' ? 'all' : 'custom'))}
              title="Toggle showing only modified rates across all categories"
            >
              Custom active: <strong>{totalCustomPrices}</strong>
            </button>
            <span className={`pm-stat-pill ${isDirty ? 'is-warn' : 'is-sync'}`}>
              {isDirty ? `${pendingChangeCount} unsaved` : 'Live & in sync'}
            </span>
          </div>
          <div className="pm-hero-actions">
            <button
              type="button"
              className="pm-hero-btn"
              disabled={totalCustomPrices === 0}
              onClick={resetAllToDefaults}
              title="Reset all categories to catalogue defaults"
            >
              <RotateCcw size={13} /> Reset All
            </button>
            <button
              type="button"
              className="pm-hero-btn"
              onClick={() => {
                setLoading(true);
                setError('');
                setMessage('');
                reload();
              }}
              title="Reload from database"
            >
              <RefreshCw size={13} /> Reload
            </button>
          </div>
        </div>
      </header>

      {defaults ? (
        <form onSubmit={save} noValidate className="pm-layout">
          <aside className="pm-sidebar">
            <nav className="pm-tabs" aria-label="Price management categories">
              {PANELS.map(([id, label, Icon]) => {
                const badgeCount = categoryCounts[id] || 0;
                const selected = !isGlobalView && activeTab === id;
                return (
                  <button
                    type="button"
                    key={id}
                    id={'pm-tab-' + id}
                    className="pm-tab-button"
                    aria-selected={selected}
                    onClick={() => {
                      setSearch('');
                      setFilterMode('all');
                      setActiveTab(id);
                    }}
                  >
                    <div className="pm-tab-left">
                      <Icon size={15} />
                      <span>{label}</span>
                    </div>
                    {badgeCount > 0 && <span className="pm-tab-badge">{badgeCount}</span>}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="pm-content">
            <div className="pm-toolbar">
              <div className="pm-search-wrap">
                <Search size={15} className="pm-search-icon" />
                <input
                  type="text"
                  className="pm-search-input"
                  aria-label="Search prices across all categories"
                  placeholder="Search all 9 categories: A4, 13×19, Oud, PVC, Dua…"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    className="pm-search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="pm-filter-toggle" role="group" aria-label="Filter items">
                <button
                  type="button"
                  aria-pressed={filterMode === 'all'}
                  onClick={() => setFilterMode('all')}
                >
                  All items
                </button>
                <button
                  type="button"
                  aria-pressed={filterMode === 'custom'}
                  onClick={() => setFilterMode('custom')}
                >
                  <SlidersHorizontal size={12} /> Custom only ({totalCustomPrices})
                </button>
              </div>
            </div>

            {!isGlobalView && activeTab === 'frames' && (
              <div className="pm-subtabs" role="group" aria-label="Frame rate sections">
                {FRAME_SUBTABS.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={frameSubTab === id}
                    onClick={() => setFrameSubTab(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {isGlobalView && (
              <div className="pm-global-banner" role="status">
                <span>
                  Showing <strong>{visibleMatchCount}</strong> matching {visibleMatchCount === 1 ? 'item' : 'items'} across <strong>{visibleSections.length}</strong> {visibleSections.length === 1 ? 'section' : 'sections'}
                  {filterMode === 'custom' ? ' (custom rates only)' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setFilterMode('all');
                  }}
                >
                  Clear filter
                </button>
              </div>
            )}

            {error && <div className="pm-alert-error" role="alert">{error}</div>}
            {message && <div className="pm-alert-success" role="status"><Check size={17} /> {message}</div>}

            {visibleSections.length > 0 ? (
              visibleSections.map(renderSection)
            ) : (
              <div className="pm-empty">
                <p>
                  {filterMode === 'custom' && !q
                    ? 'Abhi koi custom override active nahi hai. Kisi bhi item ka rate badal kar try karein.'
                    : `No items matched “${search}”.`}
                </p>
                <button
                  type="button"
                  className="pm-section-reset"
                  onClick={() => {
                    setSearch('');
                    setFilterMode('all');
                  }}
                >
                  Show all items
                </button>
              </div>
            )}

            {isDirty && (
              <div className="pm-floating-bar">
                <div className="pm-floating-status">
                  <div className="pm-pulse-dot" />
                  <div>
                    <strong>{pendingChangeCount} unsaved price {pendingChangeCount === 1 ? 'change' : 'changes'}</strong>
                    <span>Studio password daal kar save karein.</span>
                  </div>
                </div>

                <div className="pm-floating-controls">
                  <button
                    type="button"
                    className="pm-discard-btn"
                    onClick={discardChanges}
                  >
                    Discard
                  </button>

                  <label className="pm-pwd-label">
                    <span>Password:</span>
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      placeholder="Studio password"
                      className="pm-pwd-input"
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                    />
                  </label>

                  <button
                    type="submit"
                    className="pm-save-btn"
                    disabled={submitting || !password}
                  >
                    {submitting ? 'Saving…' : 'Save changes'} <Check size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className="pm-card" style={{ marginTop: 16 }}>
          {error || 'Loading catalogue pricing data…'}
        </div>
      )}
    </div>
  );
}
