import { Context } from "hono";
import { getPrisma } from "../../prisma/PrismaClient";
import { HTTPException } from "hono/http-exception";
import defaultData from "../defaultData";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import mammoth from "mammoth";
import { generateObject } from "ai";
import { resumeAnalysisSchema } from "../constants/zodSchema";

type OCRResponse = {
  ParsedResults?: {
    ParsedText: string;
  }[];
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string | string[];
  ErrorDetails?: string;
};

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
    console.log("email - ", email)
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
        userEmail: email,
      },
    });

    if (response) {
      await prisma.resume.delete({
        where: {
          id: resumeId,
        },
      });
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

const analyseResume = async (c: Context): Promise<any> => {
  try {
    const google = createGoogleGenerativeAI({
      apiKey: c.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    const formData = await c.req.formData();
    const file = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string;
    if (!file || !jobDescription) {
      throw new HTTPException(400, {
        message: "Missing resume or job description",
      });
    }

    const buffer = await file.arrayBuffer();
    const buffer2 = Buffer.from(await file.arrayBuffer());
    let resumeText = "";

    if (file.name.endsWith(".pdf")) {
      const base64PDF = Buffer.from(buffer).toString("base64");

      const ocrForm = new FormData();
      ocrForm.append("base64Image", `data:application/pdf;base64,${base64PDF}`);
      ocrForm.append("OCREngine", "2");
      ocrForm.append("isOverlayRequired", "false");
      ocrForm.append("language", "eng");
      ocrForm.append("apikey", c.env.OCR_API_KEY);

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: ocrForm,
      });

      const data = (await response.json()) as OCRResponse;
      console.log(data);
      if (!data?.ParsedResults?.[0]?.ParsedText) {
        throw new HTTPException(400, {
          message: "OCR failed to extract text from PDF",
        });
      }
      resumeText = data.ParsedResults[0].ParsedText;
    } else if (file.name.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer: buffer2 });
      resumeText = result.value;
    } else {
      throw new HTTPException(400, { message: "Unsupported file type" });
    }

    const prompt = `
You are a professional resume Analyzer.Your task is to evaluate the resume match with the job description based on structured categories.

Compare the following RESUME and JOB DESCRIPTION, then:
1. Give a match score (0-100)
2. List matching skills
3. List missing or weak areas
4. Suggest improvements
Do not add categories other than the ones provided.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;

    const { object } = await generateObject({
      model: google("gemini-2.5-flash", {
        structuredOutputs: false,
      }),
      schema: resumeAnalysisSchema,
      prompt: prompt,
      system:
        "You are a professional resume Analyzer.Your task is to evaluate the resume match with the job description based on structured categories",
    });

    const analysis = {
      match: object.match,
      matchingSkills: object.matchingSkills,
      weakAreas: object.weakAreas,
      improvements: object.improvements,
    };
    c.status(200);
    return c.json({ success: true, analysis: analysis });
  } catch (error) {
    c.status(400);
    throw new HTTPException(400, { message: "Error generating Analysis" });
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
  deleteResume,
  analyseResume,
};
