import React from 'react';
import { FlaskConical, Info } from 'lucide-react';

/**
 * Visible in both catalogue and editor so the development status is never
 * hidden when someone enters through the navigation or opens a draft.
 */
export default function BetaNotice({ section }) {
  return (
    <aside className="beta-notice" role="note" aria-label={`${section} beta status`}>
      <div className="beta-notice-icon" aria-hidden="true"><FlaskConical size={20}/></div>
      <div className="beta-notice-copy">
        <div className="beta-notice-title">
          <span className="beta-status-chip">BETA</span>
          <strong>{section} is still under development</strong>
        </div>
        <p>
          You can explore and test the available drafts, but features, wording and
          document formats may be incomplete or change. Do not rely on these
          drafts as approved institutional forms. Check the latest NESTS rules
          and your office's requirements before official use.
        </p>
      </div>
      <Info size={17} className="beta-notice-info" aria-hidden="true"/>
    </aside>
  );
}
