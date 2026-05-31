import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rss, Globe, CheckCircle2, XCircle, Settings2 } from 'lucide-react';

export default function AdminScrapeSourcesPanel({ connections, palette }) {
  const navigate = useNavigate();
  const sources = connections?.sources || [];
  const active = connections?.active ?? 0;
  const total = connections?.total ?? 0;
  const ingest = connections?.ingest || {};
  const rssFromIngest = ingest.rss_feeds_used_by_scraper;
  const rssFromKind = sources.filter((s) => s.kind === 'rss').length;
  const rssUsed =
    typeof rssFromIngest === 'number' && rssFromIngest > 0
      ? rssFromIngest
      : rssFromKind || ingest.rss_catalog_feeds || 0;
  const truncated = connections?.sources_truncated;

  return (
    <section
      id="dashboard-sources"
      style={{
        backgroundColor: palette.card,
        borderRadius: 14,
        border: `1px solid ${palette.border}`,
        boxShadow: `0 1px 2px ${palette.shadowLight}`,
        marginBottom: 20,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '16px 18px',
          borderBottom: `1px solid ${palette.borderLight}`,
          backgroundColor: palette.pageAlt,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: palette.textPrimary }}>Scrape sources</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: palette.textSecondary }}>
            {active} of {total} in Admin · RSS scraper uses {rssUsed} feeds (catalog + connections)
          </p>
          {total < rssUsed ? (
            <p style={{ margin: '4px 0 0', fontSize: 11, color: palette.textTertiary }}>
              Fewer rows here than feeds at scrape time — open Manage to sync catalog, or redeploy after code updates.
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/settings#admin-sources')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
            padding: '9px 14px',
            borderRadius: 10,
            border: `1px solid ${palette.border}`,
            background: palette.card,
            color: palette.textPrimary,
            cursor: 'pointer',
            boxShadow: `0 1px 2px ${palette.shadowLight}`,
          }}
        >
          <Settings2 size={15} />
          Manage
        </button>
      </div>
      <div style={{ padding: 16 }}>
        {sources.length === 0 ? (
          <p style={{ fontSize: 13, color: palette.textSecondary, margin: 0 }}>No scrape sources configured.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 10,
              maxHeight: 480,
              overflowY: 'auto',
              paddingRight: 4,
            }}
          >
            {sources.map((s) => {
              const Icon = s.kind === 'rss' ? Rss : Globe;
              const on = s.active !== false;
              return (
                <div
                  key={`${s.slug}-${s.url || s.name}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `1px solid ${palette.border}`,
                    backgroundColor: on ? palette.successBg : palette.pageAlt,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: palette.card,
                      border: `1px solid ${palette.borderLight}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={17} color={on ? palette.success : palette.textTertiary} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: palette.textPrimary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.name}
                    </div>
                    <div style={{ fontSize: 11, color: palette.textTertiary, marginTop: 2 }}>
                      {s.source_key || s.slug}
                    </div>
                  </div>
                  {on ? (
                    <CheckCircle2 size={16} color={palette.success} strokeWidth={2.5} />
                  ) : (
                    <XCircle size={16} color={palette.error} />
                  )}
                </div>
              );
            })}
          </div>
        )}
        {truncated ? (
          <p style={{ margin: '12px 0 0', fontSize: 12, color: palette.textTertiary }}>
            Showing first {sources.length} of {total}. Open Manage for the full list.
          </p>
        ) : null}
      </div>
    </section>
  );
}
