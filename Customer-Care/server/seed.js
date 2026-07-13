const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seed() {
  console.log('Seeding mock database files...');
  const DATA_DIR = path.join(__dirname, 'data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Pre-hash credentials for mock database
  const hashAdmin = await bcrypt.hash('admin123', 10);
  const hashAgent = await bcrypt.hash('agent123', 10);
  const hashRohan = await bcrypt.hash('rohan123', 10);

  const users = [
    {
      _id: 'mock_usr_admin',
      firstName: 'System',
      lastName: 'Admin',
      username: 'admin',
      email: 'admin@care.com',
      password: hashAdmin,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'mock_usr_agent',
      firstName: 'Support',
      lastName: 'Agent',
      username: 'agent',
      email: 'agent@care.com',
      password: hashAgent,
      role: 'agent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'mock_usr_rohan',
      firstName: 'Rohan',
      lastName: 'Kumar',
      username: 'rohan',
      email: 'rohan@care.com',
      password: hashRohan,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const complaints = [
    {
      _id: '67f357eace032a9339246219', // Matches screenshot 5 ID!
      name: 'Rohan Kumar',
      phone: '9876543210',
      email: 'rohan@care.com',
      details: 'Network error', // Matches screenshot 5 details!
      status: 'pending', // Matches screenshot 5 status!
      date: '2025-07-04T12:00:00.000Z', // Matches screenshot 5 date (7/4/2025)!
      createdBy: 'mock_usr_rohan',
      assignedTo: null,
      createdAt: '2025-07-04T12:00:00.000Z',
      updatedAt: '2025-07-04T12:00:00.000Z'
    }
  ];

  const messages = [
    {
      _id: 'mock_msg_1',
      sender: 'mock_usr_rohan',
      receiver: 'mock_usr_agent',
      content: 'what is the issue',
      timestamp: '2025-03-25T11:18:00.000Z', // Matches screenshot 6!
      complaintId: '67f357eace032a9339246219',
      createdAt: '2025-03-25T11:18:00.000Z',
      updatedAt: '2025-03-25T11:18:00.000Z'
    },
    {
      _id: 'mock_msg_2',
      sender: 'mock_usr_rohan',
      receiver: 'mock_usr_agent',
      content: 'what is the issue',
      timestamp: '2025-04-07T10:17:00.000Z', // Matches screenshot 6!
      complaintId: '67f357eace032a9339246219',
      createdAt: '2025-04-07T10:17:00.000Z',
      updatedAt: '2025-04-07T10:17:00.000Z'
    }
  ];

  fs.writeFileSync(path.join(DATA_DIR, 'users.json'), JSON.stringify(users, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'complaints.json'), JSON.stringify(complaints, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'messages.json'), JSON.stringify(messages, null, 2));

  console.log('Seed files created successfully!');
  console.log('Login credentials:');
  console.log('- Customer: rohan@care.com / rohan123');
  console.log('- Agent: agent@care.com / agent123');
  console.log('- Admin: admin@care.com / admin123');
}

seed();
