import React, { useState, useEffect, createContext, useContext } from 'react';
import { Shield, LayoutDashboard, FileText, BarChart3, Key, Settings, Users, LogOut, Eye, Copy, AlertCircle, Loader2, Plus, Download, ExternalLink } from 'lucide-react';

// API Configuration
const API_BASE_URL = process.env.VITE_API_URL || 'https://accessmatic-backend-production.up.railway.app';

// Types
interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization: {
    id: string;
    name: string;
    plan_type: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  organization_name: string;
  plan_type: string;
}

// API Client
class APIClient {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessmatic_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessmatic_token', token);
    } else {
      localStorage.removeItem('accessmatic_token');
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async register(userData: RegisterData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  async logout() {
    this.setToken(null);
  }

  async getDocuments(params: Record<string, string> = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/documents${queryString ? `?${queryString}` : ''}`);
  }

  async getAPIKeys() {
    return await this.request('/api-keys');
  }

  async createAPIKey(name: string, permissions: string[] = []) {
    return await this.request('/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name, permissions }),
    });
  }

  async getAnalytics(timeframe = '30d') {
    return await this.request(`/analytics/dashboard?timeframe=${timeframe}`);
  }
}

const apiClient = new APIClient();

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessmatic_token');
      if (token) {
        try {
          const userData = await apiClient.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Auth check failed:', error);
          apiClient.setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    setUser(response.user);
  };

  const register = async (userData: RegisterData) => {
    const response = await apiClient.register(userData);
    setUser(response.user);
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// UI Components
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false, 
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, error, children, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

interface AlertProps {
  children: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ children, type = 'info', className = '' }) => {
  const types = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className={`p-4 border rounded-md ${types[type]} ${className}`}>
      {children}
    </div>
  );
};

// Login Page
const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-blue-600" />
            <span className="ml-3 text-3xl font-bold text-gray-900">AccessMatic</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Demo credentials: admin@demo.com / password
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert type="error">
                <div className="flex">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </Alert>
            )}

            <Input
              label="Email address"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Button variant="ghost" className="p-0 h-auto font-medium text-blue-600 hover:text-blue-500">
              Create one here
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Register Page
const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    organization_name: '',
    plan_type: 'small'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        organization_name: formData.organization_name,
        plan_type: formData.plan_type
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const planOptions = {
    small: { name: 'Small Government', price: '$99/month', description: '500 PDF accesses' },
    medium: { name: 'Medium Government', price: '$299/month', description: '2,000 PDF accesses' },
    large: { name: 'Large Government', price: '$599/month', description: '5,000 PDF accesses' }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-blue-600" />
            <span className="ml-3 text-3xl font-bold text-gray-900">AccessMatic</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">Start your 30-day free trial today</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert type="error">
                <div className="flex">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full name"
                name="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
              />

              <Input
                label="Email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@city.gov"
              />
            </div>

            <Input
              label="Organization name"
              name="organization_name"
              type="text"
              required
              value={formData.organization_name}
              onChange={handleChange}
              placeholder="City of Maplewood"
            />

            <Select
              label="Plan type"
              name="plan_type"
              value={formData.plan_type}
              onChange={handleChange}
            >
              {Object.entries(planOptions).map(([key, plan]) => (
                <option key={key} value={key}>
                  {plan.name} - {plan.price} ({plan.description})
                </option>
              ))}
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />

              <Input
                label="Confirm password"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Start free trial'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Button variant="ghost" className="p-0 h-auto font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Sidebar Component
interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Overview', path: 'dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: 'documents', icon: FileText },
    { name: 'Analytics', path: 'analytics', icon: BarChart3 },
    { name: 'API Keys', path: 'api-keys', icon: Key },
    { name: 'Settings', path: 'settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-y-0 z-50 flex w-64 flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Shield className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">AccessMatic</span>
        </div>
        
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.path;
                  
                  return (
                    <li key={item.name}>
                      <button
                        onClick={() => setCurrentPage(item.path)}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full text-left ${
                          isActive
                            ? 'bg-gray-50 text-blue-600'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
            
            <li className="mt-auto">
              <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
                <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.full_name || 'Demo User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.organization?.name || 'Demo Organization'}
                  </div>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 w-full text-left"
              >
                <LogOut className="h-6 w-6 shrink-0" />
                Sign out
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

// Header Component
const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
          <div className="flex items-center gap-x-2">
            <span className="text-sm text-gray-500">Plan:</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {user?.organization?.plan_type || 'Small'} Government
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Overview Page
const DashboardOverview: React.FC = () => {
  const [analytics] = useState({
    total_documents_processed: 127,
    total_documents_accessed: 2456,
    avg_accessibility_score: 94.2,
    compliance_rate: 98.5
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Welcome to AccessMatic
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Get started by setting up your first integration or review your accessibility metrics.
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button className="mr-3">
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Quick Setup Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Quick Setup</h3>
          <span className="text-sm text-gray-500">5 minutes to complete</span>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Add AccessMatic to Your Website</h4>
            <p className="text-sm text-blue-700 mb-3">
              Copy and paste this script tag into your website's &lt;head&gt; section:
            </p>
            <div className="bg-gray-900 rounded p-3 text-green-400 font-mono text-sm">
              <div className="text-white">&lt;script</div>
              <div className="ml-4 text-yellow-400">src="https://cdn.accessmatic.us/v1/accessmatic.min.js"</div>
              <div className="ml-4 text-blue-400">data-accessmatic-key="am_demo_1234567890"</div>
              <div className="ml-4 text-purple-400">data-auto-discover="true"&gt;</div>
              <div className="text-white">&lt;/script&gt;</div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => copyToClipboard('<script src="https://cdn.accessmatic.us/v1/accessmatic.min.js" data-accessmatic-key="am_demo_1234567890" data-auto-discover="true"></script>')}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Integration Code
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Documents Processed
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {analytics.total_documents_processed}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Eye className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Documents Accessed
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {analytics.total_documents_accessed}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Avg. Accessibility Score
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {analytics.avg_accessibility_score}%
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Compliance Rate
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {analytics.compliance_rate}%
                </dd>
              </dl>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// API Keys Page
const APIKeysPage: React.FC = () => {
  const [apiKeys] = useState([
    {
      id: '1',
      name: 'Production Website',
      key: 'am_prod_1234567890abcdef',
      created_at: '2024-01-15T10:30:00Z',
      last_used_at: '2024-01-20T14:22:00Z',
      permissions: ['read', 'process']
    }
  ]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            API Keys
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your API keys for integrating AccessMatic with your websites.
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {key.name}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                      <span>Last used {new Date(key.last_used_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(key.key)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="font-mono text-sm bg-gray-100 p-2 rounded border">
                    {key.key}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Documents Page
const DocumentsPage: React.FC = () => {
  const [documents] = useState([
    {
      id: '1',
      title: 'City Budget 2024.pdf',
      original_url: 'https://example.gov/budget-2024.pdf',
      status: 'completed',
      accessibility_score: 94,
      processed_at: '2024-01-20T10:30:00Z',
      page_url: 'https://example.gov/budget',
      compliance_level: 'WCAG AA'
    },
    {
      id: '2',
      title: 'Council Meeting Minutes - March.pdf',
      original_url: 'https://example.gov/minutes-march.pdf',
      status: 'processing',
      accessibility_score: null,
      processed_at: null,
      page_url: 'https://example.gov/meetings',
      compliance_level: null
    }
  ]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Documents
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage processed documents and their accessibility status.
          </p>
        </div>
      </div>

      {/* Documents Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accessibility Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {doc.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {doc.page_url}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(doc.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {doc.accessibility_score ? (
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {doc.accessibility_score}%
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {doc.compliance_level}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.processed_at ? new Date(doc.processed_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// Main Dashboard Layout
const DashboardLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'documents':
        return <DocumentsPage />;
      case 'api-keys':
        return <APIKeysPage />;
      case 'analytics':
        return (
          <div className="p-8 text-center text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
            <p>Coming soon - detailed analytics and reporting features</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-8 text-center text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
            <p>Coming soon - organization and account settings</p>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="lg:pl-64">
        <Header />
        
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('login');

  useEffect(() => {
    // Simple routing based on user state
    if (user) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('login');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        </div>
      </div>
    );
  }

  // Demo mode - allow switching between views
  if (!user) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <Button
            variant={currentView === 'login' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('login')}
          >
            Login
          </Button>
          <Button
            variant={currentView === 'register' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('register')}
          >
            Register
          </Button>
          <Button
            variant={currentView === 'dashboard' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('dashboard')}
          >
            Demo Dashboard
          </Button>
        </div>
        
        {currentView === 'login' && <LoginPage />}
        {currentView === 'register' && <RegisterPage />}
        {currentView === 'dashboard' && <DashboardLayout />}
      </div>
    );
  }

  return <DashboardLayout />;
};

// Export the main app wrapped with providers
export default function AccessMaticDashboard() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
