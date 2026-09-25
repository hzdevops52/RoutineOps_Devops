// MongoDB initialization script
// This script runs when the container first starts

// Switch to the application database
db = db.getSiblingDB('snu-routine-generator');

// Create application user
db.createUser({
  user: 'snu_user',
  pwd: 'snu_password',
  roles: [
    {
      role: 'readWrite',
      db: 'snu-routine-generator'
    }
  ]
});

// Create initial collections with validation
db.createCollection('teachers', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'department'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        email: {
          bsonType: 'string',
          description: 'must be a string'
        },
        department: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        subjects: {
          bsonType: 'array',
          items: {
            bsonType: 'objectId'
          }
        },
        availability: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['day'],
            properties: {
              day: {
                bsonType: 'string',
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
              },
              periodsUnavailable: {
                bsonType: 'array',
                items: {
                  bsonType: 'number'
                }
              }
            }
          }
        }
      }
    }
  }
});

db.createCollection('subjects', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'code', 'department'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        code: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        department: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        credits: {
          bsonType: 'number',
          minimum: 1,
          maximum: 10
        },
        totalPeriodsPerWeek: {
          bsonType: 'number',
          minimum: 1
        },
        labRequired: {
          bsonType: 'bool'
        },
        preferredDays: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          }
        }
      }
    }
  }
});

db.createCollection('sections', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'department', 'year'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        department: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        year: {
          bsonType: 'number',
          minimum: 1,
          maximum: 4,
          description: 'must be a number between 1 and 4'
        },
        semester: {
          bsonType: 'number',
          minimum: 1,
          maximum: 2
        },
        totalStudents: {
          bsonType: 'number',
          minimum: 1
        },
        subjects: {
          bsonType: 'array',
          items: {
            bsonType: 'objectId'
          }
        }
      }
    }
  }
});

db.createCollection('routines', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['department', 'year', 'periodsPerDay'],
      properties: {
        department: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        year: {
          bsonType: 'number',
          minimum: 1,
          maximum: 4,
          description: 'must be a number between 1 and 4'
        },
        semester: {
          bsonType: 'number',
          minimum: 1,
          maximum: 2
        },
        periodsPerDay: {
          bsonType: 'number',
          minimum: 1,
          description: 'must be a number and is required'
        },
        sections: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['name', 'timetable'],
            properties: {
              name: {
                bsonType: 'string'
              },
              timetable: {
                bsonType: 'object'
              }
            }
          }
        },
        unsatisfied: {
          bsonType: 'array'
        },
        constraints: {
          bsonType: 'object'
        },
        meta: {
          bsonType: 'object'
        }
      }
    }
  }
});

db.createCollection('teacherassignmenthistories');

// Create indexes for better performance
db.teachers.createIndex({ department: 1, name: 1 });
db.subjects.createIndex({ department: 1, code: 1 });
db.sections.createIndex({ department: 1, year: 1, semester: 1 });
db.routines.createIndex({ department: 1, year: 1, semester: 1 }, { unique: true });

// Insert sample data (optional - can be removed for production)
print('MongoDB initialization completed successfully!');
print('Database: snu-routine-generator');
print('User: snu_user created with readWrite permissions');
print('Collections and indexes created');
