import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { useNavigate } from "react-router-dom";
import { interviewer } from "@/constants/DummyData";
import API from "@/lib/ServerAPI";
import toast from "react-hot-toast";
import { Bot, CircleUser } from "lucide-react";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

const Agent = ({
  userName,
  userId,
  type,
  questions,
  interviewId,
}: {
  userName: string;
  userId: string;
  type: string;
  questions?: string[];
  interviewId?: string;
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<string>("");
  const navigate = useNavigate();
  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  //Generate Interview Feedback
  const handleGenerateFeedback = async (message: SavedMessage[]) => {
    try {
      const response = await API.post(
        "/interview/feedback",
        {
          data: {
            userId,
            interviewId,
            transcript: message,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const { success, feedbackId }: { success: boolean; feedbackId: string } =
        response.data;

      if (success && feedbackId) {
        navigate(`/interview/${interviewId}/feedback`);
      } else {
        console.error("Error saving feedback: No feedbackId returned");
        toast.error("Something went wrong");
        navigate("/");
      }
    } catch (error) {
      console.error("Error occurred while generating feedback:", error);
      toast.error("Something went wrong");
      navigate("/");
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        navigate("/interview/dashboard");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, type, userId]);

  //handle call connect
  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      console.log("gene", userId, userName);
      await vapi.start(
        undefined,
        undefined,
        undefined,
        import.meta.env.VITE_VAPI_WORKFLOW_ID,
        {
          variableValues: {
            username: userName,
            userid: userId,
          },
        },
      );
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  //handle call disconnect
  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <div className="call-view">
        <div
          className={cn(
            "card-interviewer bg-base-1",
            callStatus == CallStatus.ACTIVE && isSpeaking
              ? "border border-accent-1/40"
              : "",
          )}
        >
          <div className="avatar size-16">
            {/* <img
              src="/ai-avatar.png"
              alt="profile-image"
              width={40}
              height={40}
              className="object-cover"
            /> */}
            <Bot strokeWidth={1} className="fill-accent-2 size-16" />
            {isSpeaking && <span className="animate-speak animate-ping " />}
          </div>
          <h3>AI Interviewer</h3>
        </div>
        {/* User Profile Card */}
        <div
          className={cn(
            "card-border ",
            callStatus == CallStatus.ACTIVE && !isSpeaking
              ? "border border-accent-1/40"
              : "",
          )}
        >
          <div className="card-content bg-base-1">
            {/* <img
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            /> */}
            <CircleUser strokeWidth={1} className="fill-accent-2 size-16" />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>
      {messages.length > 0 && (
        <div className="rounded-2xl w-full ">
          <div className="bg-base-1 border-2 border-accent-2 rounded-2xl  min-h-14 px-5 py-3 flex items-center justify-center">
            <p
              className={cn(
                "text-lg text-center text-white",
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100",
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}
      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button
            className="relative flex justify-center items-center btn-call mt-4 "
            onClick={() => handleCall()}
          >
            <span
              className={cn(
                "absolute bg-[#49de50] h-[85%] w-[65%] animate-ping  rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden",
              )}
            />

            <span className="relative">
              {callStatus === CallStatus.INACTIVE ||
              callStatus === CallStatus.FINISHED
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
