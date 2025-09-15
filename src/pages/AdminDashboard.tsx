import React, { useState, useEffect } from 'react';
import { Users, Store, Star, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { DashboardStats, User, Store as StoreType } from '../types';
import CreateUserModal from '../components/CreateUserModal';
import CreateStoreModal from '../components/CreateStoreModal';
import EditStoreModal from '../components/EditStoreModal';
import EditUserModal from '../components/EditUserModal';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'stores'>(() => {
    const savedTab = localStorage.getItem('adminDashboardActiveTab');
    if (savedTab === 'users' || savedTab === 'stores' || savedTab === 'overview') {
      return savedTab;
    }
    return 'overview';
  });
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [storeRatingFilter, setStoreRatingFilter] = useState('');
  const [storeSearch, setStoreSearch] = useState('');
  const [userSort, setUserSort] = useState({ field: 'name', order: 'asc' });
  const [storeSort, setStoreSort] = useState({ field: 'name', order: 'asc' });
  const [showEditStore, setShowEditStore] = useState(false);
  const [editStoreData, setEditStoreData] = useState<StoreType | null>(null);

  // Ratings modal state
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const [ratings, setRatings] = useState<any[]>([]);
  const [ratingsStore, setRatingsStore] = useState<StoreType | null>(null);

  const handleViewRatings = async (store: StoreType) => {
    setRatingsStore(store);
    setShowRatingsModal(true);
    try {
      const response = await api.get(`/admin/stores/${store.id}/ratings`);
      setRatings(response.data);
    } catch {
      toast.error('Failed to fetch ratings');
      setRatings([]);
    }
  };

  const fetchStats = React.useCallback(async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch {
      toast.error('Failed to fetch dashboard stats');
    }
  }, []);

  const fetchUsers = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
  if (userSearch) params.append('search', userSearch);
  if (userRoleFilter) params.append('role', userRoleFilter);
  // Removed userRoleFilter logic (not used)
      params.append('sortBy', userSort.field);
      params.append('sortOrder', userSort.order);

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data);
    } catch {
      toast.error('Failed to fetch users');
    }
  }, [userSearch, userSort, userRoleFilter]);

  const fetchStores = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
  if (storeSearch) params.append('search', storeSearch);
  if (storeRatingFilter) params.append('rating', storeRatingFilter);
      params.append('sortBy', storeSort.field);
      params.append('sortOrder', storeSort.order);

      const response = await api.get(`/admin/stores?${params}`);
      setStores(response.data);
    } catch {
      toast.error('Failed to fetch stores');
    }
  }, [storeSearch, storeSort, storeRatingFilter]);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'stores') {
      fetchStores();
    }
    localStorage.setItem('adminDashboardActiveTab', activeTab);
  }, [activeTab, fetchStats, fetchUsers, fetchStores]);


  const [showEditUser, setShowEditUser] = useState(false);
  const [editUserData, setEditUserData] = useState<User | null>(null);
  const handleEditUser = (user: User) => {
    setEditUserData(user);
    setShowEditUser(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('User deleted successfully');
        fetchStats();
        fetchUsers();
      } catch {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleEditStore = (store: StoreType) => {
    setEditStoreData(store);
    setShowEditStore(true);
  };

  const handleDeleteStore = async (storeId: number) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        await api.delete(`/admin/stores/${storeId}`);
        toast.success('Store deleted successfully');
        fetchStats();
        fetchStores();
      } catch {
        toast.error('Failed to delete store');
      }
    }
  };

  const handleSort = (field: string, type: 'user' | 'store') => {
    if (type === 'user') {
      setUserSort(prev => ({
        field,
        order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
      }));
    } else {
      setStoreSort(prev => ({
        field,
        order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
      }));
    }
  };

  interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
  }
  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}> 
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateUser(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
          <button
            onClick={() => setShowCreateStore(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Store</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'Users' },
            { id: 'stores', label: 'Stores' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as 'overview' | 'users' | 'stores');
                localStorage.setItem('adminDashboardActiveTab', tab.id);
              }}
              className={`py-2 px-4 font-medium text-sm rounded-t transition-colors duration-150
                ${activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-blue-600'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Stores"
            value={stats.totalStores}
            icon={Store}
            color="bg-green-500"
          />
          <StatCard
            title="Total Ratings"
            value={stats.totalRatings}
            icon={Star}
            color="bg-yellow-500"
          />
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or address..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <select
              value={userRoleFilter}
              onChange={e => setUserRoleFilter(e.target.value)}
              className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      { key: 'name', label: 'Name' },
                      { key: 'email', label: 'Email' },
                      { key: 'role', label: 'Role' },
                    ].map((header) => (
                      <th
                        key={header.key}
                        onClick={() => handleSort(header.key, 'user')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>{header.label}</span>
                          <span className="text-gray-400">
                            {userSort.field === header.key && (userSort.order === 'asc' ? '↑' : '↓')}
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No users found.</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={
                              user.role === 'store_owner'
                                ? 'font-semibold text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.7)] animate-glow'
                                : user.role === 'admin'
                                ? 'font-semibold text-green-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.7)] animate-glow'
                                : 'font-semibold text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.7)] animate-glow'
                            }
                            style={{
                              textShadow: user.role === 'store_owner'
                                ? '0 0 8px #60a5fa, 0 0 16px #60a5fa99'
                                : user.role === 'admin'
                                ? '0 0 8px #4ade80, 0 0 16px #4ade8099'
                                : '0 0 8px #f87171, 0 0 16px #f8717199',
                            }}
                          >
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            className="px-2 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600"
                            onClick={() => handleEditUser(user)}
                          >Edit</button>
                          <button
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => handleDeleteUser(user.id)}
                          >Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <EditUserModal
            user={editUserData}
            open={showEditUser}
            onClose={() => setShowEditUser(false)}
            onSuccess={() => {
              fetchUsers();
              setEditUserData(null);
            }}
          />
        </div>
      )}

      {/* Stores Tab */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or address..."
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <select
              value={storeRatingFilter}
              onChange={e => setStoreRatingFilter(e.target.value)}
              className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars & up</option>
              <option value="3">3 Stars & up</option>
              <option value="2">2 Stars & up</option>
              <option value="1">1 Star & up</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      { key: 'name', label: 'Name' },
                      { key: 'email', label: 'Email' },
                      { key: 'address', label: 'Address' },
                      { key: 'rating', label: 'Rating' },
                      { key: 'total_ratings', label: 'Total Ratings' },
                    ].map((header) => (
                      <th
                        key={header.key}
                        onClick={() => handleSort(header.key, 'store')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-1">
                          <span>{header.label}</span>
                          <span className="text-gray-400">
                            {storeSort.field === header.key && (storeSort.order === 'asc' ? '↑' : '↓')}
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stores.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No stores found.</td>
                    </tr>
                  ) : (
                    stores.map((store) => (
                      <tr key={store.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{store.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{store.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            {store.rating !== undefined && store.rating !== null ? parseFloat(store.rating.toString()).toFixed(1) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.total_ratings}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {/* Edit Store Modal */}
          {showEditStore && editStoreData && (
            <EditStoreModal
              store={editStoreData}
              onClose={() => {
                setShowEditStore(false);
                setEditStoreData(null);
              }}
              onSuccess={() => {
                fetchStores();
                setShowEditStore(false);
                setEditStoreData(null);
              }}
            />
          )}
                          <button
                            className="px-2 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600"
                            onClick={() => handleEditStore(store)}
                          >Edit</button>
                          <button
                            className="px-2 py-1 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600"
                            onClick={() => handleViewRatings(store)}
                          >View Ratings</button>
                          <button
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => handleDeleteStore(store.id)}
                          >Delete</button>
                        </td>
      {/* Ratings Modal */}
      {showRatingsModal && ratingsStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setShowRatingsModal(false);
                setRatings([]);
                setRatingsStore(null);
              }}
            >✕</button>
            <h2 className="text-xl font-bold mb-4">Ratings for {ratingsStore.name}</h2>
            {ratings.length === 0 ? (
              <div className="text-gray-500">No ratings found for this store.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ratings.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{r.rater_name || r.user_name || 'Unknown'}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{r.user_email || '-'}</td>
                        <td className="px-4 py-2 text-sm text-yellow-600 font-bold">{r.rating}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{r.comment || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-400">{new Date(r.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals for create user/store */}
      {showCreateUser && (
        <CreateUserModal
          onClose={() => setShowCreateUser(false)}
          onSuccess={() => {
            setShowCreateUser(false);
            fetchStats();
            if (activeTab === 'users') fetchUsers();
          }}
        />
      )}

      {showCreateStore && (
        <CreateStoreModal
          onClose={() => setShowCreateStore(false)}
          onSuccess={() => {
            setShowCreateStore(false);
            fetchStats();
            if (activeTab === 'stores') fetchStores();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;