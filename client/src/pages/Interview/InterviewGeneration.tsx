import Agent from '@/components/VoiceAgent/Agent';
import { useAuthContext } from '@/context/AuthProvider';

const InterviewGeneration = () => {
  const { user } = useAuthContext();
console.log(user)
  return (
    <div className="min-h-screen bg-[#05021E] px-6 py-10 text-white">
      <h3 className="text-3xl font-bold mb-8 text-center">
        Interview Generation
      </h3>

      <div className="max-w-5xl mx-auto bg-[#272533] rounded-2xl shadow-md p-8">
        <Agent userName={user?.name!} userId={user?.id!} type="generate" />
      </div>
    </div>
  );
};

export default InterviewGeneration;
