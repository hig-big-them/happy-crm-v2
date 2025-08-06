'use client';

import React from 'react';

// React 19 compatibility polyfill
if (typeof window !== 'undefined' && !React.useLayoutEffect) {
  // @ts-ignore
  React.useLayoutEffect = React.useEffect;
}

export {};