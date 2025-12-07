import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { processSessionId } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      // Extract session_id from hash
      const hash = location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (sessionIdMatch) {
        const sessionId = sessionIdMatch[1];
        const success = await processSessionId(sessionId);
        
        // Clear the hash and redirect
        if (success) {
          navigate('/projects', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [location, navigate, processSessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
        <p className="mt-4 text-muted-foreground">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
}
