import React from 'react';

interface MetaAdLibraryLinkProps {
  vendor: string;
  t: any;
}

const MetaAdLibraryLink: React.FC<MetaAdLibraryLinkProps> = ({ vendor, t }) => {
  const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(vendor)}&search_type=keyword_unordered`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={t.searchInMeta}
      className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-light-background dark:hover:bg-dark-background"
    >
      <img src="https://www.citypng.com/public/uploads/preview/facebook-meta-logo-icon-hd-png-701751694777703xqxtpvbu9q.png" alt="Meta AdLibrary" className="w-5 h-5" />
    </a>
  );
};

export default MetaAdLibraryLink;
