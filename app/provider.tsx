"use client"

import { UserDetailContext } from '@/context/UserDetailContext';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [userDetail, setUserDetail] = useState<any>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      CreateNewUser();
    } else if (isLoaded && !isSignedIn) {
      setUserDetail(null);
    }
  }, [isLoaded, isSignedIn, user]);

  const CreateNewUser = async () => {
    try {
      const result = await axios.post('/api/users', {});
      setUserDetail(result.data?.user);
    } catch (err) {
      console.warn("Could not sync user profile:", err);
    }
  };

  return (
    <div>
      <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
        {children}
      </UserDetailContext.Provider>
    </div>
  );
}

export default Provider;
