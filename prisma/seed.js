const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create current season
  const season = await prisma.season.upsert({
    where: { id: 'season-2025-2026' },
    update: {},
    create: {
      id: 'season-2025-2026',
      name: '2025-2026 High Stakes',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-05-31'),
      current: true,
    },
  })
  console.log('✓ Season created')

  // Create coach (required for teams)
  const coach = await prisma.user.upsert({
    where: { email: 'malhar.soni@cautiontape.ca' },
    update: {},
    create: {
      email: 'malhar.soni@cautiontape.ca',
      name: 'Malhar Soni',
      role: 'ADMIN',
      coachProfile: {
        create: {
          organization: 'Caution Tape Robotics Club',
          phone: '(416) 555-0100',
        },
      },
    },
    include: {
      coachProfile: true,
    },
  })
  console.log('✓ Coach created')

  // Create teams
  const team839Z = await prisma.team.upsert({
    where: { teamNumber_seasonId: { teamNumber: '839Z', seasonId: season.id } },
    update: {},
    create: {
      name: 'Team 839Z',
      teamNumber: '839Z',
      description: 'Elite competition team',
      active: true,
      seasonId: season.id,
      createdById: coach.coachProfile.id,
    },
  })

  const team839Y = await prisma.team.upsert({
    where: { teamNumber_seasonId: { teamNumber: '839Y', seasonId: season.id } },
    update: {},
    create: {
      name: 'Team 839Y',
      teamNumber: '839Y',
      description: 'Rookie competition team',
      active: true,
      seasonId: season.id,
      createdById: coach.coachProfile.id,
    },
  })

  const team839X = await prisma.team.upsert({
    where: { teamNumber_seasonId: { teamNumber: '839X', seasonId: season.id } },
    update: {},
    create: {
      name: 'Team 839X',
      teamNumber: '839X',
      description: 'Rookie competition team',
      active: true,
      seasonId: season.id,
      createdById: coach.coachProfile.id,
    },
  })

  console.log('✓ Teams created')

  // Student data from students-database.md
  const studentsData = [
    { id: 1, firstName: 'Daniel', lastName: 'Edelstein', email: 'Daniel.Edelstein@cautiontape.ca', grade: 12, team: '839Z', evTeam: true },
    { id: 2, firstName: 'Daniel', lastName: 'Fu', email: 'Daniel.Fu@cautiontape.ca', grade: 11, team: '839Z', evTeam: true },
    { id: 3, firstName: 'Luke', lastName: 'Fu', email: 'Luke.Fu@cautiontape.ca', grade: 8, team: null, evTeam: false },
    { id: 4, firstName: 'Ryan', lastName: 'Jung', email: 'Ryan.Jung@cautiontape.ca', grade: 11, team: '839Z', evTeam: false },
    { id: 5, firstName: 'Bryan', lastName: 'Kuan', email: 'Bryan.Kuan@cautiontape.ca', grade: 10, team: null, evTeam: false },
    { id: 6, firstName: 'Alessio', lastName: 'Lai', email: 'Alessio.Lai@cautiontape.ca', grade: 9, team: '839Y', evTeam: false },
    { id: 7, firstName: 'Cyrus', lastName: 'Liu', email: 'Cyrus.Liu@cautiontape.ca', grade: 8, team: '839X', evTeam: false },
    { id: 8, firstName: 'Cici', lastName: 'Ma', email: 'Cici.Ma@cautiontape.ca', grade: 7, team: '839X', evTeam: false },
    { id: 9, firstName: 'Zuhaib', lastName: 'Mansoor', email: 'Zuhaib.Mansoor@cautiontape.ca', grade: 11, team: '839Z', evTeam: true },
    { id: 10, firstName: 'Eli', lastName: 'Mindell', email: 'Eli.Mindell@cautiontape.ca', grade: 11, team: '839Z', evTeam: true },
    { id: 11, firstName: 'Steven', lastName: 'Papazian', email: 'Steven.Papazian@cautiontape.ca', grade: 12, team: '839Z', evTeam: true },
    { id: 12, firstName: 'Brialyn', lastName: 'Quast', email: 'Brialyn.Quast@cautiontape.ca', grade: 12, team: '839Z', evTeam: true },
    { id: 13, firstName: 'Keegan', lastName: 'Ramsaran', email: 'Keegan.Ramsaran@cautiontape.ca', grade: 8, team: null, evTeam: false },
    { id: 14, firstName: 'Kiara', lastName: 'Ramsaran', email: 'Kiara.Ramsaran@cautiontape.ca', grade: 11, team: null, evTeam: true },
    { id: 15, firstName: 'Justin', lastName: 'Rui', email: 'Justin.Rui@cautiontape.ca', grade: 11, team: '839Z', evTeam: true },
    { id: 16, firstName: 'Brandon', lastName: 'Situ', email: 'Brandon.Situ@cautiontape.ca', grade: 12, team: '839Z', evTeam: false },
    { id: 17, firstName: 'Caden', lastName: 'Situ', email: 'Caden.Situ@cautiontape.ca', grade: 12, team: '839Z', evTeam: false },
    { id: 18, firstName: 'Brayden', lastName: 'Sun', email: 'Brayden.Sun@cautiontape.ca', grade: 8, team: null, evTeam: false },
    { id: 19, firstName: 'Nathan', lastName: 'Tam', email: 'Nathan.Tam@cautiontape.ca', grade: 10, team: '839Z', evTeam: false },
    { id: 20, firstName: 'Elyse', lastName: 'To', email: 'Elyse.To@cautiontape.ca', grade: 9, team: null, evTeam: false },
    { id: 21, firstName: 'Allen', lastName: 'Wang', email: 'Allen.Wang@cautiontape.ca', grade: 8, team: '839Y', evTeam: false },
    { id: 22, firstName: 'Jovan', lastName: 'Wang', email: 'Jovan.Wang@cautiontape.ca', grade: 11, team: '839Z', evTeam: false },
    { id: 23, firstName: 'Isaac', lastName: 'Wong', email: 'Isaac.Wong@cautiontape.ca', grade: 12, team: '839Z', evTeam: true },
    { id: 24, firstName: 'Kylie', lastName: 'Woo', email: 'Kylie.Woo@cautiontape.ca', grade: 9, team: '839X', evTeam: false },
    { id: 25, firstName: 'Jayden', lastName: 'Yang', email: 'Jayden.Yang@cautiontape.ca', grade: 10, team: null, evTeam: false },
    { id: 26, firstName: 'Thomas', lastName: 'Yang', email: 'Thomas.Yang@cautiontape.ca', grade: 10, team: null, evTeam: false },
    { id: 27, firstName: 'Jake', lastName: 'Yeung', email: 'Jake.Yeung@cautiontape.ca', grade: 9, team: '839X', evTeam: false },
    { id: 28, firstName: 'Tobias', lastName: 'Yeung', email: 'Tobias.Yeung@cautiontape.ca', grade: 9, team: '839X', evTeam: false },
    { id: 29, firstName: 'Tiger', lastName: 'Zhang', email: 'Tiger.Zhang@cautiontape.ca', grade: 10, team: '839Z', evTeam: false },
    { id: 30, firstName: 'Brandon', lastName: 'Zhao', email: 'Brandon.Zhao@cautiontape.ca', grade: 9, team: '839Y', evTeam: true },
    { id: 31, firstName: 'Yichen', lastName: 'Zheng', email: 'Yichen.Zheng@cautiontape.ca', grade: 9, team: '839Y', evTeam: false },
  ]

  // Create students and assign to teams
  for (const data of studentsData) {
    const student = await prisma.student.upsert({
      where: { email: data.email },
      update: {},
      create: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        grade: data.grade,
        active: true,
      },
    })

    // Assign to team if applicable
    if (data.team) {
      const teamId =
        data.team === '839Z' ? team839Z.id :
        data.team === '839Y' ? team839Y.id :
        data.team === '839X' ? team839X.id : null

      if (teamId) {
        await prisma.teamMember.upsert({
          where: {
            teamId_studentId: {
              teamId,
              studentId: student.id,
            },
          },
          update: {},
          create: {
            teamId,
            studentId: student.id,
            primaryRole: 'MEMBER',
            active: true,
          },
        })
      }
    }
  }

  console.log('✓ Students created and assigned to teams')

  // Create some sample tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Robot chassis CAD design',
      description: 'Design the main robot chassis in OnShape',
      teamId: team839Z.id,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      category: 'DESIGN',
      dueDate: new Date('2026-04-10'),
    },
  })

  const task2 = await prisma.task.create({
    data: {
      title: 'Autonomous programming',
      description: 'Program autonomous routines for match',
      teamId: team839Z.id,
      priority: 'URGENT',
      status: 'TODO',
      category: 'PROGRAMMING',
      dueDate: new Date('2026-04-08'),
    },
  })

  console.log('✓ Sample tasks created')

  // Create sample trial students
  const trial1 = await prisma.trialStudent.create({
    data: {
      studentName: 'Alex Johnson',
      age: 13,
      grade: 8,
      parentName: 'Sarah Johnson',
      parentEmail: 'sarah.johnson@email.com',
      parentPhone: '(416) 555-0123',
      sessionDate: new Date('2026-04-05T09:00:00'),
      timeSlot: 'AM',
      status: 'SCHEDULED',
      notes: 'Interested in V5RC competition team',
      source: 'outlook',
    },
  })

  console.log('✓ Sample trial students created')

  console.log('\n✅ Seed completed successfully!')
  console.log(`- ${studentsData.length} students`)
  console.log('- 3 teams (839Z, 839Y, 839X)')
  console.log('- 2 sample tasks')
  console.log('- 1 trial student')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
