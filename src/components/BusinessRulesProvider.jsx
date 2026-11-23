import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_BUSINESS_RULES } from '../data/businessRules';
import { studioRequest } from '../utils/studioApi';
import { setActivePriceOverrides } from '../utils/priceRegistry';

const BusinessContext = createContext({ rules: DEFAULT_BUSINESS_RULES, priceOverrides: {}, refresh: () => {} });
export function useBusinessRules() { return useContext(BusinessContext); }
export function usePriceOverrides() { return useContext(BusinessContext).priceOverrides; }

export default function BusinessRulesProvider({ children }) {
  const [rules, setRules] = useState(DEFAULT_BUSINESS_RULES);
  const [priceOverrides, setPriceOverrides] = useState({});

  const refresh = () => studioRequest('/public/config').then(result => {
    if (result.businessRules) setRules(result.businessRules);
    if (result.priceOverrides) {
      setPriceOverrides(result.priceOverrides);
      setActivePriceOverrides(result.priceOverrides);
    }
  }).catch(() => {});

  useEffect(() => { refresh(); window.addEventListener('focus', refresh); return () => window.removeEventListener('focus', refresh); }, []);
  return <BusinessContext.Provider value={{ rules, priceOverrides, refresh }}>{children}</BusinessContext.Provider>;
}
