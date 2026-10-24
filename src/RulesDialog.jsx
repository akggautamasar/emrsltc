import React, {useEffect, useMemo, useState} from 'react';
import {X, BookOpen, ExternalLink, Search, ShieldCheck, FileText, Landmark, Info, ChevronRight} from 'lucide-react';
import {medicalRules} from './rules.js';
import {ceaRules} from './ceaRules.js';
import {policyLibrary} from './policyLibrary.js';

const formatLegacy = (group, sourceId) => ({
  ...group,
  sources: [sourceId],
  legacy: true
});

export default function RulesDialog({form, onClose}) {
  const [query, setQuery] = useState('');
  const policy = policyLibrary[form];

  useEffect(() => setQuery(''), [form]);
  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const allGroups = useMemo(() => {
    if (!policy) return [];
    const previous = form === 'medical'
      ? medicalRules.map(g => formatLegacy(g, 'med-nests-2024'))
      : form === 'cea'
        ? ceaRules.map(g => formatLegacy(g, 'cea-nests-apr'))
        : [];
    return [
      ...policy.groups,
      ...previous
    ];
  }, [form, policy]);

  if (!policy) return null;
  const findSource = id => policy.sources.find(source => source.id === id);
  const normalized = query.trim().toLocaleLowerCase();
  const matches = group => (
    [group.title, group.page, ...(group.points || []),
      ...(group.sources || []).map(id => findSource(id)?.title || '')]
      .join(' ').toLocaleLowerCase().includes(normalized)
  );
  const visibleGroups = normalized ? allGroups.filter(matches) : allGroups;
  const visibleSources = normalized
    ? policy.sources.filter(source =>
        [source.title, source.date, source.agency, source.details, source.kind]
          .join(' ').toLocaleLowerCase().includes(normalized))
    : policy.sources;
  const recentGroups = visibleGroups.filter(g => !g.legacy);
  const previousGroups = visibleGroups.filter(g => g.legacy);
  const renderGroup = (group, i) => (
    <details className="rule-group policy-group" key={group.title} open={!!normalized || i === 0}>
      <summary>
        <span className="policy-summary-left"><strong>{group.title}</strong><small>{group.page}</small></span>
        <ChevronRight size={18} className="policy-chevron"/>
      </summary>
      <div className="policy-group-content">
        <ul>{group.points.map((point, j) => <li key={j}>{point}</li>)}</ul>
        <div className="policy-rule-references">
          <span>Original sources:</span>
          {(group.sources || []).map(id => {
            const source = findSource(id);
            return source ? <a key={id} href={source.url} target="_blank"
              rel="noopener noreferrer" title={source.title}><FileText size={13}/>
              {source.agency} <ExternalLink size={12}/></a> : null;
          })}
        </div>
      </div>
    </details>
  );

  return <div className="rules-overlay" role="presentation"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="rules-dialog policy-dialog" role="dialog" aria-modal="true"
      aria-label={policy.title} aria-describedby="policy-notice">
      <div className="rules-header policy-header">
        <div className="rules-header-title">
          <span className="rules-icon"><BookOpen size={20}/></span>
          <div>
            <span className="section-kicker">OFFICIAL CLAIM RULES & CIRCULARS</span>
            <h2>{policy.title}</h2>
            <p>{policy.reference}</p>
          </div>
        </div>
        <button type="button" className="rules-close" onClick={onClose}
          aria-label="Close rules"><X size={21}/></button>
      </div>
      <div className="rules-body policy-body">
        <div className="rules-notice" id="policy-notice">
          <ShieldCheck size={20}/>
          <p>{policy.notice}</p>
        </div>
        <div className="policy-source-summary">
          <span><Landmark size={15}/> Primary sources: NESTS / Government of India</span>
          <span><FileText size={15}/> {policy.sources.length} official reference links</span>
          <span><Info size={15}/> No automatic sanction or entitlement</span>
        </div>
        <div className="rules-search">
          <Search size={17}/>
          <input aria-label={`Search ${policy.title} rules`} value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search eligibility, approvals, advance, documents, rates, source title…"/>
          {query && <button type="button" className="policy-search-clear"
            onClick={() => setQuery('')} aria-label="Clear rules search"><X size={16}/></button>}
        </div>
        <div className="policy-section-heading">
          <h3>Applicable rules & claim checklist</h3>
          <span>{visibleGroups.length} topics</span>
        </div>
        <div className="rule-groups">
          {recentGroups.map(renderGroup)}
          {previousGroups.length > 0 && <div className="policy-section-heading policy-legacy-heading">
            <h3>Detailed background from the original NESTS circular</h3>
            <span>Source-specific notes</span>
          </div>}
          {previousGroups.map((group, i) => renderGroup(group, i + recentGroups.length))}
          {visibleGroups.length === 0 && <div className="rules-empty">
            No matching rule sections. Search another term or use the official documents below.
          </div>}
        </div>
        <div className="policy-sources" id="policy-original-sources">
          <div className="policy-section-heading">
            <h3><FileText size={19}/> Official circulars & original PDFs</h3>
            <span>Open government sources</span>
          </div>
          <p className="policy-sources-intro">
            Links open the issuing authority's own PDF or a government-hosted official
            compilation. Check later amendments and the date of travel, treatment
            or academic year before using any historical rate or deadline.
          </p>
          <div className="policy-source-grid">
            {visibleSources.map((source, i) => <a className="policy-source-card" key={source.id}
                href={source.url} target="_blank" rel="noopener noreferrer"
                aria-label={`Open ${source.title} (${source.kind})`}>
                <div className="policy-source-card-heading">
                  <span className="policy-source-number">{String(i+1).padStart(2,'0')}</span>
                  <span className="policy-source-kind">{source.kind}</span>
                  <ExternalLink size={15}/>
                </div>
                <strong>{source.title}</strong>
                <span className="policy-source-meta">{source.agency} · {source.date}</span>
                <p>{source.details}</p>
                <span className="policy-open-source">Open original reference <ExternalLink size={13}/></span>
              </a>)}
          </div>
          {visibleSources.length === 0 && <p className="rules-empty">No official documents match the search. Clear the search to see every link.</p>}
        </div>
        <p className="policy-last-note">
          Information is a document-preparation reference, not legal or financial sanction.
          In case of inconsistency, current official circulars, amendments and NESTS
          administrative directions take precedence.
        </p>
      </div>
      <div className="rules-footer policy-footer">
        <span><ShieldCheck size={15}/> Refer to the linked official orders before submission</span>
        <button type="button" className="rules-done" onClick={onClose}>Back to forms</button>
      </div>
    </section>
  </div>;
}
