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
    try {
      const response = await authService.login(credentials)
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('refresh_token', response.refresh_token)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Login failed')
    }
  }
)

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
        state.isAuthenticated = true
        const { user_id, role } = parseJwt(action.payload.access_token)
        state.user_id = user_id
        state.role = role
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

      // Get current user
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
      })
  },
})

export const { 
  clearError, 
  logout, 
  setRegistrationStep, 
  updateRegistrationData, 
  clearRegistrationData 
} = authSlice.actions

export default authSlice.reducer