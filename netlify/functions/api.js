const { Pool, neonConfig } = require('@neondatabase/serverless')
const { PrismaClient } = require('@prisma/client')
const { PrismaNeon } = require('@prisma/adapter-neon')
const ws = require('ws')

// Configure Neon for serverless (WebSocket polyfill)
neonConfig.webSocketConstructor = ws

// Singleton pattern for Prisma Client in serverless
let prisma

function getPrismaClient() {
  if (!prisma) {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    const pool = new Pool({ connectionString })
    const adapter = new PrismaNeon(pool)

    prisma = new PrismaClient({
      adapter,
      log: ['error']
    })
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
