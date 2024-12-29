const { z } = require("zod");

const studentSchema = z.object({
  id: z.string(),
  schoolId: z.string(),
  classroomId: z.string(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  dateOfBirth: z.string(),
  gender: z.enum(["male", "female", "other"]),
  contactInfo: z.object({
    parentName: z.string(),
    email: z.string().email(),
    phone: z.string().regex(/^\+?[\d\s-]{10,}$/),
    address: z.string(),
  }),
  enrollmentDate: z.number(),
  status: z.enum(["active", "inactive", "transferred", "graduated"]),
  academicRecord: z
    .array(
      z.object({
        year: z.string(),
        grade: z.string(),
        performance: z.record(z.any()),
      })
    )
    .optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

module.exports = studentSchema;
