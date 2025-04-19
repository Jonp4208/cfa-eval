import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface TimeBlock {
  id: string
  start: string
  end: string
  positions: Position[]
}

interface Position {
  id: string
  name: string
  category: string
  section: 'FOH' | 'BOH'
  color: string
  count: number
  employeeId?: string
}

interface Employee {
  id: string
  name: string
  shiftStart: string
  shiftEnd: string
  area: 'FOH' | 'BOH'
  day?: string | null
}

interface DaySchedule {
  timeBlocks: TimeBlock[]
}

interface WeekSchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

interface Template {
  _id: string
  name: string
  weekSchedule: WeekSchedule
  createdAt: string
  updatedAt: string
}

interface WeeklySetup {
  _id: string
  name: string
  startDate: string
  endDate: string
  weekSchedule: WeekSchedule
  createdAt: string
  updatedAt: string
}

interface SetupSheetState {
  employees: Employee[]
  templates: Template[]
  weeklySetups: WeeklySetup[]
  currentTemplate: Template | null
  currentWeeklySetup: WeeklySetup | null
  currentAssignments: { weekSchedule: WeekSchedule } | null
  isLoading: boolean
  error: string | null
  templateToDelete: string | null
  setEmployees: (employees: Employee[]) => void
  setTemplates: (templates: Template[]) => void
  setWeeklySetups: (setups: WeeklySetup[]) => void
  setCurrentTemplate: (template: Template | null) => void
  setCurrentWeeklySetup: (setup: WeeklySetup | null) => void
  setCurrentAssignments: (assignments: { weekSchedule: WeekSchedule } | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setTemplateToDelete: (templateId: string | null) => void
  fetchTemplates: () => Promise<void>
  fetchWeeklySetups: () => Promise<void>
  createTemplate: (template: Omit<Template, '_id' | 'createdAt' | 'updatedAt'>) => Promise<Template>
  updateTemplate: (templateId: string, template: Partial<Template>) => Promise<void>
  deleteTemplate: (templateId: string) => Promise<void>
  createWeeklySetup: (setup: Omit<WeeklySetup, '_id' | 'createdAt' | 'updatedAt'>) => Promise<WeeklySetup>
  updateWeeklySetup: (setupId: string, setup: Partial<WeeklySetup>) => Promise<void>
  deleteWeeklySetup: (setupId: string) => Promise<void>
}

export const useSetupSheetStore = create<SetupSheetState>()(
  devtools(
    (set, get) => ({
      employees: [],
      templates: [],
      weeklySetups: [],
      currentTemplate: null,
      currentWeeklySetup: null,
      currentAssignments: null,
      isLoading: false,
      error: null,
      templateToDelete: null,

      setEmployees: (employees) => set({ employees }),
      setTemplates: (templates) => set({ templates }),
      setWeeklySetups: (setups) => set({ weeklySetups: setups }),
      setCurrentTemplate: (template) => set({ currentTemplate: template }),
      setCurrentWeeklySetup: (setup) => set({ currentWeeklySetup: setup }),
      setCurrentAssignments: (assignments) => set({ currentAssignments: assignments }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setTemplateToDelete: (templateId) => set({ templateToDelete: templateId }),

      fetchTemplates: async () => {
        try {
          set({ isLoading: true, error: null })
          const token = localStorage.getItem('token')
          if (!token) throw new Error('No authentication token found')

          const response = await fetch('/api/setup-sheet-templates', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to fetch templates')
          }
          const templates = await response.json()
          set({ templates, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch templates',
            isLoading: false
          })
        }
      },

      createTemplate: async (template) => {
        try {
          set({ isLoading: true, error: null })
          const token = localStorage.getItem('token')
          if (!token) throw new Error('No authentication token found')

          const response = await fetch('/api/setup-sheet-templates', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(template)
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Failed to create template')
          }

          set((state) => ({
            templates: [...state.templates, data],
            currentTemplate: data,
            isLoading: false
          }))

          return data
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create template'
          set({
            error: errorMessage,
            isLoading: false
          })
          throw new Error(errorMessage)
        }
      },

      updateTemplate: async (templateId, template) => {
        try {
          set({ isLoading: true, error: null })
          const token = localStorage.getItem('token')
          if (!token) throw new Error('No authentication token found')

          const response = await fetch(`/api/setup-sheet-templates/${templateId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(template)
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to update template')
          }

          const updatedTemplate = await response.json()
          set((state) => ({
            templates: state.templates.map((t) => (t._id === templateId ? updatedTemplate : t)),
            currentTemplate: state.currentTemplate?._id === templateId ? updatedTemplate : state.currentTemplate,
            isLoading: false
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update template',
            isLoading: false
          })
          throw error // Re-throw to let the component handle the error
        }
      },

      deleteTemplate: async (templateId) => {
        try {
          set({ isLoading: true, error: null })
          const token = localStorage.getItem('token')
          if (!token) throw new Error('No authentication token found')

          const response = await fetch(`/api/setup-sheet-templates/${templateId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to delete template')
          }

          set((state) => ({
            templates: state.templates.filter((t) => t._id !== templateId),
            currentTemplate: state.currentTemplate?._id === templateId ? null : state.currentTemplate,
            isLoading: false
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete template',
            isLoading: false
          })
          throw error // Re-throw to let the component handle the error
        }
      },

      fetchWeeklySetups: async () => {
        try {
          set({ isLoading: true, error: null })
          const token = localStorage.getItem('token')
          if (!token) throw new Error('No authentication token found')

          const response = await fetch('/api/weekly-setups', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to fetch weekly setups')
          }
          const weeklySetups = await response.json()
          set({ weeklySetups, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch weekly setups',
            isLoading: false
          })
        }
      },

      createWeeklySetup: async (setup) => {
        try {
          set({ isLoading: true, error: null })
          const token = localStorage.getItem('token')
          if (!token) throw new Error('No authentication token found')

          console.log('Preparing to send weekly setup to server');

          // Create a copy of the setup to avoid any reference issues
          const setupToSend = JSON.parse(JSON.stringify(setup));

          // Check the size of the data being sent
          const dataSize = JSON.stringify(setupToSend).length;
          console.log(`Data size: ${dataSize} bytes`);

          // If data is too large (over 5MB), trim the uploadedSchedules
          if (dataSize > 5 * 1024 * 1024) {
            console.warn('Data size exceeds 5MB, trimming uploaded schedules');
            if (setupToSend.uploadedSchedules && Array.isArray(setupToSend.uploadedSchedules)) {
              // Keep only essential employee data
              setupToSend.uploadedSchedules = setupToSend.uploadedSchedules.map(emp => ({
                id: emp.id,
                name: emp.name,
                timeBlock: emp.timeBlock,
                area: emp.area,
                day: emp.day
              }));
            }
          }

          // Set a longer timeout for the fetch request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

          try {
            console.log('Sending request to server...');
            const response = await fetch('/api/weekly-setups', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(setupToSend),
              signal: controller.signal
            })

            clearTimeout(timeoutId);

            // Check for network errors
            if (!response) {
              throw new Error('Network error - no response received');
            }

            // Try to parse the response as JSON
            let data;
            try {
              const responseText = await response.text();
              console.log('Response text:', responseText.substring(0, 200) + '...');

              try {
                data = JSON.parse(responseText);
              } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
              }
            } catch (jsonError) {
              console.error('Error reading response:', jsonError);
              throw new Error('Failed to read server response');
            }

            if (!response.ok) {
              console.error('Server returned error:', data);

              // Handle specific error codes
              if (response.status === 413) {
                throw new Error('The data is too large to save. Please try with fewer employees or positions.');
              }

              throw new Error(data.message || data.error || `Server error: ${response.status} ${response.statusText}`);
            }

            console.log('Weekly setup created successfully:', data);

            set((state) => ({
              weeklySetups: [...state.weeklySetups, data],
              currentWeeklySetup: data,
              isLoading: false
            }))

            return data;
          } catch (fetchError) {
            clearTimeout(timeoutId);
            throw fetchError;
          }
        } catch (error) {
          console.error('Error in createWeeklySetup:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to create weekly setup';
          set({
            error: errorMessage,
            isLoading: false
          })
          throw new Error(errorMessage);
        }
      },

      updateWeeklySetup: async (setupId, setup) => {
        try {
          set({ isLoading: true, error: null })
          const token = localStorage.getItem('token')
          if (!token) throw new Error('No authentication token found')

          const response = await fetch(`/api/weekly-setups/${setupId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(setup)
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to update weekly setup')
          }

          const updatedSetup = await response.json()
          set((state) => ({
            weeklySetups: state.weeklySetups.map((s) => (s._id === setupId ? updatedSetup : s)),
            currentWeeklySetup: state.currentWeeklySetup?._id === setupId ? updatedSetup : state.currentWeeklySetup,
            isLoading: false
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update weekly setup',
            isLoading: false
          })
          throw error // Re-throw to let the component handle the error
        }
      },

      deleteWeeklySetup: async (setupId) => {
        try {
          set({ isLoading: true, error: null })
          const token = localStorage.getItem('token')
          if (!token) throw new Error('No authentication token found')

          const response = await fetch(`/api/weekly-setups/${setupId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to delete weekly setup')
          }

          set((state) => ({
            weeklySetups: state.weeklySetups.filter((s) => s._id !== setupId),
            currentWeeklySetup: state.currentWeeklySetup?._id === setupId ? null : state.currentWeeklySetup,
            isLoading: false
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete weekly setup',
            isLoading: false
          })
          throw error // Re-throw to let the component handle the error
        }
      }
    }),
    { name: 'setup-sheet-store' }
  )
)