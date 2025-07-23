import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

// Fallback-safe import for jwt-decode
import * as jwt_decode from 'jwt-decode'
const jwtDecode = jwt_decode.default || jwt_decode

// Parse user_id and role from JWT
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
  } catch (e) {
    return { user_id: null, role: null }
  }
}

// Login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      const { access_token, refresh_token } = response
      const { user_id, role } = parseJwt(access_token)

      // Save in localStorage
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('user_id', user_id)
      localStorage.setItem('user_role', role)

      // ✅ Get user details via /auth/me (auto uses token via axios interceptor)
      const user = await authService.getCurrentUser()

      return {
        access_token,
        refresh_token,
        user_id,
        role,
        user,
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Login failed')
    }
  }
)

// Register
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed')
    }
  }
)

// Fetch Current User
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get user')
    }
  }
)

const initialState = {
  user: null,
  token: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  user_id: localStorage.getItem('user_id'),
  role: localStorage.getItem('user_role'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('access_token'),
  error: null,
  registrationStep: 1,
  registrationData: {},
}

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
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.access_token
        state.refreshToken = action.payload.refresh_token
        state.user_id = action.payload.user_id
        state.role = action.payload.role
        state.isAuthenticated = true
        toast.success('Login successful!')
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        toast.error(action.payload || 'Login failed')
      })

      // Register
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

      // Current User
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(getCurrentUser.rejected, (state) => {
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
