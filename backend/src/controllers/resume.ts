import { Context } from "hono";
import { getPrisma } from "../../prisma/PrismaClient";
import { HTTPException } from "hono/http-exception";
import defaultData from "../defaultData";

const handleCreateResume = async (c: Context): Promise<any> => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const { uuid, resumeTitle, email } = await c.req.json();
    console.log(resumeTitle);
    const data = {
      id: uuid,
      resumeTitle,
      userEmail: email,
      address: defaultData.address,
      email: defaultData.email,
      firstName: defaultData.firstName,
      lastName: defaultData.lastName,
      jobTitle: defaultData.jobTitle,
      phone: defaultData.phone,
      summary: defaultData.summary,
    };
    await prisma.resume.create({
      data: {
        ...data,
        experiences: {
          create: defaultData.experience,
        },
        education: {
          create: defaultData.education,
        },
        skills: {
          create: defaultData.skills,
        },
      },
      include: { experiences: true, education: true, skills: true },
    });

    c.status(200);
    return c.json({ message: "Resume SuccessFull Created" });
  } catch (error) {
    c.status(400);
    return c.json({ message: error });
  }
};

const GetResumeList = async (c: Context): Promise<any> => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const { email } = c.get("user");
    const response = await prisma.resume.findMany({
      where: {
        userEmail: email,
      },
    });

    console.log(response);

    return c.json(response);
  } catch (error) {
    c.status(404);
    throw new HTTPException(404, { message: "Internal Server Error" });
  }
};

const updateResume = async (c: Context): Promise<any> => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const { data, resumeId } = await c.req.json();
    if (!data || typeof data !== "object") {
      throw new HTTPException(400, { message: "Invalid data format" });
    }
    const { address, email, firstName, lastName, jobTitle, phone, summary } =
      data;

    const updateData: Record<string, any> = {};
    if (address !== undefined) updateData.address = address;
    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (phone !== undefined) updateData.phone = phone;
    if (summary !== undefined) updateData.summary = summary;

    console.log("updated ", updateData);
    const res = await prisma.resume.update({
      where: {
        id: resumeId,
      },
      data: updateData,
    });

    console.log("rese", res);
    c.status(200);
    return c.json({ message: "Successfully Updated" });
  } catch (error) {
    c.status(400);
    console.log(error);
    throw new HTTPException(400, { message: error as string });
  }
};

const Get_Resume = async (c: Context): Promise<any> => {
  console.log("here");
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const resumeId = c.req.param("resumeId");

    console.log("rese", resumeId);
    const response = await prisma.resume.findUnique({
      where: {
        id: resumeId,
      },
      include: { experiences: true, education: true, skills: true },
    });

    console.log(response);

    return c.json(response);
  } catch (error) {
    c.status(404);
    throw new HTTPException(404, { message: "Internal Server Error" });
  }
};

const Get_Shared_Resume = async (c: Context): Promise<any> => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const resumeId = c.req.param("resumeId");

    console.log("rese", resumeId);
    const response = await prisma.resume.findUnique({
      where: {
        id: resumeId,
      },
      include: { experiences: true, education: true, skills: true },
    });

    console.log(response);

    return c.json(response);
  } catch (error) {
    c.status(404);
    throw new HTTPException(404, { message: "Internal Server Error" });
  }
};

const updateExperience = async (c: Context): Promise<any> => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const { data: experiences, resumeId } = await c.req.json();
    if (!Array.isArray(experiences) || typeof resumeId !== "string") {
      throw new HTTPException(400, { message: "Invalid data format" });
    }

    await Promise.all(
      experiences.map(async (exp) => {
        await prisma.experience.upsert({
          where: {
            id: exp.id || "",
          },
          update: {
            title: exp.title,
            companyName: exp.companyName,
            city: exp.city,
            state: exp.state,
            startDate: exp.startDate,
            endDate: exp.endDate,
            workSummery: exp.workSummery,
          },
          create: {
            title: exp.title,
            companyName: exp.companyName,
            city: exp.city,
            state: exp.state,
            startDate: exp.startDate,
            endDate: exp.endDate,
            workSummery: exp.workSummery,
            resumeId,
          },
        });
      })
    );

    c.status(200);
    return c.json({ message: "Successfully Updated" });
  } catch (error) {
    c.status(400);
    console.log(error);
    throw new HTTPException(400, { message: error as string });
  }
};

const updateEducation = async (c: Context): Promise<any> => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const { data: education, resumeId } = await c.req.json();
    if (!Array.isArray(education) || typeof resumeId !== "string") {
      throw new HTTPException(400, { message: "Invalid data format" });
    }

    await Promise.all(
      education.map(async (ed) => {
        await prisma.education.upsert({
          where: {
            id: ed.id || "",
          },
          update: {
            universityName: ed.universityName,
            startDate: ed.startDate,
            endDate: ed.endDate,
            degree: ed.degree,
            major: ed.major,
            description: ed.description,
          },
          create: {
            universityName: ed.universityName,
            startDate: ed.startDate,
            endDate: ed.endDate,
            degree: ed.degree,
            major: ed.major,
            description: ed.description,
            resumeId,
          },
        });
      })
    );

    c.status(200);
    return c.json({ message: "Successfully Updated" });
  } catch (error) {
    c.status(400);
    console.log(error);
    throw new HTTPException(400, { message: error as string });
  }
};

const updateSkills = async (c: Context): Promise<any> => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const { data: skills, resumeId } = await c.req.json();
    if (!Array.isArray(skills) || typeof resumeId !== "string") {
      throw new HTTPException(400, { message: "Invalid data format" });
    }

    await Promise.all(
      skills.map(async (sk) => {
        await prisma.skills.upsert({
          where: {
            id: sk.id || "",
          },
          update: {
            name: sk.name,
            rating: sk.rating,
          },
          create: {
            name: sk.name,
            rating: sk.rating,
            resumeId,
          },
        });
      })
    );

    c.status(200);
    return c.json({ message: "Successfully Updated" });
  } catch (error) {
    c.status(400);
    console.log(error);
    throw new HTTPException(400, { message: error as string });
  }
};

const deleteSkill = async (c: Context): Promise<any> => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const { skillId } = await c.req.json();
    console.log("llllll  ", skillId);
    await prisma.skills.delete({
      where: {
        id: skillId,
      },
    });

    c.status(200);
    return c.json({ message: "Successfully removed" });
  } catch (error) {
    c.status(400);
    console.log(error);
    throw new HTTPException(400, { message: error as string });
  }
};
const deleteResume = async (c: Context): Promise<any> => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const resumeId = c.req.param("resumeId");
    const { email } = c.get("user");
    const response = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userEmail:email
      }
    });

    if (response) {
      await prisma.resume.delete({
        where: {
          id:resumeId
        }
      })
      c.status(200);
      return c.json({ message: "Successfully removed" });
    } else {
      c.status(404);
      throw new HTTPException(400, { message: "You are not authorized" });
    }
  } catch (error) {
    c.status(400);
    console.log(error);
    throw new HTTPException(400, { message: error as string });
  }
};

export {
  handleCreateResume,
  GetResumeList,
  updateResume,
  Get_Resume,
  updateExperience,
  updateEducation,
  updateSkills,
  deleteSkill,
  Get_Shared_Resume,
  deleteResume
};
