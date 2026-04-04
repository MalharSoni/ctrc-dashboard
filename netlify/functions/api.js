const { PrismaClient } = require('@prisma/client')

// Singleton pattern for Prisma Client in serverless
let prisma

function getPrismaClient() {
  if (!prisma) {
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0)

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set. Available env vars: ' + Object.keys(process.env).join(', '))
    }

    // Prisma reads DATABASE_URL from env automatically via schema.prisma
    prisma = new PrismaClient({
      log: ['error', 'warn']
    })

    console.log('Prisma Client initialized successfully')
  }
  return prisma
}

// Helper to send JSON response
const respond = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  },
  body: JSON.stringify(body),
})

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return respond(200, {})
  }

  const path = event.path.replace('/.netlify/functions/api', '')
  const method = event.httpMethod

  console.log('API Request:', method, path)

  try {
    const db = getPrismaClient()

    // GET /stats (dashboard stats)
    if (path === '/stats' && method === 'GET') {
      console.log('Fetching stats...')

      const [totalStudents, activeTasks, activeTeams, overdueTasks] = await Promise.all([
        db.student.count({ where: { active: true } }),
        db.task.count({ where: { status: { notIn: ['COMPLETED'] } } }),
        db.team.count({ where: { active: true } }),
        db.task.count({
          where: {
            status: { notIn: ['COMPLETED'] },
            dueDate: { lt: new Date() },
          },
        }),
      ])

      const stats = {
        totalStudents,
        activeTasks,
        activeTeams,
        overdueTasks,
        attendance: 92, // Mock for now
        meetings: 3, // Mock for now
      }

      console.log('Stats:', stats)
      return respond(200, stats)
    }

    // GET /dashboard/stats (enhanced dashboard stats)
    if (path === '/dashboard/stats' && method === 'GET') {
      console.log('Fetching enhanced dashboard stats...')

      // Get date range for attendance calculation
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const [
        totalStudents,
        activeTeams,
        activeProjects,
        overdueTasksCount,
        attendanceRecords,
        totalAttendanceRecords
      ] = await Promise.all([
        db.student.count({ where: { active: true } }),
        db.team.count({ where: { active: true } }),
        db.project.count({
          where: {
            status: { in: ['PLANNING', 'IN_PROGRESS', 'TESTING'] }
          }
        }),
        db.task.count({
          where: {
            status: { notIn: ['COMPLETED'] },
            dueDate: { lt: new Date() },
          },
        }),
        db.attendanceRecord.count({
          where: {
            date: { gte: thirtyDaysAgo },
            status: 'PRESENT'
          }
        }),
        db.attendanceRecord.count({
          where: {
            date: { gte: thirtyDaysAgo }
          }
        })
      ])

      // Calculate attendance rate (last 30 days)
      const attendanceRate = totalAttendanceRecords > 0
        ? Math.round((attendanceRecords / totalAttendanceRecords) * 100)
        : 0

      const stats = {
        totalStudents,
        activeTeams,
        attendanceRate,
        activeProjects,
        overdueTasksCount
      }

      console.log('Enhanced dashboard stats:', stats)
      return respond(200, stats)
    }

    // GET /students
    if (path === '/students' && method === 'GET') {
      console.log('Fetching students...')

      const students = await db.student.findMany({
        where: { active: true },
        include: {
          teams: {
            where: { active: true },
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  teamNumber: true,
                },
              },
            },
          },
        },
        orderBy: { lastName: 'asc' },
      })

      console.log(`Found ${students.length} students`)
      return respond(200, students)
    }

    // GET /students/:id
    if (path.startsWith('/students/') && method === 'GET') {
      const id = path.split('/')[2]
      console.log('Fetching student:', id)

      const student = await db.student.findUnique({
        where: { id },
        include: {
          teams: {
            include: {
              team: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
          curriculumProgress: {
            include: {
              module: true,
            },
          },
        },
      })

      return respond(200, student)
    }

    // GET /tasks
    if (path === '/tasks' && method === 'GET') {
      console.log('Fetching tasks...')

      const tasks = await db.task.findMany({
        where: {
          status: { notIn: ['COMPLETED'] },
        },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              teamNumber: true,
            },
          },
          assignedTo: {
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      })

      console.log(`Found ${tasks.length} tasks`)
      return respond(200, tasks)
    }

    // GET /teams
    if (path === '/teams' && method === 'GET') {
      console.log('Fetching teams...')

      const teams = await db.team.findMany({
        where: { active: true },
        include: {
          _count: {
            select: {
              members: true,
              tasks: true,
            },
          },
          season: {
            select: {
              id: true,
              name: true,
              current: true,
            },
          },
        },
        orderBy: { teamNumber: 'asc' },
      })

      console.log(`Found ${teams.length} teams`)
      return respond(200, teams)
    }

    // POST /students (create student)
    if (path === '/students' && method === 'POST') {
      const data = JSON.parse(event.body)
      console.log('Creating student:', data)

      const student = await db.student.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          grade: data.grade ? parseInt(data.grade) : null,
          gradYear: data.gradYear ? parseInt(data.gradYear) : null,
          parentName: data.parentName,
          parentEmail: data.parentEmail,
          parentPhone: data.parentPhone,
          bio: data.bio,
          avatar: data.avatar,
          active: true,
        },
      })

      return respond(201, student)
    }

    // PUT /students/:id (update student)
    if (path.startsWith('/students/') && method === 'PUT') {
      const id = path.split('/')[2]
      const data = JSON.parse(event.body)
      console.log('Updating student:', id, data)

      const student = await db.student.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          grade: data.grade ? parseInt(data.grade) : null,
          gradYear: data.gradYear ? parseInt(data.gradYear) : null,
          parentName: data.parentName,
          parentEmail: data.parentEmail,
          parentPhone: data.parentPhone,
          bio: data.bio,
          avatar: data.avatar,
          active: data.active !== undefined ? data.active : true,
        },
      })

      return respond(200, student)
    }

    // DELETE /students/:id (soft delete)
    if (path.startsWith('/students/') && method === 'DELETE') {
      const id = path.split('/')[2]
      console.log('Deleting student:', id)

      const student = await db.student.update({
        where: { id },
        data: { active: false },
      })

      return respond(200, { success: true, student })
    }

    // POST /students/bulk-assign (assign multiple students to team)
    if (path === '/students/bulk-assign' && method === 'POST') {
      const { studentIds, teamId, evTeam } = JSON.parse(event.body)
      console.log('Bulk assigning students:', studentIds, 'to team:', teamId)

      // Create TeamMember records for each student
      const assignments = await Promise.all(
        studentIds.map((studentId) =>
          db.teamMember.upsert({
            where: {
              teamId_studentId: {
                teamId,
                studentId,
              },
            },
            create: {
              teamId,
              studentId,
              primaryRole: 'MEMBER',
              active: true,
            },
            update: {
              active: true,
            },
          })
        )
      )

      return respond(200, { success: true, count: assignments.length })
    }

    // GET /attendance (get attendance records)
    if (path === '/attendance' && method === 'GET') {
      const { date, session, studentId } = event.queryStringParameters || {}
      console.log('Fetching attendance:', { date, session, studentId })

      const where = {}
      if (date) where.date = new Date(date)
      if (studentId) where.studentId = studentId

      const records = await db.attendanceRecord.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      })

      return respond(200, records)
    }

    // POST /attendance (record attendance)
    if (path === '/attendance' && method === 'POST') {
      const { records, recordedBy } = JSON.parse(event.body)
      console.log('Recording attendance for', records.length, 'students')

      // Create or update attendance records
      const created = await Promise.all(
        records.map((record) =>
          db.attendanceRecord.upsert({
            where: {
              studentId_date: {
                studentId: record.studentId,
                date: new Date(record.date),
              },
            },
            create: {
              studentId: record.studentId,
              date: new Date(record.date),
              status: record.status || 'PRESENT',
              recordedBy: recordedBy || 'system',
              notes: record.notes,
            },
            update: {
              status: record.status || 'PRESENT',
              notes: record.notes,
            },
          })
        )
      )

      return respond(200, { success: true, count: created.length, records: created })
    }

    // GET /attendance/stats (attendance statistics)
    if (path === '/attendance/stats' && method === 'GET') {
      const totalStudents = await db.student.count({ where: { active: true } })
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayAttendance = await db.attendanceRecord.count({
        where: {
          date: today,
          status: 'PRESENT',
        },
      })

      const attendanceRate = totalStudents > 0 ? Math.round((todayAttendance / totalStudents) * 100) : 0

      return respond(200, {
        totalStudents,
        todayAttendance,
        attendanceRate,
      })
    }

    // POST /tasks (create task)
    if (path === '/tasks' && method === 'POST') {
      const data = JSON.parse(event.body)
      console.log('Creating task:', data)

      const task = await db.task.create({
        data: {
          title: data.title,
          description: data.description,
          teamId: data.teamId,
          priority: data.priority || 'MEDIUM',
          status: data.status || 'TODO',
          category: data.category || 'GENERAL',
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          assignmentType: data.assignmentType || 'TEAM',
        },
      })

      return respond(201, task)
    }

    // PUT /tasks/:id (update task)
    if (path.startsWith('/tasks/') && method === 'PUT') {
      const id = path.split('/')[2]
      const data = JSON.parse(event.body)
      console.log('Updating task:', id, data)

      const task = await db.task.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          category: data.category,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          completedAt: data.status === 'COMPLETED' ? new Date() : null,
        },
      })

      return respond(200, task)
    }

    // DELETE /tasks/:id
    if (path.startsWith('/tasks/') && method === 'DELETE') {
      const id = path.split('/')[2]
      console.log('Deleting task:', id)

      const task = await db.task.delete({
        where: { id },
      })

      return respond(200, { success: true, task })
    }

    // GET /trials (get trial students)
    if (path === '/trials' && method === 'GET') {
      const { status } = event.queryStringParameters || {}
      console.log('Fetching trials:', { status })

      const where = status ? { status } : {}

      const trials = await db.trialStudent.findMany({
        where,
        orderBy: { sessionDate: 'asc' },
      })

      return respond(200, trials)
    }

    // GET /trials/:id
    if (path.startsWith('/trials/') && !path.includes('/convert') && method === 'GET') {
      const id = path.split('/')[2]
      console.log('Fetching trial:', id)

      const trial = await db.trialStudent.findUnique({
        where: { id },
      })

      return respond(200, trial)
    }

    // POST /trials (create trial booking)
    if (path === '/trials' && method === 'POST') {
      const data = JSON.parse(event.body)
      console.log('Creating trial:', data)

      const trial = await db.trialStudent.create({
        data: {
          studentName: data.studentName,
          age: data.age ? parseInt(data.age) : null,
          grade: data.grade ? parseInt(data.grade) : null,
          parentName: data.parentName,
          parentEmail: data.parentEmail,
          parentPhone: data.parentPhone,
          sessionDate: new Date(data.sessionDate),
          timeSlot: data.timeSlot,
          status: data.status || 'SCHEDULED',
          notes: data.notes,
          source: data.source || 'manual',
        },
      })

      return respond(201, trial)
    }

    // PUT /trials/:id (update trial)
    if (path.startsWith('/trials/') && !path.includes('/convert') && method === 'PUT') {
      const id = path.split('/')[2]
      const data = JSON.parse(event.body)
      console.log('Updating trial:', id, data)

      const trial = await db.trialStudent.update({
        where: { id },
        data: {
          studentName: data.studentName,
          age: data.age ? parseInt(data.age) : null,
          grade: data.grade ? parseInt(data.grade) : null,
          parentName: data.parentName,
          parentEmail: data.parentEmail,
          parentPhone: data.parentPhone,
          sessionDate: data.sessionDate ? new Date(data.sessionDate) : undefined,
          timeSlot: data.timeSlot,
          status: data.status,
          notes: data.notes,
          attendedAt: data.status === 'ATTENDED' ? new Date() : undefined,
        },
      })

      return respond(200, trial)
    }

    // POST /trials/:id/convert (convert trial to student)
    if (path.match(/\/trials\/[^/]+\/convert$/) && method === 'POST') {
      const id = path.split('/')[2]
      console.log('Converting trial to student:', id)

      const trial = await db.trialStudent.findUnique({
        where: { id },
      })

      if (!trial) {
        return respond(404, { error: 'Trial student not found' })
      }

      // Split student name into first and last
      const nameParts = trial.studentName.split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || nameParts[0]

      // Create student
      const student = await db.student.create({
        data: {
          firstName,
          lastName,
          email: trial.parentEmail, // Use parent email temporarily
          phone: trial.parentPhone,
          grade: trial.grade,
          parentName: trial.parentName,
          parentEmail: trial.parentEmail,
          parentPhone: trial.parentPhone,
          active: true,
        },
      })

      // Update trial status
      await db.trialStudent.update({
        where: { id },
        data: {
          status: 'CONVERTED',
          convertedToStudentId: student.id,
        },
      })

      return respond(200, { success: true, student, trial })
    }

    // GET /foundation/trial-students (trial students for Foundation program)
    if (path === '/foundation/trial-students' && method === 'GET') {
      console.log('Fetching foundation trial students...')

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // This week: from today to end of this week (Sunday)
      const endOfWeek = new Date(today)
      const dayOfWeek = today.getDay()
      const daysUntilSunday = 7 - dayOfWeek
      endOfWeek.setDate(today.getDate() + daysUntilSunday)
      endOfWeek.setHours(23, 59, 59, 999)

      // Next 30 days for upcoming
      const next30Days = new Date(today)
      next30Days.setDate(today.getDate() + 30)

      const [thisWeekTrials, upcomingTrials, allTrials] = await Promise.all([
        db.trialStudent.count({
          where: {
            status: 'SCHEDULED',
            sessionDate: {
              gte: today,
              lte: endOfWeek
            }
          }
        }),
        db.trialStudent.count({
          where: {
            status: 'SCHEDULED',
            sessionDate: {
              gt: endOfWeek,
              lte: next30Days
            }
          }
        }),
        db.trialStudent.findMany({
          where: {
            status: { in: ['SCHEDULED', 'ATTENDED'] },
            sessionDate: { gte: today }
          },
          orderBy: { sessionDate: 'asc' },
          take: 20
        })
      ])

      const result = {
        thisWeek: thisWeekTrials,
        upcoming: upcomingTrials,
        students: allTrials
      }

      console.log('Foundation trial students:', result)
      return respond(200, result)
    }

    // GET /projects
    if (path === '/projects' && method === 'GET') {
      console.log('Fetching projects...')

      const projects = await db.project.findMany({
        include: {
          team: {
            select: {
              id: true,
              name: true,
              teamNumber: true,
            },
          },
          _count: {
            select: {
              roles: true,
              media: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return respond(200, projects)
    }

    // POST /projects
    if (path === '/projects' && method === 'POST') {
      const data = JSON.parse(event.body)
      console.log('Creating project:', data)

      const project = await db.project.create({
        data: {
          name: data.name,
          description: data.description,
          teamId: data.teamId,
          category: data.category || 'ROBOT',
          status: data.status || 'PLANNING',
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          goals: data.goals || [],
          outcomes: data.outcomes || [],
          coverImage: data.coverImage,
        },
      })

      return respond(201, project)
    }

    // PUT /projects/:id
    if (path.startsWith('/projects/') && method === 'PUT') {
      const id = path.split('/')[2]
      const data = JSON.parse(event.body)
      console.log('Updating project:', id, data)

      const project = await db.project.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          category: data.category,
          status: data.status,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          completedAt: data.status === 'COMPLETED' ? new Date() : undefined,
          goals: data.goals,
          outcomes: data.outcomes,
          coverImage: data.coverImage,
        },
      })

      return respond(200, project)
    }

    // Not found
    console.log('Route not found:', path)
    return respond(404, { error: 'Not found', path })

  } catch (error) {
    console.error('API Error:', error)
    return respond(500, {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      path,
      method
    })
  }
  // Don't disconnect in serverless - reuse connection
}
