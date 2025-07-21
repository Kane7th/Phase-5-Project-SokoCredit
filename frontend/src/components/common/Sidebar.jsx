import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, Link } from 'react-router-dom'
import { 
  Home,
  Users,
  DollarSign,
  CreditCard,
  TrendingUp,
  Settings,
  FileText,
  Bell,
  UserCheck,
  Building,
  Smartphone,
  BarChart3,
  Calendar,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Download
} from 'lucide-react'
import '../../styles/sidebar.css'

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // Admin Navigation Items
  const adminMenuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      badge: null
    },
    {
      title: 'Lender Management',
      icon: UserCheck,
      path: '/admin/lenders',
      badge: '8 pending'
    },
    {
      title: 'System Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
      badge: null
    },
    {
      title: 'Customer Overview',
      icon: Users,
      path: '/admin/customers',
      badge: null
    },
    {
      title: 'Loan Portfolio',
      icon: DollarSign,
      path: '/admin/loans',
      badge: null
    },
    {
      title: 'Reports',
      icon: FileText,
      path: '/admin/reports',
      badge: null
    },
    {
      title: 'System Settings',
      icon: Settings,
      path: '/admin/settings',
      badge: null
    }
  ]

  // Lender Navigation Items
  const lenderMenuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      badge: null
    },
    {
      title: 'My Customers',
      icon: Users,
      path: '/lender/customers',
      badge: '2 new',
      submenu: [
        { title: 'All Customers', path: '/lender/customers' },
        { title: 'Add Customer', path: '/lender/customers/new' },
        { title: 'Customer Import', path: '/lender/customers/import' }
      ]
    },
    {
      title: 'Loan Management',
      icon: DollarSign,
      path: '/lender/loans',
      badge: '5 pending',
      submenu: [
        { title: 'All Loans', path: '/lender/loans' },
        { title: 'New Application', path: '/lender/loans/new' },
        { title: 'Pending Approval', path: '/lender/loans/pending' },
        { title: 'Active Loans', path: '/lender/loans/active' }
      ]
    },
    {
      title: 'Payment Collection',
      icon: CreditCard,
      path: '/lender/payments',
      badge: '3 overdue',
      submenu: [
        { title: 'Today\'s Collections', path: '/lender/payments/today' },
        { title: 'Payment History', path: '/lender/payments/history' },
        { title: 'Overdue Payments', path: '/lender/payments/overdue' }
      ]
    },
    {
      title: 'Performance',
      icon: TrendingUp,
      path: '/lender/performance',
      badge: null
    },
    {
      title: 'Schedule',
      icon: Calendar,
      path: '/lender/schedule',
      badge: '6 today'
    },
    {
      title: 'Mobile Tools',
      icon: Smartphone,
      path: '/lender/mobile',
      badge: null
    }
  ]

  // Customer Navigation Items
  const customerMenuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      badge: null
    },
    {
      title: 'My Loans',
      icon: DollarSign,
      path: '/customer/loans',
      badge: '1 active',
      submenu: [
        { title: 'Current Loans', path: '/customer/loans/current' },
        { title: 'Apply for Loan', path: '/customer/loans/apply' },
        { title: 'Loan History', path: '/customer/loans/history' }
      ]
    },
    {
      title: 'Payments',
      icon: CreditCard,
      path: '/customer/payments',
      badge: 'Due tomorrow',
      submenu: [
        { title: 'Make Payment', path: '/customer/payments/pay' },
        { title: 'Payment History', path: '/customer/payments/history' },
        { title: 'Payment Methods', path: '/customer/payments/methods' }
      ]
    },
    {
      title: 'My Business',
      icon: Building,
      path: '/customer/business',
      badge: null,
      submenu: [
        { title: 'Business Profile', path: '/customer/business/profile' },
        { title: 'Financial Records', path: '/customer/business/records' },
        { title: 'Growth Tips', path: '/customer/business/tips' }
      ]
    },
    {
      title: 'Documents',
      icon: FileText,
      path: '/customer/documents',
      badge: null
    },
    {
      title: 'Support',
      icon: HelpCircle,
      path: '/customer/support',
      badge: null
    }
  ]

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminMenuItems
      case 'loan_officer':
      case 'agent':
        return lenderMenuItems
      case 'customer':
        return customerMenuItems
      default:
        return []
    }
  }

  const MenuSection = ({ title, items }) => (
    <div className="menu-section">
      {!collapsed && title && (
        <div className="section-title">{title}</div>
      )}
      <ul className="menu-list">
        {items.map((item, index) => (
          <MenuItem key={index} item={item} />
        ))}
      </ul>
    </div>
  )

  const MenuItem = ({ item }) => {
    const [showSubmenu, setShowSubmenu] = useState(false)
    const hasSubmenu = item.submenu && item.submenu.length > 0
    const itemIsActive = isActive(item.path)

    return (
      <li className="menu-item">
        <Link
          to={item.path}
          className={`menu-link ${itemIsActive ? 'active' : ''}`}
          onClick={() => {
            if (hasSubmenu) {
              setShowSubmenu(!showSubmenu)
            }
          }}
        >
          <div className="menu-icon">
            <item.icon size={20} />
          </div>
          {!collapsed && (
            <>
              <span className="menu-text">{item.title}</span>
              {item.badge && (
                <span className="menu-badge">{item.badge}</span>
              )}
              {hasSubmenu && (
                <div className="submenu-arrow">
                  <ChevronRight 
                    size={16} 
                    className={showSubmenu ? 'rotated' : ''} 
                  />
                </div>
              )}
            </>
          )}
        </Link>

        {/* Submenu */}
        {hasSubmenu && showSubmenu && !collapsed && (
          <ul className="submenu">
            {item.submenu.map((subItem, subIndex) => (
              <li key={subIndex} className="submenu-item">
                <Link
                  to={subItem.path}
                  className={`submenu-link ${isActive(subItem.path) ? 'active' : ''}`}
                >
                  {subItem.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    )
  }

  const menuItems = getMenuItems()

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <Link to="/dashboard" className="logo">
            <div className="logo-icon">💰</div>
            {!collapsed && <span className="logo-text">SokoCredit</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <MenuSection items={menuItems} />

          {/* Quick Actions for Lenders */}
          {(user?.role === 'loan_officer' || user?.role === 'agent') && !collapsed && (
            <div className="quick-actions-sidebar">
              <div className="section-title">Quick Actions</div>
              <div className="quick-action-buttons">
                <Link to="/lender/customers/new" className="quick-action-btn">
                  <Plus size={16} />
                  Add Customer
                </Link>
                <Link to="/lender/loans/new" className="quick-action-btn">
                  <DollarSign size={16} />
                  New Loan
                </Link>
                <Link to="/lender/payments/today" className="quick-action-btn">
                  <CreditCard size={16} />
                  Collect Payment
                </Link>
              </div>
            </div>
          )}

          {/* Quick Actions for Customers */}
          {user?.role === 'customer' && !collapsed && (
            <div className="quick-actions-sidebar">
              <div className="section-title">Quick Actions</div>
              <div className="quick-action-buttons">
                <Link to="/customer/loans/apply" className="quick-action-btn primary">
                  <Plus size={16} />
                  Apply for Loan
                </Link>
                <Link to="/customer/payments/pay" className="quick-action-btn">
                  <CreditCard size={16} />
                  Make Payment
                </Link>
                <Link to="/customer/support" className="quick-action-btn">
                  <HelpCircle size={16} />
                  Get Help
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {!collapsed && (
            <div className="user-summary">
              <div className="user-role-indicator">
                {user?.role === 'admin' && '👑 Admin'}
                {(user?.role === 'loan_officer' || user?.role === 'agent') && '💼 Lender'}
                {user?.role === 'customer' && '🛒 Business Owner'}
              </div>
              {(user?.role === 'loan_officer' || user?.role === 'agent') && (
                <div className="performance-indicator">
                  <div className="performance-item">
                    <span>Collections</span>
                    <span className="performance-value">94.2%</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button 
            className="collapse-button"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Backdrop */}
      <div className="sidebar-backdrop" onClick={() => setCollapsed(true)} />
    </>
  )
}

export default Sidebar