import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileEditContent from '@/components/ProfileEditContent';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <ProfileEditContent onSaved={() => navigate(-1)} />
    </div>
  );
};

export default EditProfile;
