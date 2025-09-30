import React from 'react';

function PageInfo({ pageInfo, isLoading }) {
  if (isLoading) {
    return <div className="page-info loading">Loading page info...</div>;
  }

  if (!pageInfo) {
    return <div className="page-info error">Unable to access page info</div>;
  }

  return (
    <div className="page-info">
      <div className="info-row">
        <span className="label">URL:</span>
        <span className="value">{pageInfo.url}</span>
      </div>
      <div className="info-row">
        <span className="label">Title:</span>
        <span className="value">{pageInfo.title}</span>
      </div>
      <div className="info-row">
        <span className="label">Elements:</span>
        <span className="value">{pageInfo.elementCount}</span>
      </div>
    </div>
  );
}

export default PageInfo;
