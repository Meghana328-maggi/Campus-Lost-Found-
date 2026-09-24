import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    home: 'Home',
    lostItems: 'Lost Items',
    foundItems: 'Found Items',
    reportLost: 'Report Lost',
    reportFound: 'Report Found',
    searchPlaceholder: 'Search by title, brand, location, or keywords...',
    heroTitle: 'Reuniting Campus Belongings with Their Rightful Owners',
    heroSubtitle: 'A smart, secure platform with automated match detection, verified claims, and real-time campus community communication.',
    recentlyLost: 'Recently Lost Items',
    recentlyFound: 'Recently Found Items',
    howItWorks: 'How It Works',
    safetyGuidelines: 'Safety & Handover Guidelines',
    successStories: 'Recovery Stories',
    claimItem: 'Claim This Item',
    saveItem: 'Save Item',
    contactFinder: 'Contact Finder',
    myItems: 'My Items',
    myClaims: 'My Claims',
    savedItems: 'Saved Items',
    smartAlerts: 'Smart Alerts',
    adminDashboard: 'Admin Dashboard',
    profile: 'Profile',
    logout: 'Log Out',
    login: 'Log In',
    register: 'Sign Up',
    possibleMatch: 'Possible Match',
  },
  te: {
    home: 'హోమ్',
    lostItems: 'కోల్పోయిన వస్తువులు',
    foundItems: 'దొరికిన వస్తువులు',
    reportLost: 'పోగొట్టుకున్నట్లు తెలపండి',
    reportFound: 'దొరికినట్లు తెలపండి',
    searchPlaceholder: 'శీర్షిక, బ్రాండ్, స్థలం ద్వారా వెతకండి...',
    heroTitle: 'క్యాంపస్‌లో పోగొట్టుకున్న వస్తువులను యజమానులకు చేర్చండి',
    heroSubtitle: 'స్మార్ట్ స్వయంచాలక మ్యాచింగ్ మరియు సురక్షిత క్లెయిమ్‌లతో కూడిన క్యాంపస్ ప్లాట్‌ఫారమ్.',
    recentlyLost: 'ఇటీవల పోయిన వస్తువులు',
    recentlyFound: 'ఇటీవల దొరికిన వస్తువులు',
    howItWorks: 'ఇది ఎలా పనిచేస్తుంది',
    safetyGuidelines: 'భద్రతా మార్గదర్శకాలు',
    successStories: 'విజయ కథనాలు',
    claimItem: 'ఈ వస్తువును క్లెయిమ్ చేయండి',
    saveItem: 'సేవ్ చేయండి',
    contactFinder: 'దొరికిన వ్యక్తిని సంప్రదించండి',
    myItems: 'నా వస్తువులు',
    myClaims: 'నా క్లెయిమ్‌లు',
    savedItems: 'సేవ్ చేసినవి',
    smartAlerts: 'స్మార్ట్ అలర్ట్‌లు',
    adminDashboard: 'అడ్మిన్ డాష్‌బోర్డ్',
    profile: 'ప్రొఫైల్',
    logout: 'లాగ్ అవుట్',
    login: 'లాగిన్',
    register: 'రిజిస్టర్',
    possibleMatch: 'సాధ్యమైన సరిపోలిక',
  },
  hi: {
    home: 'होम',
    lostItems: 'खोया सामान',
    foundItems: 'पाया गया सामान',
    reportLost: 'खोया सामान दर्ज करें',
    reportFound: 'पाया सामान दर्ज करें',
    searchPlaceholder: 'शीर्षक, ब्रांड, स्थान या कीवर्ड से खोजें...',
    heroTitle: 'कैंपस में खोए सामान को उनके सही मालिक तक पहुंचाना',
    heroSubtitle: 'स्मार्ट स्वचालित मिलान, सत्यापित दावों और सुरक्षित वास्तविक समय मैसेजिंग के साथ एक आधुनिक प्लेटफॉर्म।',
    recentlyLost: 'हाल ही में खोया सामान',
    recentlyFound: 'हाल ही में मिला सामान',
    howItWorks: 'यह कैसे काम करता है',
    safetyGuidelines: 'सुरक्षा दिशानिर्देश',
    successStories: 'सफलता की कहानियां',
    claimItem: 'दावा प्रस्तुत करें',
    saveItem: 'सहेजें',
    contactFinder: 'खोजकर्ता से संपर्क करें',
    myItems: 'मेरे आइटम',
    myClaims: 'मेरे दावे',
    savedItems: 'सहेजे गए आइटम',
    smartAlerts: 'स्मार्ट अलर्ट',
    adminDashboard: 'एडमिन डैशबोर्ड',
    profile: 'प्रोफ़ाइल',
    logout: 'लॉग आउट',
    login: 'लॉग इन',
    register: 'साइन अप',
    possibleMatch: 'संभावित मिलान',
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
