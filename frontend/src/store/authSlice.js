import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'
import * as jwt_decode from 'jwt-decode'

const jwtDecode = jwt_decode.default || jwt_decode

export const parseJwt = (token) => {
  try {
    const decoded = jwtDecode(token)
    const identity = decoded.sub || decoded.identity

    let user_id = null
    let role = null

    if (typeof identity === 'string' && identity.includes(':')) {
      const [idPart, rolePart] = identity.split(':')
      user_id = parseInt(idPart.replace(/\D/g, ''), 10)
      role = rolePart
    } else if (typeof identity === 'number') {
      user_id = identity
      role = 'admin'
    }

    return { user_id, role }
  } catch {
    return { user_id: null, role: null }
  }
}

const access_token = localStorage.getItem('access_token')
const refresh_token = localStorage.getItem('refresh_token')
const { user_id, role } = parseJwt(access_token || '')

const initialState = {
  user: null,
  token: access_token || null,
  refreshToken: refresh_token || null,
  user_id: user_id || null,
  role: role || null,
  isAuthenticated: !!access_token,
  isLoading: false,
  error: null,
  registrationStep: 1,
  registrationData: {},
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    // Mock login for frontend-only validation
    const demoAccounts = [
      { role: 'admin', username: 'admin@sokocredit.com', password: 'admin123' },
      { role: 'loan_officer', username: 'officer@sokocredit.com', password: 'officer123' },
      { role: 'customer', username: 'customer@sokocredit.com', password: 'customer123' },
    ]

    const user = demoAccounts.find(
      (acc) =>
        acc.username === credentials.identifier &&
        acc.password === credentials.password
    )

    if (user) {
      const mockResponse = {
        user: { full_name: user.username.split('@')[0], role: user.role },
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
      }
      localStorage.setItem('access_token', mockResponse.access_token)
      localStorage.setItem('refresh_token', mockResponse.refresh_token)
      return mockResponse
    } else {
      return rejectWithValue('Invalid username or password')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authService.register(data)
      return response
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Registration failed')
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser()
      return { user }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Session expired')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.user_id = null
      state.role = null
      state.isAuthenticated = false
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_role')
      toast.success('Logged out successfully')
    },
    setRegistrationStep: (state, action) => {
      state.registrationStep = action.payload
    },
    updateRegistrationData: (state, action) => {
      state.registrationData = { ...state.registrationData, ...action.payload }
    },
    clearRegistrationData: (state) => {
      state.registrationData = {}
      state.registrationStep = 1
    },
    setUserInfo: (state, action) => {
      state.user = action.payload.user || null
      state.user_id = action.payload.user_id || null
      state.role = action.payload.role || null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.access_token
        state.refreshToken = action.payload.refresh_token
        state.user_id = action.payload.user_id
        state.role = action.payload.role
        state.user = action.payload.user
        state.isAuthenticated = true
        toast.success('Login successful!')
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        toast.error(action.payload || 'Login failed')
      })

      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false
        toast.success('Registration successful! Please wait for approval.')
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        toast.error(action.payload || 'Registration failed')
      })

      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.user_id = null
        state.role = null
        state.isAuthenticated = false
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_id')
        localStorage.removeItem('user_role')
        toast.error(action.payload || 'Session expired. Please log in again.')
      })
  },
})

export const {
  clearError,
  logout,
  setRegistrationStep,
  updateRegistrationData,
  clearRegistrationData,
  setUserInfo,
} = authSlice.actions

export default authSlice.reducer
