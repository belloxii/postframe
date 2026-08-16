import React, { useState } from 'react';
import {
  Layout,
  Palette,
  Type,
  Sliders,
  Sparkles,
  Layers,
  Square,
  Smartphone,
  Monitor,
  Maximize2,
  Check,
  QrCode,
  Eye,
  Settings2,
} from 'lucide-react';
import {
  DesignSettings,
  TemplateType,
  AspectRatioType,
  FontFamilyType,
  FontSizeOption,
  TextAlignment,
  ImageLayoutMode,
} from '../../types';
import {
  EXPORT_PRESETS,
  GRADIENT_PRESETS,
  FONT_OPTIONS,
} from '../../lib/constants';

interface CustomizationSidebarProps {
  settings: DesignSettings;
  onChange: (newSettings: DesignSettings) => void;
}

type TabType = 'templates' | 'canvas' | 'card' | 'typography' | 'elements';

export const CustomizationSidebar: React.FC<CustomizationSidebarProps> = ({
  settings,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('templates');

  const update = (partial: Partial<DesignSettings>) => {
    onChange({ ...settings, ...partial });
  };

  const templatesList: { id: TemplateType; name: string; desc: string; icon: string }[] = [
    { id: 'classic', name: 'Classic Facebook', desc: 'Authentic social feed aesthetic with verified badge & live reaction bar', icon: '📘' },
    { id: 'minimal', name: 'Editorial Minimal', desc: 'High-whitespace, refined typography, luxury gallery vibe', icon: '✨' },
    { id: 'dark', name: 'Dark Slate Modern', desc: 'High contrast dark theme with subtle neon glow & tech badges', icon: '🌑' },
    { id: 'news', name: 'News Headline', desc: 'Journalistic headline-forward layout with category masthead', icon: '📰' },
    { id: 'story', name: 'Vertical Story', desc: '9:16 vertical card with ambient gradient aura & floating pill', icon: '📱' },
    { id: 'quote', name: 'Statement Quote', desc: 'Emphasizes powerful quote text with oversized editorial serif accents', icon: '💬' },
  ];

  return (
    <div className="w-full lg:w-96 bg-[#0a0a0a] border-l border-white/10 flex flex-col h-full overflow-hidden text-white">
      {/* Sidebar Header with Tabs */}
      <div className="border-b border-white/10 bg-[#050505]/70 p-3">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-blue-500" />
            <h2 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
              Design Controls
            </h2>
          </div>
          <span className="text-[10px] font-mono text-white/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {settings.template}
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-5 gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`py-1.5 rounded-lg text-xs font-medium flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'templates'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span className="text-[10px]">Styles</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('canvas')}
            className={`py-1.5 rounded-lg text-xs font-medium flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'canvas'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[10px]">Canvas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`py-1.5 rounded-lg text-xs font-medium flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'card'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="text-[10px]">Theme</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('typography')}
            className={`py-1.5 rounded-lg text-xs font-medium flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'typography'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span className="text-[10px]">Type</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('elements')}
            className={`py-1.5 rounded-lg text-xs font-medium flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'elements'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="text-[10px]">Toggles</span>
          </button>
        </div>
      </div>

      {/* Tab Content Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
        {/* ============================================================
            TAB 1: TEMPLATES SELECTOR
        ============================================================ */}
        {activeTab === 'templates' && (
          <div className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
              Select Template Layout
            </h3>
            <div className="space-y-2">
              {templatesList.map((tpl) => {
                const isSelected = settings.template === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      // Adjust matching aspect ratio default if story selected
                      if (tpl.id === 'story') {
                        update({ template: tpl.id, aspectRatio: '9:16', cardTheme: 'glass' });
                      } else if (tpl.id === 'dark') {
                        update({ template: tpl.id, cardTheme: 'dark' });
                      } else {
                        update({ template: tpl.id });
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                    }`}
                  >
                    <span className="text-2xl select-none p-1">{tpl.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-sm">
                          {tpl.name}
                        </span>
                        {isSelected && (
                          <span className="text-xs text-blue-400 flex items-center gap-1 font-mono font-bold">
                            <Check className="w-3.5 h-3.5" /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-0.5 leading-normal">
                        {tpl.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: CANVAS & ASPECT RATIOS
        ============================================================ */}
        {activeTab === 'canvas' && (
          <div className="space-y-5">
            {/* Aspect Ratio Presets */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
                Aspect Ratio & Canvas Size
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {EXPORT_PRESETS.map((preset) => {
                  const isSelected = settings.aspectRatio === preset.aspectRatio;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => update({ aspectRatio: preset.aspectRatio })}
                      className={`p-2.5 text-left rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/30'
                          : 'bg-white/5 border-white/10 text-white/80 hover:border-white/20 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-white">
                          {preset.aspectRatio.toUpperCase()}
                        </span>
                        {preset.aspectRatio === '1:1' && <Square className="w-3.5 h-3.5 text-blue-400" />}
                        {preset.aspectRatio === '4:5' && <Smartphone className="w-3.5 h-3.5 text-blue-400" />}
                        {preset.aspectRatio === '9:16' && <Smartphone className="w-3.5 h-3.5 text-blue-400" />}
                        {preset.aspectRatio === '16:9' && <Monitor className="w-3.5 h-3.5 text-blue-400" />}
                        {preset.aspectRatio === 'auto' && <Maximize2 className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                      <div className="text-[10px] text-white/50 leading-tight truncate">
                        {preset.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Export Resolution Multiplier */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
                  Export Quality / DPI
                </h3>
                <span className="text-xs font-mono text-blue-400 font-bold">
                  {settings.exportResolution === 1 && '1x (Standard)'}
                  {settings.exportResolution === 2 && '2x (HD 2400px)'}
                  {settings.exportResolution === 4 && '4x (Ultra HD 4K+)'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 4].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => update({ exportResolution: scale as 1 | 2 | 4 })}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      settings.exportResolution === scale
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {scale}x Resolution
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Pattern */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
                Backdrop Pattern
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(['none', 'dots', 'grid'] as const).map((pat) => (
                  <button
                    key={pat}
                    type="button"
                    onClick={() => update({ patternType: pat })}
                    className={`py-2 rounded-xl border text-xs capitalize transition-all ${
                      settings.patternType === pat
                        ? 'bg-white/15 border-blue-500 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {pat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 3: THEME, COLORS & CARD APPEARANCE
        ============================================================ */}
        {activeTab === 'card' && (
          <div className="space-y-5">
            {/* Card Inner Theme */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
                Card Theme
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'glass'] as const).map((th) => (
                  <button
                    key={th}
                    type="button"
                    onClick={() => update({ cardTheme: th })}
                    className={`py-2 rounded-xl border text-xs capitalize font-medium transition-all ${
                      settings.cardTheme === th
                        ? 'bg-blue-600 text-white border-blue-500 shadow'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {th}
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient Presets */}
            <div className="space-y-2.5 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
                  Background Palette Presets
                </h3>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {GRADIENT_PRESETS.map((grad, i) => (
                  <button
                    key={i}
                    type="button"
                    title={grad.name}
                    onClick={() =>
                      update({
                        backgroundType: 'gradient',
                        gradientStart: grad.start,
                        gradientEnd: grad.end,
                        gradientAngle: grad.angle,
                      })
                    }
                    className="h-10 rounded-xl border border-white/10 hover:scale-105 transition-transform relative overflow-hidden shadow-sm"
                    style={{
                      background: `linear-gradient(${grad.angle}deg, ${grad.start}, ${grad.end})`,
                    }}
                  >
                    {settings.gradientStart === grad.start && settings.gradientEnd === grad.end && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient Angle Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Gradient Direction Angle</span>
                <span className="font-mono text-white">{settings.gradientAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="15"
                value={settings.gradientAngle}
                onChange={(e) => update({ gradientAngle: Number(e.target.value) })}
                className="w-full accent-blue-500 bg-white/10"
              />
            </div>

            {/* Card Padding */}
            <div className="space-y-1.5 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Card Inner Padding</span>
                <span className="font-mono text-white">{settings.cardPadding}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="48"
                step="4"
                value={settings.cardPadding}
                onChange={(e) => update({ cardPadding: Number(e.target.value) })}
                className="w-full accent-blue-500 bg-white/10"
              />
            </div>

            {/* Card Radius */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Corner Rounding</span>
                <span className="font-mono text-white">{settings.cardRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="36"
                step="2"
                value={settings.cardRadius}
                onChange={(e) => update({ cardRadius: Number(e.target.value) })}
                className="w-full accent-blue-500 bg-white/10"
              />
            </div>

            {/* Card Shadow */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
                Card Elevation Shadow
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(['none', 'soft', 'dramatic', 'glow'] as const).map((sh) => (
                  <button
                    key={sh}
                    type="button"
                    onClick={() => update({ cardShadow: sh })}
                    className={`py-1.5 rounded-xl border text-xs capitalize transition-all ${
                      settings.cardShadow === sh
                        ? 'bg-white/15 border-blue-500 text-white font-bold'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {sh}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 4: TYPOGRAPHY & TEXT
        ============================================================ */}
        {activeTab === 'typography' && (
          <div className="space-y-5">
            {/* Font Family Selector */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
                Font Family
              </h3>
              <div className="space-y-1.5">
                {FONT_OPTIONS.map((f) => {
                  const isSelected = settings.fontFamily === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => update({ fontFamily: f.id as FontFamilyType })}
                      className={`w-full px-3 py-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/30'
                          : 'bg-white/5 border-white/10 text-white/80 hover:border-white/20 hover:bg-white/[0.08]'
                      }`}
                    >
                      <span style={{ fontFamily: f.id }} className="text-sm">
                        {f.name}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">
                        {f.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
                Text Scale
              </h3>
              <div className="grid grid-cols-5 gap-1.5">
                {(['sm', 'md', 'lg', 'xl', '2xl'] as FontSizeOption[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => update({ fontSize: sz })}
                    className={`py-1.5 rounded-xl border text-xs font-mono uppercase transition-all ${
                      settings.fontSize === sz
                        ? 'bg-blue-600 border-blue-500 text-white shadow'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Alignment */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
                Text Alignment
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(['left', 'center', 'justify'] as TextAlignment[]).map((al) => (
                  <button
                    key={al}
                    type="button"
                    onClick={() => update({ textAlignment: al })}
                    className={`py-1.5 rounded-xl border text-xs capitalize transition-all ${
                      settings.textAlignment === al
                        ? 'bg-white/15 border-blue-500 text-white font-bold'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {al}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Height */}
            <div className="space-y-1.5 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Line Spacing</span>
                <span className="font-mono text-white">{settings.lineHeight}x</span>
              </div>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => update({ lineHeight: Number(e.target.value) })}
                className="w-full accent-blue-500 bg-white/10"
              />
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 5: TOGGLES & BRANDING
        ============================================================ */}
        {activeTab === 'elements' && (
          <div className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
              Element Visibility
            </h3>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
                <span className="text-xs font-medium text-white/90">Show Profile Avatar</span>
                <input
                  type="checkbox"
                  checked={settings.showAvatar}
                  onChange={(e) => update({ showAvatar: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
                <span className="text-xs font-medium text-white/90">Show Verified Badge</span>
                <input
                  type="checkbox"
                  checked={settings.showVerification}
                  onChange={(e) => update({ showVerification: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
                <span className="text-xs font-medium text-white/90">Show Published Date</span>
                <input
                  type="checkbox"
                  checked={settings.showDate}
                  onChange={(e) => update({ showDate: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
                <span className="text-xs font-medium text-white/90">Show Facebook Logo</span>
                <input
                  type="checkbox"
                  checked={settings.showFacebookLogo}
                  onChange={(e) => update({ showFacebookLogo: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
                <span className="text-xs font-medium text-white/90">Show Original Post URL</span>
                <input
                  type="checkbox"
                  checked={settings.showOriginalUrl}
                  onChange={(e) => update({ showOriginalUrl: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
                <div className="flex items-center gap-2">
                  <QrCode className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-medium text-white/90">Show Post QR Code</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showQrCode}
                  onChange={(e) => update({ showQrCode: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>
            </div>

            {/* Engagement Format */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
                Engagement Numbers Format
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'compact', label: 'Compact (1.2K)' },
                  { id: 'exact', label: 'Exact (1,245)' },
                  { id: 'hidden', label: 'Hide Stats' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => update({ engagementFormat: fmt.id as any })}
                    className={`p-2 rounded-xl border text-xs text-center transition-all ${
                      settings.engagementFormat === fmt.id
                        ? 'bg-white/15 border-blue-500 text-white font-bold'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
