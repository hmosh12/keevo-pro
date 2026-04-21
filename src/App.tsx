import React, { useState, useEffect } from 'react';
import { cn } from './lib/utils';
import { api } from './api';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Accounting from './components/Accounting';
import POS from './components/POS';
import Contacts from './components/Contacts';
import Expenses from './components/Expenses';
import Returns from './components/Returns';
import Damaged from './components/Damaged';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, ShieldCheck, Globe, ArrowRight } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRTL, setIsRTL] = useState(true); 
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [products, setProducts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [damagedItems, setDamagedItems] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [currencySettings, setCurrencySettings] = useState({
    baseCurrency: 'USD',
    rates: {
      USD: 1,
      SAR: 3.75,
      AED: 3.67,
      EGP: 48.50,
      IQD: 1310.00
    }
  });

  const [companyInfo, setCompanyInfo] = useState<any>({
    name: 'Keevo Trading Co.',
    logo: 'https://picsum.photos/seed/keevo/200/200',
    deliveryNumber: '+966 50 123 4567',
    address: 'King Fahd Road, Riyadh, Saudi Arabia',
    email: 'contact@keevo.com',
    website: 'www.keevo.com'
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');

  // Local storage persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('keevo_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const refreshData = async () => {
    if (!user?.companyId) return;
    try {
      const [
        company,
        productsList,
        contactsList,
        expensesList,
        returnsList,
        damagedList,
        salesList
      ] = await Promise.all([
        api.company.get(user.companyId),
        api.products.list(user.companyId),
        api.generic.list(user.companyId, 'contacts'),
        api.generic.list(user.companyId, 'expenses'),
        api.generic.list(user.companyId, 'returns'),
        api.generic.list(user.companyId, 'damaged_items'),
        api.sales.list(user.companyId)
      ]);

      if (company) setCompanyInfo(company);
      setProducts(productsList);
      setContacts(contactsList);
      setExpenses(expensesList);
      setReturns(returnsList);
      setDamagedItems(damagedList);
      setSales(salesList);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
      // Simple polling for "real-time" updates
      const interval = setInterval(refreshData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Sync Trial Status
  useEffect(() => {
    if (!companyInfo?.createdAt) return;

    if (companyInfo.isSubscribed === 1 || companyInfo.licenseStatus === 'active') {
      setIsTrialExpired(false);
      setTrialDaysLeft(null);
      return;
    }

    const createdAt = new Date(companyInfo.createdAt);
    const expiryDate = new Date(createdAt);
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    expiryDate.setDate(expiryDate.getDate() + 3);

    const now = new Date();
    const expired = now > expiryDate;
    setIsTrialExpired(expired);

    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setTrialDaysLeft(expired ? 0 : diffDays);
  }, [companyInfo?.createdAt, companyInfo.isSubscribed, companyInfo.licenseStatus]);

  const handleAuth = async () => {
    setError('');
    try {
      let userData;
      if (authMode === 'login') {
        userData = await api.auth.login({ email, password });
      } else {
        userData = await api.auth.register({ email, password, companyName });
      }
      setUser(userData);
      localStorage.setItem('keevo_user', JSON.stringify(userData));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateCompanyInfo = async (newInfo: any) => {
    if (!user?.companyId) return;
    try {
      await api.company.update(user.companyId, newInfo);
      setCompanyInfo({ ...companyInfo, ...newInfo });
    } catch (err) {
      console.error('Error updating company info:', err);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('keevo_user');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-white font-black tracking-widest uppercase text-xs animate-pulse">KEEVO ERP</p>
      </div>
    );
  }

  if (!user) {
    if (!showAuth) {
      return (
        <LandingPage 
          isRTL={isRTL} 
          onGetStarted={() => {
            setAuthMode('register');
            setShowAuth(true);
          }}
          onLogin={() => {
            setAuthMode('login');
            setShowAuth(true);
          }}
        />
      );
    }

    return (
      <div className={cn(
        "min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden",
        isRTL ? "font-['Cairo']" : "font-sans"
      )} dir={isRTL ? "rtl" : "ltr"}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-600/5 blur-[100px] rounded-full -z-10" />

        <button 
          onClick={() => setShowAuth(false)}
          className="absolute top-8 left-8 rtl:right-8 rtl:left-auto text-slate-400 hover:text-white flex items-center gap-2 font-bold px-4 py-2 bg-white/5 border border-white/10 rounded-xl transition-all"
        >
          <ArrowRight size={18} className={cn("rotate-180", isRTL && "rotate-0")} />
          <span>{isRTL ? 'العودة' : 'Back'}</span>
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="bg-white rounded-[40px] shadow-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-200 mx-auto mb-6 transform rotate-3">
                K
              </div>
              <h1 className="text-3xl font-black text-slate-800 mb-2">
                {authMode === 'login' ? (isRTL ? 'أهلاً بك مجدداً' : 'Welcome Back') : (isRTL ? 'ابدأ رحلة النجاح' : 'Start Success Journey')}
              </h1>
              <p className="text-slate-500 font-medium">
                {authMode === 'login' 
                  ? (isRTL ? 'قم بتسجيل الدخول لمتابعة أعمالك (SQLite)' : 'Sign in directly (SQLite)')
                  : (isRTL ? 'انضم إلى KEEVO وقم بإدارة تجارتك بذكاء' : 'Join KEEVO and manage your trade smartly')}
              </p>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
              <button 
                onClick={() => setAuthMode('login')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-black transition-all",
                  authMode === 'login' ? "bg-white text-indigo-600 shadow-md" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {isRTL ? 'دخول' : 'Login'}
              </button>
              <button 
                onClick={() => setAuthMode('register')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-black transition-all",
                  authMode === 'register' ? "bg-white text-indigo-600 shadow-md" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {isRTL ? 'تسجيل' : 'Register'}
              </button>
            </div>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleAuth(); }}>
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-2xl font-bold">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="admin@keevo.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {isRTL ? 'كلمة المرور' : 'Password'}
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {isRTL ? 'اسم الشركة' : 'Company Name'}
                  </label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder={isRTL ? 'شركة كيفو التجارية' : 'Keevo Trading Co.'}
                    required
                  />
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {authMode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                {authMode === 'login' ? (isRTL ? 'دخول' : 'Sign In') : (isRTL ? 'إنشاء الحساب' : 'Create Account')}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    const props = { isRTL, user, refreshData };
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            isRTL={isRTL} 
            sales={sales} 
            products={products} 
            expenses={expenses} 
            returns={returns} 
            damaged={damagedItems} 
          />
        );
      case 'inventory':
        return <Inventory {...props} products={products} />;
      case 'accounting':
        return (
          <Accounting 
            {...props} 
            currencySettings={currencySettings} 
            setCurrencySettings={setCurrencySettings} 
            sales={sales}
            auditLogs={[]} // We should fetch audit logs too if possible
          />
        );
      case 'pos':
        return <POS {...props} products={products} currencySettings={currencySettings} contacts={contacts} companyInfo={companyInfo} />;
      case 'contacts':
        return <Contacts {...props} products={products} currencySettings={currencySettings} contacts={contacts} />;
      case 'expenses':
        return <Expenses {...props} expenses={expenses} />;
      case 'returns':
        return <Returns {...props} returns={returns} />;
      case 'damaged':
        return <Damaged {...props} products={products} damagedItems={damagedItems} />;
      case 'settings':
        return <Settings {...props} companyInfo={companyInfo} setCompanyInfo={updateCompanyInfo} staff={staff} />;
      default:
        return <Dashboard isRTL={isRTL} />;
    }
  };

  return (
    <>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isRTL={isRTL} 
        setIsRTL={setIsRTL}
        user={user}
        companyInfo={companyInfo}
        logout={logout}
      >
        {renderContent()}
      </Layout>

      {!isTrialExpired && trialDaysLeft !== null && trialDaysLeft <= 7 && (
        <div className={cn(
          "fixed bottom-24 bg-amber-50 border border-amber-200 p-3 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-bottom-5",
          isRTL ? "right-8" : "left-8"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900 leading-none">
                {isRTL ? 'انتهاء الفترة التجريبية قريباً' : 'Trial Ending Soon'}
              </p>
              <p className="text-[10px] text-amber-700 mt-1">
                {isRTL 
                  ? `بقي ${trialDaysLeft} أيام على انتهاء اشتراكك` 
                  : `${trialDaysLeft} days remaining on your trial`}
              </p>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isTrialExpired && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-6 text-center"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 to-indigo-600" />
              
              <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <ShieldCheck size={48} />
              </div>

              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                {isRTL ? 'انتهت الفترة التجريبية' : 'Trial Period Expired'}
              </h2>
              
              <p className="text-slate-500 mb-8 leading-relaxed">
                {isRTL 
                  ? 'نشكرك على تجربة كيفو ERP. لقد انتهت صلاحية الفترة التجريبية. يرجى التواصل مع الدعم لتفعيل اشتراكك الكامل.'
                  : 'Thank you for trying Keevo ERP. Your trial period has ended. Please contact support to activate your full subscription.'}
              </p>

              <div className="space-y-3">
                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                  {isRTL ? 'تفعيل الاشتراك' : 'Activate Subscription'}
                </button>
                <button 
                  onClick={logout}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  {isRTL ? 'تسجيل الخروج' : 'Log Out'}
                </button>
              </div>

              <p className="mt-8 text-xs text-slate-400 font-medium">
                {isRTL ? 'لديك استفسار؟' : 'Have questions?'} 
                <span className="text-indigo-600 ml-1 cursor-pointer">support@keevo.com</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
