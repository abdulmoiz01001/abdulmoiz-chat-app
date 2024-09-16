import { useAppStore } from '@/store/store';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Chat = () => {
  const { userInfo } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if(!userInfo.profileSetup){
      toast('Please setup your profile first');
      navigate('/profile');
    }
  },[userInfo , navigate])



  return (
      <div>
        Chat {[userInfo.email, userInfo.profileSetup, userInfo.id, userInfo.firstName, userInfo.lastName, userInfo.image, userInfo.color]}
  
      </div>
    )
}

export default Chat
