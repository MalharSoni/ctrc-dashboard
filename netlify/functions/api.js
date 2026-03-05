const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

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

  try {
    // GET /students
    if (path === '/students' && method === 'GET') {
      const students = await prisma.student.findMany({
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
      return respond(200, students)
    }

    // GET /students/:id
    if (path.startsWith('/students/') && method === 'GET') {
      const id = path.split('/')[2]
      const student = await prisma.student.findUnique({
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
      const tasks = await prisma.task.findMany({
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
      return respond(200, tasks)
    }

    // GET /teams
    if (path === '/teams' && method === 'GET') {
      const teams = await prisma.team.findMany({
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
      return respond(200, teams)
    }

    // GET /stats (dashboard stats)
    if (path === '/stats' && method === 'GET') {
      const [totalStudents, activeTasks, activeTeams, overdueTasks] = await Promise.all([
        prisma.student.count({ where: { active: true } }),
        prisma.task.count({ where: { status: { notIn: ['COMPLETED'] } } }),
        prisma.team.count({ where: { active: true } }),
        prisma.task.count({
          where: {
            status: { notIn: ['COMPLETED'] },
            dueDate: { lt: new Date() },
          },
        }),
      ])

      return respond(200, {
        totalStudents,
        activeTasks,
        activeTeams,
        overdueTasks,
        attendance: 92, // Mock for now
        meetings: 3, // Mock for now
      })
    }

    // Not found
    return respond(404, { error: 'Not found' })
  } catch (error) {
    console.error('API Error:', error)
    return respond(500, { error: error.message })
  } finally {
    await prisma.$disconnect()
  }
}
