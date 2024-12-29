const { nanoid } = require("nanoid");
const schoolSchema = require("./school.schema");

class SchoolManager {
  constructor({ cache, oyster }) {
    this.cache = cache;
    this.oyster = oyster;
    this.prefix = "school:";
  }

  async create(schoolData) {
    const id = nanoid();
    const timestamp = Date.now();

    const school = {
      id,
      ...schoolData,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: "active",
    };

    try {
      const validated = schoolSchema.parse(school);
      await this.oyster.set(`${this.prefix}${id}`, validated);
      return validated;
    } catch (error) {
      throw new Error(`School validation failed: ${error.message}`);
    }
  }

  async getById(id) {
    const school = await this.oyster.get(`${this.prefix}${id}`);
    if (!school) {
      throw new Error("School not found");
    }
    return school;
  }

  async update(id, updates) {
    const school = await this.getById(id);
    const updatedSchool = {
      ...school,
      ...updates,
      updatedAt: Date.now(),
    };

    try {
      const validated = schoolSchema.parse(updatedSchool);
      await this.oyster.set(`${this.prefix}${id}`, validated);
      return validated;
    } catch (error) {
      throw new Error(`School update validation failed: ${error.message}`);
    }
  }

  async delete(id) {
    const exists = await this.oyster.exists(`${this.prefix}${id}`);
    if (!exists) {
      throw new Error("School not found");
    }
    await this.oyster.del(`${this.prefix}${id}`);
    return true;
  }

  async list(filter = {}) {
    const schools = await this.oyster.scan(`${this.prefix}*`);
    return schools.filter((school) => {
      for (const [key, value] of Object.entries(filter)) {
        if (school[key] !== value) return false;
      }
      return true;
    });
  }

  async addAdmin(schoolId, adminId) {
    const school = await this.getById(schoolId);
    if (!school.adminIds.includes(adminId)) {
      school.adminIds.push(adminId);
      return await this.update(schoolId, { adminIds: school.adminIds });
    }
    return school;
  }

  async removeAdmin(schoolId, adminId) {
    const school = await this.getById(schoolId);
    school.adminIds = school.adminIds.filter((id) => id !== adminId);
    return await this.update(schoolId, { adminIds: school.adminIds });
  }
}

module.exports = SchoolManager;
