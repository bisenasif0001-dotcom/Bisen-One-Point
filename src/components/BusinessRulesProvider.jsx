import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_BUSINESS_RULES } from '../data/businessRules';
import { studioRequest } from '../utils/studioApi';

const BusinessContext = createContext({ rules: DEFAULT_BUSINESS_RULES, refresh: () => {} });
export function useBusinessRules() { return useContext(BusinessContext); }
export default function BusinessRulesProvider({ children }) {
  const [rules, setRules] = useState(DEFAULT_BUSINESS_RULES);
  const refresh = () => studioRequest('/public/config').then(result => { if (result.businessRules) setRules(result.businessRules); }).catch(() => {});
  useEffect(() => { refresh(); window.addEventListener('focus', refresh); return () => window.removeEventListener('focus', refresh); }, []);
  return <BusinessContext.Provider value={{ rules, refresh }}>{children}</BusinessContext.Provider>;
}
