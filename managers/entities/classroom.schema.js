const { z } = require("zod");

const classroomSchema = z.object({
  id: z.string(),
  schoolId: z.string(),
  name: z.string().min(1).max(50),
  capacity: z.number().positive(),
  currentStudentCount: z.number().min(0),
  grade: z.string(),
  section: z.string(),
  teacherId: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  createdAt: z.number(),
  updatedAt: z.number(),
  resources: z.array(z.string()).optional(),
  schedule: z.record(z.string()).optional(),
});

module.exports = classroomSchema;
