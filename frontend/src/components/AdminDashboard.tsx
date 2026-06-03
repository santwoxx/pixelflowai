import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, increment, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { UserProfile, UsageLog } from '../types';
import { Shield, Users, Image as ImageIcon, Zap, History, Plus, RefreshCw, Star, ArrowUpRight } from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [recentLogs, setRecentLogs] = useState<UsageLog[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalImages: 0,
    freeUsers: 0,
    proUsers: 0,
    businessUsers: 0,
  });

  const [givingCreditsTo, setGivingCreditsTo] = useState<string | null>(null);
  const [creditsAmount, setCreditsAmount] = useState(10);
  const [updatingUser, setUpdatingUser] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch users
      const usersSnap = await getDocs(collection(db, 'users'));
      const list: UserProfile[] = [];
      let totalImgCount = 0;
      let free = 0, pro = 0, bus = 0;

      usersSnap.forEach((d) => {
        const u = d.data() as any;
        const profile: UserProfile = {
          uid: d.id,
          email: u.email || '',
          displayName: u.displayName || '',
          role: u.role || 'user',
          credits: u.credits ?? 5,
          subscriptionTier: u.subscriptionTier || 'free',
          imagesProcessed: u.imagesProcessed || 0,
          createdAt: u.createdAt?.toDate() || new Date(),
          updatedAt: u.updatedAt?.toDate() || new Date(),
        };
        list.push(profile);
        totalImgCount += profile.imagesProcessed;

        if (profile.subscriptionTier === 'pro') pro++;
        else if (profile.subscriptionTier === 'business') bus++;
        else free++;
      });

      setUsersList(list);

      // 2. Fetch recent logs
      const logsQuery = query(collection(db, 'usage_logs'), orderBy('createdAt', 'desc'), limit(15));
      const logsSnap = await getDocs(logsQuery);
      const logs: UsageLog[] = [];
      logsSnap.forEach((d) => {
        const l = d.data();
        logs.push({
          id: d.id,
          userId: l.userId,
          action: l.action,
          creditsDeducted: l.creditsDeducted || 0,
          createdAt: l.createdAt?.toDate() || new Date()
        });
      });
      setRecentLogs(logs);

      setStats({
        totalUsers: list.length,
        totalImages: totalImgCount,
        freeUsers: free,
        proUsers: pro,
        businessUsers: bus,
      });

    } catch (err) {
      console.error("Erro ao puxar dados de administrador:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddCredits = async (userId: string) => {
    setUpdatingUser(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        credits: increment(creditsAmount),
        updatedAt: serverTimestamp()
      });
      setGivingCreditsTo(null);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Erro ao creditar usuário.');
    } finally {
      setUpdatingUser(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-8 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-amber-400" />
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase font-display text-white">Painel de Administrador</h1>
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Visão analítica de faturamento, crescimento do SaaS e auditória de transações.</p>
        </div>
        <button
          onClick={fetchAdminData}
          className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors font-mono"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Sincronizar Dados</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-amber-400 mx-auto" />
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* Summary stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider block">Total de Usuários</span>
                <Users className="h-5 w-5 text-amber-500/80" />
              </div>
              <h2 className="text-3xl font-bold text-white font-display mb-1">{stats.totalUsers}</h2>
              <span className="text-[10px] text-slate-500 block font-mono">Contas Registradas</span>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider block">Imagens Processadas</span>
                <ImageIcon className="h-5 w-5 text-amber-500/80" />
              </div>
              <h2 className="text-3xl font-bold text-white font-display mb-1">{stats.totalImages}</h2>
              <span className="text-[10px] text-slate-500 block font-mono">Refinos Executados</span>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider block">Assinaturas Pro</span>
                <Star className="h-5 w-5 text-amber-400" />
              </div>
              <h2 className="text-3xl font-bold text-white font-display mb-1">{stats.proUsers}</h2>
              <span className="text-[10px] text-emerald-400 block font-mono font-bold">R$ {stats.proUsers * 29} MRR Planejado</span>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider block">Parcerias Business</span>
                <ArrowUpRight className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-white font-display mb-1">{stats.businessUsers}</h2>
              <span className="text-[10px] text-purple-400 block font-mono font-bold">R$ {stats.businessUsers * 79} MRR Corporativo</span>
            </div>

          </div>

          {/* Users Table / Subscriptions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-display">Telescópio de Clientes</h3>
              <p className="text-xs text-slate-500 leading-normal mt-0.5">Gestão das credenciais e contadores de processamento por usuário.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#090d1e] text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider border-b border-slate-800">
                  <tr>
                    <th scope="col" className="px-6 py-4">Nome / Email</th>
                    <th scope="col" className="px-6 py-4">Função</th>
                    <th scope="col" className="px-6 py-4">Plano</th>
                    <th scope="col" className="px-6 py-4">Uso de IA</th>
                    <th scope="col" className="px-6 py-4">Créditos</th>
                    <th scope="col" className="px-6 py-4">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {usersList.map((user) => (
                    <tr key={user.uid} className="hover:bg-slate-900/20">
                       <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-white">{user.displayName || 'Sem Nome'}</div>
                        <div className="text-slate-500 text-[10px] font-mono mt-0.5">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap uppercase text-[10px] font-bold tracking-wider">
                        <span className={`px-2 py-0.5 rounded-md ${user.role === 'admin' ? 'bg-red-500/15 border border-red-500/30 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize font-semibold">
                        <span className={`px-2 py-0.5 rounded-md ${user.subscriptionTier !== 'free' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                          {user.subscriptionTier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white font-mono font-semibold">
                        {user.imagesProcessed} refinadas
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">
                        {user.role === 'admin' ? (
                          <span className="text-amber-400 font-bold">♾️ Admin</span>
                        ) : (
                          <span className={`${user.credits <= 0 ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                            {user.credits} restantes
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {givingCreditsTo === user.uid ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={creditsAmount}
                              onChange={(e) => setCreditsAmount(parseInt(e.target.value) || 0)}
                              className="w-14 rounded-lg bg-slate-950 p-1.5 text-center text-xs font-mono font-bold text-amber-400 border border-slate-700 focus:outline-none"
                            />
                            <button
                              disabled={updatingUser}
                              onClick={() => handleAddCredits(user.uid)}
                              className="rounded-lg bg-amber-500 hover:bg-amber-600 px-2.5 py-1.5 text-[10px] font-bold text-slate-950 transition-colors"
                            >
                              Creditar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setGivingCreditsTo(user.uid)}
                            className="flex items-center gap-1.5 hover:text-amber-400 text-slate-400 transition-colors py-1 px-2.5 rounded-lg border border-slate-800 bg-slate-900 text-[10px] font-bold uppercase tracking-wider"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Crédito extra</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit telemetry logs */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white font-display">Auditória de Segurança de Uso</h3>
                <p className="text-xs text-slate-500 leading-normal mt-0.5">Logs cronológicos das mutações e subtrações de crédito do SaaS.</p>
              </div>
              <History className="h-4 w-4 text-slate-600" />
            </div>

            <div className="p-6 max-h-[350px] overflow-y-auto divide-y divide-slate-800/80 font-mono text-xs">
              {recentLogs.map((log) => (
                <div key={log.id} className="py-3 flex justify-between items-center gap-6">
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    <span className="text-[10px] text-slate-500 font-semibold">{log.createdAt.toLocaleTimeString('pt-BR')}</span>
                    <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">UID: {log.userId.slice(0, 8)}...</span>
                    <span className="text-slate-300">{log.action}</span>
                  </div>
                  {log.creditsDeducted > 0 && (
                    <span className="text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 rounded-md px-1.5 py-0.5 text-[10px]">
                      -{log.creditsDeducted} Créd.
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
