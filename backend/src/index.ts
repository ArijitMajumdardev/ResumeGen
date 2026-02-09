import { Context, Hono } from "hono";
import {
  handleUserDetail,
  handleUserLogin,
  handleUserSignup,
} from "./controllers/user";
import { cors } from "hono/cors";
import { handle_Auth_Middleware } from "./middlewares/authMiddleware";
import {
  analyseResume,
  deleteResume,
  deleteSkill,
  Get_Resume,
  Get_Shared_Resume,
  GetResumeList,
  handleCreateResume,
  updateEducation,
  updateExperience,
  updateResume,
  updateSkills,
} from "./controllers/resume";
import { logger } from "hono/logger";
import {
  Get_Interview,
  Handle_Interview_Feedback,
  Get_User_Interviews,
  handle_interview_generate,
  Get_Interview_Feedback,
} from "./controllers/interview";
// import { prisma } from '../prisma/PrismaClient'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CORS_ORIGIN: string;
    GOOGLE_GENERATIVE_AI_API_KEY: string;
    OCR_API_KEY: string
  };
  Variables: {
    user: string;
  };
}>();

app.use(logger());
// app.use('*', cors())
app.use("*", async (c, next) => {
  const envOrigins = c.env?.CORS_ORIGIN || "http://localhost:5173";
  const allowedOrigins = envOrigins.split(",").map((origin) => origin.trim());

  const corsMiddlewareHandler = cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : ""),
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  return corsMiddlewareHandler(c, next);
});

app.options("*", (c) => c.text("OK", 200));

app.post("/signup", handleUserSignup);
app.post("/login", handleUserLogin);
app.get("/user-detail", handleUserDetail);

app.post("/create-resume", handle_Auth_Middleware, handleCreateResume);
app.get("/resume-list", handle_Auth_Middleware, GetResumeList);
app.put("update-resume", handle_Auth_Middleware, updateResume);
app.get("/get-resume/:resumeId", handle_Auth_Middleware, Get_Resume);
app.get("/share/get-resume/:resumeId", Get_Shared_Resume);
app.put("/update-experience", handle_Auth_Middleware, updateExperience);
app.put("/update-education", handle_Auth_Middleware, updateEducation);
app.put("/update-skills", handle_Auth_Middleware, updateSkills);
app.delete("/delete-skills", handle_Auth_Middleware, deleteSkill);
app.delete("/delete-resume/:resumeId", handle_Auth_Middleware, deleteResume);
app.post("/analyse-resume",handle_Auth_Middleware, analyseResume);

app.post("/vapi/generate", handle_interview_generate);
app.get("/get-user-interviews/:userid",handle_Auth_Middleware,Get_User_Interviews);
app.get("/get-interview/:id",handle_Auth_Middleware,Get_Interview);
app.post("/interview/feedback",handle_Auth_Middleware,Handle_Interview_Feedback);
app.get("/interview/feedback",handle_Auth_Middleware,Get_Interview_Feedback);

export default app;
