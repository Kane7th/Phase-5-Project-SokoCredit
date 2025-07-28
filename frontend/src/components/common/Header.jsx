import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  X,
  CreditCard,
  Users,
  DollarSign
} from 'lucide-react'
import { logout } from '../../store/authSlice'
import '../../styles/header.css'

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleNavigate = (path) => {
    navigate(path)
    setShowUserMenu(false)
  }

  const getUserRoleDisplay = (role) => {
    const roles = {
      admin: 'System Administrator',
      loan_officer: 'Loan Officer',
      mamaMboga: 'Mama Mboga',
      customer: 'Business Owner'
    }
    return roles[role] || role
  }

  const getUserRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return '👑'
      case 'loan_officer':
      case 'mamaMboga':
        return '💼'
      case 'customer':
        return '🛒'
      default:
        return '👤'
    }
  }

  // Mock notifications - replace with real data
  const notifications = [
    {
      id: 1,
      type: 'payment',
      title: 'Payment Received',
      message: 'Mary Wanjiku paid KSH 2,500',
      time: '5 min ago',
      unread: true
    },
    {
      id: 2,
      type: 'loan',
      title: 'Loan Application',
      message: 'New loan application from Grace Akinyi',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'system',
      title: 'System Update',
      message: 'New features available in your dashboard',
      time: '2 hours ago',
      unread: false
    }
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Search Bar */}
        <div className="header-search">
          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder={
                user?.role === 'customer' 
                  ? 'Search your loans, payments...' 
                  : 'Search customers, loans...'
              }
              className="search-input"
            />
          </div>
        </div>

        {/* Header Actions */}
        <div className="header-actions">
          {/* Quick Stats for Lenders */}
          {(user?.role === 'loan_officer' || user?.role === 'mamaMboga') && (
            <div className="quick-stats">
              <div className="stat-item">
                <Users size={16} />
                <span>23</span>
              </div>
              <div className="stat-item">
                <DollarSign size={16} />
                <span>1.2M</span>
              </div>
              <div className="stat-item">
                <CreditCard size={16} />
                <span>28.5K</span>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="header-action">
            <button 
              className="action-button"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="dropdown-menu notifications-menu">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  <span className="notification-count">
                    {unreadCount} unread
                  </span>
                </div>
                <div className="notification-list">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.unread ? 'unread' : ''}`}
                    >
                      <div className="notification-icon">
                        {notification.type === 'payment' && '💰'}
                        {notification.type === 'loan' && '📋'}
                        {notification.type === 'system' && '⚙️'}
                      </div>
                      <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                      {notification.unread && <div className="unread-indicator"></div>}
                    </div>
                  ))}
                </div>
                <div className="dropdown-footer">
                  <button className="view-all-button">View All Notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="header-action">
            <button 
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {getUserRoleIcon(user?.role)}
              </div>
              <div className="user-info">
                <span className="user-name">
                  {user?.full_name?.split(' ')[0] || 'User'}
                </span>
                <span className="user-role">
                  {getUserRoleDisplay(user?.role)}
                </span>
              </div>
            </button>

            {showUserMenu && (
              <div className="dropdown-menu user-menu">
                <div className="dropdown-header">
                  <div className="user-profile">
                    <div className="user-avatar-large">
                      {getUserRoleIcon(user?.role)}
                    </div>
                    <div className="user-details">
                      <h3>{user?.full_name}</h3>
                      <p>{getUserRoleDisplay(user?.role)}</p>
                      <p className="user-email">{user?.email || user?.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="dropdown-body">
                  <button className="menu-item" onClick={() => handleNavigate('/profile')}>
                    <User size={16} />
                    My Profile
                  </button>
                  <button className="menu-item" onClick={() => handleNavigate('/settings')}>
                    <Settings size={16} />
                    Settings
                  </button>
                  
                  {user?.role === 'customer' && (
                    <>
                      <button className="menu-item" onClick={() => handleNavigate('/dashboard/customer/loans')}>
                        <CreditCard size={16} />
                        My Loans
                      </button>
                      <button className="menu-item" onClick={() => handleNavigate('/dashboard/customer/payments/history')}>
                        <DollarSign size={16} />
                        Payment History
                      </button>
                    </>
                  )}
                  
                  <hr className="menu-divider" />
                  
                  <button className="menu-item danger" onClick={handleLogout}>
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu">
            <div className="mobile-user-info">
              <div className="user-avatar-large">
                {getUserRoleIcon(user?.role)}
              </div>
              <div className="user-details">
                <h3>{user?.full_name}</h3>
                <p>{getUserRoleDisplay(user?.role)}</p>
              </div>
            </div>
            
            <div className="mobile-menu-items">
              <button className="mobile-menu-item">
                <User size={20} />
                My Profile
              </button>
              <button className="mobile-menu-item">
                <Bell size={20} />
                Notifications
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              <button className="mobile-menu-item">
                <Settings size={20} />
                Settings
              </button>
              <hr className="menu-divider" />
              <button className="mobile-menu-item danger" onClick={handleLogout}>
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menus */}
      {(showUserMenu || showNotifications || showMobileMenu) && (
        <div 
          className="menu-overlay"
          onClick={() => {
            setShowUserMenu(false)
            setShowNotifications(false)
            setShowMobileMenu(false)
          }}
        />
      )}
    </header>
  )
}

export default Header