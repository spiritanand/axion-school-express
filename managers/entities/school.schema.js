const { z } = require("zod");

const schoolSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100),
  address: z.string().min(5).max(200),
  contactEmail: z.string().email(),
  contactPhone: z.string().regex(/^\+?[\d\s-]{10,}$/),
  adminIds: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number(),
  status: z.enum(["active", "inactive", "suspended"]),
  maxClassrooms: z.number().positive(),
  maxStudentsPerClassroom: z.number().positive(),
});

module.exports = schoolSchema;
