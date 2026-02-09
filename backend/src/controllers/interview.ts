import { Context } from "hono";
import { getPrisma } from "../../prisma/PrismaClient";
import { HTTPException } from "hono/http-exception";
import { generateObject, generateText } from "ai";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { feedbackSchema } from "../constants/zodSchema";

const handle_interview_generate = async (c: Context): Promise<any> => {
  try {
    const google = createGoogleGenerativeAI({
      apiKey: c.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    const prisma = getPrisma(c.env.DATABASE_URL);
    const { type, role, level, techstack, amount, userid } = await c.req.json();

    const { text: questions } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Prepare questions for a job interview.
          The job role is ${role}.
          The job experience level is ${level}.
          The tech stack used in the job is: ${techstack}.
          The focus between behavioural and technical questions should lean towards: ${type}.
          The amount of questions required is: ${amount}.
          Please return only the questions, without any additional text.
          The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
          Return the questions formatted like this:
          ["Question 1", "Question 2", "Question 3"]
          
          Thank you! <3
      `,
    });

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userid: userid,
      finalized: true,
    };

    await prisma.interview.create({
      data: interview,
    });

    c.status(200);
    return c.json({ message: "Interview Created Successfully " });
  } catch (error) {
    c.status(500);
    console.log(error);
    throw new HTTPException(500, { message: error as string });
  }
};

//Get all user Interviews

const Get_User_Interviews = async (c: Context): Promise<any> => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const userid = c.req.param("userid");

    const response = await prisma.interview.findMany({
      where: {
        userid: userid,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        feedback: true,
      },
    });

    c.status(200);
    return c.json(response);
  } catch (error) {
    c.status(404);
    throw new HTTPException(404, { message: "Internal Server Error" });
  }
};
//Get Interview

const Get_Interview = async (c: Context): Promise<any> => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const interviewId = c.req.param("id");

    const response = await prisma.interview.findUnique({
      where: {
        id: interviewId,
      },
    });

    c.status(200);
    return c.json(response);
  } catch (error) {
    c.status(404);
    throw new HTTPException(404, { message: "Internal Server Error" });
  }
};

//Handle Interview Feedback

const Handle_Interview_Feedback = async (c: Context): Promise<any> => {
  try {
    const google = createGoogleGenerativeAI({
      apiKey: c.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    const prisma = getPrisma(c.env.DATABASE_URL);
    const { data } = await c.req.json();
    console.log("this is the data", data);
    const { interviewId, userId, transcript } = data;
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");
    const { object } = await generateObject({
      model: google("gemini-2.5-flash", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
          You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
          Transcript:
          ${formattedTranscript}
  
          Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
          - **Communication Skills**: Clarity, articulation, structured responses.
          - **Technical Knowledge**: Understanding of key concepts for the role.
          - **Problem-Solving**: Ability to analyze problems and propose solutions.
          - **Cultural & Role Fit**: Alignment with company values and job role.
          - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
          `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    const response = await prisma.feedback.upsert({
      where: {
        interviewId: interviewId,
        userId: userId,
      },
      update: {
        ...feedback,
      },
      create: {
        ...feedback,
      },
    });

    c.status(200);
    return c.json({ success: true, feedbackId: response.id });
  } catch (error) {
    c.status(400);
    throw new HTTPException(400, { message: "Error saving feedback:" });
  }
};

//Get Interview Feedback

const Get_Interview_Feedback = async (c: Context): Promise<any> => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const interviewId = c.req.query("interviewId");
    const userId = c.req.query("userId");
    if (!interviewId || !userId) {
      throw new HTTPException(400, { message: "Missing query parameters" });
    }
    const response = await prisma.feedback.findUnique({
      where: {
        interviewId: interviewId,
        userId:userId
      },
      include: {
        interview: true,
      },
    });

    //  // If feedback does not exist, throw 404
    if (!response) {
      throw new HTTPException(404, { message: "Feedback not found" });
    }

    // // If userId does not match, throw 403 Forbidden
    if (response.userId !== userId) {
      throw new HTTPException(403, {
        message: "You are not authorized to access this feedback",
      });
    }

    c.status(200);
    return c.json(response);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error; // Preserve the correct HTTP error (403, 404, etc.)
    }
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
};

export {
  handle_interview_generate,
  Get_User_Interviews,
  Get_Interview,
  Handle_Interview_Feedback,
  Get_Interview_Feedback,
};
